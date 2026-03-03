import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestConnector } from "../setup";
import { TaiyiConnector } from "../../src/connector";
import { UserRole } from "../../src/enums";

const randomSuffix = Math.floor(Math.random() * 10000);
const TEST_GROUP_NAME = `ci-test-group-${randomSuffix}`;
const TEST_USER_NAME = `ci-test-user-${randomSuffix}`;

describe("用户和组管理", { timeout: 60000 }, () => {
  let connector: TaiyiConnector;
  let groupCreated = false;
  let userCreated = false;

  beforeAll(async () => {
    connector = await getTestConnector();
    // 预清理
    await connector.removeUser(TEST_USER_NAME);
    await connector.removeGroup(TEST_GROUP_NAME);
  });

  afterAll(async () => {
    if (userCreated) {
      await connector.removeUser(TEST_USER_NAME);
    }
    if (groupCreated) {
      await connector.removeGroup(TEST_GROUP_NAME);
    }
  });

  it("queryGroups 返回组列表", async () => {
    const result = await connector.queryGroups(0, 10);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data!.records)).toBe(true);
  });

  it("addGroup 创建用户组", async () => {
    const result = await connector.addGroup({
      id: TEST_GROUP_NAME,
      roles: [UserRole.User],
    });
    expect(result.error).toBeUndefined();
    groupCreated = true;

    // 等待组生效，使用直接查询而非列表查询以避开同步延迟
    let found = false;
    for (let i = 0; i < 10; i++) {
      const g = await connector.queryGroupMembers(TEST_GROUP_NAME);
      if (!g.error) {
        found = true;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    expect(found).toBe(true);
  });

  it("queryGroupMembers 查询组成员", async () => {
    if (!groupCreated) return;
    const result = await connector.queryGroupMembers(TEST_GROUP_NAME);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("addUser 添加用户", async () => {
    if (!groupCreated) return;
    
    // 再次确认组存在，后端有时同步较慢
    let ready = false;
    for(let i=0; i<5; i++) {
      const g = await connector.queryGroupMembers(TEST_GROUP_NAME);
      if (!g.error) { ready = true; break; }
      await new Promise(r => setTimeout(r, 1000));
    }

    const result = await connector.addUser(
      TEST_USER_NAME,
      TEST_GROUP_NAME,
      "ci-test-password-123!"
    );
    expect(result.error).toBeUndefined();
    userCreated = true;
  });

  it("queryUsers 查询用户列表", async () => {
    const result = await connector.queryUsers(0, 10);
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data!.records)).toBe(true);
  });

  it("removeUser 删除用户", async () => {
    if (!userCreated) return;
    const result = await connector.removeUser(TEST_USER_NAME);
    expect(result.error).toBeUndefined();
    userCreated = false;
  });

  it("removeGroup 删除用户组", async () => {
    if (!groupCreated) return;
    const result = await connector.removeGroup(TEST_GROUP_NAME);
    expect(result.error).toBeUndefined();
    groupCreated = false;
  });
});
