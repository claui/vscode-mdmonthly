import { commands, ExtensionContext } from "vscode";

import { openJournalEntry } from "./journal";
import log from "./log";

export function activate(context: ExtensionContext) {
  commands.registerCommand("mdmonthly.action.showLog", log.show, log);
  commands.registerCommand("mdmonthly.action.openJournalEntry",
    openJournalEntry);

  const version = context.extension.packageJSON.version as string;
  log.info(`Extension v${version} startup successful`);
  return {};
}

export function deactivate() {
  return;
}
