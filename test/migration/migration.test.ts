import { describe, it, expect, beforeAll } from "vitest";
import { getTestConnector } from "../setup";
import { TaiyiConnector } from "../../src/connector";

describe.skip("迁移方法（stub 验证）", () => {
  let connector: TaiyiConnector;

  beforeAll(async () => {
    connector = await getTestConnector();
  });

  it("tryMigrateToNode 方法存在", () => {
    expect(typeof connector.tryMigrateToNode).toBe("function");
  });

  it("tryImportGuestsToNode 方法存在", () => {
    expect(typeof connector.tryImportGuestsToNode).toBe("function");
  });

  it("tryReloadResourceStorage 方法存在", () => {
    expect(typeof connector.tryReloadResourceStorage).toBe("function");
  });
});
