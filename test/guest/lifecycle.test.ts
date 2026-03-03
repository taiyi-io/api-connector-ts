import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestConnector } from "../setup";
import { getAvailableComputePool } from "../helpers/resource-guard";
import { TaiyiConnector } from "../../src/connector";
import { ResourceAccessLevel } from "../../src/enums";

const TEST_GUEST_NAME = "ci-test-guest-lifecycle-v2";

describe("云主机生命周期", () => {
  let connector: TaiyiConnector;
  let poolID: string | null = null;
  let systemID: string | null = null;
  let guestID: string | null = null;

  beforeAll(async () => {
    connector = await getTestConnector();
    
    // 前置清理：仅下达指令，不阻塞等待
    const guests = await connector.queryGuests(0, 100);
    if (guests.data) {
      const existing = guests.data.records.find(g => g.name === TEST_GUEST_NAME || g.name === "ci-test-guest-lifecycle");
      if (existing) {
        await connector.tryDeleteGuest(existing.id);
      }
    }

    poolID = await getAvailableComputePool(connector);
    if (!poolID) {
      console.warn("跳过云主机生命周期测试：没有可用的计算池");
      return;
    }
    // 获取系统模板
    const systems = await connector.fetchAllSystems();
    if (!systems.error && systems.data && systems.data.length > 0) {
      systemID = systems.data[0].id;
    }
    if (!systemID) {
      console.warn("跳过云主机生命周期测试：没有可用的系统模板");
      poolID = null;
    }
  });

  afterAll(async () => {
    if (guestID) {
      await connector.deleteGuest(guestID);
    }
  });

  it("创建云主机并等待完成", async () => {
    if (!poolID || !systemID) return;
    const result = await connector.createGuest(poolID, systemID, {
      name: TEST_GUEST_NAME,
      cores: 1,
      memory: 512,
      disks: [10240],
      access_level: ResourceAccessLevel.Private,
    });
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    guestID = result.data!;
  });

  it("查询云主机存在", async () => {
    if (!guestID) return;
    const result = await connector.getGuest(guestID);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data!.id).toBe(guestID);
  });

  it("启动云主机", async () => {
    if (!guestID) return;
    const result = await connector.startGuest(guestID);
    expect(result.error).toBeUndefined();
  });

  it("停止云主机", async () => {
    if (!guestID) return;
    const result = await connector.stopGuest(guestID);
    expect(result.error).toBeUndefined();
  });

  it("删除云主机", async () => {
    if (!guestID) return;
    const result = await connector.deleteGuest(guestID);
    expect(result.error).toBeUndefined();
    guestID = null;
  });
});
