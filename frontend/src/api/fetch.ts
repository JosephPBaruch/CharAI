import type { FeatureCollection } from "geojson";
import type { FieldEntry } from "../features";

const DEFAULT_API = "http://localhost:8000/api";
const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API;

const POSTFieldData = async (data: {
  globalMax: number | "";
  field: FieldEntry;
  data: FeatureCollection | null;
}) => {
  const response = await fetch(`${API_URL}/field/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error posting field data: ${response.statusText}`);
  }

  return response.json();
};

export { POSTFieldData };
