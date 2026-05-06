import { describe, it, expect } from "vitest";
import { TaiyiConnector } from "../../src/connector";

describe("TaiyiConnector backendURL — IPv6 字面量加方括号", () => {
  it("IPv6 字面量入参产出合法 URL，包含 [host]:port", () => {
    const c = new TaiyiConnector("2001:db8::1", 5851, "test-device");
    expect(c.backendURL).toContain("[2001:db8::1]:5851");
    // URL 解析器应能识别
    expect(() => new URL(c.backendURL)).not.toThrow();
  });

  it("回环 IPv6 ::1 同样加方括号", () => {
    const c = new TaiyiConnector("::1", 5850, "test-device");
    expect(c.backendURL).toContain("[::1]:5850");
    expect(new URL(c.backendURL).hostname).toBe("[::1]");
  });

  it("IPv4 字面量行为不退化", () => {
    const c = new TaiyiConnector("127.0.0.1", 5851, "test-device");
    expect(c.backendURL).toContain("127.0.0.1:5851");
    expect(c.backendURL).not.toContain("[");
    expect(new URL(c.backendURL).hostname).toBe("127.0.0.1");
  });

  it("hostname 行为不退化", () => {
    const c = new TaiyiConnector("api.example.com", 5851, "test-device");
    expect(c.backendURL).toContain("api.example.com:5851");
    expect(c.backendURL).not.toContain("[");
  });

  it("已带方括号的 IPv6 入参幂等（不二次包裹）", () => {
    const c = new TaiyiConnector("[2001:db8::1]", 5851, "test-device");
    expect(c.backendURL).toContain("[2001:db8::1]:5851");
    expect(c.backendURL).not.toContain("[[");
  });

  it("TLS 开启时同样合法", () => {
    const c = new TaiyiConnector("2001:db8::1", 5851, "test-device", true);
    expect(c.backendURL.startsWith("https://[2001:db8::1]:5851/")).toBe(true);
  });
});
