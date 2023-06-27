import {
  InputBoxValidationMessage,
  InputBoxValidationSeverity,
  Position,
  Range,
  TextDocument,
  TextEditor,
  TextEditorEdit,
  window,
  workspace,
} from "vscode";

import { Temporal } from "@js-temporal/polyfill";

import { createOrFindJournalEntry, JournalResult, JournalResultEntry } from "mdmonthly";

import log from "./log";

const { PlainDate } = Temporal;

function validateInput(value: string): InputBoxValidationMessage | undefined {
  try {
    PlainDate.from(value);
    return void 0;
  } catch (error) {
    if (error instanceof RangeError) {
      return {
        message: capitalize(error.message),
        severity: InputBoxValidationSeverity.Error,
      };
    }
    throw error;
  }
}

function capitalize(s: string): string {
  return s[0].toUpperCase() + s.slice(1);
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

  const textDocument: TextDocument = await workspace
    .openTextDocument(journalResult.markdownFilePath);
  log.info(`Text document: ${JSON.stringify(textDocument)}`)

  const position = new Position(journalResult.line, journalResult.character);
  const editor: TextEditor = await window
    .showTextDocument(textDocument, {
      selection: new Range(position, position),
    });
  log.info(`Editor: ${JSON.stringify(textDocument)}`)

  const entry: JournalResultEntry = journalResult.entry;
  if (entry.exists) {
    log.info(`Entry already exists at position ${position}`);
    return;
  }
  log.info(`Inserting entry at position ${position}`);
  if (!await editor.edit((builder: TextEditorEdit) => {
    builder.insert(position, entry.headerSnippetToInsert);
  })) {
    await window.showErrorMessage(`Unable to insert entry for ${chosenDate}.`);
  }
}
