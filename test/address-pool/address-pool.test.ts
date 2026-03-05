import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestConnector } from "../setup";
import { TaiyiConnector } from "../../src/connector";
import { AddressMode } from "../../src/enums";

const TEST_POOL_ID = "ci-test-addr-pool";

describe("地址池管理（验证同步调用）", () => {
  let connector: TaiyiConnector;
  let poolCreated = false;

  beforeAll(async () => {
    connector = await getTestConnector();
  });

  afterAll(async () => {
    if (poolCreated) {
      await connector.deleteAddressPool(TEST_POOL_ID);
    }
  });

  it("queryAddressPoolConfigs 返回地址池配置列表", async () => {
    const result = await connector.queryAddressPoolConfigs();
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("createAddressPool 同步创建地址池（无 invalid task 错误）", async () => {
    const result = await connector.createAddressPool(
      TEST_POOL_ID,
      AddressMode.V4Only,
      "CI 测试地址池"
    );
    expect(result.error).toBeUndefined();
    poolCreated = true;
  });

  it("getAddressPoolDetail 查询地址池详情", async () => {
    if (!poolCreated) return;
    const result = await connector.getAddressPoolDetail(TEST_POOL_ID);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data!.config.id).toBe(TEST_POOL_ID);
    expect(result.data!.config.mode).toBe(AddressMode.V4Only);
  });

  it("addAddressRange 同步添加地址范围（无 invalid task 错误）", async () => {
    if (!poolCreated) return;
    const result = await connector.addAddressRange(
      TEST_POOL_ID,
      "ext-v4",
      "192.168.100.10",
      "192.168.100.20"
    );
    expect(result.error).toBeUndefined();
  });

  it("removeAddressRange 同步删除地址范围（无 invalid task 错误）", async () => {
    if (!poolCreated) return;
    const result = await connector.removeAddressRange(
      TEST_POOL_ID,
      "ext-v4",
      "192.168.100.10",
      "192.168.100.20"
    );
    expect(result.error).toBeUndefined();
  });

  it("modifyAddressPool 同步修改地址池（无 invalid task 错误）", async () => {
    if (!poolCreated) return;
    const result = await connector.modifyAddressPool(
      TEST_POOL_ID,
      "CI 测试地址池（已修改）"
    );
    expect(result.error).toBeUndefined();
  });

  it("deleteAddressPool 同步删除地址池（无 invalid task 错误）", async () => {
    if (!poolCreated) return;
    const result = await connector.deleteAddressPool(TEST_POOL_ID);
    expect(result.error).toBeUndefined();
    poolCreated = false;

    // 验证已删除
    const configs = await connector.queryAddressPoolConfigs();
    expect(configs.error).toBeUndefined();
    const found = configs.data?.find((p) => p.id === TEST_POOL_ID);
    expect(found).toBeUndefined();
  });
});
