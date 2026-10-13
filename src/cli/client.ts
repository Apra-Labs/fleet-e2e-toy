const DEFAULT_BASE_URL = "http://localhost:3000";

export function getBaseUrl(): string {
  return process.env.NOTEAPI_URL ?? DEFAULT_BASE_URL;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string; errors?: { field: string; message: string }[] };
    if (body.error) return body.error;
    if (body.errors && body.errors.length > 0) {
      return body.errors.map((e) => `${e.field}: ${e.message}`).join(", ");
    }
  } catch {
    // response body was not JSON — fall through to generic message
  }
  return `Request failed with status ${res.status}`;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T | undefined> {
  let res: Response;
  try {
    res = await fetch(`${getBaseUrl()}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(`Could not reach NoteAPI at ${getBaseUrl()}`);
  }

  if (!res.ok) {
    throw new ApiError(await extractErrorMessage(res), res.status);
  }

  if (res.status === 204) {
    return undefined;
  }

  return (await res.json()) as T;
}
