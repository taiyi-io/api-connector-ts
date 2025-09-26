"use strict";
/**
 * 向API服务发送请求的转发器
 * **仅限服务端组件使用**
 */
"use server";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.fetchCommandResponse = fetchCommandResponse;
exports.sendCommand = sendCommand;
exports.checkSystemStatus = checkSystemStatus;
exports.initialSystem = initialSystem;
exports.authenticateByPassword = authenticateByPassword;
exports.authenticateByToken = authenticateByToken;
exports.refreshAccessToken = refreshAccessToken;
exports.openMonitorChannel = openMonitorChannel;
const ed25519 = __importStar(require("@noble/ed25519"));
const enums_1 = require("./enums");
const helper_1 = require("./helper");
const headerCSRFToken = "X-CSRF-Token";
/**
 * 控制命令URL
 * @param backendURL - 后端URL
 * @returns 控制命令URL
 */
function commandURL(backendURL) {
    return `${backendURL}commands/`;
}
function signEd25519(payload, privateKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = ed25519.etc.hexToBytes(privateKey).slice(0, 32);
        const msg = Buffer.from(payload, "utf-8");
        const signature = yield ed25519.signAsync(msg, key);
        const hex = Buffer.from(signature).toString("hex");
        return hex;
    });
}
/**
 * 解析控制命令响应
 * @param response - 响应
 * @returns 控制命令响应
 */
function parseCommandResponse(response) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = {};
        //if 401 unauthenticated
        if (response.status === 401) {
            result = {
                unauthenticated: true,
            };
            return result;
        }
        //if 200 success
        if (response.status != 200) {
            result = {
                error: response.statusText,
            };
            return result;
        }
        const payload = yield response.json();
        if (payload.error) {
            result = {
                error: payload.error,
            };
            return result;
        }
        if (!payload.data) {
            result = {
                error: "no data in task response",
            };
            return result;
        }
        result = {
            data: payload.data,
        };
        return result;
    });
}
/**
 * 解析控制命令结果
 * @param response - 响应
 * @returns 控制命令响应
 */
function parseCommandResult(response) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = {};
        //if 401 unauthenticated
        if (response.status === 401) {
            result = {
                unauthenticated: true,
            };
            return result;
        }
        //if 200 success
        if (response.status != 200) {
            result = {
                error: response.statusText,
            };
            return result;
        }
        const payload = yield response.json();
        if (payload.error) {
            result = {
                error: payload.error,
            };
            return result;
        }
        return result;
    });
}
/**
 * 解析认证令牌
 * @param response - 响应
 * @returns 认证令牌
 */
function parseAuthoriedToken(response) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = {};
        //if 401 unauthenticated
        if (response.status === 401) {
            result = {
                unauthenticated: true,
            };
            return result;
        }
        //if 200 success
        if (response.status != 200) {
            result = {
                error: response.statusText,
            };
            return result;
        }
        const payload = yield response.json();
        if (payload.error) {
            result = {
                error: payload.error,
            };
            return result;
        }
        if (!payload.data) {
            result = {
                error: "no data in task response",
            };
            return result;
        }
        const tokens = payload.data;
        result = {
            data: tokens,
        };
        return result;
    });
}
/**
 * 发送控制命令，获取标准结果
 * @param backendURL - 后端URL
 * @param accessToken - 授权令牌
 * @param csrfToken - CSRF令牌
 * @param command - 控制命令请求
 * @returns 控制命令响应
 */
function postAuthenticatedCommand(backendURL, accessToken, csrfToken, command) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = commandURL(backendURL);
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        };
        if (csrfToken) {
            headers[headerCSRFToken] = csrfToken;
        }
        try {
            const resp = yield fetch(url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(command),
            });
            return {
                data: resp,
            };
        }
        catch (error) {
            //如果是具体错误
            if (error instanceof Error) {
                return {
                    error: `请求${url}失败:${error.message}`,
                };
            }
            else {
                return {
                    error: `请求${url}时发生未知错误`,
                };
            }
        }
    });
}
/**
 * 发送原始请求
 * @param url - 请求URL
 * @param headers - 请求头
 * @param body - 请求体
 * @returns 响应
 */
function postRawRequest(url, headers, body) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const resp = yield fetch(url, {
                method: "POST",
                headers: headers,
                body: body,
            });
            return {
                data: resp,
            };
        }
        catch (error) {
            //如果是具体错误
            if (error instanceof Error) {
                return {
                    error: `请求${url}失败:${error.message}`,
                };
            }
            else {
                return {
                    error: `请求${url}时发生未知错误`,
                };
            }
        }
    });
}
/**
 * 发送控制命令，解析响应内容
 * @param backendURL - 后端URL
 * @param accessToken - 授权令牌
 * @param csrfToken - CSRF令牌
 * @param command - 控制命令请求
 * @returns 控制命令响应
 */
function fetchCommandResponse(backendURL, accessToken, csrfToken, command) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield postAuthenticatedCommand(backendURL, accessToken, csrfToken, command);
        if (response.error) {
            return { error: response.error };
        }
        const result = yield parseCommandResponse(response.data);
        return result;
    });
}
/**
 * 发送控制命令，检查是否成功
 * @param backendURL - 后端URL
 * @param accessToken - 授权令牌
 * @param csrfToken - CSRF令牌
 * @param command - 控制命令请求
 * @returns 控制命令响应
 */
function sendCommand(backendURL, accessToken, csrfToken, command) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield postAuthenticatedCommand(backendURL, accessToken, csrfToken, command);
        if (response.error) {
            return { error: response.error };
        }
        const result = yield parseCommandResult(response.data);
        return result;
    });
}
/**
 * 获取系统状态
 * @param backendURL - 后端URL
 * @returns 系统状态
 */
function checkSystemStatus(backendURL) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = commandURL(backendURL);
        const cmd = {
            type: enums_1.controlCommandEnum.GetSystemStatus,
        };
        const headers = {
            "Content-Type": "application/json",
        };
        const body = JSON.stringify(cmd);
        const resp = yield postRawRequest(url, headers, body);
        if (resp.error) {
            return { error: resp.error };
        }
        const result = yield parseCommandResponse(resp.data);
        if (result.unauthenticated) {
            return {
                unauthenticated: true,
            };
        }
        if (result.error) {
            return {
                error: result.error,
            };
        }
        if (result.data && result.data.system_status) {
            return {
                data: result.data.system_status,
            };
        }
        return {
            error: "no system status in response",
        };
    });
}
/**
 * 初始化系统
 * @param backendURL - 后端URL
 * @param user - 用户标识
 * @param password - 认证密钥
 * @returns 初始化结果
 */
function initialSystem(backendURL, user, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const cmd = {
            type: enums_1.controlCommandEnum.InitializeSystem,
            initialize_system: {
                user,
                password,
            },
        };
        const url = commandURL(backendURL);
        const headers = {
            "Content-Type": "application/json",
        };
        const body = JSON.stringify(cmd);
        const resp = yield postRawRequest(url, headers, body);
        if (resp.error) {
            return { error: resp.error };
        }
        const result = yield parseCommandResult(resp.data);
        return result;
    });
}
/**
 * 使用密码认证
 * @param backendURL - 后端URL
 * @param user - 用户标识
 * @param device - 唯一设备标识
 * @param password - 认证密钥
 * @returns 认证令牌
 */
function authenticateByPassword(backendURL, user, device, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const cmd = {
            user,
            device,
            secret: password,
        };
        ///auth/by-secret
        const url = `${backendURL}auth/by-secret`;
        const headers = {
            "Content-Type": "application/json",
        };
        const body = JSON.stringify(cmd);
        const resp = yield postRawRequest(url, headers, body);
        if (resp.error) {
            return { error: resp.error };
        }
        const result = yield parseAuthoriedToken(resp.data);
        return result;
    });
}
/**
 * 使用令牌认证
 * @param backendURL - 后端URL
 * @param user - 用户标识
 * @param device - 唯一设备标识
 * @param serial - 设备序列号
 * @param signature_algorithm - 签名算法
 * @param private_key - 私钥
 * @returns 认证令牌
 */
function authenticateByToken(backendURL, user, device, serial, signature_algorithm, private_key) {
    return __awaiter(this, void 0, void 0, function* () {
        if (signature_algorithm != enums_1.SignatureAlgorithm.Ed25519) {
            return {
                error: `unexpected signature algorithm ${signature_algorithm}`,
            };
        }
        // 1. Create timestamp in RFC3339 format
        const timestamp = new Date().toISOString();
        // 2. Generate random nonce (at least 20 chars)
        const nonce = (0, helper_1.generateNonce)();
        const keyTimestamp = "timestamp";
        const keyNonce = "nonce";
        const keyUser = "user";
        const keySerial = "serial";
        const keyDevice = "device";
        const keys = {
            [keyTimestamp]: timestamp,
            [keyNonce]: nonce,
            [keyUser]: user,
            [keySerial]: serial,
            [keyDevice]: device,
        };
        const sortedKeys = Object.keys(keys).sort();
        //使用key=value，用&拼接
        const payload = sortedKeys.map((key) => `${key}=${keys[key]}`).join("&");
        const signature = yield signEd25519(payload, private_key);
        const url = `${backendURL}auth/by-token`;
        const params = {
            user: user,
            device: device,
            serial: serial,
            nonce: nonce,
            timestamp: timestamp,
            signature_algorithm: signature_algorithm,
            signature: signature,
        };
        const headers = {
            "Content-Type": "application/json",
        };
        const body = JSON.stringify(params);
        const resp = yield postRawRequest(url, headers, body);
        if (resp.error) {
            return { error: resp.error };
        }
        const result = yield parseAuthoriedToken(resp.data);
        //todo: validate nonce
        return result;
    });
}
/**
 * 刷新认证令牌
 * @param backendURL - 后端URL
 * @param user - 用户标识
 * @param device - 唯一设备标识
 * @param refreshToken - 刷新令牌
 * @returns 刷新后的认证令牌
 */
function refreshAccessToken(backendURL, user, device, refreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const cmd = {
            user: user,
            device: device,
            token: refreshToken,
        };
        ///auth/refresh
        const url = `${backendURL}auth/refresh`;
        const headers = {
            "Content-Type": "application/json",
        };
        const body = JSON.stringify(cmd);
        const resp = yield postRawRequest(url, headers, body);
        if (resp.error) {
            return { error: resp.error };
        }
        const result = yield parseAuthoriedToken(resp.data);
        return result;
    });
}
/**
 * 打开监控通道
 * @param backendURL - 后端URL
 * @param accessToken - 访问令牌
 * @param csrfToken - CSRF令牌
 * @param guestID - 目标云主机id
 * @returns 监控通道数据
 */
function openMonitorChannel(backendURL, accessToken, csrfToken, guestID) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${backendURL}monitor/`;
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "X-CSRF-Token": csrfToken,
        };
        const body = JSON.stringify({
            id: guestID,
        });
        const resp = yield postRawRequest(url, headers, body);
        if (resp.error) {
            return { error: resp.error };
        }
        if (!resp.data) {
            return { error: "无效响应" };
        }
        const result = yield resp.data.json();
        if (result.error) {
            return { error: result.error };
        }
        return { data: result.data };
    });
}
