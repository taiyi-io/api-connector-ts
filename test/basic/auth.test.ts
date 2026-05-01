import { describe, it, expect, beforeAll } from "vitest";
import { getTestConnector } from "../setup";
import { TaiyiConnector } from "../../src/connector";

describe("认证接口", () => {
  let connector: TaiyiConnector;

  beforeAll(async () => {
    connector = await getTestConnector();
  });

  it("令牌认证成功后可获得当前用户信息", async () => {
    expect(connector.authenticated).toBe(true);
    expect(connector.user).toBeTruthy();
    expect(Array.isArray(connector.roles)).toBe(true);
  });

  it("authenticateByToken 使用有效 tyat 令牌成功", async () => {
    // 已在 setup 中验证，此处验证认证状态
    expect(connector).toBeDefined();
    expect(connector.authenticated).toBe(true);
  });
});

describe("authenticateByToken 负向用例（无需后端）", () => {
  const newConnector = (): TaiyiConnector =>
    new TaiyiConnector("127.0.0.1", 5851, "test-device-negative");

  it("空字符串应被拒绝", async () => {
    const c = newConnector();
    const result = await c.authenticateByToken("");
    expect(result.error).toBeDefined();
    expect(result.error).toContain("不能为空");
    expect(c.authenticated).toBe(false);
  });

  it("旧 base64-JSON 样本应被拒绝", async () => {
    // 旧格式：base64(JSON({id, serial, algorithm, public_key, private_key}))
    const legacySample = btoa(
      JSON.stringify({
        id: "admin.system",
        serial: "abc",
        algorithm: "ed25519",
        public_key: "deadbeef",
        private_key: "cafebabe",
      })
    );
    const c = newConnector();
    const result = await c.authenticateByToken(legacySample);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("tyat_");
    expect(c.authenticated).toBe(false);
  });

  it("错误前缀应被拒绝并提示 tyat_", async () => {
    const c = newConnector();
    const result = await c.authenticateByToken(
      "taiyi_pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    );
    expect(result.error).toBeDefined();
    expect(result.error).toContain("tyat_");
    expect(c.authenticated).toBe(false);
  });

  it("长度不足应被拒绝", async () => {
    const c = newConnector();
    const result = await c.authenticateByToken("tyat_short");
    expect(result.error).toBeDefined();
    expect(result.error).toContain("长度");
    expect(c.authenticated).toBe(false);
  });

  it("字符集不合规（含 i/l/o/u）应被拒绝", async () => {
    const c = newConnector();
    // 32 个 'i' 落在 base32-Crockford 排除字符之列
    const result = await c.authenticateByToken(
      "tyat_iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii"
    );
    expect(result.error).toBeDefined();
    expect(result.error).toContain("字符集");
    expect(c.authenticated).toBe(false);
  });
});
