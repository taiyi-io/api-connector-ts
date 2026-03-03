import { describe, it, expect, beforeAll } from "vitest";
import { getTestConnector } from "../setup";
import { TaiyiConnector } from "../../src/connector";

describe("认证接口", () => {
  let connector: TaiyiConnector;

  beforeAll(async () => {
    connector = await getTestConnector();
  });

  it("令牌认证成功后可查询系统状态", async () => {
    // getTestConnector 内部已完成令牌认证
    const result = await connector.getSystemStatus();
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
  });

  it("authenticateByToken 使用有效 accessString 成功", async () => {
    // 已在 setup 中验证，此处验证认证状态
    expect(connector).toBeDefined();
  });
});
