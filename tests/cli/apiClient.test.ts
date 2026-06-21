import { CliError } from "../../src/cli/types";

// We need to mock global fetch before importing the module
const mockFetch = jest.fn();
global.fetch = mockFetch;

import * as apiClient from "../../src/cli/apiClient";

function makeResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("apiClient.listNotes", () => {
  it("calls GET /api/notes and returns notes", async () => {
    const notes = [{ id: "1", title: "Test", content: "c", tags: [], createdAt: "", updatedAt: "" }];
    mockFetch.mockResolvedValue(makeResponse(200, notes));

    const result = await apiClient.listNotes();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/api/notes");
    expect(result).toEqual(notes);
  });

  it("appends query param when query is provided", async () => {
    mockFetch.mockResolvedValue(makeResponse(200, []));

    await apiClient.listNotes("hello");

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("q=hello");
  });

  it("throws CliError on non-2xx response", async () => {
    mockFetch.mockResolvedValue(makeResponse(500, { error: "Server error" }));

    await expect(apiClient.listNotes()).rejects.toBeInstanceOf(CliError);
  });

  it("uses error message from response body", async () => {
    mockFetch.mockResolvedValue(makeResponse(400, { error: "Bad request message" }));

    await expect(apiClient.listNotes()).rejects.toMatchObject({
      message: "Bad request message",
    });
  });
});

describe("apiClient.getNote", () => {
  it("calls GET /api/notes/:id", async () => {
    const note = { id: "abc", title: "T", content: "C", tags: [], createdAt: "", updatedAt: "" };
    mockFetch.mockResolvedValue(makeResponse(200, note));

    const result = await apiClient.getNote("abc");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/api/notes/abc");
    expect(result).toEqual(note);
  });

  it("throws CliError on 404", async () => {
    mockFetch.mockResolvedValue(makeResponse(404, { error: "Note not found" }));

    await expect(apiClient.getNote("missing")).rejects.toBeInstanceOf(CliError);
  });
});

describe("apiClient.createNote", () => {
  it("calls POST /api/notes with correct body", async () => {
    const created = { id: "new", title: "T", content: "C", tags: [], createdAt: "", updatedAt: "" };
    mockFetch.mockResolvedValue(makeResponse(201, created));

    const result = await apiClient.createNote({ title: "T", content: "C", tags: [] });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/notes");
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body as string)).toEqual({ title: "T", content: "C", tags: [] });
    expect(result).toEqual(created);
  });

  it("throws CliError on 400 with human-readable message", async () => {
    mockFetch.mockResolvedValue(makeResponse(400, { error: "Title is required" }));

    await expect(apiClient.createNote({ title: "", content: "C", tags: [] })).rejects.toMatchObject({
      message: "Title is required",
    });
  });
});

describe("apiClient.updateNote", () => {
  it("calls PUT /api/notes/:id with correct body", async () => {
    const updated = { id: "1", title: "New", content: "C", tags: [], createdAt: "", updatedAt: "" };
    mockFetch.mockResolvedValue(makeResponse(200, updated));

    const result = await apiClient.updateNote("1", { title: "New" });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/notes/1");
    expect(opts.method).toBe("PUT");
    expect(JSON.parse(opts.body as string)).toEqual({ title: "New" });
    expect(result).toEqual(updated);
  });

  it("throws CliError on 404", async () => {
    mockFetch.mockResolvedValue(makeResponse(404, { error: "Note not found" }));

    await expect(apiClient.updateNote("missing", { title: "X" })).rejects.toBeInstanceOf(CliError);
  });
});

describe("apiClient.deleteNote", () => {
  it("calls DELETE /api/notes/:id", async () => {
    mockFetch.mockResolvedValue(makeResponse(204, null));

    await apiClient.deleteNote("1");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/notes/1");
    expect(opts.method).toBe("DELETE");
  });

  it("throws CliError on 404", async () => {
    mockFetch.mockResolvedValue(makeResponse(404, { error: "Note not found" }));

    await expect(apiClient.deleteNote("missing")).rejects.toBeInstanceOf(CliError);
  });
});
