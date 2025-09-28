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
exports.handleStoreStatusChanged = handleStoreStatusChanged;
const enums_1 = require("./enums");
const headers_1 = require("next/headers");
const helper_1 = require("./helper");
const cookieRefreshToken = "taiyi_refresh_token";
const cookieRefreshTokenExpire = "taiyi_refresh_token_expire";
const cookieCSRFToken = "taiyi_csrf_token";
const cookieDevice = "taiyi_device";
const cookieStorePrefix = "taiyi_store";
/**
 * 获取Nextjs的安全数据存储（**仅限服务端组件使用**）
 * @param deviceID - 设备ID
 * @param backendHost - 后端主机地址
 * @param backendPort - 后端端口号
 * @returns 安全的数据存储
 */
function getNextStore(deviceID_1, backendHost_1) {
    return __awaiter(this, arguments, void 0, function* (deviceID, backendHost, backendPort = 5851) {
        const fingerprint = (0, helper_1.generateDeviceFingerprint)(deviceID, backendHost, backendPort);
        const storeKey = `${cookieStorePrefix}_${fingerprint}`;
        const cs = yield (0, headers_1.cookies)();
        const storeItem = cs.get(storeKey);
        if (storeItem && storeItem.value) {
            //exists
            const store = JSON.parse(storeItem.value);
            if (validateStoredData(store)) {
                return store;
            }
        }
        //new store
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
        //set json value
        cs.set(storeKey, JSON.stringify(store), {
            sameSite: "strict", // 防 CSRF 攻击
            maxAge: 1 * 24 * 60 * 60, // 有效期 1 天
        });
        return store;
    });
}
/**
 * 检查安全数据存储是否已认证（**仅限服务端组件使用**）
 * @param backendHost - 后端主机地址
 * @param backendPort - 后端端口号
 * @returns 是否已认证
 */
function isStoreAuthenticated(backendHost_1) {
    return __awaiter(this, arguments, void 0, function* (backendHost, backendPort = 5851) {
        const deviceID = yield getDeviceID();
        const store = yield getNextStore(deviceID, backendHost, backendPort);
        return store.authenticated;
    });
}
/**
 * 保存安全连接封装的令牌（**仅限服务端组件使用**）
 * @param storeID - 安全连接封装ID
 * @param tokens - 分配令牌
 * @returns 无返回值
 */
function storeAllocatedTokens(storeID, tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        const cs = yield (0, headers_1.cookies)();
        const storeKey = `${cookieStorePrefix}_${storeID}`;
        const storeItem = cs.get(storeKey);
        if (storeItem && storeItem.value) {
            const store = JSON.parse(storeItem.value);
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
                let maxAge = Math.floor((expiredAt.getTime() - Date.now() + 60 * 1000) / 1000);
                if (maxAge <= 0) {
                    //1 hour for default
                    maxAge = 1 * 60 * 60;
                }
                cs.set(storeKey, storeContent, {
                    sameSite: "strict", // 防 CSRF 攻击
                    maxAge: maxAge, // 确保maxAge不为负数
                });
                const stored = {
                    csrf_token: tokens.csrf_token,
                    refresh_token: tokens.refresh_token,
                    refresh_expire: tokens.refresh_expired_at,
                };
                yield storeCriticalValues(storeID, stored);
            }
        }
    });
}
/**
 * 从安全存储中获取已分配令牌（**仅限服务端组件使用**）
 * @param storeID - 安全连接封装ID
 * @returns 分配令牌
 */
function retrieveAllocatedTokens(storeID) {
    return __awaiter(this, void 0, void 0, function* () {
        const cs = yield (0, headers_1.cookies)();
        const storeKey = `${cookieStorePrefix}_${storeID}`;
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
 * @param storeID - 存储ID
 * @param values - 关键值
 */
function storeCriticalValues(storeID, values) {
    return __awaiter(this, void 0, void 0, function* () {
        const cks = yield (0, headers_1.cookies)();
        //基于refresh_expire计算maxAge
        const maxAge = Math.floor((new Date(values.refresh_expire).getTime() - Date.now()) / 1000);
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
    });
}
/**
 * 获取关键值（**仅限服务端组件使用**）
 * @param storeID - 存储ID
 * @returns 关键值
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
 * @param id - 设备ID
 */
function setDeviceID(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const cks = yield (0, headers_1.cookies)();
        cks.set(cookieDevice, id, {
            sameSite: "strict", // 防 CSRF 攻击
            maxAge: 30 * 24 * 60 * 60, // 有效期 30 天
        });
    });
}
/**
 * 从cookie中获取设备ID（**仅限服务端组件使用**）
 * @returns 设备ID
 */
function getDeviceID() {
    return __awaiter(this, void 0, void 0, function* () {
        const cks = yield (0, headers_1.cookies)();
        const deviceItem = cks.get(cookieDevice);
        const deviceID = deviceItem.value;
        return deviceID;
    });
}
/**
 * 处理存储状态变化（**仅限服务端组件使用**）
 * @param storeID - 存储ID
 * @param authenticated - 是否已认证
 */
function handleStoreStatusChanged(storeID, authenticated) {
    return __awaiter(this, void 0, void 0, function* () {
        const cks = yield (0, headers_1.cookies)();
        const storeKey = `${cookieStorePrefix}_${storeID}`;
        const storeItem = cks.get(storeKey);
        if (storeItem && storeItem.value) {
            const store = JSON.parse(storeItem.value);
            if (authenticated != store.authenticated) {
                store.authenticated = authenticated;
                cks.set(storeKey, JSON.stringify(store), {
                    sameSite: "strict", // 防 CSRF 攻击
                    maxAge: 30 * 24 * 60 * 60, // 有效期 30 天
                });
            }
        }
    });
}
/**
 * 验证存储的数据（**仅限服务端组件使用**）
 * @param store - 存储数据
 * @returns 验证结果
 */
function validateStoredData(store) {
    if (!store.id ||
        !store.device ||
        !store.backend_host ||
        !store.backend_port) {
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
