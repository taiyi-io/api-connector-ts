import { describe, it, expect, beforeAll } from "vitest";
import { getTestConnector } from "../setup";
import { TaiyiConnector } from "../../src/connector";
import { StatisticRange } from "../../src/enums";

describe("监控和统计", () => {
  let connector: TaiyiConnector;

  beforeAll(async () => {
    connector = await getTestConnector();
  });

  it("getMonitorRules 获取监控规则", async () => {
    const result = await connector.getMonitorRules();
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
  });

  it("queryNodesUsage 查询节点资源使用", async () => {
    const nodes = await connector.queryNodes();
    const ids = (nodes.data || []).map((n) => n.id);
    const result = await connector.queryNodesUsage(ids);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("queryPoolsUsage 查询计算池资源使用", async () => {
    const pools = await connector.queryComputePools();
    const ids = (pools.data || []).map((p) => p.id);
    const result = await connector.queryPoolsUsage(ids);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("queryClusterUsage 查询集群资源使用", async () => {
    const result = await connector.queryClusterUsage();
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
  });
});
