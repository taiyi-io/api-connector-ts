export * from "./connector";
export * from "./enums";
export * from "./data-defines";
export * from "./request-params";
export * from "./helper";
export * from "./next-secure-store";
export * from "./next-connector";
export * from "./request-forwarder";
export * from "./insecure-store";
import { TaiyiConnector } from "./connector";
import { getInsecureConnector } from "./insecure-store";

/**
 * 创建一个不安全的连接
 * 仅用于开发、调试和非Nextjs的基本应用场景
 * 建议根据实际业务场景，自行封装更安全的数据存储方法
 * 注意：不安全的连接不支持CSRF攻击保护，不建议在生产环境中使用
 * @param deviceID 设备标识
 * @param accessString 访问字符串，用于认证
 * @param backendHost 后端主机名
 * @param backendPort 后端端口号
 * @returns 不安全的连接
 */
export async function newInsecureConnector(
  deviceID: string,
  accessString: string,
  backendHost: string,
  backendPort: number = 5851
): Promise<TaiyiConnector> {
  const connector = await getInsecureConnector(
    deviceID,
    backendHost,
    backendPort
  );
  const result = await connector.authenticateByToken(accessString);
  if (result.error) {
    throw new Error(`认证失败:${result.error}`);
  } else if (result.unauthenticated) {
    throw new Error(`未认证:${result.unauthenticated}`);
  }

  return connector;
}
