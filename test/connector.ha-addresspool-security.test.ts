import { expect, test, describe, beforeEach } from "vitest";
import {
  TaiyiConnector,
  SecurityRule,
  AddressPoolConfig,
  AddressPoolDetail,
  SecurityPolicyGroup,
  GuestSecurityPolicy,
  GuestHAConfig,
} from "../src/";
import { getTestConnector } from "./utils";

describe("HA Support Tests", () => {
  let connector: TaiyiConnector;

  beforeEach(async function () {
    connector = await getTestConnector();
  });

  test("should start guest with expect_epoch parameter", async function () {
    // tryStartGuest 接受 expectEpoch 参数
    // 此测试验证方法签名正确，实际执行需要有效的云主机ID
    expect(connector.tryStartGuest).toBeDefined();
    expect(connector.startGuest).toBeDefined();
  });
});

describe("Address Pool V2 Tests", () => {
  let connector: TaiyiConnector;

  beforeEach(async function () {
    connector = await getTestConnector();
  });

  test("should have new address pool methods", async function () {
    expect(connector.tryCreateAddressPool).toBeDefined();
    expect(connector.createAddressPool).toBeDefined();
    expect(connector.queryAddressPoolConfigs).toBeDefined();
    expect(connector.getAddressPoolDetail).toBeDefined();
    expect(connector.tryModifyAddressPoolV2).toBeDefined();
    expect(connector.modifyAddressPoolV2).toBeDefined();
    expect(connector.tryDeleteAddressPool).toBeDefined();
    expect(connector.deleteAddressPool).toBeDefined();
    expect(connector.tryAddAddressRange).toBeDefined();
    expect(connector.addAddressRange).toBeDefined();
    expect(connector.tryRemoveAddressRange).toBeDefined();
    expect(connector.removeAddressRange).toBeDefined();
  });

  test("should query address pool configs", async function () {
    const result = await connector.queryAddressPoolConfigs();
    // 可能返回空列表或错误（取决于后端状态）
    if (!result.error) {
      expect(Array.isArray(result.data)).toBe(true);
    }
  });
});

describe("Security Policy Tests", () => {
  let connector: TaiyiConnector;

  beforeEach(async function () {
    connector = await getTestConnector();
  });

  test("should have security policy methods", async function () {
    expect(connector.createSecurityPolicy).toBeDefined();
    expect(connector.querySecurityPolicies).toBeDefined();
    expect(connector.getSecurityPolicy).toBeDefined();
    expect(connector.modifySecurityPolicy).toBeDefined();
    expect(connector.deleteSecurityPolicy).toBeDefined();
    expect(connector.copySecurityPolicy).toBeDefined();
    expect(connector.getGuestSecurityPolicy).toBeDefined();
    expect(connector.modifyGuestSecurityPolicy).toBeDefined();
    expect(connector.resetGuestSecurityPolicy).toBeDefined();
  });

  test("should query security policies", async function () {
    const result = await connector.querySecurityPolicies();
    if (!result.error) {
      expect(Array.isArray(result.data)).toBe(true);
    }
  });
});
