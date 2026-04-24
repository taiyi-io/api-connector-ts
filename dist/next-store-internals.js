"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieStorePrefix = exports.cookieDevice = exports.cookieCSRFToken = exports.cookieRefreshTokenExpire = exports.cookieRefreshToken = void 0;
exports.buildStoreKey = buildStoreKey;
exports.validateStoredData = validateStoredData;
/**
 * 存储在 cookie 中的键名常量
 */
exports.cookieRefreshToken = "taiyi_refresh_token";
exports.cookieRefreshTokenExpire = "taiyi_refresh_token_expire";
exports.cookieCSRFToken = "taiyi_csrf_token";
exports.cookieDevice = "taiyi_device";
exports.cookieStorePrefix = "taiyi_store";
/**
 * 根据 useTLS 拼接 store cookie 键名
 * @param storeID - 存储ID（设备指纹）
 * @param useTLS - 是否启用 TLS
 * @returns store cookie 键名
 */
function buildStoreKey(storeID, useTLS) {
    return `${exports.cookieStorePrefix}_${storeID}_${useTLS ? "tls" : "plain"}`;
}
/**
 * 验证存储的数据是否有效
 * @param store - 存储数据
 * @returns 是否有效
 */
function validateStoredData(store) {
    if (!store.id || !store.device || !store.backend_host || !store.backend_port)
        return false;
    if (store.authenticated && store.access_token && store.access_expired_at) {
        const expiredAt = new Date(store.access_expired_at);
        if (expiredAt.getTime() < Date.now())
            return false;
    }
    return true;
}
