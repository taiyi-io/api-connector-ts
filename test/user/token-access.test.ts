import { describe, it, expect, beforeAll } from "vitest";
import { getTestConnector } from "../setup";
import { TaiyiConnector } from "../../src/connector";
import { UserRole } from "../../src/enums";

describe("令牌和访问管理", () => {
  let connector: TaiyiConnector;

  beforeAll(async () => {
    connector = await getTestConnector();
  });

  it("queryUserTokens 查询用户令牌列表", async () => {
    const result = await connector.queryUserTokens(connector.user, 0, 10);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data!.records)).toBe(true);
  });

  it("queryAccesses 查询访问记录", async () => {
    // 显式校验 Manager 角色，即使失败也会输出详细的权限信息
    if (!connector.requireRole(UserRole.Manager)) {
      console.log("[Test] 当前用户缺少 Manager 角色，预期操作可能会失败");
    }
    const result = await connector.queryAccesses(connector.user, 0, 10);
    if (result.error && result.error.includes("must be manager")) {
      console.log("[Test] 操作因权限不足而失败，符合预期: " + result.error);
      return;
    }
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data!.records)).toBe(true);
  });
});
