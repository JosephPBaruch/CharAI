import Papa from "papaparse";
import * as kml from "@tmcw/togeojson";
import * as xmldom from "@xmldom/xmldom";
import shp from "shpjs";
import type { ParseResult } from "./types";
import { coordAll } from "@turf/turf";
import type { LatLngLiteral } from "leaflet";

export const parseFile = async (file: File): Promise<ParseResult> => {
  if (file === null)
    return {
      success: false,
      error:
        "Unable to read the file. The file may be corrupted or too large. Please try uploading a different file.",
    };
  const fileExtension = getFileExtension(file.name);

  try {
    if (fileExtension === "csv") return parseCSVFile(await file.text());
    if (fileExtension === "kml") return parseKMLFile(await file.text());
    if (fileExtension === "json") return parseJSONFile(await file.text());
    if (fileExtension === "geojson") return parseGeoJSONFile(await file.text());
    if (fileExtension === "zip") return parseSHPFile(file);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Failed to parse file: ${errorMessage}. Please check the file format and try again.`,
    };
  }

  return {
    success: false,
    error:
      "Unsupported file type. Please upload a CSV, JSON, GeoJSON, KML, or Shapefile (.zip).",
  };
};

const getFileExtension = (fileName: string) => {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
};

const parseCSVFile = (fileContent: string): ParseResult => {
  try {
    const parsedContent = Papa.parse(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    }).data;

    if (!isLatLngArray(parsedContent)) {
      return {
        success: false,
        error:
          "CSV file must contain columns named 'lat' and 'lng' with valid coordinate values.",
      };
    }

    if (!hasMinDistinctPointsGeneric(parsedContent)) {
      return {
        success: false,
        error:
          "Farm boundary must have at least 3 coordinate points. Your file has " +
          parsedContent.length +
          ".",
      };
    }

    return {
      success: true,
      data: parsedContent,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Failed to parse CSV file: ${errorMessage}. Ensure the file is properly formatted.`,
    };
  }
};

const parseKMLFile = (fileContent: string): ParseResult => {
  try {
    const DOMParser = xmldom.DOMParser;
    const parsedKML = new DOMParser().parseFromString(fileContent);
    const converted = kml.kml(parsedKML);

    if (!hasOnlyGeometries(converted)) {
      return {
        success: false,
        error:
          "KML file contains features without geometry. Ensure all features have valid coordinates.",
      };
    }

    const coordsAsJSON = normalizeToJSON(converted);

    if (!hasMinDistinctPointsGeneric(converted)) {
      return {
        success: false,
        error:
          "Farm boundary must have at least 3 coordinate points. Your file has " +
          coordsAsJSON.length +
          ".",
      };
    }

    return {
      success: true,
      data: coordsAsJSON,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Failed to parse KML file: ${errorMessage}. Ensure the file is a valid KML document.`,
    };
  }
};

const parseSHPFile = async (file: File): Promise<ParseResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const geojson = await shp(arrayBuffer);

    if (Array.isArray(geojson)) {
      return {
        success: false,
        error:
          "Shapefile must contain a single layer. Your file contains multiple layers.",
      };
    }

    const { fileName, ...filteredGeoJSON } = geojson;
    const coordsAsJSON = normalizeToJSON(filteredGeoJSON);

    if (!hasMinDistinctPointsGeneric(coordsAsJSON)) {
      return {
        success: false,
        error:
          "Farm boundary must have at least 3 coordinate points. Your file has " +
          coordsAsJSON.length +
          ".",
      };
    }

    return {
      success: true,
      data: coordsAsJSON,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Failed to parse Shapefile: ${errorMessage}. Ensure you've uploaded a valid .shp file with correct geometries.`,
    };
  }
};

const parseJSONFile = (fileContent: string): ParseResult => {
  try {
    const parsedContent: unknown[] = JSON.parse(fileContent);

    if (!isLatLngArray(parsedContent)) {
      if (!Array.isArray(parsedContent)) {
        return {
          success: false,
          error: "JSON file must contain an array of coordinates.",
        };
      }
      return {
        success: false,
        error:
          "Each coordinate must have 'lat' and 'lng' properties with numeric values.",
      };
    }

    if (!hasMinDistinctPointsGeneric(parsedContent)) {
      return {
        success: false,
        error:
          "Farm boundary must have at least 3 coordinate points. Your file has " +
          parsedContent.length +
          ".",
      };
    }

    return {
      success: true,
      data: parsedContent,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Failed to parse JSON file: ${errorMessage}. Ensure the file contains valid JSON.`,
    };
  }
};

const parseGeoJSONFile = (fileContent: string): ParseResult => {
  try {
    const parsedContent: unknown = JSON.parse(fileContent);

    if (!isFeatureCollection(parsedContent)) {
      return {
        success: false,
        error:
          "GeoJSON file must contain a FeatureCollection with at least one feature.",
      };
    }

    const coordsAsJSON = normalizeToJSON(parsedContent);

    if (!hasMinDistinctPointsGeneric(coordsAsJSON)) {
      return {
        success: false,
        error:
          "Farm boundary must have at least 3 coordinate points. Your file has " +
          coordsAsJSON.length +
          ".",
      };
    }

    return {
      success: true,
      data: coordsAsJSON,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Failed to parse GeoJSON file: ${errorMessage}. Ensure the file contains valid GeoJSON.`,
    };
  }
};

const isLatLngArray = (data: unknown): data is LatLngLiteral[] => {
  if (!Array.isArray(data) || data === null) return false;

  return data.every((pair) => {
    if (typeof pair !== "object" || Array.isArray(pair) || pair === null)
      return false;
    if (!("lat" in pair && "lng" in pair)) return false;
    return typeof pair.lat === "number" && typeof pair.lng === "number";
  });
};

const hasOnlyGeometries = (
  data: GeoJSON.FeatureCollection<GeoJSON.Geometry | null>,
): data is GeoJSON.FeatureCollection<GeoJSON.Geometry> => {
  return data.features.every((feature) => feature.geometry !== null);
};

const isFeatureCollection = (
  obj: unknown,
): obj is GeoJSON.FeatureCollection => {
  if (typeof obj !== "object" || obj === null) return false;

  const featureCollection = obj as any;

  return (
    featureCollection.type === "FeatureCollection" &&
    Array.isArray(featureCollection.features)
  );
};

const normalizeToJSON = (geojson: GeoJSON.GeoJSON) => {
  try {
    const coords = coordAll(geojson);
    const formattedCoords: LatLngLiteral[] = coords.map((pair) => {
      return { lng: pair[0], lat: pair[1] };
    });
    return formattedCoords;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error normalizing GeoJSON coordinates:", errorMessage);
    return [];
  }
};

const hasMinDistinctPointsGeneric = (
  input: any,
  minPoints = 3,
  precision = 6,
): boolean => {
  let coords: LatLngLiteral[] = [];

  if (Array.isArray(input)) {
    coords = input;
  } else {
    coords = normalizeToJSON(input);
  }

  const uniquePoints = new Set(
    coords.map(
      (p) =>
        `${Number(p.lat).toFixed(precision)},${Number(p.lng).toFixed(precision)}`,
    ),
  );

  return uniquePoints.size >= minPoints;
};
