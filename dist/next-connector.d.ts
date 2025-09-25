/**
 * 适用于Nextjs的封装，安全存储TaiyiConnector
 * 已内部封装localstorage和cookie，自动分配设备标识和多connector支持并保持一致，无需手动干预
 * getNextConnector() 基于后端服务地址获取稳定的connector
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
