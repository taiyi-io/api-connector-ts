import { TokenSigningMethod, UserRole } from "./enums";
import { AllocatedTokens } from "./data-defines";
/**
 * 适配Nextjs的安全数据存储
 * @property {string} id 实例唯一标识
 * @property {string} device 设备ID
 * @property {string} backendHost 后端主机地址
 * @property {number} backendPort 后端端口号
 * @property {boolean} authenticated 是否已认证
 * @property {string} accessToken 访问令牌
 * @property {string} public_key 公钥
 * @property {TokenSigningMethod} algorithm 令牌签名方法
 * @property {string} access_expired_at 访问令牌过期时间，RFC3339格式
 * @property {UserRole[]} roles 用户角色列表
 * @property {string} user 用户名称
 * @description 封装Nextjs的安全连接，防CSRF攻击
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
 * @property {string} csrf_token CSRF令牌
 * @property {string} refresh_token 刷新令牌
 * @property {string} refresh_expire 刷新令牌过期时间，RFC3339格式
 */
export interface CriticalValues {
    csrf_token: string;
    refresh_token: string;
    refresh_expire: string;
}
/**
 * 获取Nextjs的安全数据存储（**仅限服务端组件使用**）
 * @param {string} deviceID 设备ID
 * @param {string} backendHost 后端主机地址
 * @param {number} backendPort 后端端口号
 * @returns {NextSecureStore} 安全数据存储
 * @description 基于设备ID、后端主机地址和后端端口号获取安全数据存储
 * @async
 */
export declare function getNextStore(deviceID: string, backendHost: string, backendPort?: number): Promise<NextSecureStore>;
/**
 * 检查安全数据存储是否已认证（**仅限服务端组件使用**）
 * @param {string} backendHost 后端主机地址
 * @param {number} backendPort 后端端口号
 * @returns {Promise<boolean>} 是否已认证
 * @description 基于后端主机地址和后端端口号检查安全数据存储是否已认证
 * @async
 */
export declare function isStoreAuthenticated(backendHost: string, backendPort?: number): Promise<boolean>;
/**
 * 保存安全连接封装的令牌（**仅限服务端组件使用**）
 * @param {string} storeID 安全连接封装ID
 * @param {AllocatedTokens} tokens 分配令牌
 * @returns {Promise<void>} 无返回值
 * @description 更新安全连接封装的访问令牌、访问令牌过期时间、用户角色列表和用户名称
 * @async
 */
export declare function storeAllocatedTokens(storeID: string, tokens: AllocatedTokens): Promise<void>;
/**
 * 获取安全连接封装的令牌（**仅限服务端组件使用**）
 * @param {string} storeID 安全连接封装ID
 * @returns {Promise<AllocatedTokens>} 分配令牌
 * @description 从cookie中获取安全连接封装的访问令牌、访问令牌过期时间、用户角色列表和用户名称
 * @async
 */
export declare function retrieveAllocatedTokens(storeID: string): Promise<AllocatedTokens>;
/**
 * 存储关键值（**仅限服务端组件使用**）
 * @param {string} storeID 连接器ID
 * @param {CriticalValues} values 关键值
 * @description 存储csrf令牌、刷新令牌和刷新令牌过期时间到cookie中
 * @async
 */
export declare function storeCriticalValues(storeID: string, values: CriticalValues): Promise<void>;
/**
 * 获取关键值（**仅限服务端组件使用**）
 * @param {string} storeID 连接器ID
 * @returns {CriticalValues} 关键值
 * @description 从cookie中获取csrf令牌、刷新令牌和刷新令牌过期时间
 * @async
 */
export declare function retrieveCriticalValues(storeID: string): Promise<CriticalValues>;
/**
 * 设置设备ID（**仅限服务端组件使用**）
 * @param {string} id 设备ID
 * @description 将设备ID存储到cookie中
 * @async
 */
export declare function setDeviceID(id: string): Promise<void>;
/**
 * 获取设备ID（**仅限服务端组件使用**）
 * @returns {Promise<string>} 设备ID
 * @description 从cookie中获取设备ID，如果不存在，生成一个新的设备ID并存储到cookie中
 * @async
 */
export declare function getDeviceID(): Promise<string>;
/**
 * 存储安全状态变化处理（**仅限服务端组件使用**）
 * @param {string} storeID 安全连接封装ID
 * @param {boolean} authenticated 认证状态
 * @description 将安全连接封装的认证状态存储到cookie中
 * @async
 */
export declare function handleStoreStatusChanged(storeID: string, authenticated: boolean): Promise<void>;
