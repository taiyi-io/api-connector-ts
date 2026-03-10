import { TokenSigningMethod, UserRole } from "./enums";
import { AllocatedTokens } from "./data-defines";
/**
 * 适配Nextjs的安全数据存储
 */
export interface NextSecureStore {
    id: string;
    device: string;
    backend_host: string;
    backend_port: number;
    authenticated: boolean;
    access_token: string;
    public_key: string;
    algorithm: TokenSigningMethod;
    access_expired_at: string;
    roles: UserRole[];
    user: string;
}
/**
 * 需要安全存储的关键值
 */
export interface CriticalValues {
    csrf_token: string;
    refresh_token: string;
    refresh_expire: string;
}
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
 * 从cookie中获取设备ID（**仅限服务端组件使用**）
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
