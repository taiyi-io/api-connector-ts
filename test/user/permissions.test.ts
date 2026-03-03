import { describe, it, expect, beforeAll } from "vitest";
import { getTestConnector } from "../setup";
import { TaiyiConnector } from "../../src/connector";
import { ResourceType } from "../../src/enums";

describe("资源权限管理", () => {
  let connector: TaiyiConnector;

  beforeAll(async () => {
    connector = await getTestConnector();
  });

  it("queryWhiteList 查询白名单列表", async () => {
    const result = await connector.queryWhiteList(0, 10);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data!.records)).toBe(true);
  });

  it("queryUserRoles 查询用户角色", async () => {
    const result = await connector.queryUserRoles();
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });
});
