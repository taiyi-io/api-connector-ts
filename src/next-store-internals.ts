/**
 * Nextjs 安全存储的内部常量与纯函数。
 *
 * 本文件不带 `"use server"` 指令，可被 middleware/edge 运行时直接 import，
 * 与 `next-secure-store.ts`（服务端 cookie 读写）和 `next-middleware.ts`（middleware 只读）共享。
 */
import { TokenSigningMethod, UserRole } from "./enums";

/**
 * 存储在 cookie 中的键名常量
 */
export const cookieRefreshToken = "taiyi_refresh_token";
export const cookieRefreshTokenExpire = "taiyi_refresh_token_expire";
export const cookieCSRFToken = "taiyi_csrf_token";
export const cookieDevice = "taiyi_device";
export const cookieStorePrefix = "taiyi_store";

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
 * 根据 useTLS 拼接 store cookie 键名
 * @param storeID - 存储ID（设备指纹）
 * @param useTLS - 是否启用 TLS
 * @returns store cookie 键名
 */
export function buildStoreKey(storeID: string, useTLS: boolean): string {
  return `${cookieStorePrefix}_${storeID}_${useTLS ? "tls" : "plain"}`;
}

/**
 * 验证存储的数据是否有效
 * @param store - 存储数据
 * @returns 是否有效
 */
export function validateStoredData(store: NextSecureStore): boolean {
  if (!store.id || !store.device || !store.backend_host || !store.backend_port) return false;
  if (store.authenticated && store.access_token && store.access_expired_at) {
    const expiredAt = new Date(store.access_expired_at);
    if (expiredAt.getTime() < Date.now()) return false;
  }
  return true;
}
