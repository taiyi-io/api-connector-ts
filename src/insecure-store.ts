/**
 * 基于内存方式，非安全地存储TaiyiConnector数据
 * 用于开发、调试和非Nextjs的基本应用场景
 * 建议根据实际业务场景，自行封装更安全的数据存储方法
 */
import { TaiyiConnector, SetTokenHandler, GetTokenHandler } from "./connector";
import { AllocatedTokens } from "./data-defines";

/**
 * 内存中的令牌存储，键为connector.id
 */
const tokenStorage: Map<string, AllocatedTokens> = new Map();

/**
 * 存储令牌
 * @param connectorID connector.id
 * @param tokens 要存储的令牌
 * @returns Promise<void>
 */
export const insecureSetTokens: SetTokenHandler = async (
  connectorID: string,
  tokens: AllocatedTokens
): Promise<void> => {
  console.log(`insecure-store: 存储令牌 for ${connectorID}`);
  tokenStorage.set(connectorID, tokens);
};

/**
 * 获取令牌
 * @param connectorID connector.id
 * @returns Promise<AllocatedTokens>
 */
export const insecureGetTokens: GetTokenHandler = async (
  connectorID: string
): Promise<AllocatedTokens> => {
  console.log(`insecure-store: 获取令牌 for ${connectorID}`);
  const tokens = tokenStorage.get(connectorID);
  if (!tokens) {
    throw new Error(`未找到storeID ${connectorID} 对应的令牌`);
  }
  return tokens;
};

/**
 * 清除指定storeID的令牌
 * @param connectorID connector.id
 */
export const clearInsecureTokens = (connectorID: string): void => {
  console.log(`insecure-store: 清除令牌 for ${connectorID}`);
  tokenStorage.delete(connectorID);
};

/**
 * 获取使用内存存储的TaiyiConnector实例
 * @param deviceID 设备标识
 * @param backendHost 后端主机名
 * @param backendPort 后端端口号
 * @returns Promise<TaiyiConnector>
 */
export async function getInsecureConnector(
  deviceID: string,
  backendHost: string,
  backendPort: number = 5851
): Promise<TaiyiConnector> {
  console.log(`insecure-store: 创建连接器 with deviceID ${deviceID}`);
  // 创建TaiyiConnector实例
  const connector = new TaiyiConnector(backendHost, backendPort, deviceID);

  // 绑定回调函数，不需要stateChange
  connector.bindCallback(connector.id, insecureSetTokens, insecureGetTokens);

  return connector;
}
