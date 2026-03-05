import { describe, it, expect, beforeAll } from "vitest";
import { getTestConnector } from "./setup";
import { TaiyiConnector } from "../../src/connector";

describe("调试输出", () => {
  let connector: TaiyiConnector;

  beforeAll(async () => {
    connector = await getTestConnector();
  });

  it("输出 default 资源池详情", async () => {
    const result = await connector.getComputePool("default");
    console.log("DEFAULT_POOL_CONTENT:", JSON.stringify(result.data, null, 2));
  });
});
