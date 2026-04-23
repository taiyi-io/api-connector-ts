import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestConnector } from "../setup";
import { getAvailableComputePool } from "../helpers/resource-guard";
import { TaiyiConnector } from "../../src/connector";
import { Priority, ResourceAccessLevel } from "../../src/enums";

const TEST_GUEST_NAME = "ci-test-guest-config-v2";

describe("云主机配置修改", () => {
  let connector: TaiyiConnector;
  let poolID: string | null = null;
  let systemID: string | null = null;
  let guestID: string | null = null;

  beforeAll(async () => {
    connector = await getTestConnector();

    // 前置清理
    const guests = await connector.queryGuests(0, 100);
    if (guests.data) {
      const existing = guests.data.records.find(g => g.name === TEST_GUEST_NAME || g.name === "ci-test-guest-config");
      if (existing) {
        await connector.tryDeleteGuest(existing.id);
      }
    }

    poolID = await getAvailableComputePool(connector);
    if (!poolID) {
      console.warn("跳过云主机配置测试：没有可用的计算池");
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
    // 创建测试云主机
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

  it("modifyGuestCPU 修改 CPU 核数", async () => {
    if (!guestID) return;
    const result = await connector.modifyGuestCPU(guestID, 2);
    expect(result.error).toBeUndefined();
  });

  it("modifyGuestMemory 修改内存大小", async () => {
    if (!guestID) return;
    const result = await connector.modifyGuestMemory(guestID, 1024);
    expect(result.error).toBeUndefined();
  });

  it("modifyGuestHostname 修改主机名", async () => {
    if (!guestID) return;
    const randomHost = `ci-host-${Math.floor(Math.random() * 10000)}`;
    const result = await connector.modifyGuestHostname(guestID, randomHost);
    expect(result.error).toBeUndefined();
  });

  it("modifyAutoStart 修改自动启动", async () => {
    if (!guestID) return;
    // 先获取当前状态
    const guest = await connector.getGuest(guestID);
    expect(guest.error).toBeUndefined();
    const currentAutoStart = guest.data!.auto_start;

    // 切换状态
    const result = await connector.modifyAutoStart(guestID, !currentAutoStart);
    expect(result.error).toBeUndefined();

    // 还原状态
    const resultRestore = await connector.modifyAutoStart(guestID, currentAutoStart);
    expect(resultRestore.error).toBeUndefined();
  });

  it("modifyGuestCPUPriority 修改 CPU 优先级", async () => {
    if (!guestID) return;
    const result = await connector.modifyGuestCPUPriority(guestID, Priority.High);
    expect(result.error).toBeUndefined();
  });

  it("modifyGuestDiskQoS 设置磁盘读写速率与 IOPS", async () => {
    if (!guestID) return;
    const result = await connector.modifyGuestDiskQoS(
      guestID,
      10 * 1024 * 1024,
      10 * 1024 * 1024,
      1000,
      1000
    );
    expect(result.error).toBeUndefined();
  });

  it("modifyGuestNetworkQoS 设置网络收发速率", async () => {
    if (!guestID) return;
    const result = await connector.modifyGuestNetworkQoS(
      guestID,
      1024 * 1024,
      1024 * 1024
    );
    expect(result.error).toBeUndefined();
  });

  it("getGuest 返回对象允许可选 host_address_v6 字段", async () => {
    if (!guestID) return;
    const result = await connector.getGuest(guestID);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    if (result.data!.host_address_v6 !== undefined) {
      expect(typeof result.data!.host_address_v6).toBe("string");
    }
  });
});
