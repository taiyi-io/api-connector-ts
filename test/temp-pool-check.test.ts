import { describe, it, expect, beforeAll } from "vitest";
import { getTestConnector } from "./setup";
import { TaiyiConnector } from "../../src/connector";

describe("临时池检查", () => {
  let connector: TaiyiConnector;

  beforeAll(async () => {
    connector = await getTestConnector();
  });

  it("查找带地址池和安全策略的计算池", async () => {
    const pools = await connector.queryComputePools();
    if (pools.data) {
      for (const p of pools.data) {
        const detail = await connector.getComputePool(p.id);
        if (detail.data) {
          console.log(`Pool: ${detail.data.id}, Address: ${detail.data.address}, Policy: ${detail.data.security_policy}, Nodes: ${detail.data.nodes?.length}`);
        }
      }
    }
  });
});
