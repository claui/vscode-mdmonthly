import fs from "fs";
import path from "path";

import tmp from "tmp";
import dedent from "ts-dedent";

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
  describe("no directory exists", () => {
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

  describe.each([
    {
      style: "short", fileContent: dedent`
        # 2023-04

        ## 2023-04-03

        Test content
      `
    },
  ])(
    "a Markdown file that contains $style-style entries",
    ({ fileContent }) => {

      let tempDir: string;

      beforeAll(() => {
        tempDir = createTempDir();
        fs.mkdirSync(path.join(tempDir, '2023'), { recursive: true })
        fs.writeFileSync(
          path.join(tempDir, '2023', '2023-04.md'),
          fileContent,
          { encoding: "utf8" }
        );
      });

      afterAll(() => {
        if (tempDir) {
          deleteTempDir(tempDir);
        }
      });

      const newDateFuture = "2023-04-04";
      const newDatePast = "2023-04-01";
      const newDateExact = "2023-04-03";

      describe.each([
        {
          caseDescription: "is in the past",
          newDate: "2023-04-01",
          expectedResult: {
            line: 2,
            character: 0,
            entry: {
              exists: false,
              headerSnippetToInsert: "## 2023-04-01\n\n",
            },
          },
        },
        {
          caseDescription: "exactly matches an existing entry",
          newDate: "2023-04-03",
          expectedResult: {
            line: 2,
            character: 0,
            entry: {
              exists: true,
            },
          },
        },
        {
          caseDescription: "is in the future",
          newDate: "2023-04-04",
          expectedResult: {
            line: 4,
            character: 0,
            entry: {
              exists: false,
              headerSnippetToInsert: "## 2023-04-04\n\n",
            },
          },
        },
      ])(
        "the new date $caseDescription", ({ newDate, expectedResult }) => {
          let result: JournalResult;

          beforeAll(() => {
            result = createOrFindJournalEntry(newDate, { projectRoot: tempDir });
          });

          it("prepares a L2 header snippet for the day", () => {
            expect(result.entry).toEqual(expectedResult.entry);
          });

          it("identifies the correct L2 header insertion point", () => {
            expect(result.line).toBe(expectedResult.line);
            expect(result.character).toBe(expectedResult.character);
          });
        });
    });
});
