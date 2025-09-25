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
 * @property {string} id 实例唯一标识
 * @property {string} device 设备ID
 * @property {string} backendHost 后端主机地址
 * @property {number} backendPort 后端端口号
 * @property {boolean} authenticated 是否已认证
 * @property {string} accessToken 访问令牌
 * @property {string} public_key 公钥
 * @property {TokenSigningMethod} algorithm 令牌签名方法
 * @property {string} access_expired_at 访问令牌过期时间，RFC3339格式
 * @property {UserRole[]} roles 用户角色列表
 * @property {string} user 用户名称
 * @description 封装Nextjs的安全连接，防CSRF攻击
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
 * @property {string} csrf_token CSRF令牌
 * @property {string} refresh_token 刷新令牌
 * @property {string} refresh_expire 刷新令牌过期时间，RFC3339格式
 */
export interface CriticalValues {
  csrf_token: string;
  refresh_token: string;
  refresh_expire: string;
}

/**
 * 获取Nextjs的安全数据存储（**仅限服务端组件使用**）
 * @param {string} deviceID 设备ID
 * @param {string} backendHost 后端主机地址
 * @param {number} backendPort 后端端口号
 * @returns {NextSecureStore} 安全数据存储
 * @description 基于设备ID、后端主机地址和后端端口号获取安全数据存储
 * @async
 */
export async function getNextStore(
  deviceID: string,
  backendHost: string,
  backendPort: number = 5851
): Promise<NextSecureStore> {
  const fingerprint = generateDeviceFingerprint(
    deviceID,
    backendHost,
    backendPort
  );
  const storeKey = `${cookieStorePrefix}_${fingerprint}`;
  const cs = await cookies();
  const storeItem = cs.get(storeKey);
  if (storeItem && storeItem.value) {
    //exists
    const store: NextSecureStore = JSON.parse(storeItem.value);
    if (validateStoredData(store)) {
      return store;
    }
  }
  //new store
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
  //set json value
  cs.set(storeKey, JSON.stringify(store), {
    sameSite: "strict", // 防 CSRF 攻击
    maxAge: 1 * 24 * 60 * 60, // 有效期 1 天
  });
  return store;
}

/**
 * 检查安全数据存储是否已认证（**仅限服务端组件使用**）
 * @param {string} backendHost 后端主机地址
 * @param {number} backendPort 后端端口号
 * @returns {Promise<boolean>} 是否已认证
 * @description 基于后端主机地址和后端端口号检查安全数据存储是否已认证
 * @async
 */
export async function isStoreAuthenticated(
  backendHost: string,
  backendPort: number = 5851
): Promise<boolean> {
  const deviceID = await getDeviceID();
  const store = await getNextStore(deviceID, backendHost, backendPort);
  return store.authenticated;
}

/**
 * 保存安全连接封装的令牌（**仅限服务端组件使用**）
 * @param {string} storeID 安全连接封装ID
 * @param {AllocatedTokens} tokens 分配令牌
 * @returns {Promise<void>} 无返回值
 * @description 更新安全连接封装的访问令牌、访问令牌过期时间、用户角色列表和用户名称
 * @async
 */
export async function storeAllocatedTokens(
  storeID: string,
  tokens: AllocatedTokens
): Promise<void> {
  const cs = await cookies();
  const storeKey = `${cookieStorePrefix}_${storeID}`;
  const storeItem = cs.get(storeKey);
  if (storeItem && storeItem.value) {
    const store: NextSecureStore = JSON.parse(storeItem.value);
    if (validateStoredData(store)) {
      store.access_token = tokens.access_token;
      store.access_expired_at = tokens.access_expired_at;
      store.algorithm = tokens.algorithm;
      store.public_key = tokens.public_key;
      store.roles = tokens.roles;
      store.user = tokens.user;
      store.authenticated = true;
      //set json value
      const storeContent = JSON.stringify(store);
      const expiredAt = new Date(tokens.access_expired_at);
      // 在访问令牌过期时间基础上增加1分钟作为cookie的有效期
      let maxAge = Math.floor(
        (expiredAt.getTime() - Date.now() + 60 * 1000) / 1000
      );
      if (maxAge <= 0) {
        //1 hour for default
        maxAge = 1 * 60 * 60;
      }

      cs.set(storeKey, storeContent, {
        sameSite: "strict", // 防 CSRF 攻击
        maxAge: maxAge, // 确保maxAge不为负数
      });
      const stored: CriticalValues = {
        csrf_token: tokens.csrf_token,
        refresh_token: tokens.refresh_token,
        refresh_expire: tokens.refresh_expired_at,
      };
      await storeCriticalValues(storeID, stored);
      // console.log(`store-${storeID}: tokens authenticated, user ${store.user}`);
    } else {
      console.log(`丢弃已失效存储数据: ${JSON.stringify(store)}`);
    }
  }
}

/**
 * 获取安全连接封装的令牌（**仅限服务端组件使用**）
 * @param {string} storeID 安全连接封装ID
 * @returns {Promise<AllocatedTokens>} 分配令牌
 * @description 从cookie中获取安全连接封装的访问令牌、访问令牌过期时间、用户角色列表和用户名称
 * @async
 */
export async function retrieveAllocatedTokens(
  storeID: string
): Promise<AllocatedTokens> {
  const cs = await cookies();
  const storeKey = `${cookieStorePrefix}_${storeID}`;
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
  // console.log(`store-${storeID}: warning: no tokens found`);
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
 * @param {string} storeID 连接器ID
 * @param {CriticalValues} values 关键值
 * @description 存储csrf令牌、刷新令牌和刷新令牌过期时间到cookie中
 * @async
 */
export async function storeCriticalValues(
  storeID: string,
  values: CriticalValues
) {
  const cks = await cookies();
  //基于refresh_expire计算maxAge
  const maxAge = Math.floor(
    (new Date(values.refresh_expire).getTime() - Date.now()) / 1000
  );
  //save csrf
  const csrfKey = `${cookieCSRFToken}_${storeID}`;
  cks.set(csrfKey, values.csrf_token, {
    sameSite: "strict", // 防 CSRF 攻击
    maxAge: maxAge, // 有效期 30 天
  });
  //save refresh token
  const refreshKey = `${cookieRefreshToken}_${storeID}`;
  cks.set(refreshKey, values.refresh_token, {
    httpOnly: true,
    sameSite: "strict", // 防 CSRF 攻击
    maxAge: maxAge, // 有效期 30 天
  });
  //save refresh token expire
  const refreshExpireKey = `${cookieRefreshTokenExpire}_${storeID}`;
  cks.set(refreshExpireKey, values.refresh_expire, {
    sameSite: "strict", // 防 CSRF 攻击
    maxAge: maxAge, // 有效期 30 天
    httpOnly: true,
  });
}

/**
 * 获取关键值（**仅限服务端组件使用**）
 * @param {string} storeID 连接器ID
 * @returns {CriticalValues} 关键值
 * @description 从cookie中获取csrf令牌、刷新令牌和刷新令牌过期时间
 * @async
 */
export async function retrieveCriticalValues(
  storeID: string
): Promise<CriticalValues> {
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
 * 设置设备ID（**仅限服务端组件使用**）
 * @param {string} id 设备ID
 * @description 将设备ID存储到cookie中
 * @async
 */
export async function setDeviceID(id: string): Promise<void> {
  const cks = await cookies();
  cks.set(cookieDevice, id, {
    sameSite: "strict", // 防 CSRF 攻击
    maxAge: 30 * 24 * 60 * 60, // 有效期 30 天
  });
}

/**
 * 获取设备ID（**仅限服务端组件使用**）
 * @returns {Promise<string>} 设备ID
 * @description 从cookie中获取设备ID，如果不存在，生成一个新的设备ID并存储到cookie中
 * @async
 */
export async function getDeviceID(): Promise<string> {
  const cks = await cookies();
  const deviceItem = cks.get(cookieDevice);
  const deviceID = deviceItem!.value;
  return deviceID;
}
/**
 * 存储安全状态变化处理（**仅限服务端组件使用**）
 * @param {string} storeID 安全连接封装ID
 * @param {boolean} authenticated 认证状态
 * @description 将安全连接封装的认证状态存储到cookie中
 * @async
 */
export async function handleStoreStatusChanged(
  storeID: string,
  authenticated: boolean
) {
  const cks = await cookies();
  const storeKey = `${cookieStorePrefix}_${storeID}`;
  const storeItem = cks.get(storeKey);
  if (storeItem && storeItem.value) {
    const store: NextSecureStore = JSON.parse(storeItem.value);
    if (authenticated != store.authenticated) {
      // console.log(`store-${storeID}: status changed to ${authenticated}`);
      store.authenticated = authenticated;
      cks.set(storeKey, JSON.stringify(store), {
        sameSite: "strict", // 防 CSRF 攻击
        maxAge: 30 * 24 * 60 * 60, // 有效期 30 天
      });
    }
  }
}

/**
 * 验证存储的数据（**仅限服务端组件使用**）
 * @param {NextSecureStore} store 安全连接封装
 * @returns {boolean} 验证结果
 * @description 验证存储的数据是否完整和有效
 */
function validateStoredData(store: NextSecureStore): boolean {
  if (
    !store.id ||
    !store.device ||
    !store.backend_host ||
    !store.backend_port
  ) {
    return false;
  }
  if (store.authenticated && store.access_token && store.access_expired_at) {
    const expiredAt = new Date(store.access_expired_at);
    if (expiredAt.getTime() < Date.now()) {
      //expired
      return false;
    }
  }
  return true;
}
