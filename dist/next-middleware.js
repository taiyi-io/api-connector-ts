"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeviceIDFromRequest = getDeviceIDFromRequest;
exports.getStoreFromRequest = getStoreFromRequest;
exports.getRefreshExpireFromRequest = getRefreshExpireFromRequest;
exports.isStoreAuthenticatedFromRequest = isStoreAuthenticatedFromRequest;
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
const helper_1 = require("./helper");
const next_store_internals_1 = require("./next-store-internals");
/**
 * 从请求 cookie 中读取设备 ID
 *
 * 与 `next-secure-store.ts:getDeviceID()` 不同：本函数**不会**在缺失时生成并写入新的设备 ID，
 * 仅做只读查询。若需要自动分配设备 ID，请在 Route Handler / Server Action 中调用 `getDeviceID()`。
 *
 * @param req - NextRequest 实例
 * @returns 设备 ID，缺失时返回 undefined
 */
function getDeviceIDFromRequest(req) {
    const item = req.cookies.get(next_store_internals_1.cookieDevice);
    return (item === null || item === void 0 ? void 0 : item.value) || undefined;
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
function getStoreFromRequest(req, backendHost, backendPort = 5851, useTLS = false) {
    const deviceID = getDeviceIDFromRequest(req);
    if (!deviceID)
        return undefined;
    const fingerprint = (0, helper_1.generateDeviceFingerprint)(deviceID, backendHost, backendPort, useTLS);
    const storeKey = (0, next_store_internals_1.buildStoreKey)(fingerprint, useTLS);
    const storeItem = req.cookies.get(storeKey);
    if (!storeItem || !storeItem.value)
        return undefined;
    try {
        const store = JSON.parse(storeItem.value);
        if (!(0, next_store_internals_1.validateStoredData)(store))
            return undefined;
        return store;
    }
    catch (_a) {
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
function getRefreshExpireFromRequest(req, storeID) {
    const item = req.cookies.get(`${next_store_internals_1.cookieRefreshTokenExpire}_${storeID}`);
    if (!item || !item.value)
        return undefined;
    const d = new Date(item.value);
    if (Number.isNaN(d.getTime()))
        return undefined;
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
function isStoreAuthenticatedFromRequest(req, backendHost, backendPort = 5851, useTLS = false, opts) {
    // 尝试读取有效 store（未过期且已登录）
    const store = getStoreFromRequest(req, backendHost, backendPort, useTLS);
    if (store && store.authenticated) {
        return true;
    }
    // 宽容模式：access 已过期/缺失，但 refresh 仍有效也放行
    if (opts === null || opts === void 0 ? void 0 : opts.allowRefreshExpired) {
        const deviceID = getDeviceIDFromRequest(req);
        if (!deviceID)
            return false;
        const fingerprint = (0, helper_1.generateDeviceFingerprint)(deviceID, backendHost, backendPort, useTLS);
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
