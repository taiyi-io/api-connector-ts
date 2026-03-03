import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestConnector } from "../setup";
import { getAvailableComputePool } from "../helpers/resource-guard";
import { TaiyiConnector } from "../../src/connector";
import { ResourceAccessLevel } from "../../src/enums";

const TEST_GUEST_NAME = "ci-test-guest-media-v2";

describe("云主机媒体管理", () => {
  let connector: TaiyiConnector;
  let poolID: string | null = null;
  let systemID: string | null = null;
  let guestID: string | null = null;

  beforeAll(async () => {
    connector = await getTestConnector();

    // 前置清理
    const guests = await connector.queryGuests(0, 100);
    if (guests.data) {
      const existing = guests.data.records.find(g => g.name === TEST_GUEST_NAME || g.name === "ci-test-guest-media");
      if (existing) {
        await connector.tryDeleteGuest(existing.id);
      }
    }

    poolID = await getAvailableComputePool(connector);
    if (!poolID) {
      console.warn("跳过媒体测试：没有可用的计算池");
      return;
    }
    const systems = await connector.fetchAllSystems();
    if (!systems.error && systems.data && systems.data.length > 0) {
      systemID = systems.data[0].id;
    }
    if (!systemID) {
      poolID = null;
      return;
    }
    const result = await connector.createGuest(poolID, systemID, {
      name: TEST_GUEST_NAME,
      cores: 1,
      memory: 512,
      disks: [10240],
      access_level: ResourceAccessLevel.Private,
    });
    if (!result.error && result.data) {
      guestID = result.data;
    }
  });

  afterAll(async () => {
    if (guestID) {
      await connector.deleteGuest(guestID);
    }
  });

  it("queryISOFiles 获取 ISO 文件列表", async () => {
    // 验证方法存在且可调用
    const result = await connector.queryISOFiles(0, 10);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
  });
});
