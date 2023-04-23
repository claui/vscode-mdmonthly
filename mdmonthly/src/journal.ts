import fs from "fs";
import path from "path";

import { Temporal } from "@js-temporal/polyfill";

const { PlainDate } = Temporal;

export type JournalResult = {
  markdownFilePath: string;
  headerSnippet: string;
  line: number;
  character: number;
};

export function createOrFindJournalEntry(
  isoDate: string,
  projectRoot: string,
): JournalResult {
  const date: Temporal.PlainDate = PlainDate.from(isoDate);
  const year: string = date.year.toString();
  const month: string = date.month.toString().padStart(2, "0");
  const day: string = date.day.toString().padStart(2, "0");

  const yearDirectory: string = path.join(projectRoot, year);
  if (!fs.existsSync(yearDirectory)) {
    fs.mkdirSync(yearDirectory);
  }

  const markdownFileName = `${year}-${month}.md`;
  const markdownFilePath: string = path.join(yearDirectory, markdownFileName);
  const headerSnippet = `## ${year}-${month}-${day}\n\n`;

  if (!fs.existsSync(markdownFilePath)) {
    fs.writeFileSync(markdownFilePath, `# ${year}-${month}\n\n`);
  }

  const fileContent: string = fs.readFileSync(markdownFilePath, "utf8");
  const lines: string[] = fileContent.split("\n");

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
