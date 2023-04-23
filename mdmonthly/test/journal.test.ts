import fs from "fs";
import path from "path";

import tmp from "tmp";

tmp.setGracefulCleanup();

import { createOrFindJournalEntry, JournalResult } from "../src/index";

function createTempDir(): string {
  return tmp
    .dirSync({ template: "journal-test-XXXXXX", unsafeCleanup: true })
    .name;
}

function deleteTempDir(tempDir: string): void {
  fs.rmdirSync(tempDir, { recursive: true });
}

describe("createOrFindJournalEntry", () => {
  describe("if neither directory or Markdown file are existing", () => {
    let tempDir: string;
    let result: JournalResult;

    beforeAll(() => {
      tempDir = createTempDir();
      const isoDate = "2023-04-01";
      result = createOrFindJournalEntry(isoDate, tempDir);
    });

    it("creates a subdirectory", () => {
      expect(fs.existsSync(path.join(tempDir, "2023"))).toBe(true);
    });

    it("creates a file inside the subdirectory", () => {
      expect(fs.existsSync(result.markdownFilePath)).toBe(true);
    });

    it("includes a L1 header in the file", () => {
      const fileContent: string =
        fs.readFileSync(result.markdownFilePath, "utf8");
      expect(fileContent).toContain("# 2023-04\n\n");
    });

    it("prepares a L2 header snippet for the day", () => {
      expect(result.headerSnippet).toBe("## 2023-04-01\n\n");
    });

    it("identifies the correct L2 header insertion point", () => {
      expect(result.line).toBe(2);
      expect(result.character).toBe(0);
    });
  });

  describe("a Markdown file exists but contains no future entries", () => {
    let tempDir: string;
    let result: JournalResult;

    beforeAll(() => {
      tempDir = createTempDir();
      const isoDate1 = "2023-04-01";
      const isoDate2 = "2023-04-02";
      const original = createOrFindJournalEntry(isoDate1, tempDir);
      fs.appendFileSync(original.markdownFilePath,
        original.headerSnippet, { encoding: "utf8" });
      result = createOrFindJournalEntry(isoDate2, tempDir);
    });

    it("prepares a L2 header snippet for the day", () => {
      expect(result.headerSnippet).toBe("## 2023-04-02\n\n");
    });

    it("identifies the correct L2 header insertion point", () => {
      expect(result.line).toBe(4);
      expect(result.character).toBe(0);
    });
  });

  describe("a Markdown file exists and contains a future entry", () => {
    let tempDir: string;
    let result: JournalResult;

    beforeAll(() => {
      tempDir = createTempDir();
      const isoDate1 = "2023-04-03";
      const isoDate2 = "2023-04-01";
      const original = createOrFindJournalEntry(isoDate1, tempDir);
      fs.appendFileSync(original.markdownFilePath,
        original.headerSnippet, { encoding: "utf8" });
      result = createOrFindJournalEntry(isoDate2, tempDir);
    });

    it("prepares a L2 header snippet for the day", () => {
      expect(result.headerSnippet).toBe("## 2023-04-01\n\n");
    });

    it("identifies the correct L2 header insertion point", () => {
      expect(result.line).toBe(2);
      expect(result.character).toBe(0);
    });
  });
});
