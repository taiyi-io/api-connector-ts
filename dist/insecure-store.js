"use strict";
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
exports.clearInsecureTokens = exports.insecureGetTokens = exports.insecureSetTokens = void 0;
exports.getInsecureConnector = getInsecureConnector;
/**
 * 基于内存方式，非安全地存储TaiyiConnector数据
 * 用于开发、调试和非Nextjs的基本应用场景
 * 建议根据实际业务场景，自行封装更安全的数据存储方法
 */
const connector_1 = require("./connector");
/**
 * 内存中的令牌存储，键为connector.id
 */
const tokenStorage = new Map();
/**
 * 存储令牌
 * @param connectorID - connector.id
 * @param tokens - 要存储的令牌
 * @returns Promise<void>
 */
const insecureSetTokens = (connectorID, tokens) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`insecure-store: 存储令牌 for ${connectorID}`);
    tokenStorage.set(connectorID, tokens);
});
exports.insecureSetTokens = insecureSetTokens;
/**
 * 获取令牌
 * @param connectorID - connector.id
 * @returns Promise<AllocatedTokens>
 */
const insecureGetTokens = (connectorID) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`insecure-store: 获取令牌 for ${connectorID}`);
    const tokens = tokenStorage.get(connectorID);
    if (!tokens) {
        throw new Error(`未找到storeID ${connectorID} 对应的令牌`);
    }
    return tokens;
});
exports.insecureGetTokens = insecureGetTokens;
/**
 * 清除指定storeID的令牌
 * @param connectorID - connector.id
 */
const clearInsecureTokens = (connectorID) => {
    console.log(`insecure-store: 清除令牌 for ${connectorID}`);
    tokenStorage.delete(connectorID);
};
exports.clearInsecureTokens = clearInsecureTokens;
/**
 * 获取使用内存存储的TaiyiConnector实例
 * @param deviceID - 设备标识
 * @param backendHost - 后端主机名
 * @param backendPort - 后端端口号，默认值为5851
 * @returns Promise<TaiyiConnector>
 */
function getInsecureConnector(deviceID_1, backendHost_1) {
    return __awaiter(this, arguments, void 0, function* (deviceID, backendHost, backendPort = 5851) {
        console.log(`insecure-store: 创建连接器 with deviceID ${deviceID}`);
        // 创建TaiyiConnector实例
        const connector = new connector_1.TaiyiConnector(backendHost, backendPort, deviceID);
        // 绑定回调函数，不需要stateChange
        connector.bindCallback(connector.id, exports.insecureSetTokens, exports.insecureGetTokens);
        return connector;
    });
}
