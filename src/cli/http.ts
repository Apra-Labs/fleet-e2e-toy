export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface RequestOptions {
  method: HttpMethod;
  baseUrl: string;
  path: string;
  query?: Record<string, string>;
  body?: unknown;
}

export async function request<T>(opts: RequestOptions): Promise<T> {
  const { method, baseUrl, path, query, body } = opts;

  let url = `${baseUrl.replace(/\/$/, "")}${path}`;
  if (query && Object.keys(query).length > 0) {
    const params = new URLSearchParams(query);
    url = `${url}?${params.toString()}`;
  }

  const fetchOptions: RequestInit = { method };
  if (body !== undefined) {
    fetchOptions.headers = { "Content-Type": "application/json" };
    fetchOptions.body = JSON.stringify(body);
  }

  const res = await fetch(url, fetchOptions);

  if (!res.ok) {
    let message: string;
    try {
      const json = (await res.json()) as Record<string, unknown>;
      message =
        typeof json["error"] === "string" ? json["error"] : res.statusText;
    } catch {
      message = res.statusText;
    }
    throw new Error(`HTTP ${res.status}: ${message}`);
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return res.json() as Promise<T>;
}
