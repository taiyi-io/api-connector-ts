"use server";
/**
 * 适配Nextjs的封装，安全存储TaiyiConnector，防止CSRF攻击（**仅限服务端组件使用**）
 * 内部使用localstorage和cookie存储数据，自动分配设备标识和多connector支持并保持一致，无需手动干预
 * isStoreAuthenticated() 检查存储是否已认证，在middleware、route和服务端组件中使用
 * getNextStore() 直接访问存储数据
 * 提供数据读写更新辅助方法
 *
 * 注意：`"use server"` 指令必须是文件首条语句，不能被 JSDoc 注释前置，
 * 否则 Next 16 会将这些函数当作普通客户端代码打包，导致运行时
 * `cookies` was called outside a request scope。
 */
import { TokenSigningMethod } from "./enums";
import { AllocatedTokens } from "./data-defines";
import { cookies } from "next/headers";
import { createId } from "@paralleldrive/cuid2";
import { generateDeviceFingerprint } from "./helper";
import {
  cookieRefreshToken,
  cookieRefreshTokenExpire,
  cookieCSRFToken,
  cookieDevice,
  cookieStorePrefix,
  validateStoredData,
  NextSecureStore,
  CriticalValues,
} from "./next-store-internals";
export type { NextSecureStore, CriticalValues } from "./next-store-internals";

/**
 * 获取Nextjs的安全数据存储（**仅限服务端组件使用**）
 */
export async function getNextStore(
  deviceID: string,
  backendHost: string,
  backendPort: number = 5851, useTLS: boolean = false
): Promise<NextSecureStore> {
  const fingerprint = generateDeviceFingerprint(deviceID, backendHost, backendPort, useTLS);
  const storeKey = `${cookieStorePrefix}_${fingerprint}_${useTLS ? "tls" : "plain"}`;
  const cs = await cookies();
  const storeItem = cs.get(storeKey);
  if (storeItem && storeItem.value) {
    const store: NextSecureStore = JSON.parse(storeItem.value);
    if (validateStoredData(store)) {
      return store;
    }
  }
  const store: NextSecureStore = {
    id: fingerprint,
    device: deviceID,
    backend_host: backendHost,
    backend_port: backendPort,
    authenticated: false,
    access_token: "",
    public_key: "",
    algorithm: TokenSigningMethod.HS256,
    access_expired_at: "",
    roles: [],
    user: "",
  };
  cs.set(storeKey, JSON.stringify(store), { path: "/", sameSite: "strict", maxAge: 1 * 24 * 60 * 60 });
  return store;
}

/**
 * 检查安全数据存储是否已认证（**仅限服务端组件使用**）
 */
export async function isStoreAuthenticated(
  backendHost: string,
  backendPort: number = 5851, useTLS: boolean = false
): Promise<boolean> {
  const deviceID = await getDeviceID();
  const store = await getNextStore(deviceID, backendHost, backendPort, useTLS);
  return store.authenticated;
}

/**
 * 保存安全连接封装的令牌（**仅限服务端组件使用**）
 */
export async function storeAllocatedTokens(
  storeID: string,
  tokens: AllocatedTokens, useTLS: boolean = false
): Promise<void> {
  const cs = await cookies();
  const storeKey = `${cookieStorePrefix}_${storeID}_${useTLS ? "tls" : "plain"}`;
  const storeItem = cs.get(storeKey);
  let store: NextSecureStore;
  if (storeItem && storeItem.value) {
    store = JSON.parse(storeItem.value);
  } else {
    const deviceID = await getDeviceID();
    store = {
      id: storeID,
      device: deviceID,
      backend_host: "",
      backend_port: 0,
      authenticated: false,
      access_token: "",
      public_key: "",
      algorithm: tokens.algorithm,
      access_expired_at: "",
      roles: [],
      user: "",
    };
  }

  store.access_token = tokens.access_token;
  store.access_expired_at = tokens.access_expired_at;
  store.algorithm = tokens.algorithm;
  store.public_key = tokens.public_key;
  store.roles = tokens.roles;
  store.user = tokens.user;
  store.authenticated = true;

  const storeContent = JSON.stringify(store);
  const expiredAt = new Date(tokens.access_expired_at);
  let maxAge = Math.floor((expiredAt.getTime() - Date.now() + 60 * 1000) / 1000);
  if (maxAge <= 0) maxAge = 1 * 60 * 60;

  cs.set(storeKey, storeContent, { path: "/", sameSite: "strict", maxAge: maxAge });

  const stored: CriticalValues = {
    csrf_token: tokens.csrf_token,
    refresh_token: tokens.refresh_token,
    refresh_expire: tokens.refresh_expired_at,
  };
  await storeCriticalValues(storeID, stored);
}

/**
 * 从安全存储中获取已分配令牌（**仅限服务端组件使用**）
 */
export async function retrieveAllocatedTokens(storeID: string, useTLS: boolean = false): Promise<AllocatedTokens> {
  const cs = await cookies();
  const storeKey = `${cookieStorePrefix}_${storeID}_${useTLS ? "tls" : "plain"}`;
  const storeItem = cs.get(storeKey);
  if (storeItem && storeItem.value) {
    const store: NextSecureStore = JSON.parse(storeItem.value);
    if (validateStoredData(store)) {
      const values = await retrieveCriticalValues(storeID);
      return {
        access_token: store.access_token,
        access_expired_at: store.access_expired_at,
        algorithm: store.algorithm,
        public_key: store.public_key,
        roles: store.roles,
        user: store.user,
        refresh_token: values.refresh_token,
        refresh_expired_at: values.refresh_expire,
        csrf_token: values.csrf_token,
      };
    }
  }
  return {
    access_token: "",
    access_expired_at: "",
    algorithm: TokenSigningMethod.HS256,
    public_key: "",
    roles: [],
    user: "",
    refresh_token: "",
    refresh_expired_at: "",
    csrf_token: "",
  };
}

/**
 * 存储关键值（**仅限服务端组件使用**）
 */
export async function storeCriticalValues(storeID: string, values: CriticalValues) {
  const cks = await cookies();
  const maxAge = Math.floor((new Date(values.refresh_expire).getTime() - Date.now()) / 1000);
  cks.set(`${cookieCSRFToken}_${storeID}`, values.csrf_token, { path: "/", sameSite: "strict", maxAge: maxAge });
  cks.set(`${cookieRefreshToken}_${storeID}`, values.refresh_token, { path: "/", httpOnly: true, sameSite: "strict", maxAge: maxAge });
  cks.set(`${cookieRefreshTokenExpire}_${storeID}`, values.refresh_expire, { path: "/", sameSite: "strict", maxAge: maxAge, httpOnly: true });
}

/**
 * 获取关键值（**仅限服务端组件使用**）
 */
export async function retrieveCriticalValues(storeID: string): Promise<CriticalValues> {
  const cks = await cookies();
  const csrfKey = `${cookieCSRFToken}_${storeID}`;
  const refreshKey = `${cookieRefreshToken}_${storeID}`;
  const refreshExpireKey = `${cookieRefreshTokenExpire}_${storeID}`;
  const csrfItem = cks.get(csrfKey);
  const refreshItem = cks.get(refreshKey);
  const refreshExpireItem = cks.get(refreshExpireKey);
  return {
    csrf_token: csrfItem?.value || "",
    refresh_token: refreshItem?.value || "",
    refresh_expire: refreshExpireItem?.value || "",
  };
}

/**
 * cookie中存储设备ID（**仅限服务端组件使用**）
 */
export async function setDeviceID(id: string): Promise<void> {
  const cks = await cookies();
  cks.set(cookieDevice, id, { path: "/", sameSite: "strict", maxAge: 30 * 24 * 60 * 60 });
}

/**
 * 从cookie中获取设备ID（**仅限服务端组件使用**）。
 *
 * 当设备ID cookie不存在或为空时，自动生成新ID（前缀 `server-` + cuid2）并写入cookie，
 * 避免服务端路由（如登录 `/api/auth`）在客户端 `getNextConnector()` 尚未触发过设备ID分配时，
 * 因为读到空设备ID而导致后端返回 `device required` 错误。
 *
 * 生成的ID会以 30 天有效期写入 `taiyi_device` cookie，后续客户端 `getDeviceFromBrowser()` 启动时
 * 若 localStorage 未存ID，会保持与此处一致。
 */
export async function getDeviceID(): Promise<string> {
  const cks = await cookies();
  const deviceItem = cks.get(cookieDevice);
  if (deviceItem && deviceItem.value) {
    return deviceItem.value;
  }
  // cookie 缺失，自动生成并持久化，保证服务端路由调用时设备ID必定非空
  const newDeviceID = `server-${createId()}`;
  cks.set(cookieDevice, newDeviceID, { path: "/", sameSite: "strict", maxAge: 30 * 24 * 60 * 60 });
  return newDeviceID;
}

/**
 * 清除存储的令牌信息（**仅限服务端组件使用**）
 */
export async function clearAllocatedTokens(storeID: string, useTLS: boolean = false) {
  const cks = await cookies();
  const storeKey = `${cookieStorePrefix}_${storeID}_${useTLS ? "tls" : "plain"}`;
  const storeItem = cks.get(storeKey);
  if (storeItem && storeItem.value) {
    const store: NextSecureStore = JSON.parse(storeItem.value);
    store.authenticated = false;
    store.access_token = "";
    store.access_expired_at = "";
    store.roles = [];
    store.user = "";
    cks.set(storeKey, JSON.stringify(store), { path: "/", sameSite: "strict", maxAge: 1 * 24 * 60 * 60 });
  }
  cks.set(`${cookieCSRFToken}_${storeID}`, "", { path: "/", maxAge: 0 });
  cks.set(`${cookieRefreshToken}_${storeID}`, "", { path: "/", maxAge: 0 });
  cks.set(`${cookieRefreshTokenExpire}_${storeID}`, "", { path: "/", maxAge: 0 });
}

/**
 * 处理存储状态变化（**仅限服务端组件使用**）
 */
export async function handleStoreStatusChanged(storeID: string, authenticated: boolean, useTLS: boolean = false) {
  const cks = await cookies();
  const storeKey = `${cookieStorePrefix}_${storeID}_${useTLS ? "tls" : "plain"}`;
  const storeItem = cks.get(storeKey);
  if (storeItem && storeItem.value) {
    const store: NextSecureStore = JSON.parse(storeItem.value);
    if (authenticated != store.authenticated) {
      store.authenticated = authenticated;
      cks.set(storeKey, JSON.stringify(store), { path: "/", sameSite: "strict", maxAge: 30 * 24 * 60 * 60 });
    }
  }
}

