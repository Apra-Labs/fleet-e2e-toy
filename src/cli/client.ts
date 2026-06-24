export class CliError extends Error {
  constructor(
    public readonly status: number | null,
    message: string
  ) {
    super(message);
    this.name = "CliError";
  }
}

export interface HttpClientOptions {
  baseUrl?: string;
  method: string;
  path: string;
  body?: unknown;
}

export async function httpClient(options: HttpClientOptions): Promise<unknown> {
  const baseUrl = options.baseUrl ?? "http://localhost:3000";
  const url = `${baseUrl}${options.path}`;

  let response: Response;
  try {
    const init: RequestInit = {
      method: options.method,
      headers: options.body !== undefined ? { "Content-Type": "application/json" } : {},
    };
    if (options.body !== undefined) {
      init.body = JSON.stringify(options.body);
    }
    response = await fetch(url, init);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new CliError(null, `Network error: ${message}`);
  }

  if (!response.ok) {
    let errorMessage: string;
    try {
      const json = (await response.json()) as { error?: string };
      errorMessage = json.error ?? `HTTP ${response.status} ${response.statusText}`;
    } catch {
      errorMessage = `HTTP ${response.status} ${response.statusText}`;
    }
    throw new CliError(response.status, errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json() as Promise<unknown>;
}
