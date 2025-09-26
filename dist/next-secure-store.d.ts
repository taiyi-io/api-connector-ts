import { TokenSigningMethod, UserRole } from "./enums";
import { AllocatedTokens } from "./data-defines";
/**
 * 适配Nextjs的安全数据存储
 * @property id - 实例唯一标识
 * @property device - 设备ID
 * @property backend_host - 后端主机地址
 * @property backend_port - 后端端口号
 * @property authenticated - 是否已认证
 * @property access_token - 访问令牌
 * @property public_key - 公钥
 * @property algorithm - 令牌签名方法
 * @property access_expired_at - 访问令牌过期时间，RFC3339格式
 * @property roles - 用户角色列表
 * @property user - 用户名称
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
 * @property csrf_token - CSRF令牌
 * @property refresh_token - 刷新令牌
 * @property refresh_expire - 刷新令牌过期时间，RFC3339格式
 */
export interface CriticalValues {
    csrf_token: string;
    refresh_token: string;
    refresh_expire: string;
}
/**
 * 获取Nextjs的安全数据存储（**仅限服务端组件使用**）
 * @param deviceID - 设备ID
 * @param backendHost - 后端主机地址
 * @param backendPort - 后端端口号
 * @returns 安全的数据存储
 */
export declare function getNextStore(deviceID: string, backendHost: string, backendPort?: number): Promise<NextSecureStore>;
/**
 * 检查安全数据存储是否已认证（**仅限服务端组件使用**）
 * @param backendHost - 后端主机地址
 * @param backendPort - 后端端口号
 * @returns 是否已认证
 */
export declare function isStoreAuthenticated(backendHost: string, backendPort?: number): Promise<boolean>;
/**
 * 保存安全连接封装的令牌（**仅限服务端组件使用**）
 * @param storeID - 安全连接封装ID
 * @param tokens - 分配令牌
 * @returns 无返回值
 */
export declare function storeAllocatedTokens(storeID: string, tokens: AllocatedTokens): Promise<void>;
/**
 * 从安全存储中获取已分配令牌（**仅限服务端组件使用**）
 * @param storeID - 安全连接封装ID
 * @returns 分配令牌
 */
export declare function retrieveAllocatedTokens(storeID: string): Promise<AllocatedTokens>;
/**
 * 存储关键值（**仅限服务端组件使用**）
 * @param storeID - 存储ID
 * @param values - 关键值
 */
export declare function storeCriticalValues(storeID: string, values: CriticalValues): Promise<void>;
/**
 * 获取关键值（**仅限服务端组件使用**）
 * @param storeID - 存储ID
 * @returns 关键值
 */
export declare function retrieveCriticalValues(storeID: string): Promise<CriticalValues>;
/**
 * cookie中存储设备ID（**仅限服务端组件使用**）
 * @param id - 设备ID
 */
export declare function setDeviceID(id: string): Promise<void>;
/**
 * 从cookie中获取设备ID（**仅限服务端组件使用**）
 * @returns 设备ID
 */
export declare function getDeviceID(): Promise<string>;
/**
 * 处理存储状态变化（**仅限服务端组件使用**）
 * @param storeID - 存储ID
 * @param authenticated - 是否已认证
 */
export declare function handleStoreStatusChanged(storeID: string, authenticated: boolean): Promise<void>;
