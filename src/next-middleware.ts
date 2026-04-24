/**
 * 适用于 Nextjs middleware / edge 运行时的**只读** cookie 访问工具。
 *
 * 本文件**不带** `"use server"` 指令，仅基于 `NextRequest.cookies` 读取数据，
 * 绝不调用 `cookies().set()`，避免在 middleware 中产生静默失败的写入副作用。
 *
 * 主要使用场景：
 * - Next.js middleware（`proxy.ts` / `middleware.ts`）做登录态守卫
 * - edge runtime 的 Route Handler 纯只读鉴权
 *
 * 写入（令牌持久化、设备ID分配）请继续使用 `next-secure-store.ts` 中的 Server Action。
 */
import { generateDeviceFingerprint } from "./helper";
import {
  cookieDevice,
  cookieRefreshTokenExpire,
  buildStoreKey,
  validateStoredData,
  NextSecureStore,
} from "./next-store-internals";

/**
 * 结构化的请求 cookie 读取契约。
 *
 * 采用结构化类型而非直接依赖 `next/server` 的 `NextRequest`，
 * 避免调用方（portal / 其他应用）与本库各自安装的 `next` 版本产生类型冲突，
 * 同时兼容 middleware、Route Handler、edge runtime 等多种场景。
 *
 * 只要对象具备 `cookies.get(name)` 且返回 `{ value: string } | undefined` 即可使用。
 */
export interface ReadableCookieRequest {
  cookies: {
    get(name: string): { value: string } | undefined;
  };
}

/**
 * 从请求 cookie 中读取设备 ID
 *
 * 与 `next-secure-store.ts:getDeviceID()` 不同：本函数**不会**在缺失时生成并写入新的设备 ID，
 * 仅做只读查询。若需要自动分配设备 ID，请在 Route Handler / Server Action 中调用 `getDeviceID()`。
 *
 * @param req - NextRequest 实例
 * @returns 设备 ID，缺失时返回 undefined
 */
export function getDeviceIDFromRequest(req: ReadableCookieRequest): string | undefined {
  const item = req.cookies.get(cookieDevice);
  return item?.value || undefined;
}

/**
 * 从请求 cookie 中读取安全存储数据（只读）
 *
 * @param req - NextRequest 实例
 * @param backendHost - 后端主机名
 * @param backendPort - 后端端口号
 * @param useTLS - 是否启用 TLS
 * @returns 有效的 NextSecureStore；未登录、cookie 缺失或过期时返回 undefined
 */
export function getStoreFromRequest(
  req: ReadableCookieRequest,
  backendHost: string,
  backendPort: number = 5851,
  useTLS: boolean = false
): NextSecureStore | undefined {
  const deviceID = getDeviceIDFromRequest(req);
  if (!deviceID) return undefined;
  const fingerprint = generateDeviceFingerprint(deviceID, backendHost, backendPort, useTLS);
  const storeKey = buildStoreKey(fingerprint, useTLS);
  const storeItem = req.cookies.get(storeKey);
  if (!storeItem || !storeItem.value) return undefined;
  try {
    const store = JSON.parse(storeItem.value) as NextSecureStore;
    if (!validateStoredData(store)) return undefined;
    return store;
  } catch {
    return undefined;
  }
}

/**
 * 从请求 cookie 中读取 refresh token 过期时间
 *
 * @param req - NextRequest 实例
 * @param storeID - 存储ID（设备指纹），即 `NextSecureStore.id`
 * @returns refresh token 过期时间；cookie 缺失或格式错误返回 undefined
 */
export function getRefreshExpireFromRequest(
  req: ReadableCookieRequest,
  storeID: string
): Date | undefined {
  const item = req.cookies.get(`${cookieRefreshTokenExpire}_${storeID}`);
  if (!item || !item.value) return undefined;
  const d = new Date(item.value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

/**
 * middleware 中判定请求是否已认证（只读）
 *
 * 严格模式（默认）：access token 未过期且 `authenticated=true` 才返回 true。
 *
 * 宽容模式（`opts.allowRefreshExpired = true`）：
 * 允许 access token 已过期但 refresh token 仍在有效期的请求通过，
 * 让页面加载后由客户端 `TaiyiConnector.startHeartBeat()` 完成刷新，
 * 避免在 access 过期窗口期误跳登录页。
 *
 * @param req - NextRequest 实例
 * @param backendHost - 后端主机名
 * @param backendPort - 后端端口号
 * @param useTLS - 是否启用 TLS
 * @param opts - 额外选项
 * @returns 是否已认证
 */
export function isStoreAuthenticatedFromRequest(
  req: ReadableCookieRequest,
  backendHost: string,
  backendPort: number = 5851,
  useTLS: boolean = false,
  opts?: { allowRefreshExpired?: boolean }
): boolean {
  // 尝试读取有效 store（未过期且已登录）
  const store = getStoreFromRequest(req, backendHost, backendPort, useTLS);
  if (store && store.authenticated) {
    return true;
  }
  // 宽容模式：access 已过期/缺失，但 refresh 仍有效也放行
  if (opts?.allowRefreshExpired) {
    const deviceID = getDeviceIDFromRequest(req);
    if (!deviceID) return false;
    const fingerprint = generateDeviceFingerprint(deviceID, backendHost, backendPort, useTLS);
    // store 过期后 validateStoredData 会返回 false，导致 getStoreFromRequest 返回 undefined，
    // 此时 authenticated 字段仍持久在 cookie 里，但我们无法复用已失效的 store，
    // 直接改用 refresh 过期时间作为放行依据。
    const refreshExpire = getRefreshExpireFromRequest(req, fingerprint);
    if (refreshExpire && refreshExpire.getTime() > Date.now()) {
      return true;
    }
  }
  return false;
}
