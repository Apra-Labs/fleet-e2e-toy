import { httpClient, CliError } from "../../src/cli/client";

// Mock global fetch
const mockFetch = jest.fn<Promise<Response>, [string | URL, RequestInit?]>();
global.fetch = mockFetch as typeof fetch;

function makeResponse(status: number, body: unknown, ok: boolean): Response {
  return {
    ok,
    status,
    statusText: ok ? "OK" : "Error",
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

beforeEach(() => {
  mockFetch.mockClear();
});

describe("httpClient", () => {
  it("returns parsed JSON on 2xx", async () => {
    const data = { id: "1", title: "Test" };
    mockFetch.mockResolvedValueOnce(makeResponse(200, data, true));

    const result = await httpClient({ method: "GET", path: "/notes" });
    expect(result).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/notes",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("respects custom baseUrl", async () => {
    const data = { id: "1" };
    mockFetch.mockResolvedValueOnce(makeResponse(200, data, true));

    await httpClient({ baseUrl: "http://myhost:9000", method: "GET", path: "/notes" });
    expect(mockFetch).toHaveBeenCalledWith("http://myhost:9000/notes", expect.anything());
  });

  it("throws CliError with status on non-2xx response", async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(404, { error: "not found" }, false));

    await expect(httpClient({ method: "GET", path: "/notes/missing" })).rejects.toBeInstanceOf(
      CliError
    );
  });

  it("throws CliError without stack trace info on non-2xx", async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(500, { error: "server error" }, false));

    try {
      await httpClient({ method: "GET", path: "/notes" });
      fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(CliError);
      expect((err as CliError).status).toBe(500);
      expect((err as CliError).message).toBe("server error");
    }
  });

  it("throws CliError on network failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    await expect(httpClient({ method: "GET", path: "/notes" })).rejects.toBeInstanceOf(CliError);
  });

  it("CliError from network failure has null status", async () => {
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    try {
      await httpClient({ method: "GET", path: "/notes" });
      fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(CliError);
      expect((err as CliError).status).toBeNull();
    }
  });

  it("sends JSON body on POST", async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(201, { id: "2" }, true));

    await httpClient({ method: "POST", path: "/notes", body: { title: "t", content: "c" } });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ title: "t", content: "c" }),
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      })
    );
  });

  it("returns null on 204 No Content", async () => {
    const noContentResponse = {
      ok: true,
      status: 204,
      statusText: "No Content",
      json: () => Promise.resolve(null),
    } as unknown as Response;
    mockFetch.mockResolvedValueOnce(noContentResponse);

    const result = await httpClient({ method: "DELETE", path: "/notes/1" });
    expect(result).toBeNull();
  });
});
