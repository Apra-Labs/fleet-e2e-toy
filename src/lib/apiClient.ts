export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function getDefaultBaseUrl(): string {
  return process.env.NOTEAPI_BASE_URL ?? 'http://localhost:3000';
}

async function parseErrorMessage(response: Response, status: number): Promise<string> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return `HTTP ${status}`;
  }

  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>;
    if (typeof b['error'] === 'string') {
      return b['error'];
    }
    if (Array.isArray(b['errors']) && b['errors'].length > 0) {
      const first = b['errors'][0];
      if (first && typeof first === 'object' && typeof (first as Record<string, unknown>)['message'] === 'string') {
        return (first as Record<string, unknown>)['message'] as string;
      }
    }
  }

  return `HTTP ${status}`;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? getDefaultBaseUrl();
  }

  private async request<T>(method: string, path: string, body?: unknown, query?: Record<string, string>): Promise<T> {
    let url = `${this.baseUrl}${path}`;

    if (query && Object.keys(query).length > 0) {
      const params = new URLSearchParams(query);
      url = `${url}?${params.toString()}`;
    }

    const init: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      throw new ApiError(0, `Cannot reach ${this.baseUrl}: ${reason}`);
    }

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    if (!response.ok) {
      const message = await parseErrorMessage(response, response.status);
      throw new ApiError(response.status, message);
    }

    return response.json() as Promise<T>;
  }

  async get<T>(path: string, query?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', path, undefined, query);
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  async del(path: string): Promise<void> {
    return this.request<void>('DELETE', path);
  }
}

export function createApiClient(baseUrl?: string): ApiClient {
  return new ApiClient(baseUrl);
}
