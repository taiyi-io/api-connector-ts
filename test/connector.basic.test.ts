import { expect, test, describe, beforeEach } from "vitest";
import { TaiyiConnector, GuestFilter } from "../src/";
import { getTestConnector } from "./utils";

describe("TaiyiConnector Basic Tests", () => {
  let connector: TaiyiConnector;

  // 在所有测试前初始化连接器
  beforeEach(async function () {
    connector = await getTestConnector();
  });

  // 测试用例1: 查询云主机列表
  test("should query guests successfully", async function () {
    const filter: GuestFilter = {};
    const result = await connector.queryGuests(0, 10, filter);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data!.total).toBeTypeOf("number");
    expect(Array.isArray(result.data!.records)).toBe(true);
    console.log("Cloud host list:", result.data!.records);
  });
});
