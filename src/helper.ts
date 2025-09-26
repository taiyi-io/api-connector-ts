/**
 * 其他辅助方法
 */
import copy from "copy-to-clipboard";
import {
  ResourceUsageDurationField,
  POOL_RESOURCE_SNAPSHOT_FIELD_COUNT,
  NODE_RESOURCE_SNAPSHOT_FIELD_COUNT,
  ResourceSnapshotField,
  StatisticUnitRecordField,
  ResourceAction,
} from "./enums";

import {
  GuestSpec,
  FoundAdminSecret,
  ResourceStatisticUnit,
  GuestResourceUsageRecord,
  GuestResourceUsageData,
  NodeResourceSnapshotRecord,
  NodeResourceSnapshot,
  PoolResourceSnapshotRecord,
  PoolResourceSnapshot,
  ClusterResourceSnapshotRecord,
  ClusterResourceSnapshot,
} from "./data-defines";
import { ResourceStatisticUnitRecord } from "./request-params";
import fnv1a from "@sindresorhus/fnv1a";

/**
 * 生成随机字符串
 * @returns 随机字符串
 */
export function generateNonce() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const length = Math.max(20, Math.floor(Math.random() * 10) + 20); // At least 20 chars
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
export function findAdminSecret(spec: GuestSpec | null): FoundAdminSecret {
  if (!spec || !spec.cloud_init) {
    return { found: false };
  }

  // First check the default user
  const defaultUser = spec.cloud_init.default_user;
  if (
    !spec.cloud_init.root_disabled &&
    defaultUser &&
    defaultUser.disable_password !== true &&
    defaultUser.password &&
    defaultUser.password.trim() !== ""
  ) {
    return {
      found: true,
      admin: defaultUser.name,
      secret: defaultUser.password,
    };
  }

  // Then check additional users
  if (spec.cloud_init.users && spec.cloud_init.users.length > 0) {
    for (const user of spec.cloud_init.users) {
      // Try to find an admin user or any user with a password
      if (
        user.disable_password !== true &&
        user.password &&
        user.password.trim() !== ""
      ) {
        return {
          found: true,
          admin: user.name,
          secret: user.password,
        };
      }
    }
  }

  // No admin credentials found
  return { found: false };
}

/**
 * 解析资源统计数据
 * @param records - 资源统计记录
 * @returns 解析后的资源统计数据
 */
export function unmarshalResourceStatistics(
  records: ResourceStatisticUnitRecord[]
): {
  results: ResourceStatisticUnit[];
  error?: string;
} {
  const results: ResourceStatisticUnit[] = [];
  const expectedLength = StatisticUnitRecordField.Count;

  for (const record of records) {
    // Validate fields array length
    if (record.fields.length !== expectedLength) {
      return {
        results: [],
        error: `Invalid fields length: expected ${expectedLength}, got ${record.fields.length}`,
      };
    }

    // Validate timestamp format
    if (!record.timestamp || record.timestamp.length === 0) {
      return {
        results: [],
        error: `Invalid timestamp : ${record.timestamp}`,
      };
    }

    const unit: ResourceStatisticUnit = {
      cores: {
        average: record.fields[StatisticUnitRecordField.CoresAverage],
        max: record.fields[StatisticUnitRecordField.CoresMax],
        min: record.fields[StatisticUnitRecordField.CoresMin],
      },
      memory: {
        average: record.fields[StatisticUnitRecordField.MemoryAverage],
        max: record.fields[StatisticUnitRecordField.MemoryMax],
        min: record.fields[StatisticUnitRecordField.MemoryMin],
      },
      disk: {
        average: record.fields[StatisticUnitRecordField.DiskAverage],
        max: record.fields[StatisticUnitRecordField.DiskMax],
        min: record.fields[StatisticUnitRecordField.DiskMin],
      },
      readRequests: record.fields[StatisticUnitRecordField.ReadRequests],
      readBytes: record.fields[StatisticUnitRecordField.ReadBytes],
      writeRequests: record.fields[StatisticUnitRecordField.WriteRequests],
      writeBytes: record.fields[StatisticUnitRecordField.WriteBytes],
      receivedPackets: record.fields[StatisticUnitRecordField.ReceivedPackets],
      receivedBytes: record.fields[StatisticUnitRecordField.ReceivedBytes],
      transmittedPackets:
        record.fields[StatisticUnitRecordField.TransmittedPackets],
      transmittedBytes:
        record.fields[StatisticUnitRecordField.TransmittedBytes],
      readBytesPerSecond: {
        average:
          record.fields[StatisticUnitRecordField.ReadBytesPerSecondAverage],
        max: record.fields[StatisticUnitRecordField.ReadBytesPerSecondMax],
        min: record.fields[StatisticUnitRecordField.ReadBytesPerSecondMin],
      },
      readPacketsPerSecond: {
        average:
          record.fields[StatisticUnitRecordField.ReadPacketsPerSecondAverage],
        max: record.fields[StatisticUnitRecordField.ReadPacketsPerSecondMax],
        min: record.fields[StatisticUnitRecordField.ReadPacketsPerSecondMin],
      },
      writeBytesPerSecond: {
        average:
          record.fields[StatisticUnitRecordField.WriteBytesPerSecondAverage],
        max: record.fields[StatisticUnitRecordField.WriteBytesPerSecondMax],
        min: record.fields[StatisticUnitRecordField.WriteBytesPerSecondMin],
      },
      writePacketsPerSecond: {
        average:
          record.fields[StatisticUnitRecordField.WritePacketsPerSecondAverage],
        max: record.fields[StatisticUnitRecordField.WritePacketsPerSecondMax],
        min: record.fields[StatisticUnitRecordField.WritePacketsPerSecondMin],
      },
      receivedBytesPerSecond: {
        average:
          record.fields[StatisticUnitRecordField.ReceivedBytesPerSecondAverage],
        max: record.fields[StatisticUnitRecordField.ReceivedBytesPerSecondMax],
        min: record.fields[StatisticUnitRecordField.ReceivedBytesPerSecondMin],
      },
      receivedPacketsPerSecond: {
        average:
          record.fields[
            StatisticUnitRecordField.ReceivedPacketsPerSecondAverage
          ],
        max: record.fields[
          StatisticUnitRecordField.ReceivedPacketsPerSecondMax
        ],
        min: record.fields[
          StatisticUnitRecordField.ReceivedPacketsPerSecondMin
        ],
      },
      transmittedBytesPerSecond: {
        average:
          record.fields[
            StatisticUnitRecordField.TransmittedBytesPerSecondAverage
          ],
        max: record.fields[
          StatisticUnitRecordField.TransmittedBytesPerSecondMax
        ],
        min: record.fields[
          StatisticUnitRecordField.TransmittedBytesPerSecondMin
        ],
      },
      transmittedPacketsPerSecond: {
        average:
          record.fields[
            StatisticUnitRecordField.TransmittedPacketsPerSecondAverage
          ],
        max: record.fields[
          StatisticUnitRecordField.TransmittedPacketsPerSecondMax
        ],
        min: record.fields[
          StatisticUnitRecordField.TransmittedPacketsPerSecondMin
        ],
      },
      timestamp: record.timestamp,
    };

    results.push(unit);
  }

  return { results };
}

/**
 * 解析资源用量数据
 * @param records - 资源用量记录
 * @returns 解析后的资源使用数据
 */
export function unmarshalResourceUsage(records: GuestResourceUsageRecord[]): {
  results: GuestResourceUsageData[];
  error?: string;
} {
  const results: GuestResourceUsageData[] = [];
  const expectedLength = ResourceUsageDurationField.Count;

  for (const record of records) {
    // Validate fields array length
    if (record.fields.length !== expectedLength) {
      return {
        results: [],
        error: `Invalid fields length: expected ${expectedLength}, got ${record.fields.length}`,
      };
    }

    // Validate timestamp
    if (!record.timestamp || record.timestamp.length === 0) {
      return {
        results: [],
        error: `Invalid timestamp: ${record.timestamp}`,
      };
    }

    // Validate guest ID
    if (!record.guest_id || record.guest_id.length === 0) {
      return {
        results: [],
        error: `Invalid guest ID: ${record.guest_id}`,
      };
    }

    const usage: GuestResourceUsageData = {
      guest_id: record.guest_id,
      timestamp: record.timestamp,
      cores: record.fields[ResourceUsageDurationField.Cores],
      memory: record.fields[ResourceUsageDurationField.Memory],
      disk: record.fields[ResourceUsageDurationField.Disk],
      readRequests: record.fields[ResourceUsageDurationField.ReadRequests],
      readBytes: record.fields[ResourceUsageDurationField.ReadBytes],
      writeRequests: record.fields[ResourceUsageDurationField.WriteRequests],
      writeBytes: record.fields[ResourceUsageDurationField.WriteBytes],
      receivedPackets:
        record.fields[ResourceUsageDurationField.ReceivedPackets],
      receivedBytes: record.fields[ResourceUsageDurationField.ReceivedBytes],
      transmittedPackets:
        record.fields[ResourceUsageDurationField.TransmittedPackets],
      transmittedBytes:
        record.fields[ResourceUsageDurationField.TransmittedBytes],
      readBytesPerSecond:
        record.fields[ResourceUsageDurationField.ReadBytesPerSecond],
      readPacketsPerSecond:
        record.fields[ResourceUsageDurationField.ReadPacketsPerSecond],
      writeBytesPerSecond:
        record.fields[ResourceUsageDurationField.WriteBytesPerSecond],
      writePacketsPerSecond:
        record.fields[ResourceUsageDurationField.WritePacketsPerSecond],
      receivedBytesPerSecond:
        record.fields[ResourceUsageDurationField.ReceivedBytesPerSecond],
      receivedPacketsPerSecond:
        record.fields[ResourceUsageDurationField.ReceivedPacketsPerSecond],
      transmittedBytesPerSecond:
        record.fields[ResourceUsageDurationField.TransmittedBytesPerSecond],
      transmittedPacketsPerSecond:
        record.fields[ResourceUsageDurationField.TransmittedPacketsPerSecond],
    };

    results.push(usage);
  }

  return { results };
}

/**
 * 解析节点资源用量数据
 * @param records - 节点资源用量记录
 * @returns 解析后的节点资源使用数据
 */
export function unmarshalNodesResourceUsage(
  records: NodeResourceSnapshotRecord[]
): { results: NodeResourceSnapshot[]; error?: string } {
  const results: NodeResourceSnapshot[] = [];

  for (const record of records) {
    if (record.fields.length !== NODE_RESOURCE_SNAPSHOT_FIELD_COUNT) {
      return {
        results: [],
        error: `Invalid fields length: expected ${NODE_RESOURCE_SNAPSHOT_FIELD_COUNT}, got ${record.fields.length}`,
      };
    }

    if (!record.timestamp || record.timestamp.length === 0) {
      return {
        results: [],
        error: `Invalid timestamp: ${record.timestamp}`,
      };
    }

    if (!record.node_id || record.node_id.length === 0) {
      return {
        results: [],
        error: `Invalid node ID: ${record.node_id}`,
      };
    }

    const snapshot: NodeResourceSnapshot = {
      node_id: record.node_id,
      timestamp: record.timestamp,
      critical: record.fields[ResourceSnapshotField.Critical],
      alert: record.fields[ResourceSnapshotField.Alert],
      warning: record.fields[ResourceSnapshotField.Warning],
      cores: record.fields[ResourceSnapshotField.Cores],
      memory: record.fields[ResourceSnapshotField.Memory],
      disk: record.fields[ResourceSnapshotField.Disk],
      guests: record.fields[ResourceSnapshotField.Guests],
      core_usage: record.fields[ResourceSnapshotField.CoreUsage],
      memory_used: record.fields[ResourceSnapshotField.MemoryUsed],
      disk_used: record.fields[ResourceSnapshotField.DiskUsed],
      read_bytes_per_second: record.fields[ResourceSnapshotField.ReadBytes],
      read_packets_per_second: record.fields[ResourceSnapshotField.ReadPackets],
      write_bytes_per_second: record.fields[ResourceSnapshotField.WriteBytes],
      write_packets_per_second:
        record.fields[ResourceSnapshotField.WritePackets],
      received_bytes_per_second:
        record.fields[ResourceSnapshotField.ReceivedBytes],
      received_packets_per_second:
        record.fields[ResourceSnapshotField.ReceivedPackets],
      transmitted_bytes_per_second:
        record.fields[ResourceSnapshotField.TransmittedBytes],
      transmitted_packets_per_second:
        record.fields[ResourceSnapshotField.TransmittedPackets],
      guest_stopped: record.fields[ResourceSnapshotField.GuestStopped],
      guest_running: record.fields[ResourceSnapshotField.GuestRunning],
      guest_unkown: record.fields[ResourceSnapshotField.GuestUnknown],
    };

    results.push(snapshot);
  }

  return { results, error: undefined };
}

/**
 * 解析池资源用量数据
 * @param records - 池资源用量记录
 * @returns 解析后的池资源使用数据
 */
export function unmarshalPoolsResourceUsage(
  records: PoolResourceSnapshotRecord[]
): { results: PoolResourceSnapshot[]; error?: string } {
  const results: PoolResourceSnapshot[] = [];

  for (const record of records) {
    if (record.fields.length !== POOL_RESOURCE_SNAPSHOT_FIELD_COUNT) {
      return {
        results: [],
        error: `Invalid fields length: expected ${POOL_RESOURCE_SNAPSHOT_FIELD_COUNT}, got ${record.fields.length}`,
      };
    }

    if (!record.timestamp || record.timestamp.length === 0) {
      return {
        results: [],
        error: `Invalid timestamp: ${record.timestamp}`,
      };
    }

    if (!record.pool_id || record.pool_id.length === 0) {
      return {
        results: [],
        error: `Invalid pool ID: ${record.pool_id}`,
      };
    }

    const snapshot: PoolResourceSnapshot = {
      pool_id: record.pool_id,
      timestamp: record.timestamp,
      critical: record.fields[ResourceSnapshotField.Critical],
      alert: record.fields[ResourceSnapshotField.Alert],
      warning: record.fields[ResourceSnapshotField.Warning],
      cores: record.fields[ResourceSnapshotField.Cores],
      memory: record.fields[ResourceSnapshotField.Memory],
      disk: record.fields[ResourceSnapshotField.Disk],
      guests: record.fields[ResourceSnapshotField.Guests],
      core_usage: record.fields[ResourceSnapshotField.CoreUsage],
      memory_used: record.fields[ResourceSnapshotField.MemoryUsed],
      disk_used: record.fields[ResourceSnapshotField.DiskUsed],
      read_bytes_per_second: record.fields[ResourceSnapshotField.ReadBytes],
      read_packets_per_second: record.fields[ResourceSnapshotField.ReadPackets],
      write_bytes_per_second: record.fields[ResourceSnapshotField.WriteBytes],
      write_packets_per_second:
        record.fields[ResourceSnapshotField.WritePackets],
      received_bytes_per_second:
        record.fields[ResourceSnapshotField.ReceivedBytes],
      received_packets_per_second:
        record.fields[ResourceSnapshotField.ReceivedPackets],
      transmitted_bytes_per_second:
        record.fields[ResourceSnapshotField.TransmittedBytes],
      transmitted_packets_per_second:
        record.fields[ResourceSnapshotField.TransmittedPackets],
      guest_stopped: record.fields[ResourceSnapshotField.GuestStopped],
      guest_running: record.fields[ResourceSnapshotField.GuestRunning],
      guest_unkown: record.fields[ResourceSnapshotField.GuestUnknown],
      node_online: record.fields[ResourceSnapshotField.NodeOnline],
      node_offline: record.fields[ResourceSnapshotField.NodeOffline],
      node_lost: record.fields[ResourceSnapshotField.NodeLost],
    };

    results.push(snapshot);
  }

  return { results, error: undefined };
}

/**
 * 解析集群资源用量数据
 * @param record - 集群资源用量记录
 * @returns 解析后的集群资源使用数据
 */
export function unmarshalClusterResourceUsage(
  record: ClusterResourceSnapshotRecord
): { results: ClusterResourceSnapshot | undefined; error?: string } {
  if (record.fields.length !== ResourceSnapshotField.Count) {
    return {
      results: undefined,
      error: `Invalid fields length: expected ${ResourceSnapshotField.Count}, got ${record.fields.length}`,
    };
  }

  if (!record.timestamp || record.timestamp.length === 0) {
    return {
      results: undefined,
      error: `Invalid timestamp: ${record.timestamp}`,
    };
  }

  const snapshot: ClusterResourceSnapshot = {
    cluster_id: record.cluster_id,
    started_time: record.started_time,
    timestamp: record.timestamp,
    critical: record.fields[ResourceSnapshotField.Critical],
    alert: record.fields[ResourceSnapshotField.Alert],
    warning: record.fields[ResourceSnapshotField.Warning],
    cores: record.fields[ResourceSnapshotField.Cores],
    memory: record.fields[ResourceSnapshotField.Memory],
    disk: record.fields[ResourceSnapshotField.Disk],
    guests: record.fields[ResourceSnapshotField.Guests],
    core_usage: record.fields[ResourceSnapshotField.CoreUsage],
    memory_used: record.fields[ResourceSnapshotField.MemoryUsed],
    disk_used: record.fields[ResourceSnapshotField.DiskUsed],
    read_bytes_per_second: record.fields[ResourceSnapshotField.ReadBytes],
    read_packets_per_second: record.fields[ResourceSnapshotField.ReadPackets],
    write_bytes_per_second: record.fields[ResourceSnapshotField.WriteBytes],
    write_packets_per_second: record.fields[ResourceSnapshotField.WritePackets],
    received_bytes_per_second:
      record.fields[ResourceSnapshotField.ReceivedBytes],
    received_packets_per_second:
      record.fields[ResourceSnapshotField.ReceivedPackets],
    transmitted_bytes_per_second:
      record.fields[ResourceSnapshotField.TransmittedBytes],
    transmitted_packets_per_second:
      record.fields[ResourceSnapshotField.TransmittedPackets],
    guest_stopped: record.fields[ResourceSnapshotField.GuestStopped],
    guest_running: record.fields[ResourceSnapshotField.GuestRunning],
    guest_unkown: record.fields[ResourceSnapshotField.GuestUnknown],
    node_online: record.fields[ResourceSnapshotField.NodeOnline],
    node_offline: record.fields[ResourceSnapshotField.NodeOffline],
    node_lost: record.fields[ResourceSnapshotField.NodeLost],
    pool_enabled: record.fields[ResourceSnapshotField.PoolEnabled],
    pool_disabled: record.fields[ResourceSnapshotField.PoolDisabled],
  };

  return { results: snapshot, error: undefined };
}

/**
 * 复制文本到剪贴板
 * @param text - 要复制的文本
 * @returns Promise<boolean> - 复制成功返回true，否则返回false
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  copy(text);
  return true;
}
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
export function canViewResource(resource: OperatableResource): boolean {
  return resource.actions?.includes(ResourceAction.View) || false;
}
/**
 * 检查资源是否可编辑
 * @param resource - 可操作资源
 * @returns 是否可编辑
 */
export function canEditResource(resource: OperatableResource): boolean {
  return resource.actions?.includes(ResourceAction.Edit) || false;
}
/**
 * 检查资源是否可删除
 * @param resource - 可操作资源
 * @returns 是否可删除
 */
export function canDeleteResource(resource: OperatableResource): boolean {
  return resource.actions?.includes(ResourceAction.Delete) || false;
}

/**
 * 根据输入的host和port生成一个特征字符串
 * @param device - 设备标识
 * @param host - 主机名或IP地址
 * @param port - 端口号
 * @returns 生成的特征字符串
 */
export function generateDeviceFingerprint(
  device: string,
  host: string,
  port: number
): string {
  const input = `${device}@${host}:${port}`;
  return fnv1a(input, { size: 64 }).toString(16);
}

export async function StreamEnabled(): Promise<boolean> {
  return false;
}
