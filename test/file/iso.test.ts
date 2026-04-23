import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestConnector } from "../setup";
import { TaiyiConnector } from "../../src/connector";
import { ResourceAccessLevel } from "../../src/enums";

const TEST_ISO_NAME = "ci-test-iso";

describe("ISO 文件管理", () => {
  let connector: TaiyiConnector;
  let isoID: string | null = null;

  beforeAll(async () => {
    connector = await getTestConnector();
    // 前置清理：删除可能残留的同名 ISO
    const list = await connector.queryISOFiles(0, 200);
    if (list.data) {
      for (const f of list.data.records) {
        if (f.name === TEST_ISO_NAME || f.name === "ci-test-iso-modified") {
          await connector.deleteISOFile(f.id);
        }
      }
    }
  });

  afterAll(async () => {
    if (isoID) {
      await connector.deleteISOFile(isoID);
    }
  });

  it("queryISOFiles 返回 ISO 文件列表", async () => {
    const result = await connector.queryISOFiles(0, 10);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data!.records)).toBe(true);
  });

  it("createISOFile 创建 ISO 文件记录", async () => {
    const result = await connector.createISOFile(
      { name: TEST_ISO_NAME },
      ResourceAccessLevel.Private
    );
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    isoID = result.data!;
  });

  it("getISOFile 查询创建的 ISO 文件", async () => {
    if (!isoID) return;
    const result = await connector.getISOFile(isoID);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data!.id).toBe(isoID);
  });

  it("modifyISOFile 修改 ISO 文件名", async () => {
    if (!isoID) return;
    const result = await connector.modifyISOFile(isoID, {
      name: "ci-test-iso-modified",
    });
    expect(result.error).toBeUndefined();
  });

  it("deleteISOFile 删除 ISO 文件", async () => {
    if (!isoID) return;
    const result = await connector.deleteISOFile(isoID);
    expect(result.error).toBeUndefined();
    isoID = null;
  });
});
