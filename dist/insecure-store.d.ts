/**
 * 基于内存方式，非安全地存储TaiyiConnector数据
 * 用于开发、调试和非Nextjs的基本应用场景
 * 建议根据实际业务场景，自行封装更安全的数据存储方法
 */
import { TaiyiConnector, SetTokenHandler, GetTokenHandler } from "./connector";
/**
 * 存储令牌
 * @param connectorID - connector.id
 * @param tokens - 要存储的令牌
 * @returns Promise<void>
 */
export declare const insecureSetTokens: SetTokenHandler;
/**
 * 获取令牌
 * @param connectorID - connector.id
 * @returns Promise<AllocatedTokens>
 */
export declare const insecureGetTokens: GetTokenHandler;
/**
 * 清除指定storeID的令牌
 * @param connectorID - connector.id
 */
export declare const clearInsecureTokens: (connectorID: string) => void;
/**
 * 获取使用内存存储的TaiyiConnector实例
 * @param deviceID - 设备标识
 * @param backendHost - 后端主机名
 * @param backendPort - 后端端口号，默认值为5851
 * @returns Promise<TaiyiConnector>
 */
export declare function getInsecureConnector(deviceID: string, backendHost: string, backendPort?: number): Promise<TaiyiConnector>;
