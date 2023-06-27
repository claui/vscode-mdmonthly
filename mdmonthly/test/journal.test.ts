import fs from "fs";
import path from "path";

import tmp from "tmp";

import { createOrFindJournalEntry, JournalResult } from "mdmonthly";
import { Paths as _Paths } from "../src/paths-deps";

function createTempDir(): string {
  return tmp
    .dirSync({ template: "journal-test-XXXXXX" })
    .name;
}

function deleteTempDir(tempDir: string): void {
  fs.rmSync(tempDir, { recursive: true });
}

describe("createOrFindJournalEntry", () => {
  describe("if no directory exists", () => {
    let tempDir: string;
    let result: JournalResult;

    beforeAll(() => {
      tempDir = createTempDir();
      const isoDate = "2023-04-01";
      result = createOrFindJournalEntry(isoDate, { projectRoot: tempDir });
    });

    afterAll(() => {
      if (tempDir) {
        deleteTempDir(tempDir);
      }
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
      expect(result.entry).toEqual({
        exists: false,
        headerSnippetToInsert: "## 2023-04-01\n\n",
      });
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
      const original: JournalResult = createOrFindJournalEntry(
        isoDate1, { projectRoot: tempDir },
      );
      if (original.entry.exists) {
        fail("Original entry exists");
      }
      fs.appendFileSync(original.markdownFilePath,
        original.entry.headerSnippetToInsert, { encoding: "utf8" });
      result = createOrFindJournalEntry(isoDate2, { projectRoot: tempDir });
    });

    afterAll(() => {
      if (tempDir) {
        deleteTempDir(tempDir);
      }
    });

    it("prepares a L2 header snippet for the day", () => {
      expect(result.entry).toEqual({
        exists: false,
        headerSnippetToInsert: "## 2023-04-02\n\n",
      });
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
      const original: JournalResult = createOrFindJournalEntry(
        isoDate1, { projectRoot: tempDir },
      );
      if (original.entry.exists) {
        fail("Original entry exists");
      };
      fs.appendFileSync(original.markdownFilePath,
        original.entry.headerSnippetToInsert, { encoding: "utf8" });
      result = createOrFindJournalEntry(
        isoDate2, { projectRoot: tempDir },
      );
    });

    afterAll(() => {
      if (tempDir) {
        deleteTempDir(tempDir);
      }
    });

    it("prepares a L2 header snippet for the day", () => {
      expect(result.entry).toEqual({
        exists: false,
        headerSnippetToInsert: "## 2023-04-01\n\n",
      });
    });

    it("identifies the correct L2 header insertion point", () => {
      expect(result.line).toBe(2);
      expect(result.character).toBe(0);
    });
  });

  describe("a Markdown file exists and contains the given entry", () => {
    let tempDir: string;
    let result: JournalResult;

    beforeAll(() => {
      tempDir = createTempDir();
      const isoDate = "2023-04-01";
      const original: JournalResult = createOrFindJournalEntry(
        isoDate, { projectRoot: tempDir },
      );
      if (original.entry.exists) {
        fail("Original entry exists");
      };
      fs.appendFileSync(original.markdownFilePath,
        original.entry.headerSnippetToInsert, { encoding: "utf8" });
      result = createOrFindJournalEntry(
        isoDate, { projectRoot: tempDir },
      );
    });

    afterAll(() => {
      if (tempDir) {
        deleteTempDir(tempDir);
      }
    });

    it("prepares a L2 header snippet for the day", () => {
      expect(result.entry.exists).toBe(true);
    });

    it("identifies the correct L2 header insertion point", () => {
      expect(result.line).toBe(2);
      expect(result.character).toBe(0);
    });
  });

  describe("no projectRoot is given", () => {
    let tempDir: string;
    let Paths: typeof _Paths;
    let result: JournalResult;

    beforeAll(() => {
      tempDir = createTempDir();
      const isoDate = "2023-04-01";
      Paths = {
        dataPath: path.join(tempDir, "fake-xdg-data", "mdmonthly"),
      };
      result = createOrFindJournalEntry(isoDate, { paths: Paths });
    });

    afterAll(() => {
      if (tempDir) {
        deleteTempDir(tempDir);
      }
    });

    it("creates a subdirectory of the XDG data directory", () => {
      expect(
        fs.existsSync(path.join(tempDir, "fake-xdg-data", "mdmonthly", "2023")),
      )
        .toBe(true);
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
      expect(result.entry).toEqual({
        exists: false,
        headerSnippetToInsert: "## 2023-04-01\n\n",
      });
    });

    it("identifies the correct L2 header insertion point", () => {
      expect(result.line).toBe(2);
      expect(result.character).toBe(0);
    });
  });
});
