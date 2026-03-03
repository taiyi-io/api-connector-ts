import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestConnector } from "../setup";
import { TaiyiConnector } from "../../src/connector";
import { ComputePoolStrategy } from "../../src/enums";

const TEST_POOL_ID = "test-pool-ci";

describe("计算池管理", () => {
  let connector: TaiyiConnector;
  let poolCreated = false;

  beforeAll(async () => {
    connector = await getTestConnector();
  });

  afterAll(async () => {
    if (poolCreated) {
      await connector.deleteComputePool(TEST_POOL_ID);
    }
  });

  it("queryComputePools 返回计算池列表", async () => {
    const result = await connector.queryComputePools();
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("完整 CRUD：创建→查询→修改策略→删除", async () => {
    // 创建
    const createResult = await connector.addComputePool({
      id: TEST_POOL_ID,
      strategy: ComputePoolStrategy.MostAvailableMemory,
      description: "CI 测试计算池",
    });
    expect(createResult.error).toBeUndefined();
    poolCreated = true;

    // 查询验证存在
    const getResult = await connector.getComputePool(TEST_POOL_ID);
    expect(getResult.error).toBeUndefined();
    expect(getResult.data).toBeDefined();
    expect(getResult.data!.id).toBe(TEST_POOL_ID);

    // 修改策略
    const strategyResult = await connector.changeComputePoolStrategy(
      TEST_POOL_ID,
      ComputePoolStrategy.LeastCoreLoad
    );
    expect(strategyResult.error).toBeUndefined();

    // 删除
    const deleteResult = await connector.deleteComputePool(TEST_POOL_ID);
    expect(deleteResult.error).toBeUndefined();
    poolCreated = false;

    // 验证已删除
    const getAfterDelete = await connector.queryComputePools();
    expect(getAfterDelete.error).toBeUndefined();
    const found = getAfterDelete.data?.find((p) => p.id === TEST_POOL_ID);
    expect(found).toBeUndefined();
  });
});
