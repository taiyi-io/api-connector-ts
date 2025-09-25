import { ResourceAction } from "./enums";
import { GuestSpec, FoundAdminSecret, ResourceStatisticUnit, GuestResourceUsageRecord, GuestResourceUsageData, NodeResourceSnapshotRecord, NodeResourceSnapshot, PoolResourceSnapshotRecord, PoolResourceSnapshot, ClusterResourceSnapshotRecord, ClusterResourceSnapshot } from "./data-defines";
import { ResourceStatisticUnitRecord } from "./request-params";
export declare function generateNonce(): string;
export declare function findAdminSecret(spec: GuestSpec | null): FoundAdminSecret;
export declare function unmarshalResourceStatistics(records: ResourceStatisticUnitRecord[]): {
    results: ResourceStatisticUnit[];
    error?: string;
};
export declare function unmarshalResourceUsage(records: GuestResourceUsageRecord[]): {
    results: GuestResourceUsageData[];
    error?: string;
};
export declare function unmarshalNodesResourceUsage(records: NodeResourceSnapshotRecord[]): {
    results: NodeResourceSnapshot[];
    error?: string;
};
export declare function unmarshalPoolsResourceUsage(records: PoolResourceSnapshotRecord[]): {
    results: PoolResourceSnapshot[];
    error?: string;
};
export declare function unmarshalClusterResourceUsage(record: ClusterResourceSnapshotRecord): {
    results: ClusterResourceSnapshot | undefined;
    error?: string;
};
export declare function copyToClipboard(text: string): Promise<boolean>;
interface OperatableResource {
    actions?: ResourceAction[];
}
export declare function canViewResource(resource: OperatableResource): boolean;
export declare function canEditResource(resource: OperatableResource): boolean;
export declare function canDeleteResource(resource: OperatableResource): boolean;
/**
 * 根据输入的host和port生成一个特征字符串
 * @param host 主机名或IP地址
 * @param port 端口号
 * @returns 生成的特征字符串
 */
export declare function generateDeviceFingerprint(device: string, host: string, port: number): string;
export declare function StreamEnabled(): Promise<boolean>;
export {};
