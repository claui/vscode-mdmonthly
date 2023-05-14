import envPaths from "env-paths";

const BASE_NAME = "mdmonthly";

export const Paths = {
  get dataPath(): string {
    return envPaths(BASE_NAME, { suffix: "" }).data
  },
};
