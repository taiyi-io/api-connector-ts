import { TaiyiConnector } from "../../src/connector";
import { NodeState } from "../../src/enums";

/**
 * 检查是否有可用的计算池（未禁用）
 * @returns 第一个未禁用计算池的 ID，不存在则返回 null
 */
export async function getAvailableComputePool(
  connector: TaiyiConnector
): Promise<string | null> {
  const result = await connector.queryComputePools();
  if (result.error || !result.data || result.data.length === 0) {
    return null;
  }
  const available = result.data.find((p) => !p.disabled);
  return available ? available.id : null;
}

/**
 * 检查是否有可用的存储池
 * @returns 第一个存储池的 ID，不存在则返回 null
 */
export async function getAvailableStoragePool(
  connector: TaiyiConnector
): Promise<string | null> {
  const result = await connector.queryStoragePools();
  if (result.error || !result.data || result.data.length === 0) {
    return null;
  }
  return result.data[0].id;
}

/**
 * 检查是否有可用的资源节点（在线）
 * @returns 第一个在线资源节点的 ID，不存在则返回 null
 */
export async function getAvailableNode(
  connector: TaiyiConnector
): Promise<string | null> {
  const result = await connector.queryNodes();
  if (result.error || !result.data || result.data.length === 0) {
    return null;
  }
  const online = result.data.find(
    (n) => n.state === NodeState.Connected || n.state === NodeState.Ready
  );
  return online ? online.id : null;
}
