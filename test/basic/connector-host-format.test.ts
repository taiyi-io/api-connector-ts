import { describe, it, expect } from "vitest";
import { formatHostForURL } from "../../src/helper";

describe("formatHostForURL — URL host 段规范化", () => {
  it("空串与纯空白返回空串", () => {
    expect(formatHostForURL("")).toBe("");
    expect(formatHostForURL("   ")).toBe("");
  });

  it("IPv4 字面量原样返回", () => {
    expect(formatHostForURL("127.0.0.1")).toBe("127.0.0.1");
    expect(formatHostForURL("10.0.0.1")).toBe("10.0.0.1");
    expect(formatHostForURL("192.168.1.100")).toBe("192.168.1.100");
  });

  it("hostname 原样返回", () => {
    expect(formatHostForURL("api.example.com")).toBe("api.example.com");
    expect(formatHostForURL("localhost")).toBe("localhost");
    expect(formatHostForURL("node-01")).toBe("node-01");
  });

  it("IPv6 字面量自动包裹方括号", () => {
    expect(formatHostForURL("2001:db8::1")).toBe("[2001:db8::1]");
    expect(formatHostForURL("::1")).toBe("[::1]");
    expect(formatHostForURL("fe80::abcd")).toBe("[fe80::abcd]");
    expect(formatHostForURL("2001:0db8:0000:0000:0000:0000:0000:0001")).toBe(
      "[2001:0db8:0000:0000:0000:0000:0000:0001]"
    );
  });

  it("已带方括号的 IPv6 字面量幂等返回", () => {
    expect(formatHostForURL("[2001:db8::1]")).toBe("[2001:db8::1]");
    expect(formatHostForURL("[::1]")).toBe("[::1]");
  });

  it("含 zone id 的链路本地地址返回空串", () => {
    expect(formatHostForURL("fe80::1%eth0")).toBe("");
    expect(formatHostForURL("fe80::abcd%en0")).toBe("");
  });

  it("可直接拼入 URL host 段（行为契约）", () => {
    const v6 = formatHostForURL("2001:db8::1");
    const url = `http://${v6}:5851/api/v1/`;
    // 标准 URL 解析器应能识别该 URL；WHATWG URL 在 IPv6 hostname 上保留方括号
    const parsed = new URL(url);
    expect(parsed.hostname).toBe("[2001:db8::1]");
    expect(parsed.port).toBe("5851");
  });

  it("IPv4 输入构造 URL 与改动前行为一致", () => {
    const v4 = formatHostForURL("127.0.0.1");
    const url = `http://${v4}:5851/api/v1/`;
    const parsed = new URL(url);
    expect(parsed.hostname).toBe("127.0.0.1");
    expect(parsed.port).toBe("5851");
  });
});
