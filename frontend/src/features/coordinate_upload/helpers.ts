import Papa from "papaparse";

export const parseFile = (file: any, fileExtension: string) => {
  console.log(fileExtension);
  let coordinates = {};
  if (file === null) return {};
  if (fileExtension === "csv") coordinates = parseCSVFile(file);
  if (fileExtension === "kml") coordinates = parseKMLFile(file);
  return coordinates;
};

const parseCSVFile = (file: any) => {
  const rows = Papa.parse(file, { header: true, dynamicTyping: true }).data;
  console.log(`rows: ${JSON.stringify(rows)}`);
  const geojson = {
    type: "FeatureCollection",
    features: rows.map((row: any) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [Number(row.lon), Number(row.lat)],
      },
      properties: row,
    })),
  };
  console.log(`geojson: ${JSON.stringify(geojson)}`);
  return geojson;
};

const parseKMLFile = (file: string) => {
  const coordinatesSubString = file
    .split("<coordinates>")
    .pop()
    ?.split("</coordinates>")[0]
    .trim();
  console.log(`kml parsed substring: ${coordinatesSubString}`);

  if (coordinatesSubString === undefined) return {};
  const rows = Papa.parse(coordinatesSubString, { delimiter: "," }).data;
  console.log(`length of rows: ${rows.length}`);
  console.log(`kml parsed rows: ${JSON.stringify(rows)}`);
  const geojson = {
    type: "FeatureCollection",
    features: rows.map((row: any) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [Number(row.split(",")[1]), Number(row.split(",")[0])],
      },
      properties: row,
    })),
  };
  console.log(`FINISHED KML PRODUCT AS GEOJSON: ${JSON.stringify(geojson)}`);

  return geojson;
};
