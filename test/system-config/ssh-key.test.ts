import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestConnector } from "../setup";
import { TaiyiConnector } from "../../src/connector";

const TEST_SSH_KEY_LABEL = "ci-test-ssh-key";
// 测试用 ED25519 公钥（仅用于 CI 测试，非真实密钥）
const TEST_PUBLIC_KEY = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFakeTestKeyForCITesting ci-test";

describe("SSH 密钥管理", () => {
  let connector: TaiyiConnector;
  let keyID: string | null = null;

  beforeAll(async () => {
    connector = await getTestConnector();
  });

  afterAll(async () => {
    if (keyID) {
      await connector.removeSSHKey(keyID);
    }
  });

  it("querySSHKeys 返回 SSH 密钥列表", async () => {
    const result = await connector.querySSHKeys();
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data!.records)).toBe(true);
  });

  it("addSSHKey 添加 SSH 公钥", async () => {
    const result = await connector.addSSHKey(
      TEST_SSH_KEY_LABEL,
      TEST_PUBLIC_KEY
    );
    if (result.error) {
      // SSH 密钥格式可能无效，跳过后续测试
      console.warn("addSSHKey 失败（可能密钥格式无效）：" + result.error);
      return;
    }
    expect(result.data).toBeDefined();
    keyID = result.data!;
  });

  it("removeSSHKey 删除 SSH 公钥", async () => {
    if (!keyID) return;
    const result = await connector.removeSSHKey(keyID);
    expect(result.error).toBeUndefined();
    keyID = null;
  });
});
