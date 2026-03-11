import type { FeatureCollection } from "geojson";
import type { FieldEntry } from "../features";
import { getApiUrlForApi, getAuthToken } from "../services/authService";

const API_URL = getApiUrlForApi();

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

const DeleteField = async (fieldId: string) => {
  const response = await fetch(`${API_URL}/field/`, {
    method: "Delete",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${getAuthToken()}`,
    },
    body: JSON.stringify({
      field_id: fieldId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error deleting field`);
  }

  return response.status;
};

const GETPrescriptionMap = async (fieldId: string) => {
  const response = await fetch(`${API_URL}/field/${fieldId}/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching prescription map: ${response.statusText}`);
  }

  // Stream the (decompressed) response body in chunks.
  // Fallback to response.json() for environments without ReadableStream support.
  if (!response.body) {
    return response.json();
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }
  result += decoder.decode();

  return JSON.parse(result);
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

export { DeleteField, GETPrescriptionMap, GETFields, POSTFieldData };
