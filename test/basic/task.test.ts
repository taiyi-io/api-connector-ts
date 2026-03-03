import { describe, it, expect, beforeAll } from "vitest";
import { getTestConnector } from "../setup";
import { TaiyiConnector } from "../../src/connector";

describe("任务管理接口", () => {
  let connector: TaiyiConnector;

  beforeAll(async () => {
    connector = await getTestConnector();
  });

  it("queryTasks 返回任务列表", async () => {
    const result = await connector.queryTasks(0, 10);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data!.records)).toBe(true);
  });

  it("clearTasks 清除已完成任务不报错", async () => {
    const result = await connector.clearTasks();
    expect(result.error).toBeUndefined();
  });
});
