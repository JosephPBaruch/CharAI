const DEFAULT_API = 'http://localhost:8000/api';
const API_URL = ((import.meta.env.VITE_API_URL || DEFAULT_API) + '/data').replace(/\/$/, '');

async function handleResponse(response: Response) {
	const text = await response.text();
	let data: any = null;
	if (text) {
		try {
			data = JSON.parse(text);
		} catch (e) {
			data = text;
		}
	}

	if (!response.ok) {
		throw data || { detail: response.statusText };
	}

	return data;
}

export const uploadCoordinateFile = async (data: any): Promise<any> => {
  const response = await fetch(`${API_URL}/coordinate-file-upload/`, {
		method: 'POST',
		credentials: 'include',
		body: data,
	});

  const result = await handleResponse(response);

  return result as any;
}

export const uploadYieldFile = async (data: any): Promise<any> => {
  const response = await fetch(`${API_URL}/yield-file-upload/`, {
		method: 'POST',
		credentials: 'include',
		body: data,
	});

  const result = await handleResponse(response);

  return result as any;
}