"use strict";
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
exports.newInsecureConnector = newInsecureConnector;
__exportStar(require("./connector"), exports);
__exportStar(require("./enums"), exports);
__exportStar(require("./data-defines"), exports);
__exportStar(require("./request-params"), exports);
__exportStar(require("./helper"), exports);
__exportStar(require("./next-secure-store"), exports);
__exportStar(require("./next-connector"), exports);
__exportStar(require("./request-forwarder"), exports);
__exportStar(require("./insecure-store"), exports);
const insecure_store_1 = require("./insecure-store");
/**
 * 创建一个不安全的连接
 * 仅用于开发、调试和非Nextjs的基本应用场景
 * 建议根据实际业务场景，自行封装更安全的数据存储方法
 * 注意：不安全的连接不支持CSRF攻击保护，不建议在生产环境中使用
 * @param deviceID 设备标识
 * @param accessString 访问字符串，用于认证
 * @param backendHost 后端主机名
 * @param backendPort 后端端口号
 * @returns 不安全的连接
 */
function newInsecureConnector(deviceID_1, accessString_1, backendHost_1) {
    return __awaiter(this, arguments, void 0, function* (deviceID, accessString, backendHost, backendPort = 5851) {
        const connector = yield (0, insecure_store_1.getInsecureConnector)(deviceID, backendHost, backendPort);
        const result = yield connector.authenticateByToken(accessString);
        if (result.error) {
            throw new Error(`认证失败:${result.error}`);
        }
        else if (result.unauthenticated) {
            throw new Error(`未认证:${result.unauthenticated}`);
        }
        return connector;
    });
}
