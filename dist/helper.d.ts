import { ResourceAction } from "./enums";
import { GuestSpec, FoundAdminSecret, ResourceStatisticUnit, GuestResourceUsageRecord, GuestResourceUsageData, NodeResourceSnapshotRecord, NodeResourceSnapshot, PoolResourceSnapshotRecord, PoolResourceSnapshot, ClusterResourceSnapshotRecord, ClusterResourceSnapshot } from "./data-defines";
import { ResourceStatisticUnitRecord } from "./request-params";
/**
 * 生成随机字符串
 * @returns 随机字符串
 */
export declare function generateNonce(): string;
export declare function findAdminSecret(spec: GuestSpec | null): FoundAdminSecret;
/**
 * 解析资源统计数据
 * @param records - 资源统计记录
 * @returns 解析后的资源统计数据
 */
export declare function unmarshalResourceStatistics(records: ResourceStatisticUnitRecord[]): {
    results: ResourceStatisticUnit[];
    error?: string;
};
/**
 * 解析资源用量数据
 * @param records - 资源用量记录
 * @returns 解析后的资源使用数据
 */
export declare function unmarshalResourceUsage(records: GuestResourceUsageRecord[]): {
    results: GuestResourceUsageData[];
    error?: string;
};
/**
 * 解析节点资源用量数据
 * @param records - 节点资源用量记录
 * @returns 解析后的节点资源使用数据
 */
export declare function unmarshalNodesResourceUsage(records: NodeResourceSnapshotRecord[]): {
    results: NodeResourceSnapshot[];
    error?: string;
};
/**
 * 解析池资源用量数据
 * @param records - 池资源用量记录
 * @returns 解析后的池资源使用数据
 */
export declare function unmarshalPoolsResourceUsage(records: PoolResourceSnapshotRecord[]): {
    results: PoolResourceSnapshot[];
    error?: string;
};
/**
 * 解析集群资源用量数据
 * @param record - 集群资源用量记录
 * @returns 解析后的集群资源使用数据
 */
export declare function unmarshalClusterResourceUsage(record: ClusterResourceSnapshotRecord): {
    results: ClusterResourceSnapshot | undefined;
    error?: string;
};
/**
 * 复制文本到剪贴板
 * @param text - 要复制的文本
 * @returns Promise<boolean> - 复制成功返回true，否则返回false
 */
export declare function copyToClipboard(text: string): Promise<boolean>;
/**
 * 可操作资源接口
 * @interface
 */
export interface OperatableResource {
    actions?: ResourceAction[];
}
/**
 * 检查资源是否可查看
 * @param resource - 可操作资源
 * @returns 是否可查看
 */
export declare function canViewResource(resource: OperatableResource): boolean;
/**
 * 检查资源是否可编辑
 * @param resource - 可操作资源
 * @returns 是否可编辑
 */
export declare function canEditResource(resource: OperatableResource): boolean;
/**
 * 检查资源是否可删除
 * @param resource - 可操作资源
 * @returns 是否可删除
 */
export declare function canDeleteResource(resource: OperatableResource): boolean;
/**
 * 根据输入的host和port生成一个特征字符串
 * @param device - 设备标识
 * @param host - 主机名或IP地址
 * @param port - 端口号
 * @returns 生成的特征字符串
 */
export declare function generateDeviceFingerprint(device: string, host: string, port: number, useTLS?: boolean): string;
export declare function StreamEnabled(): Promise<boolean>;
/**
 * 将 host 字符串规范化为可直接拼入 URL host 段的形式。
 *
 * 规则：
 * - 空串原样返回。
 * - IPv4 字面量、hostname、已带方括号的 IPv6 字面量原样返回（幂等）。
 * - 含 zone id（`%`）的 IPv6 链路本地地址不能用作对外 URL host，统一返回空串，由调用方进入错误分支。
 * - 命中 IPv6 字面量（含至少 2 个 `:` 且不含 `.`）→ 返回 `[host]`。
 *
 * @param host - 原始 host 字符串
 * @returns 适用于 URL host 段的字符串；不可用时返回空串
 */
export declare function formatHostForURL(host: string): string;
