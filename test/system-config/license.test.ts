import { describe, it, expect, beforeAll } from "vitest";
import { getTestConnector } from "../setup";
import { TaiyiConnector } from "../../src/connector";

describe("许可证管理", () => {
  let connector: TaiyiConnector;

  beforeAll(async () => {
    connector = await getTestConnector();
  });

  it("getActivatedLicense 获取已激活许可证", async () => {
    const result = await connector.getActivatedLicense();
    // 可能没有激活的许可证，不视为错误
    expect(result).toBeDefined();
  });

  it("queryLicenses 查询许可证列表", async () => {
    const result = await connector.queryLicenses();
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });
});
