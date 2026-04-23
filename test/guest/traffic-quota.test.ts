import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestConnector } from "../setup";
import { getAvailableComputePool } from "../helpers/resource-guard";
import { TaiyiConnector } from "../../src/connector";
import { ResourceAccessLevel } from "../../src/enums";
import type { TrafficQuotaSpec } from "../../src/data-defines";

const TEST_GUEST_NAME = "ci-test-guest-traffic-v2";

describe("云主机流量配额", () => {
  let connector: TaiyiConnector;
  let poolID: string | null = null;
  let systemID: string | null = null;
  let guestID: string | null = null;

  beforeAll(async () => {
    connector = await getTestConnector();

    // 前置清理同名残留
    const guests = await connector.queryGuests(0, 100);
    if (guests.data) {
      const existing = guests.data.records.find((g) => g.name === TEST_GUEST_NAME);
      if (existing) {
        await connector.tryDeleteGuest(existing.id);
      }
    }

    poolID = await getAvailableComputePool(connector);
    if (!poolID) {
      console.warn("跳过云主机流量配额测试：没有可用的计算池");
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

  it("tryQueryGuestTraffic 初始查询字段类型合法", async () => {
    if (!guestID) return;
    const result = await connector.tryQueryGuestTraffic(guestID);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    const info = result.data!;
    expect(typeof info.guest_id).toBe("string");
    expect(typeof info.effective_limit).toBe("number");
    expect(typeof info.used_bytes).toBe("number");
    expect(typeof info.usage_percent).toBe("number");
  });

  it("tryModifyGuestTrafficQuota 设置后回查一致", async () => {
    if (!guestID) return;
    const limit = 10 * 1024 * 1024 * 1024; // 10GiB
    const quota: TrafficQuotaSpec = {
      enabled: true,
      limit_bytes: limit,
      count_mode: "both",
      cycle_mode: "rolling-days",
      cycle_days: 30,
      over_action: "alert",
    };
    const modifyResult = await connector.tryModifyGuestTrafficQuota(guestID, quota);
    expect(modifyResult.error).toBeUndefined();

    const query = await connector.tryQueryGuestTraffic(guestID);
    expect(query.error).toBeUndefined();
    expect(query.data).toBeDefined();
    expect(query.data!.spec).toBeDefined();
    expect(query.data!.spec!.enabled).toBe(true);
    expect(query.data!.spec!.limit_bytes).toBe(limit);
  });

  it("tryExtendGuestTrafficTemp 追加临时额度", async () => {
    if (!guestID) return;
    const extra = 100 * 1024 * 1024; // 100MiB
    const extendResult = await connector.tryExtendGuestTrafficTemp(guestID, extra);
    expect(extendResult.error).toBeUndefined();

    const query = await connector.tryQueryGuestTraffic(guestID);
    expect(query.error).toBeUndefined();
    expect(query.data).toBeDefined();
    if (query.data!.state?.temp_extra_bytes !== undefined) {
      expect(typeof query.data!.state!.temp_extra_bytes).toBe("number");
    }
  });

  it("tryResetGuestTraffic 重置累计流量", async () => {
    if (!guestID) return;
    const resetResult = await connector.tryResetGuestTraffic(guestID);
    expect(resetResult.error).toBeUndefined();

    const query = await connector.tryQueryGuestTraffic(guestID);
    expect(query.error).toBeUndefined();
    expect(query.data).toBeDefined();
    expect(query.data!.state).toBeDefined();
    expect(query.data!.state!.accumulated_rx).toBe(0);
    expect(query.data!.state!.accumulated_tx).toBe(0);
  });
});
