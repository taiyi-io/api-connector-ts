/**
 * 适用于Nextjs的封装，安全存储TaiyiConnector
 * 已内部封装localstorage和cookie，自动分配设备标识和多connector支持并保持一致，无需手动干预
 * getNextConnector() 基于后端服务地址获取稳定的connector
 */
import { TaiyiConnector } from "./connector";
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
export declare function getNextConnector(backendHost: string, backendPort?: number): Promise<TaiyiConnector>;
