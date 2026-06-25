import { run } from "../src/cli";
import { noteStore } from "../src/models/note";

beforeEach(() => noteStore.clear());

async function invoke(argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await run(argv, { out: (s) => out.push(s), err: (s) => err.push(s) });
  return { code, stdout: out.join(""), stderr: err.join("") };
}

describe("CLI tests", () => {
  // 1. create happy path
  it("create happy path — exit 0, stdout parses to a Note with the supplied title", async () => {
    const { code, stdout } = await invoke(["create", "--title", "My Test Note", "--content", "Some content"]);
    expect(code).toBe(0);
    const note = JSON.parse(stdout);
    expect(note.title).toBe("My Test Note");
    expect(note.id).toBeDefined();
    expect(note.createdAt).toBeDefined();
  });

  // 2. create missing --title
  it("create missing --title — exit 1, stderr contains 'title'", async () => {
    const { code, stderr } = await invoke(["create", "--content", "Some content"]);
    expect(code).toBe(1);
    expect(stderr).toContain("title");
  });

  // 3. create missing --content
  it("create missing --content — exit 1, stderr contains 'content'", async () => {
    const { code, stderr } = await invoke(["create", "--title", "My Note"]);
    expect(code).toBe(1);
    expect(stderr).toContain("content");
  });

  // 4. list empty store
  it("list empty store — exit 0, stdout JSON.parse → empty array", async () => {
    const { code, stdout } = await invoke(["list"]);
    expect(code).toBe(0);
    const notes = JSON.parse(stdout);
    expect(notes).toEqual([]);
  });

  // 5. list with notes + --tag filter
  it("list with notes + --tag filter — only notes with the tag returned", async () => {
    await invoke(["create", "--title", "Work Note", "--content", "Body", "--tags", "work"]);
    await invoke(["create", "--title", "Personal Note", "--content", "Body", "--tags", "personal"]);

    const { code, stdout } = await invoke(["list", "--tag", "work"]);
    expect(code).toBe(0);
    const notes = JSON.parse(stdout);
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe("Work Note");
  });

  // 6. list with --search — case-insensitive substring match on title
  it("list with --search — case-insensitive substring match on title", async () => {
    await invoke(["create", "--title", "Meeting Notes", "--content", "Important meeting"]);
    await invoke(["create", "--title", "Shopping List", "--content", "Buy milk"]);

    const { code, stdout } = await invoke(["list", "--search", "meeting"]);
    expect(code).toBe(0);
    const notes = JSON.parse(stdout);
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe("Meeting Notes");
  });

  // 7. get <id> happy path
  it("get <id> happy path — exit 0, returns the note JSON", async () => {
    const createResult = await invoke(["create", "--title", "Get Me", "--content", "Here I am"]);
    const created = JSON.parse(createResult.stdout);

    const { code, stdout } = await invoke(["get", created.id]);
    expect(code).toBe(0);
    const note = JSON.parse(stdout);
    expect(note.id).toBe(created.id);
    expect(note.title).toBe("Get Me");
  });

  // 8. get <missing-id>
  it("get <missing-id> — exit 1, stderr mentions 'not found'", async () => {
    const { code, stderr } = await invoke(["get", "nonexistent-id-123"]);
    expect(code).toBe(1);
    expect(stderr.toLowerCase()).toMatch(/not found/i);
  });

  // 9. update <id> --title X
  it("update <id> --title X — exit 0, title changed in response", async () => {
    const createResult = await invoke(["create", "--title", "Original Title", "--content", "Content"]);
    const created = JSON.parse(createResult.stdout);

    const { code, stdout } = await invoke(["update", created.id, "--title", "Updated Title"]);
    expect(code).toBe(0);
    const updated = JSON.parse(stdout);
    expect(updated.title).toBe("Updated Title");
    expect(updated.content).toBe("Content");
  });

  // 10. update <missing-id>
  it("update <missing-id> — exit 1, stderr mentions not found", async () => {
    const { code, stderr } = await invoke(["update", "nonexistent-id-456", "--title", "New Title"]);
    expect(code).toBe(1);
    expect(stderr.toLowerCase()).toMatch(/not found/i);
  });

  // 11. update <id> with invalid (empty) title via --title=""
  it("update <id> with invalid (empty) title via --title='' — exit 1, stderr mentions title", async () => {
    const createResult = await invoke(["create", "--title", "Some Title", "--content", "Content"]);
    const created = JSON.parse(createResult.stdout);

    const { code, stderr } = await invoke(["update", created.id, "--title="]);
    expect(code).toBe(1);
    expect(stderr).toContain("title");
  });

  // 12. delete <id> happy path
  it("delete <id> happy path — exit 0, stdout JSON has deleted:true; subsequent get returns exit 1", async () => {
    const createResult = await invoke(["create", "--title", "Delete Me", "--content", "Bye"]);
    const created = JSON.parse(createResult.stdout);

    const { code, stdout } = await invoke(["delete", created.id]);
    expect(code).toBe(0);
    const result = JSON.parse(stdout);
    expect(result.deleted).toBe(true);

    // Subsequent get should fail
    const getResult = await invoke(["get", created.id]);
    expect(getResult.code).toBe(1);
  });

  // 13. delete <missing-id>
  it("delete <missing-id> — exit 1", async () => {
    const { code } = await invoke(["delete", "nonexistent-id-789"]);
    expect(code).toBe(1);
  });

  // 14. --version
  it("--version — exit 0, stdout starts with 'noteapi/'", async () => {
    const { code, stdout } = await invoke(["--version"]);
    expect(code).toBe(0);
    expect(stdout).toMatch(/^noteapi\//);
  });

  // 15. -V short flag — same as --version
  it("-V short flag — exit 0, stdout starts with 'noteapi/'", async () => {
    const { code, stdout } = await invoke(["-V"]);
    expect(code).toBe(0);
    expect(stdout).toMatch(/^noteapi\//);
  });

  // 16. --help root
  it("--help root — exit 0, stdout contains 'create' and 'list' and 'delete'", async () => {
    const { code, stdout } = await invoke(["--help"]);
    expect(code).toBe(0);
    expect(stdout).toContain("create");
    expect(stdout).toContain("list");
    expect(stdout).toContain("delete");
  });

  // 17. create --help
  it("create --help — exit 0, stdout contains '--title' and '--content'", async () => {
    const { code, stdout } = await invoke(["create", "--help"]);
    expect(code).toBe(0);
    expect(stdout).toContain("--title");
    expect(stdout).toContain("--content");
  });

  // 18. Unknown command `frobnicate`
  it("Unknown command 'frobnicate' — exit 1, stderr contains 'Unknown command'", async () => {
    const { code, stderr } = await invoke(["frobnicate"]);
    expect(code).toBe(1);
    expect(stderr).toContain("Unknown command");
  });

  // 19. Unknown flag `list --bogus x`
  it("Unknown flag 'list --bogus x' — exit 1, stderr contains 'Unknown flag' or 'bogus'", async () => {
    const { code, stderr } = await invoke(["list", "--bogus", "x"]);
    expect(code).toBe(1);
    expect(stderr).toMatch(/Unknown flag|bogus/i);
  });
});
