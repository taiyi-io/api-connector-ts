import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestConnector } from "../setup";
import { getAvailableComputePool } from "../helpers/resource-guard";
import { TaiyiConnector } from "../../src/connector";
import { ResourceAccessLevel } from "../../src/enums";

const PROFILE_NAME_A = "ci-test-profile-a-v2";
const PROFILE_NAME_B = "ci-test-profile-b-v2";
const GUEST_FROM_PROFILE_NAME = "ci-test-guest-from-profile-v2";

describe("云主机套餐 (GuestProfile)", () => {
  let connector: TaiyiConnector;
  let poolID: string | null = null;
  let profileA: string | null = null;
  let profileB: string | null = null;
  let guestID: string | null = null;

  async function cleanupProfilesByName(names: string[]): Promise<void> {
    const result = await connector.tryQueryGuestProfiles({ offset: 0, limit: 200 });
    if (result.error || !result.data) return;
    for (const profile of result.data.profiles) {
      if (names.includes(profile.name)) {
        await connector.tryDeleteGuestProfile(profile.id);
      }
    }
  }

  async function cleanupGuestByName(name: string): Promise<void> {
    const guests = await connector.queryGuests(0, 100);
    if (!guests.data) return;
    const existing = guests.data.records.find((g) => g.name === name);
    if (existing) {
      await connector.tryDeleteGuest(existing.id);
    }
  }

  beforeAll(async () => {
    connector = await getTestConnector();
    poolID = await getAvailableComputePool(connector);
    if (!poolID) {
      console.warn("跳过云主机套餐测试：没有可用的计算池");
      return;
    }
    await cleanupGuestByName(GUEST_FROM_PROFILE_NAME);
    await cleanupProfilesByName([PROFILE_NAME_A, PROFILE_NAME_B]);
  });

  afterAll(async () => {
    if (guestID) {
      await connector.deleteGuest(guestID);
    }
    await cleanupGuestByName(GUEST_FROM_PROFILE_NAME);
    await cleanupProfilesByName([PROFILE_NAME_A, PROFILE_NAME_B]);
  });

  it("tryCreateGuestProfile 创建套餐并返回 ID", async () => {
    if (!poolID) return;
    const result = await connector.tryCreateGuestProfile({
      name: PROFILE_NAME_A,
      description: "ci 套餐 A",
      cores: 1,
      memory: 512,
      disks: [5120],
      access_level: ResourceAccessLevel.Private,
      pool_id: poolID,
    });
    expect(result.error).toBeUndefined();
    expect(result.data).toBeTruthy();
    profileA = result.data!;
  });

  it("tryGetGuestProfile 回读套餐字段一致", async () => {
    if (!profileA) return;
    const result = await connector.tryGetGuestProfile(profileA);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    const profile = result.data!;
    expect(profile.id).toBe(profileA);
    expect(profile.name).toBe(PROFILE_NAME_A);
    expect(profile.cores).toBe(1);
    expect(profile.memory).toBe(512);
    expect(profile.disks[0]).toBe(5120);
  });

  it("tryQueryGuestProfiles 可按 keyword 查到刚创建的套餐", async () => {
    if (!profileA) return;
    const result = await connector.tryQueryGuestProfiles({
      offset: 0,
      limit: 50,
      keyword: PROFILE_NAME_A,
    });
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    const found = result.data!.profiles.find((p) => p.id === profileA);
    expect(found).toBeDefined();
  });

  it("tryModifyGuestProfile 按 profile_id 字段名修改 cores/memory", async () => {
    if (!profileA) return;
    // 后端 modify 为全量覆写语义，需要显式传入所有需保留的字段
    const modifyResult = await connector.tryModifyGuestProfile({
      profile_id: profileA,
      cores: 1,
      memory: 1024,
      disks: [5120],
      access_level: ResourceAccessLevel.Private,
    });
    expect(modifyResult.error).toBeUndefined();

    const getResult = await connector.tryGetGuestProfile(profileA);
    expect(getResult.error).toBeUndefined();
    expect(getResult.data!.cores).toBe(1);
    expect(getResult.data!.memory).toBe(1024);
    expect(getResult.data!.disks[0]).toBe(5120);
  });

  it("tryCreateGuestFromProfile 基于套餐创建云主机", async () => {
    if (!profileA || !poolID) return;
    // 根据回读的套餐判断是否需要传 pool_id：
    // - 若套餐已绑定 pool，则不传（否则后端报 "cannot override pool when profile has a bound pool"）
    // - 若未绑定，则必须传（否则后端报 "pool_id is required when profile has no bound pool"）
    const profile = await connector.tryGetGuestProfile(profileA);
    expect(profile.error).toBeUndefined();
    const params: { profile_id: string; name: string; pool_id?: string } = {
      profile_id: profileA,
      name: GUEST_FROM_PROFILE_NAME,
    };
    if (!profile.data!.pool_id) {
      params.pool_id = poolID;
    }
    const result = await connector.tryCreateGuestFromProfile(params);
    expect(result.error).toBeUndefined();

    // SDK 返回 taskID，走 waitTask 拿到真实 guest ID
    expect(result.data).toBeTruthy();
    const taskData = await connector.waitTask(result.data!, 300);
    expect(taskData.error).toBeUndefined();
    expect(taskData.data).toBeDefined();
    expect(taskData.data!.guest).toBeTruthy();
    guestID = taskData.data!.guest!;

    const guest = await connector.getGuest(guestID);
    expect(guest.error).toBeUndefined();
    expect(guest.data!.cores).toBe(1);
    expect(guest.data!.memory).toBe(1024);
  });

  it("tryReplaceGuestConfig 用第二个套餐替换云主机配置", async () => {
    if (!guestID || !poolID) return;
    // 创建第二个套餐
    const createB = await connector.tryCreateGuestProfile({
      name: PROFILE_NAME_B,
      description: "ci 套餐 B",
      cores: 1,
      memory: 512,
      disks: [5120],
      access_level: ResourceAccessLevel.Private,
      pool_id: poolID,
    });
    expect(createB.error).toBeUndefined();
    profileB = createB.data!;

    const replace = await connector.tryReplaceGuestConfig({
      guest_id: guestID,
      profile_id: profileB,
    });
    expect(replace.error).toBeUndefined();
  });

  it("tryDeleteGuestProfile 删除套餐后再 GET 应报错", async () => {
    if (!profileA) return;
    const deleteResult = await connector.tryDeleteGuestProfile(profileA);
    expect(deleteResult.error).toBeUndefined();

    const getResult = await connector.tryGetGuestProfile(profileA);
    expect(getResult.error).toBeDefined();
    profileA = null;

    if (profileB) {
      const delB = await connector.tryDeleteGuestProfile(profileB);
      expect(delB.error).toBeUndefined();
      profileB = null;
    }
  });
});
