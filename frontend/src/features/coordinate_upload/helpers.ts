import Papa from "papaparse";
import * as kml from "@tmcw/togeojson";
import * as xmldom from "@xmldom/xmldom";
import shp from "shpjs";
import type { ParseResult } from "./stepper_pages/types";
import { coordAll } from "@turf/turf";
import type { LatLngLiteral } from "leaflet";

export const parseFile = async (file: File): Promise<ParseResult> => {
  if (file === null)
    return {
      success: false,
      error:
        "The input is empty or the file was read improperly. Please try again.",
    };
  const fileExtension = getFileExtension(file.name);
  if (fileExtension === "csv") return parseCSVFile(await file.text());
  if (fileExtension === "kml") return parseKMLFile(await file.text());
  if (fileExtension === "json") return parseJSONFile(await file.text());
  if (fileExtension === "geojson") return parseGeoJSONFile(await file.text());
  if (fileExtension === "zip") return parseSHPFile(await file.arrayBuffer());
  return {
    success: false,
    error:
      "The uploaded file is of an unsupported type. Please try again with a different file type.",
  };
};

const getFileExtension = (fileName: string) => {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
};

const parseCSVFile = (fileContent: string): ParseResult => {
  const parsedContent = Papa.parse(fileContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  }).data;

  if (!isLatLngArray(parsedContent) || parsedContent.length < 3)
    return {
      success: false,
      error: "The input is incorrectly formatted.",
    };
  return {
    success: true,
    data: parsedContent,
  };
};

const parseKMLFile = (fileContent: string): ParseResult => {
  const DOMParser = xmldom.DOMParser;
  const parsedKML = new DOMParser().parseFromString(fileContent);
  const converted = kml.kml(parsedKML);
  if (!hasOnlyGeometries(converted)) {
    return {
      success: false,
      error: "The input is incorrectly formatted.",
    };
  }
  const coordsAsJSON = normalizeToJSON(converted);
  if (coordsAsJSON.length < 3) {
    return {
      success: false,
      error: "The input is incorrectly formatted.",
    };
  }
  return {
    success: true,
    data: coordsAsJSON,
  };
};

const parseSHPFile = async (
  fileArrayBuffer: ArrayBuffer,
): Promise<ParseResult> => {
  const geojson = await shp(fileArrayBuffer);
  if (Array.isArray(geojson)) {
    return {
      success: false,
      error: "The input is incorrectly formatted.",
    };
  }
  const { fileName, ...filteredGeoJSON } = geojson;
  const coordsAsJSON = normalizeToJSON(filteredGeoJSON);
  if (coordsAsJSON.length < 3) {
    return {
      success: false,
      error: "The input is incorrectly formatted.",
    };
  }
  return {
    success: true,
    data: coordsAsJSON,
  };
};

const parseJSONFile = (fileContent: string): ParseResult => {
  const parsedContent: unknown[] = JSON.parse(fileContent);
  if (!isLatLngArray(parsedContent))
    return {
      success: false,
      error: "The input is incorrectly formatted.",
    };
  return {
    success: true,
    data: parsedContent,
  };
};

const parseGeoJSONFile = (fileContent: string): ParseResult => {
  const parsedContent: unknown = JSON.parse(fileContent);
  if (!isFeatureCollection(parsedContent))
    return {
      success: false,
      error: "The input is incorrectly formatted.",
    };
  const coordsAsJSON = normalizeToJSON(parsedContent);
  if (coordsAsJSON.length < 3) {
    return {
      success: false,
      error: "The input is incorrectly formatted.",
    };
  }
  return {
    success: true,
    data: coordsAsJSON,
  };
};

const isLatLngArray = (data: unknown): data is LatLngLiteral[] => {
  if (!Array.isArray(data) || data === null) return false;
  if (data.length < 3) return false;

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
  const coords = coordAll(geojson);
  const formattedCoords: LatLngLiteral[] = coords.map((pair) => {
    return { lng: pair[0], lat: pair[1] };
  });
  return formattedCoords;
};
