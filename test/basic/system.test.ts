import { describe, it, expect, beforeAll } from "vitest";
import { getTestConnector } from "../setup";
import { TaiyiConnector } from "../../src/connector";

describe("系统状态接口", () => {
  let connector: TaiyiConnector;

  beforeAll(async () => {
    connector = await getTestConnector();
  });

  it("getSystemStatus 返回系统状态", async () => {
    const result = await connector.getSystemStatus();
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
  });

  it("queryClusterStatus 返回集群状态", async () => {
    const result = await connector.queryClusterStatus();
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
  });

  it("queryNodes 返回节点列表", async () => {
    const result = await connector.queryNodes();
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });
});
