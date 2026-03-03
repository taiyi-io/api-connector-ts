import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestConnector } from "../setup";
import { getAvailableComputePool } from "../helpers/resource-guard";
import { TaiyiConnector } from "../../src/connector";
import { ResourceAccessLevel } from "../../src/enums";

const TEST_GUEST_NAME = "ci-test-guest-snapshot-v2";
const TEST_SNAPSHOT_LABEL = "ci-snapshot-test";

describe("云主机快照管理", () => {
  let connector: TaiyiConnector;
  let poolID: string | null = null;
  let systemID: string | null = null;
  let guestID: string | null = null;
  let snapshotID: string | null = null;

  beforeAll(async () => {
    connector = await getTestConnector();

    // 前置清理
    const guests = await connector.queryGuests(0, 100);
    if (guests.data) {
      const existing = guests.data.records.find(g => g.name === TEST_GUEST_NAME || g.name === "ci-test-guest-snapshot");
      if (existing) {
        await connector.tryDeleteGuest(existing.id);
      }
    }

    poolID = await getAvailableComputePool(connector);
    if (!poolID) {
      console.warn("跳过快照测试：没有可用的计算池");
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
    if (snapshotID && guestID) {
      await connector.deleteSnapshot(guestID, snapshotID);
    }
    if (guestID) {
      await connector.deleteGuest(guestID);
    }
  });

  it("createSnapshot 创建快照", async () => {
    if (!guestID) return;
    const result = await connector.createSnapshot(guestID, TEST_SNAPSHOT_LABEL);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    snapshotID = result.data!;
  });

  it("querySnapshots 查询快照列表", async () => {
    if (!guestID) return;
    const result = await connector.querySnapshots(guestID);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("deleteSnapshot 删除快照", async () => {
    if (!guestID || !snapshotID) return;
    const result = await connector.deleteSnapshot(guestID, snapshotID);
    expect(result.error).toBeUndefined();
    snapshotID = null;
  });
});
