import _fs from "fs";
import path from "path";

import dedent from "ts-dedent";
import { Temporal } from "@js-temporal/polyfill";

import { DateFormattingError } from "./errors";
import { Fs } from "./fs-deps";
import { Paths } from "./paths-deps";

const { PlainDate } = Temporal;

export type JournalResultEntry =
  | { exists: true }
  | { exists: false, headerSnippetToInsert: string };

export interface JournalResult {
  markdownFilePath: string;
  entry: JournalResultEntry;
  line: number;
  character: number;
}

const DEFAULT_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long", year: "numeric", month: "2-digit", day: "2-digit",
};
const MARKER_REGEXP = /^<!-- (?<isoDate>\d{4}-\d{2}-\d{2}) -->$/;

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

interface InsertLine {
  exists: boolean;
  line: number;
}

function calculateInsertLine(
  lines: string[], date: Temporal.PlainDate): InsertLine {
  for (let i: number = 0; i < lines.length - 1; i++) {
    const capturingMatch: RegExpExecArray | null = MARKER_REGEXP.exec(lines[i]);
    if (capturingMatch?.groups && lines[i + 1].startsWith("## ")) {
      const entryDate: Temporal.PlainDate =
        PlainDate.from(capturingMatch.groups.isoDate);
      if (PlainDate.compare(entryDate, date) >= 0) {
        return { exists: date.equals(entryDate), line: i };
      }
    }
  }

  return { exists: false, line: lines.length - 1 };
}

interface JournalOptions {
  projectRoot?: string;
  locales?: string | string[];
  dateFormatOptions?: Intl.DateTimeFormatOptions;
  fs?: Fs;
  paths?: typeof Paths;
}

function snippetFor(isoDate: string, localizedDate: string): string {
  return dedent`
        <!-- ${isoDate} -->
        ## ${localizedDate}


      `;
}

export function createOrFindJournalEntry(
  isoDate: string,
  {
    projectRoot = void 0,
    locales = void 0,
    dateFormatOptions = DEFAULT_DATE_FORMAT_OPTIONS,
    fs = _fs,
    paths = Paths,
  }: JournalOptions = {},
): JournalResult {
  const date: Temporal.PlainDate = PlainDate.from(isoDate);
  const { year, month, day: _ } = splitDate(date);
  const yearDirectory: string = path.join(projectRoot ?? paths.dataPath, year);

  if (!fs.existsSync(yearDirectory)) {
    fs.mkdirSync(yearDirectory, { recursive: true });
  }

  const { lines, markdownFilePath }:
    { lines: string[]; markdownFilePath: string; }
    = readLines(year, month, yearDirectory);

  const { exists, line } = calculateInsertLine(lines, date);

  let localizedDate: string;
  try {
    localizedDate = date.toLocaleString(locales, dateFormatOptions);
  } catch (error) {
    if ("message" in error
      && typeof error.message === "string"
      && (error.message as string)
        .match("Incorrect locale information provided")
    ) {
      throw new DateFormattingError(error, locales, { cause: error });
    }
    /* c8 ignore next */
    throw error;
    /* c8 ignore next */
  }
  return {
    markdownFilePath,
    entry: exists ? { exists } : {
      exists,
      headerSnippetToInsert: snippetFor(date.toString(), localizedDate),
    },
    line,
    character: 0,
  };
}
