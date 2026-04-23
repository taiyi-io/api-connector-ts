"use strict";
/**
 * 适配Nextjs的封装，安全存储TaiyiConnector，防止CSRF攻击（**仅限服务端组件使用**）
 * 内部使用localstorage和cookie存储数据，自动分配设备标识和多connector支持并保持一致，无需手动干预
 * isStoreAuthenticated() 检查存储是否已认证，在middleware、route和服务端组件中使用
 * getNextStore() 直接访问存储数据
 * 提供数据读写更新辅助方法
 */
"use server";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextStore = getNextStore;
exports.isStoreAuthenticated = isStoreAuthenticated;
exports.storeAllocatedTokens = storeAllocatedTokens;
exports.retrieveAllocatedTokens = retrieveAllocatedTokens;
exports.storeCriticalValues = storeCriticalValues;
exports.retrieveCriticalValues = retrieveCriticalValues;
exports.setDeviceID = setDeviceID;
exports.getDeviceID = getDeviceID;
exports.clearAllocatedTokens = clearAllocatedTokens;
exports.handleStoreStatusChanged = handleStoreStatusChanged;
const enums_1 = require("./enums");
const headers_1 = require("next/headers");
const cuid2_1 = require("@paralleldrive/cuid2");
const helper_1 = require("./helper");
const cookieRefreshToken = "taiyi_refresh_token";
const cookieRefreshTokenExpire = "taiyi_refresh_token_expire";
const cookieCSRFToken = "taiyi_csrf_token";
const cookieDevice = "taiyi_device";
const cookieStorePrefix = "taiyi_store";
/**
 * 获取Nextjs的安全数据存储（**仅限服务端组件使用**）
 */
function getNextStore(deviceID_1, backendHost_1) {
    return __awaiter(this, arguments, void 0, function* (deviceID, backendHost, backendPort = 5851, useTLS = false) {
        const fingerprint = (0, helper_1.generateDeviceFingerprint)(deviceID, backendHost, backendPort, useTLS);
        const storeKey = `${cookieStorePrefix}_${fingerprint}_${useTLS ? "tls" : "plain"}`;
        const cs = yield (0, headers_1.cookies)();
        const storeItem = cs.get(storeKey);
        if (storeItem && storeItem.value) {
            const store = JSON.parse(storeItem.value);
            if (validateStoredData(store)) {
                return store;
            }
        }
        const store = {
            id: fingerprint,
            device: deviceID,
            backend_host: backendHost,
            backend_port: backendPort,
            authenticated: false,
            access_token: "",
            public_key: "",
            algorithm: enums_1.TokenSigningMethod.HS256,
            access_expired_at: "",
            roles: [],
            user: "",
        };
        cs.set(storeKey, JSON.stringify(store), { sameSite: "strict", maxAge: 1 * 24 * 60 * 60 });
        return store;
    });
}
/**
 * 检查安全数据存储是否已认证（**仅限服务端组件使用**）
 */
function isStoreAuthenticated(backendHost_1) {
    return __awaiter(this, arguments, void 0, function* (backendHost, backendPort = 5851, useTLS = false) {
        const deviceID = yield getDeviceID();
        const store = yield getNextStore(deviceID, backendHost, backendPort, useTLS);
        return store.authenticated;
    });
}
/**
 * 保存安全连接封装的令牌（**仅限服务端组件使用**）
 */
function storeAllocatedTokens(storeID_1, tokens_1) {
    return __awaiter(this, arguments, void 0, function* (storeID, tokens, useTLS = false) {
        const cs = yield (0, headers_1.cookies)();
        const storeKey = `${cookieStorePrefix}_${storeID}_${useTLS ? "tls" : "plain"}`;
        const storeItem = cs.get(storeKey);
        let store;
        if (storeItem && storeItem.value) {
            store = JSON.parse(storeItem.value);
        }
        else {
            const deviceID = yield getDeviceID();
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
        if (maxAge <= 0)
            maxAge = 1 * 60 * 60;
        cs.set(storeKey, storeContent, { sameSite: "strict", maxAge: maxAge });
        const stored = {
            csrf_token: tokens.csrf_token,
            refresh_token: tokens.refresh_token,
            refresh_expire: tokens.refresh_expired_at,
        };
        yield storeCriticalValues(storeID, stored);
    });
}
/**
 * 从安全存储中获取已分配令牌（**仅限服务端组件使用**）
 */
function retrieveAllocatedTokens(storeID_1) {
    return __awaiter(this, arguments, void 0, function* (storeID, useTLS = false) {
        const cs = yield (0, headers_1.cookies)();
        const storeKey = `${cookieStorePrefix}_${storeID}_${useTLS ? "tls" : "plain"}`;
        const storeItem = cs.get(storeKey);
        if (storeItem && storeItem.value) {
            const store = JSON.parse(storeItem.value);
            if (validateStoredData(store)) {
                const values = yield retrieveCriticalValues(storeID);
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
            algorithm: enums_1.TokenSigningMethod.HS256,
            public_key: "",
            roles: [],
            user: "",
            refresh_token: "",
            refresh_expired_at: "",
            csrf_token: "",
        };
    });
}
/**
 * 存储关键值（**仅限服务端组件使用**）
 */
function storeCriticalValues(storeID, values) {
    return __awaiter(this, void 0, void 0, function* () {
        const cks = yield (0, headers_1.cookies)();
        const maxAge = Math.floor((new Date(values.refresh_expire).getTime() - Date.now()) / 1000);
        cks.set(`${cookieCSRFToken}_${storeID}`, values.csrf_token, { sameSite: "strict", maxAge: maxAge });
        cks.set(`${cookieRefreshToken}_${storeID}`, values.refresh_token, { httpOnly: true, sameSite: "strict", maxAge: maxAge });
        cks.set(`${cookieRefreshTokenExpire}_${storeID}`, values.refresh_expire, { sameSite: "strict", maxAge: maxAge, httpOnly: true });
    });
}
/**
 * 获取关键值（**仅限服务端组件使用**）
 */
function retrieveCriticalValues(storeID) {
    return __awaiter(this, void 0, void 0, function* () {
        const cks = yield (0, headers_1.cookies)();
        const csrfKey = `${cookieCSRFToken}_${storeID}`;
        const refreshKey = `${cookieRefreshToken}_${storeID}`;
        const refreshExpireKey = `${cookieRefreshTokenExpire}_${storeID}`;
        const csrfItem = cks.get(csrfKey);
        const refreshItem = cks.get(refreshKey);
        const refreshExpireItem = cks.get(refreshExpireKey);
        return {
            csrf_token: (csrfItem === null || csrfItem === void 0 ? void 0 : csrfItem.value) || "",
            refresh_token: (refreshItem === null || refreshItem === void 0 ? void 0 : refreshItem.value) || "",
            refresh_expire: (refreshExpireItem === null || refreshExpireItem === void 0 ? void 0 : refreshExpireItem.value) || "",
        };
    });
}
/**
 * cookie中存储设备ID（**仅限服务端组件使用**）
 */
function setDeviceID(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const cks = yield (0, headers_1.cookies)();
        cks.set(cookieDevice, id, { sameSite: "strict", maxAge: 30 * 24 * 60 * 60 });
    });
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
function getDeviceID() {
    return __awaiter(this, void 0, void 0, function* () {
        const cks = yield (0, headers_1.cookies)();
        const deviceItem = cks.get(cookieDevice);
        if (deviceItem && deviceItem.value) {
            return deviceItem.value;
        }
        // cookie 缺失，自动生成并持久化，保证服务端路由调用时设备ID必定非空
        const newDeviceID = `server-${(0, cuid2_1.createId)()}`;
        cks.set(cookieDevice, newDeviceID, { sameSite: "strict", maxAge: 30 * 24 * 60 * 60 });
        return newDeviceID;
    });
}
/**
 * 清除存储的令牌信息（**仅限服务端组件使用**）
 */
function clearAllocatedTokens(storeID_1) {
    return __awaiter(this, arguments, void 0, function* (storeID, useTLS = false) {
        const cks = yield (0, headers_1.cookies)();
        const storeKey = `${cookieStorePrefix}_${storeID}_${useTLS ? "tls" : "plain"}`;
        const storeItem = cks.get(storeKey);
        if (storeItem && storeItem.value) {
            const store = JSON.parse(storeItem.value);
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
    });
}
/**
 * 处理存储状态变化（**仅限服务端组件使用**）
 */
function handleStoreStatusChanged(storeID_1, authenticated_1) {
    return __awaiter(this, arguments, void 0, function* (storeID, authenticated, useTLS = false) {
        const cks = yield (0, headers_1.cookies)();
        const storeKey = `${cookieStorePrefix}_${storeID}_${useTLS ? "tls" : "plain"}`;
        const storeItem = cks.get(storeKey);
        if (storeItem && storeItem.value) {
            const store = JSON.parse(storeItem.value);
            if (authenticated != store.authenticated) {
                store.authenticated = authenticated;
                cks.set(storeKey, JSON.stringify(store), { sameSite: "strict", maxAge: 30 * 24 * 60 * 60 });
            }
        }
    });
}
/**
 * 验证存储的数据（**仅限服务端组件使用**）
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
