import { describe, it, expect, beforeAll } from "vitest";
import { getTestConnector } from "../setup";
import { TaiyiConnector } from "../../src/connector";

describe("系统模板管理", () => {
  let connector: TaiyiConnector;

  beforeAll(async () => {
    connector = await getTestConnector();
  });

  it("querySystems 返回系统模板列表", async () => {
    const result = await connector.querySystems(0, 10);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data!.records)).toBe(true);
  });

  it("fetchAllSystems 获取所有系统模板", async () => {
    const result = await connector.fetchAllSystems();
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });
});
