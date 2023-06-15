import _fs from "fs";
import path from "path";

import { Temporal } from "@js-temporal/polyfill";

import { Fs } from "./fs-deps";
import { Paths } from "./paths-deps";

const { PlainDate } = Temporal;

export type JournalResult = {
  markdownFilePath: string;
  headerSnippet: string;
  line: number;
  character: number;
};

function readLines(
  year: string, month: string, yearDirectory: string,
  { fs = _fs }: { fs?: Fs } = {},
) {
  const markdownFileName = `${year}-${month}.md`;
  const markdownFilePath: string = path.join(yearDirectory, markdownFileName);

  if (!fs.existsSync(markdownFilePath)) {
    fs.writeFileSync(markdownFilePath, `# ${year}-${month}\n\n`);
  }

  const fileContent: string = fs.readFileSync(markdownFilePath, "utf8");
  const lines: string[] = fileContent.split("\n");
  return { lines, markdownFilePath };
}

function splitDate(date: Temporal.PlainDate): {
  year: string, month: string, day: string,
} {
  return {
    year: date.year.toString(),
    month: date.month.toString().padStart(2, "0"),
    day: date.day.toString().padStart(2, "0"),
  }
}

function calculateInsertLine(
  lines: string[], date: Temporal.PlainDate): number {
  for (let i: number = 0; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) {
      const entryDate: Temporal.PlainDate
        = PlainDate.from(lines[i].substring(3));
      if (PlainDate.compare(entryDate, date) > 0) {
        return i;
      }
    }
  }

  return lines.length - 1;
}

type JournalOptions = { projectRoot?: string, fs?: Fs, paths?: typeof Paths };

export function createOrFindJournalEntry(
  isoDate: string,
  {
    projectRoot = void 0,
    fs = _fs,
    paths = Paths,
  }: JournalOptions = {},
): JournalResult {
  const date: Temporal.PlainDate = PlainDate.from(isoDate);
  const { year, month, day } = splitDate(date);
  const headerSnippet = `## ${year}-${month}-${day}\n\n`;
  const yearDirectory: string = path.join(projectRoot ?? paths.dataPath, year);

  if (!fs.existsSync(yearDirectory)) {
    fs.mkdirSync(yearDirectory, { recursive: true });
  }

  const { lines, markdownFilePath }:
    { lines: string[]; markdownFilePath: string; }
    = readLines(year, month, yearDirectory);

  return {
    markdownFilePath,
    headerSnippet,
    line: calculateInsertLine(lines, date),
    character: 0,
  };
}
