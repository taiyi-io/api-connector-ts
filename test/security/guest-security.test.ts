import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestConnector } from "../setup";
import { getAvailableComputePool } from "../helpers/resource-guard";
import { TaiyiConnector } from "../../src/connector";
import { ResourceAccessLevel } from "../../src/enums";

const TEST_GUEST_NAME = "ci-test-guest-security-v2";

describe("云主机安全策略（验证同步调用）", () => {
  let connector: TaiyiConnector;
  let poolID: string | null = null;
  let systemID: string | null = null;
  let guestID: string | null = null;
  let guestMAC: string | null = null;

  beforeAll(async () => {
    connector = await getTestConnector();

    // 前置清理
    const guests = await connector.queryGuests(0, 100);
    if (guests.data) {
      const existing = guests.data.records.find(g => g.name === TEST_GUEST_NAME || g.name === "ci-test-guest-security");
      if (existing) {
        await connector.tryDeleteGuest(existing.id);
      }
    }

    poolID = await getAvailableComputePool(connector);
    if (!poolID) {
      console.warn("跳过云主机安全策略测试：没有可用的计算池");
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
      // 获取 MAC 地址
      const guest = await connector.getGuest(guestID);
      if (!guest.error && guest.data?.network_interfaces?.external_interfaces?.length > 0) {
        guestMAC = guest.data.network_interfaces.external_interfaces[0].mac_address;
      }
    }
  });

  afterAll(async () => {
    if (guestID) {
      await connector.deleteGuest(guestID);
    }
  });

  it("getGuestSecurityPolicy 获取云主机安全策略", async () => {
    if (!guestID || !guestMAC) return;
    const result = await connector.getGuestSecurityPolicy(guestID, guestMAC);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
  });

  it("modifyGuestSecurityPolicy 同步修改云主机安全策略（无 invalid task 错误）", async () => {
    if (!guestID || !guestMAC) return;
    const result = await connector.modifyGuestSecurityPolicy(
      guestID,
      guestMAC,
      []
    );
    expect(result.error).toBeUndefined();
  });

  it("resetGuestSecurityPolicy 同步重置云主机安全策略（无 invalid task 错误）", async () => {
    if (!guestID || !guestMAC) return;
    const result = await connector.resetGuestSecurityPolicy(guestID, guestMAC);
    expect(result.error).toBeUndefined();
  });
});
