/**
 * 适用于Nextjs的封装，安全存储TaiyiConnector
 * 已内部封装localstorage和cookie，自动分配设备标识和多connector支持并保持一致，无需手动干预
 * getNextConnector() 基于后端服务地址获取稳定的connector
 */
import { TaiyiConnector } from "./connector";
/**
 * 获取Nextjs的安全连接
 * @param backendHost - 后端主机名
 * @param backendPort - 后端端口号，默认值为5851
 * @returns TaiyiConnector
 * @throws {Error} 令牌失效
 */
export declare function getNextConnector(backendHost: string, backendPort?: number): Promise<TaiyiConnector>;
