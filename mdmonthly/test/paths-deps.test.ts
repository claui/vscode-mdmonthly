import { Paths } from "mdmonthly/src/paths-deps";

describe("the Paths object", () => {
  it("returns a directory", () => {
    expect(Paths.dataPath).toMatch(/.*\/mdmonthly/);
  });
});
