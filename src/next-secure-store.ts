/**
 * 适配Nextjs的封装，安全存储TaiyiConnector，防止CSRF攻击（**仅限服务端组件使用**）
 * 内部使用localstorage和cookie存储数据，自动分配设备标识和多connector支持并保持一致，无需手动干预
 * isStoreAuthenticated() 检查存储是否已认证，在middleware、route和服务端组件中使用
 * getNextStore() 直接访问存储数据
 * 提供数据读写更新辅助方法
 */
"use server";
import { TokenSigningMethod, UserRole } from "./enums";
import { AllocatedTokens } from "./data-defines";
import { cookies } from "next/headers";
import { generateDeviceFingerprint } from "./helper";

const cookieRefreshToken = "taiyi_refresh_token";
const cookieRefreshTokenExpire = "taiyi_refresh_token_expire";
const cookieCSRFToken = "taiyi_csrf_token";
const cookieDevice = "taiyi_device";
const cookieStorePrefix = "taiyi_store";

/**
 * 适配Nextjs的安全数据存储
 */
export interface NextSecureStore {
  id: string;
  device: string;
  backend_host: string;
  backend_port: number;
  authenticated: boolean;
  access_token: string;
  public_key: string;
  algorithm: TokenSigningMethod;
  access_expired_at: string;
  roles: UserRole[];
  user: string;
}

/**
 * 需要安全存储的关键值
 */
export interface CriticalValues {
  csrf_token: string;
  refresh_token: string;
  refresh_expire: string;
}

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
  cs.set(storeKey, JSON.stringify(store), { sameSite: "strict", maxAge: 1 * 24 * 60 * 60 });
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

  cs.set(storeKey, storeContent, { sameSite: "strict", maxAge: maxAge });

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
  cks.set(`${cookieCSRFToken}_${storeID}`, values.csrf_token, { sameSite: "strict", maxAge: maxAge });
  cks.set(`${cookieRefreshToken}_${storeID}`, values.refresh_token, { httpOnly: true, sameSite: "strict", maxAge: maxAge });
  cks.set(`${cookieRefreshTokenExpire}_${storeID}`, values.refresh_expire, { sameSite: "strict", maxAge: maxAge, httpOnly: true });
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
  cks.set(cookieDevice, id, { sameSite: "strict", maxAge: 30 * 24 * 60 * 60 });
}

/**
 * 从cookie中获取设备ID（**仅限服务端组件使用**）
 */
export async function getDeviceID(): Promise<string> {
  const cks = await cookies();
  const deviceItem = cks.get(cookieDevice);
  return deviceItem?.value || "";
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
    cks.set(storeKey, JSON.stringify(store), { sameSite: "strict", maxAge: 1 * 24 * 60 * 60 });
  }
  cks.set(`${cookieCSRFToken}_${storeID}`, "", { maxAge: 0 });
  cks.set(`${cookieRefreshToken}_${storeID}`, "", { maxAge: 0 });
  cks.set(`${cookieRefreshTokenExpire}_${storeID}`, "", { maxAge: 0 });
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
      cks.set(storeKey, JSON.stringify(store), { sameSite: "strict", maxAge: 30 * 24 * 60 * 60 });
    }
  }
}

/**
 * 验证存储的数据（**仅限服务端组件使用**）
 */
function validateStoredData(store: NextSecureStore): boolean {
  if (!store.id || !store.device || !store.backend_host || !store.backend_port) return false;
  if (store.authenticated && store.access_token && store.access_expired_at) {
    const expiredAt = new Date(store.access_expired_at);
    if (expiredAt.getTime() < Date.now()) return false;
  }
  return true;
}
