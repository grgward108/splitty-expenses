/**
 * Custom fetch function for Orval-generated client
 * This can be customized to add authentication, logging, etc.
 */

let baseUrl = "http://localhost:3000";

export const setBaseUrl = (url: string) => {
  baseUrl = url;
};

export const getBaseUrl = () => baseUrl;

export const customFetch = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  } catch (networkError) {
    // ネットワークエラー（接続失敗、タイムアウト等）
    const error = new Error(
      `Network error: ${networkError instanceof Error ? networkError.message : "Failed to connect to server"}`
    );
    (error as Error & { code: string }).code = "NETWORK_ERROR";
    (error as Error & { url: string }).url = fullUrl;
    throw error;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText || `HTTP ${response.status}`,
      code: "UNKNOWN_ERROR",
    }));
    throw error;
  }

  // Handle empty responses (e.g., 204 No Content)
  if (response.status === 204) {
    return {
      data: undefined,
      status: 204,
      headers: response.headers,
    } as T;
  }

  // Wrap the response in Orval's expected format
  const data = await response.json();
  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
};

export default customFetch;
