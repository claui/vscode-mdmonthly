import {
  commands,
} from "vscode";

import log from "./log";

export function activate() {
  commands.registerCommand("mdmonthly.action.showLog", log.show, log);

  log.info("Extension startup successful");
  return {};
}

export function deactivate() {
  return;
}
