import type { FeatureCollection } from "geojson";
import type { FieldEntry } from "../features";
import { getAuthToken } from "../services/authService";

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
      Authorization: `Token ${getAuthToken()}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error posting field data: ${response.statusText}`);
  }

  return response.json();
};

const GETPrescriptionMap = async (fieldId: string) => {
  const response = await fetch(`${API_URL}/prescription/${fieldId}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching prescription map: ${response.statusText}`);
  }

  return response.json();
};

const GETFields = async () => {
  const response = await fetch(`${API_URL}/field/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching fields: ${response.statusText}`);
  }

  return response.json();
};

export { GETPrescriptionMap, GETFields, POSTFieldData };
