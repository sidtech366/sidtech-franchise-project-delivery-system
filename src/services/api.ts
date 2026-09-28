const API_URL =
  'https://script.google.com/macros/s/AKfycbygpxaLRTGVlE5VOfrchOWIKJjrFhiDsvT8hUk0rYuTBbra09BonIK6gSUy6dhEeFpAGA/exec';

export interface ApiResponse<T = unknown> {
  ok: boolean;
  message?: string;
  data?: T;
  error?: string;
  [key: string]: unknown;
}

export async function apiGet<T = unknown>(
  params: Record<string, string> = {}
): Promise<ApiResponse<T>> {
  const query = new URLSearchParams(params).toString();

  const url = query ? `${API_URL}?${query}` : API_URL;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function apiPost<T = unknown>(
  action: string,
  data: Record<string, unknown> = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      action,
      ...data,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function checkApiHealth(): Promise<ApiResponse> {
  return apiGet();
}

export { API_URL };
