import { describe, it, expect, beforeAll } from "vitest";
import { getTestConnector } from "../setup";
import { getAvailableNode } from "../helpers/resource-guard";
import { TaiyiConnector } from "../../src/connector";

describe("节点配置", () => {
  let connector: TaiyiConnector;
  let nodeID: string | null = null;

  beforeAll(async () => {
    connector = await getTestConnector();
    nodeID = await getAvailableNode(connector);
    if (!nodeID) {
      console.warn("跳过节点配置测试：没有可用的节点");
    }
  });

  it("getConfig 获取节点配置", async () => {
    if (!nodeID) return;
    const result = await connector.getConfig(nodeID);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
  });
});
