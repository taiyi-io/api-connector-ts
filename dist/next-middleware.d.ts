import { NextSecureStore } from "./next-store-internals";
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
        get(name: string): {
            value: string;
        } | undefined;
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
export declare function getDeviceIDFromRequest(req: ReadableCookieRequest): string | undefined;
/**
 * 从请求 cookie 中读取安全存储数据（只读）
 *
 * @param req - NextRequest 实例
 * @param backendHost - 后端主机名
 * @param backendPort - 后端端口号
 * @param useTLS - 是否启用 TLS
 * @returns 有效的 NextSecureStore；未登录、cookie 缺失或过期时返回 undefined
 */
export declare function getStoreFromRequest(req: ReadableCookieRequest, backendHost: string, backendPort?: number, useTLS?: boolean): NextSecureStore | undefined;
/**
 * 从请求 cookie 中读取 refresh token 过期时间
 *
 * @param req - NextRequest 实例
 * @param storeID - 存储ID（设备指纹），即 `NextSecureStore.id`
 * @returns refresh token 过期时间；cookie 缺失或格式错误返回 undefined
 */
export declare function getRefreshExpireFromRequest(req: ReadableCookieRequest, storeID: string): Date | undefined;
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
export declare function isStoreAuthenticatedFromRequest(req: ReadableCookieRequest, backendHost: string, backendPort?: number, useTLS?: boolean, opts?: {
    allowRefreshExpired?: boolean;
}): boolean;
