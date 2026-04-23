import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestConnector } from "../setup";
import { TaiyiConnector } from "../../src/connector";

const TEST_POLICY_ID = "ci-test-policy";
const TEST_POLICY_COPY_ID = "ci-test-policy-copy";

describe("安全策略组管理", () => {
  let connector: TaiyiConnector;
  let policyCreated = false;
  let policyCopyCreated = false;

  beforeAll(async () => {
    connector = await getTestConnector();
    // 前置清理：删除可能残留的同名策略
    await connector.deleteSecurityPolicy(TEST_POLICY_COPY_ID);
    await connector.deleteSecurityPolicy(TEST_POLICY_ID);
  });

  afterAll(async () => {
    if (policyCopyCreated) {
      await connector.deleteSecurityPolicy(TEST_POLICY_COPY_ID);
    }
    if (policyCreated) {
      await connector.deleteSecurityPolicy(TEST_POLICY_ID);
    }
  });

  it("querySecurityPolicies 返回安全策略列表", async () => {
    const result = await connector.querySecurityPolicies();
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("createSecurityPolicy 创建安全策略组", async () => {
    const result = await connector.createSecurityPolicy(
      TEST_POLICY_ID,
      "CI测试安全策略",
      [],
      [],
      "CI集成测试用安全策略"
    );
    expect(result.error).toBeUndefined();
    policyCreated = true;
  });

  it("getSecurityPolicy 查询创建的安全策略", async () => {
    if (!policyCreated) return;
    const result = await connector.getSecurityPolicy(TEST_POLICY_ID);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data!.id).toBe(TEST_POLICY_ID);
  });

  it("modifySecurityPolicy 修改安全策略组", async () => {
    if (!policyCreated) return;
    const result = await connector.modifySecurityPolicy(
      TEST_POLICY_ID,
      "CI测试安全策略（已修改）",
      "修改后的描述"
    );
    expect(result.error).toBeUndefined();
  });

  it("copySecurityPolicy 复制安全策略组", async () => {
    if (!policyCreated) return;
    const result = await connector.copySecurityPolicy(
      TEST_POLICY_ID,
      TEST_POLICY_COPY_ID,
      "CI测试安全策略（复制）"
    );
    expect(result.error).toBeUndefined();
    policyCopyCreated = true;
  });

  it("deleteSecurityPolicy 删除安全策略组", async () => {
    if (policyCopyCreated) {
      const copyResult = await connector.deleteSecurityPolicy(TEST_POLICY_COPY_ID);
      expect(copyResult.error).toBeUndefined();
      policyCopyCreated = false;
    }
    if (!policyCreated) return;
    const result = await connector.deleteSecurityPolicy(TEST_POLICY_ID);
    expect(result.error).toBeUndefined();
    policyCreated = false;
  });
});
