import {
  InputBoxValidationMessage,
  InputBoxValidationSeverity,
  window,
} from "vscode";

import { Temporal } from "@js-temporal/polyfill";

import { createOrFindJournalEntry, JournalResult } from "mdmonthly";

import log from "./log";

const { PlainDate } = Temporal;

function validateInput(value: string): InputBoxValidationMessage | undefined {
  try {
    PlainDate.from(value);
    return void 0;
  } catch (error) {
    if (error instanceof RangeError) {
      return {
        message: error.message,
        severity: InputBoxValidationSeverity.Error,
      };
    }
    throw error;
  }
}

async function queryIsoDate() {
  return await window.showInputBox({
    title: "Date of journal entry",
    prompt: "Enter a date to create or open a journal entry",
    ignoreFocusOut: true,
    value: Temporal.Now.plainDateISO().toString(),
    validateInput,
  });
}

export async function openJournalEntry() {
  const chosenDate: string | undefined = await queryIsoDate();
  if (!chosenDate) {
    return;
  }
  const journalResult: JournalResult = createOrFindJournalEntry(chosenDate);
  log.info(`Result: ${JSON.stringify(journalResult)}`);
}
