/**
 * 适用于Nextjs的封装，利用cookie安全存储TaiyiConnector
 * 自动生成一致的设备id
 */
import { TaiyiConnector } from "./connector";
/**
 * 获取Nextjs的安全连接
 * @param {string} backendHost 后端主机名
 * @param {number} backendPort 后端端口号
 * @returns {TaiyiConnector} 安全连接
 * @async
 */
export declare function getNextConnector(backendHost: string, backendPort?: number): Promise<TaiyiConnector>;
