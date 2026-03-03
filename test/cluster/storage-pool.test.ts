import { describe, it, expect, beforeAll } from "vitest";
import { getTestConnector } from "../setup";
import { getAvailableStoragePool } from "../helpers/resource-guard";
import { TaiyiConnector } from "../../src/connector";
import { StorageType } from "../../src/enums";

describe("存储池管理", () => {
  let connector: TaiyiConnector;
  let storagePoolID: string | null = null;

  beforeAll(async () => {
    connector = await getTestConnector();
    storagePoolID = await getAvailableStoragePool(connector);
    if (!storagePoolID) {
      console.warn("存储池管理测试：没有可用的存储池（仅读取测试）");
    }
  });

  it("queryStoragePools 返回存储池列表", async () => {
    const result = await connector.queryStoragePools();
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("getStoragePool 获取指定存储池详情", async () => {
    // 找一个非本地存储池进行测试，因为本地存储池可能不支持详情查询
    const list = await connector.queryStoragePools();
    const remotePool = (list.data || []).find(p => p.type !== StorageType.Local);
    
    if (remotePool) {
      const result = await connector.getStoragePool(remotePool.id);
      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data!.id).toBe(remotePool.id);
    } else {
      console.warn("跳过 getStoragePool 测试：未找到可用的非本地存储池");
    }
  });
});
