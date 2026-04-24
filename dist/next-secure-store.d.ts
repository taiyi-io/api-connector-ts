import { AllocatedTokens } from "./data-defines";
import { NextSecureStore, CriticalValues } from "./next-store-internals";
export type { NextSecureStore, CriticalValues } from "./next-store-internals";
/**
 * 获取Nextjs的安全数据存储（**仅限服务端组件使用**）
 */
export declare function getNextStore(deviceID: string, backendHost: string, backendPort?: number, useTLS?: boolean): Promise<NextSecureStore>;
/**
 * 检查安全数据存储是否已认证（**仅限服务端组件使用**）
 */
export declare function isStoreAuthenticated(backendHost: string, backendPort?: number, useTLS?: boolean): Promise<boolean>;
/**
 * 保存安全连接封装的令牌（**仅限服务端组件使用**）
 */
export declare function storeAllocatedTokens(storeID: string, tokens: AllocatedTokens, useTLS?: boolean): Promise<void>;
/**
 * 从安全存储中获取已分配令牌（**仅限服务端组件使用**）
 */
export declare function retrieveAllocatedTokens(storeID: string, useTLS?: boolean): Promise<AllocatedTokens>;
/**
 * 存储关键值（**仅限服务端组件使用**）
 */
export declare function storeCriticalValues(storeID: string, values: CriticalValues): Promise<void>;
/**
 * 获取关键值（**仅限服务端组件使用**）
 */
export declare function retrieveCriticalValues(storeID: string): Promise<CriticalValues>;
/**
 * cookie中存储设备ID（**仅限服务端组件使用**）
 */
export declare function setDeviceID(id: string): Promise<void>;
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
export declare function getDeviceID(): Promise<string>;
/**
 * 清除存储的令牌信息（**仅限服务端组件使用**）
 */
export declare function clearAllocatedTokens(storeID: string, useTLS?: boolean): Promise<void>;
/**
 * 处理存储状态变化（**仅限服务端组件使用**）
 */
export declare function handleStoreStatusChanged(storeID: string, authenticated: boolean, useTLS?: boolean): Promise<void>;
