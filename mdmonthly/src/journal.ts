import fs from "fs";
import path from "path";

import { Temporal } from "@js-temporal/polyfill";
import envPaths from "env-paths";

const { PlainDate } = Temporal;

const BASE_NAME = "mdmonthly";

export type JournalResult = {
  markdownFilePath: string;
  headerSnippet: string;
  line: number;
  character: number;
};

function readLines(year: string, month: string, yearDirectory: string) {
  const markdownFileName = `${year}-${month}.md`;
  const markdownFilePath: string = path.join(yearDirectory, markdownFileName);

  if (!fs.existsSync(markdownFilePath)) {
    fs.writeFileSync(markdownFilePath, `# ${year}-${month}\n\n`);
  }

  const fileContent: string = fs.readFileSync(markdownFilePath, "utf8");
  const lines: string[] = fileContent.split("\n");
  return { lines, markdownFilePath };
}

export function createOrFindJournalEntry(
  isoDate: string,
  projectRoot?: string,
): JournalResult {
  const paths = envPaths(BASE_NAME, { suffix: "" });

  const date: Temporal.PlainDate = PlainDate.from(isoDate);
  const year: string = date.year.toString();
  const month: string = date.month.toString().padStart(2, "0");
  const day: string = date.day.toString().padStart(2, "0");

  const yearDirectory: string = path.join(projectRoot ?? paths.data, year);
  if (!fs.existsSync(yearDirectory)) {
    fs.mkdirSync(yearDirectory, { recursive: true });
  }

  const headerSnippet = `## ${year}-${month}-${day}\n\n`;
  const { lines, markdownFilePath }:
  { lines: string[]; markdownFilePath: string; }
    = readLines(year, month, yearDirectory);

  let insertLine: number = -1;
  for (let i: number = 0; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) {
      const entryDate: Temporal.PlainDate
        = PlainDate.from(lines[i].substring(3));
      if (PlainDate.compare(entryDate, date) > 0) {
        insertLine = i;
        break;
      }
    }
  }

  if (insertLine === -1) {
    insertLine = lines.length - 1;
  }

  return {
    markdownFilePath,
    headerSnippet,
    line: insertLine,
    character: 0,
  };
}
