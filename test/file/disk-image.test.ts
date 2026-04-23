import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestConnector } from "../setup";
import { TaiyiConnector } from "../../src/connector";
import { ResourceAccessLevel } from "../../src/enums";

const TEST_DISK_NAME = "ci-test-disk-image";

describe("磁盘镜像管理", () => {
  let connector: TaiyiConnector;
  let diskID: string | null = null;

  beforeAll(async () => {
    connector = await getTestConnector();
    // 前置清理：删除可能残留的同名磁盘镜像
    const list = await connector.queryDiskFiles(0, 200);
    if (list.data) {
      for (const f of list.data.records) {
        if (f.name === TEST_DISK_NAME || f.name === "ci-test-disk-modified") {
          await connector.deleteDiskFile(f.id);
        }
      }
    }
  });

  afterAll(async () => {
    if (diskID) {
      await connector.deleteDiskFile(diskID);
    }
  });

  it("queryDiskFiles 返回磁盘镜像列表", async () => {
    const result = await connector.queryDiskFiles(0, 10);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data!.records)).toBe(true);
  });

  it("createDiskFile 创建磁盘镜像记录", async () => {
    const result = await connector.createDiskFile(
      { name: TEST_DISK_NAME, volume_size_in_mb: 1024 },
      ResourceAccessLevel.Private
    );
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    diskID = result.data!;
  });

  it("getDiskFile 查询创建的磁盘镜像", async () => {
    if (!diskID) return;
    const result = await connector.getDiskFile(diskID);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data!.id).toBe(diskID);
  });

  it("modifyDiskFile 修改磁盘镜像名", async () => {
    if (!diskID) return;
    const result = await connector.modifyDiskFile(diskID, {
      name: "ci-test-disk-modified",
    });
    expect(result.error).toBeUndefined();
  });

  it("deleteDiskFile 删除磁盘镜像", async () => {
    if (!diskID) return;
    const result = await connector.deleteDiskFile(diskID);
    expect(result.error).toBeUndefined();
    diskID = null;
  });
});
