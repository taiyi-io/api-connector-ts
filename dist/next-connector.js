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
exports.getNextConnector = getNextConnector;
/**
 * 适用于Nextjs的封装，安全存储TaiyiConnector
 * 已内部封装localstorage和cookie，自动分配设备标识和多connector支持并保持一致，无需手动干预
 * getNextConnector() 基于后端服务地址获取稳定的connector
 */
const connector_1 = require("./connector");
const next_secure_store_1 = require("./next-secure-store");
const cuid2_1 = require("@paralleldrive/cuid2");
const storageKeyDevice = "taiyi_device";
/**
 * 获取适配Nextjs框架，数据安全存储的TaiyiConnector实例
 * 自动分配设备标识并保持一致，无需手动干预。数据基于cookie和localstorage保存
 * @param backendHost - 后端主机名
 * @param backendPort - 后端端口号，默认值为5851
 * @returns TaiyiConnector
 * @throws 令牌失效
 * @example
 * ...
 * const connector = await getNextConnector(
 *   process.env.BACKEND_HOST!,
 *   Number(process.env.BACKEND_PORT)
 * );
 * await connector.authenticateByToken(token);
 * await connector.getGuest(guestID);
 */
function getNextConnector(backendHost_1) {
    return __awaiter(this, arguments, void 0, function* (backendHost, backendPort = 5851) {
        const deviceID = yield getDeviceFromBrowser();
        console.log(`next-connector: get connector with deviceID ${deviceID}`);
        const store = yield (0, next_secure_store_1.getNextStore)(deviceID, backendHost, backendPort);
        const connector = new connector_1.TaiyiConnector(store.backend_host, store.backend_port, store.device);
        connector.bindCallback(store.id, next_secure_store_1.storeAllocatedTokens, next_secure_store_1.retrieveAllocatedTokens, next_secure_store_1.handleStoreStatusChanged);
        if (store.authenticated) {
            const values = yield (0, next_secure_store_1.retrieveCriticalValues)(store.id);
            if (values) {
                const tokens = {
                    access_token: store.access_token,
                    access_expired_at: store.access_expired_at,
                    refresh_token: values.refresh_token,
                    refresh_expired_at: values.refresh_expire,
                    csrf_token: values.csrf_token,
                    public_key: store.public_key,
                    algorithm: store.algorithm,
                    roles: store.roles,
                    user: store.user,
                };
                const result = connector.loadTokens(tokens);
                if (result.error) {
                    throw new Error(`加载已分配令牌失败:${result.error}`);
                }
            }
        }
        return connector;
    });
}
function getDeviceFromBrowser() {
    return __awaiter(this, void 0, void 0, function* () {
        // 尝试从localStorage读取deviceID
        const storedDeviceID = localStorage.getItem(storageKeyDevice);
        if (storedDeviceID && storedDeviceID.trim() !== "") {
            yield (0, next_secure_store_1.setDeviceID)(storedDeviceID);
            return storedDeviceID;
        }
        // 获取浏览器类型，无法获取则使用默认值
        let browser = "browser";
        if (typeof navigator !== "undefined" && navigator.userAgent) {
            if (navigator.userAgent.includes("Chrome")) {
                browser = "chrome";
            }
            else if (navigator.userAgent.includes("Firefox")) {
                browser = "firefox";
            }
            else if (navigator.userAgent.includes("Safari")) {
                browser = "safari";
            }
            else if (navigator.userAgent.includes("MSIE") ||
                navigator.userAgent.includes("Trident")) {
                browser = "ie";
            }
            else if (navigator.userAgent.includes("Edge")) {
                browser = "edge";
            }
        }
        else {
            browser = "browser";
        }
        // 生成新的deviceID
        const id = (0, cuid2_1.createId)();
        const deviceID = `${browser}-${id}`;
        // 保存到localStorage
        localStorage.setItem(storageKeyDevice, deviceID);
        yield (0, next_secure_store_1.setDeviceID)(deviceID);
        // console.log(`new device id ${deviceID} ready`);
        return deviceID;
    });
}
