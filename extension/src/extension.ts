import { commands } from "vscode";

import { openJournalEntry } from "./journal";
import log from "./log";

export function activate() {
  commands.registerCommand("mdmonthly.action.showLog", log.show, log);
  commands.registerCommand("mdmonthly.action.openJournalEntry",
    openJournalEntry);

  log.info("Extension startup successful");
  return {};
}

export function deactivate() {
  return;
}
