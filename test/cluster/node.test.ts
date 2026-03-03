import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestConnector } from "../setup";
import { getAvailableNode } from "../helpers/resource-guard";
import { TaiyiConnector } from "../../src/connector";

describe("节点管理", () => {
  let connector: TaiyiConnector;
  let testNodeID: string | null = null;

  beforeAll(async () => {
    connector = await getTestConnector();
    testNodeID = await getAvailableNode(connector);
    if (!testNodeID) {
      console.warn("跳过节点管理测试：没有可用的资源节点");
    }
  });

  it("queryNodes 返回节点列表", async () => {
    const result = await connector.queryNodes();
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("getNode 获取指定节点详情", async () => {
    if (!testNodeID) return;
    const result = await connector.getNode(testNodeID);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data!.id).toBe(testNodeID);
  });

  it("disableNode 禁用节点后可重新启用", async () => {
    if (!testNodeID) return;
    // 禁用
    const disableResult = await connector.disableNode(testNodeID);
    expect(disableResult.error).toBeUndefined();
    // 重新启用
    const enableResult = await connector.enableNode(testNodeID);
    expect(enableResult.error).toBeUndefined();
  });
});
