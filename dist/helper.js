"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNonce = generateNonce;
exports.findAdminSecret = findAdminSecret;
exports.unmarshalResourceStatistics = unmarshalResourceStatistics;
exports.unmarshalResourceUsage = unmarshalResourceUsage;
exports.unmarshalNodesResourceUsage = unmarshalNodesResourceUsage;
exports.unmarshalPoolsResourceUsage = unmarshalPoolsResourceUsage;
exports.unmarshalClusterResourceUsage = unmarshalClusterResourceUsage;
exports.copyToClipboard = copyToClipboard;
exports.canViewResource = canViewResource;
exports.canEditResource = canEditResource;
exports.canDeleteResource = canDeleteResource;
exports.generateDeviceFingerprint = generateDeviceFingerprint;
exports.StreamEnabled = StreamEnabled;
/**
 * 其他辅助方法
 */
const copy_to_clipboard_1 = __importDefault(require("copy-to-clipboard"));
const enums_1 = require("./enums");
const fnv1a_1 = __importDefault(require("@sindresorhus/fnv1a"));
function generateNonce() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const length = Math.max(20, Math.floor(Math.random() * 10) + 20); // At least 20 chars
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
function findAdminSecret(spec) {
    if (!spec || !spec.cloud_init) {
        return { found: false };
    }
    // First check the default user
    const defaultUser = spec.cloud_init.default_user;
    if (!spec.cloud_init.root_disabled &&
        defaultUser &&
        defaultUser.disable_password !== true &&
        defaultUser.password &&
        defaultUser.password.trim() !== "") {
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
            if (user.disable_password !== true &&
                user.password &&
                user.password.trim() !== "") {
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
function unmarshalResourceStatistics(records) {
    const results = [];
    const expectedLength = enums_1.StatisticUnitRecordField.Count;
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
        const unit = {
            cores: {
                average: record.fields[enums_1.StatisticUnitRecordField.CoresAverage],
                max: record.fields[enums_1.StatisticUnitRecordField.CoresMax],
                min: record.fields[enums_1.StatisticUnitRecordField.CoresMin],
            },
            memory: {
                average: record.fields[enums_1.StatisticUnitRecordField.MemoryAverage],
                max: record.fields[enums_1.StatisticUnitRecordField.MemoryMax],
                min: record.fields[enums_1.StatisticUnitRecordField.MemoryMin],
            },
            disk: {
                average: record.fields[enums_1.StatisticUnitRecordField.DiskAverage],
                max: record.fields[enums_1.StatisticUnitRecordField.DiskMax],
                min: record.fields[enums_1.StatisticUnitRecordField.DiskMin],
            },
            readRequests: record.fields[enums_1.StatisticUnitRecordField.ReadRequests],
            readBytes: record.fields[enums_1.StatisticUnitRecordField.ReadBytes],
            writeRequests: record.fields[enums_1.StatisticUnitRecordField.WriteRequests],
            writeBytes: record.fields[enums_1.StatisticUnitRecordField.WriteBytes],
            receivedPackets: record.fields[enums_1.StatisticUnitRecordField.ReceivedPackets],
            receivedBytes: record.fields[enums_1.StatisticUnitRecordField.ReceivedBytes],
            transmittedPackets: record.fields[enums_1.StatisticUnitRecordField.TransmittedPackets],
            transmittedBytes: record.fields[enums_1.StatisticUnitRecordField.TransmittedBytes],
            readBytesPerSecond: {
                average: record.fields[enums_1.StatisticUnitRecordField.ReadBytesPerSecondAverage],
                max: record.fields[enums_1.StatisticUnitRecordField.ReadBytesPerSecondMax],
                min: record.fields[enums_1.StatisticUnitRecordField.ReadBytesPerSecondMin],
            },
            readPacketsPerSecond: {
                average: record.fields[enums_1.StatisticUnitRecordField.ReadPacketsPerSecondAverage],
                max: record.fields[enums_1.StatisticUnitRecordField.ReadPacketsPerSecondMax],
                min: record.fields[enums_1.StatisticUnitRecordField.ReadPacketsPerSecondMin],
            },
            writeBytesPerSecond: {
                average: record.fields[enums_1.StatisticUnitRecordField.WriteBytesPerSecondAverage],
                max: record.fields[enums_1.StatisticUnitRecordField.WriteBytesPerSecondMax],
                min: record.fields[enums_1.StatisticUnitRecordField.WriteBytesPerSecondMin],
            },
            writePacketsPerSecond: {
                average: record.fields[enums_1.StatisticUnitRecordField.WritePacketsPerSecondAverage],
                max: record.fields[enums_1.StatisticUnitRecordField.WritePacketsPerSecondMax],
                min: record.fields[enums_1.StatisticUnitRecordField.WritePacketsPerSecondMin],
            },
            receivedBytesPerSecond: {
                average: record.fields[enums_1.StatisticUnitRecordField.ReceivedBytesPerSecondAverage],
                max: record.fields[enums_1.StatisticUnitRecordField.ReceivedBytesPerSecondMax],
                min: record.fields[enums_1.StatisticUnitRecordField.ReceivedBytesPerSecondMin],
            },
            receivedPacketsPerSecond: {
                average: record.fields[enums_1.StatisticUnitRecordField.ReceivedPacketsPerSecondAverage],
                max: record.fields[enums_1.StatisticUnitRecordField.ReceivedPacketsPerSecondMax],
                min: record.fields[enums_1.StatisticUnitRecordField.ReceivedPacketsPerSecondMin],
            },
            transmittedBytesPerSecond: {
                average: record.fields[enums_1.StatisticUnitRecordField.TransmittedBytesPerSecondAverage],
                max: record.fields[enums_1.StatisticUnitRecordField.TransmittedBytesPerSecondMax],
                min: record.fields[enums_1.StatisticUnitRecordField.TransmittedBytesPerSecondMin],
            },
            transmittedPacketsPerSecond: {
                average: record.fields[enums_1.StatisticUnitRecordField.TransmittedPacketsPerSecondAverage],
                max: record.fields[enums_1.StatisticUnitRecordField.TransmittedPacketsPerSecondMax],
                min: record.fields[enums_1.StatisticUnitRecordField.TransmittedPacketsPerSecondMin],
            },
            timestamp: record.timestamp,
        };
        results.push(unit);
    }
    return { results };
}
function unmarshalResourceUsage(records) {
    const results = [];
    const expectedLength = enums_1.ResourceUsageDurationField.Count;
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
        const usage = {
            guest_id: record.guest_id,
            timestamp: record.timestamp,
            cores: record.fields[enums_1.ResourceUsageDurationField.Cores],
            memory: record.fields[enums_1.ResourceUsageDurationField.Memory],
            disk: record.fields[enums_1.ResourceUsageDurationField.Disk],
            readRequests: record.fields[enums_1.ResourceUsageDurationField.ReadRequests],
            readBytes: record.fields[enums_1.ResourceUsageDurationField.ReadBytes],
            writeRequests: record.fields[enums_1.ResourceUsageDurationField.WriteRequests],
            writeBytes: record.fields[enums_1.ResourceUsageDurationField.WriteBytes],
            receivedPackets: record.fields[enums_1.ResourceUsageDurationField.ReceivedPackets],
            receivedBytes: record.fields[enums_1.ResourceUsageDurationField.ReceivedBytes],
            transmittedPackets: record.fields[enums_1.ResourceUsageDurationField.TransmittedPackets],
            transmittedBytes: record.fields[enums_1.ResourceUsageDurationField.TransmittedBytes],
            readBytesPerSecond: record.fields[enums_1.ResourceUsageDurationField.ReadBytesPerSecond],
            readPacketsPerSecond: record.fields[enums_1.ResourceUsageDurationField.ReadPacketsPerSecond],
            writeBytesPerSecond: record.fields[enums_1.ResourceUsageDurationField.WriteBytesPerSecond],
            writePacketsPerSecond: record.fields[enums_1.ResourceUsageDurationField.WritePacketsPerSecond],
            receivedBytesPerSecond: record.fields[enums_1.ResourceUsageDurationField.ReceivedBytesPerSecond],
            receivedPacketsPerSecond: record.fields[enums_1.ResourceUsageDurationField.ReceivedPacketsPerSecond],
            transmittedBytesPerSecond: record.fields[enums_1.ResourceUsageDurationField.TransmittedBytesPerSecond],
            transmittedPacketsPerSecond: record.fields[enums_1.ResourceUsageDurationField.TransmittedPacketsPerSecond],
        };
        results.push(usage);
    }
    return { results };
}
function unmarshalNodesResourceUsage(records) {
    const results = [];
    for (const record of records) {
        if (record.fields.length !== enums_1.NODE_RESOURCE_SNAPSHOT_FIELD_COUNT) {
            return {
                results: [],
                error: `Invalid fields length: expected ${enums_1.NODE_RESOURCE_SNAPSHOT_FIELD_COUNT}, got ${record.fields.length}`,
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
        const snapshot = {
            node_id: record.node_id,
            timestamp: record.timestamp,
            critical: record.fields[enums_1.ResourceSnapshotField.Critical],
            alert: record.fields[enums_1.ResourceSnapshotField.Alert],
            warning: record.fields[enums_1.ResourceSnapshotField.Warning],
            cores: record.fields[enums_1.ResourceSnapshotField.Cores],
            memory: record.fields[enums_1.ResourceSnapshotField.Memory],
            disk: record.fields[enums_1.ResourceSnapshotField.Disk],
            guests: record.fields[enums_1.ResourceSnapshotField.Guests],
            core_usage: record.fields[enums_1.ResourceSnapshotField.CoreUsage],
            memory_used: record.fields[enums_1.ResourceSnapshotField.MemoryUsed],
            disk_used: record.fields[enums_1.ResourceSnapshotField.DiskUsed],
            read_bytes_per_second: record.fields[enums_1.ResourceSnapshotField.ReadBytes],
            read_packets_per_second: record.fields[enums_1.ResourceSnapshotField.ReadPackets],
            write_bytes_per_second: record.fields[enums_1.ResourceSnapshotField.WriteBytes],
            write_packets_per_second: record.fields[enums_1.ResourceSnapshotField.WritePackets],
            received_bytes_per_second: record.fields[enums_1.ResourceSnapshotField.ReceivedBytes],
            received_packets_per_second: record.fields[enums_1.ResourceSnapshotField.ReceivedPackets],
            transmitted_bytes_per_second: record.fields[enums_1.ResourceSnapshotField.TransmittedBytes],
            transmitted_packets_per_second: record.fields[enums_1.ResourceSnapshotField.TransmittedPackets],
            guest_stopped: record.fields[enums_1.ResourceSnapshotField.GuestStopped],
            guest_running: record.fields[enums_1.ResourceSnapshotField.GuestRunning],
            guest_unkown: record.fields[enums_1.ResourceSnapshotField.GuestUnknown],
        };
        results.push(snapshot);
    }
    return { results, error: undefined };
}
function unmarshalPoolsResourceUsage(records) {
    const results = [];
    for (const record of records) {
        if (record.fields.length !== enums_1.POOL_RESOURCE_SNAPSHOT_FIELD_COUNT) {
            return {
                results: [],
                error: `Invalid fields length: expected ${enums_1.POOL_RESOURCE_SNAPSHOT_FIELD_COUNT}, got ${record.fields.length}`,
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
        const snapshot = {
            pool_id: record.pool_id,
            timestamp: record.timestamp,
            critical: record.fields[enums_1.ResourceSnapshotField.Critical],
            alert: record.fields[enums_1.ResourceSnapshotField.Alert],
            warning: record.fields[enums_1.ResourceSnapshotField.Warning],
            cores: record.fields[enums_1.ResourceSnapshotField.Cores],
            memory: record.fields[enums_1.ResourceSnapshotField.Memory],
            disk: record.fields[enums_1.ResourceSnapshotField.Disk],
            guests: record.fields[enums_1.ResourceSnapshotField.Guests],
            core_usage: record.fields[enums_1.ResourceSnapshotField.CoreUsage],
            memory_used: record.fields[enums_1.ResourceSnapshotField.MemoryUsed],
            disk_used: record.fields[enums_1.ResourceSnapshotField.DiskUsed],
            read_bytes_per_second: record.fields[enums_1.ResourceSnapshotField.ReadBytes],
            read_packets_per_second: record.fields[enums_1.ResourceSnapshotField.ReadPackets],
            write_bytes_per_second: record.fields[enums_1.ResourceSnapshotField.WriteBytes],
            write_packets_per_second: record.fields[enums_1.ResourceSnapshotField.WritePackets],
            received_bytes_per_second: record.fields[enums_1.ResourceSnapshotField.ReceivedBytes],
            received_packets_per_second: record.fields[enums_1.ResourceSnapshotField.ReceivedPackets],
            transmitted_bytes_per_second: record.fields[enums_1.ResourceSnapshotField.TransmittedBytes],
            transmitted_packets_per_second: record.fields[enums_1.ResourceSnapshotField.TransmittedPackets],
            guest_stopped: record.fields[enums_1.ResourceSnapshotField.GuestStopped],
            guest_running: record.fields[enums_1.ResourceSnapshotField.GuestRunning],
            guest_unkown: record.fields[enums_1.ResourceSnapshotField.GuestUnknown],
            node_online: record.fields[enums_1.ResourceSnapshotField.NodeOnline],
            node_offline: record.fields[enums_1.ResourceSnapshotField.NodeOffline],
            node_lost: record.fields[enums_1.ResourceSnapshotField.NodeLost],
        };
        results.push(snapshot);
    }
    return { results, error: undefined };
}
function unmarshalClusterResourceUsage(record) {
    if (record.fields.length !== enums_1.ResourceSnapshotField.Count) {
        return {
            results: undefined,
            error: `Invalid fields length: expected ${enums_1.ResourceSnapshotField.Count}, got ${record.fields.length}`,
        };
    }
    if (!record.timestamp || record.timestamp.length === 0) {
        return {
            results: undefined,
            error: `Invalid timestamp: ${record.timestamp}`,
        };
    }
    const snapshot = {
        cluster_id: record.cluster_id,
        started_time: record.started_time,
        timestamp: record.timestamp,
        critical: record.fields[enums_1.ResourceSnapshotField.Critical],
        alert: record.fields[enums_1.ResourceSnapshotField.Alert],
        warning: record.fields[enums_1.ResourceSnapshotField.Warning],
        cores: record.fields[enums_1.ResourceSnapshotField.Cores],
        memory: record.fields[enums_1.ResourceSnapshotField.Memory],
        disk: record.fields[enums_1.ResourceSnapshotField.Disk],
        guests: record.fields[enums_1.ResourceSnapshotField.Guests],
        core_usage: record.fields[enums_1.ResourceSnapshotField.CoreUsage],
        memory_used: record.fields[enums_1.ResourceSnapshotField.MemoryUsed],
        disk_used: record.fields[enums_1.ResourceSnapshotField.DiskUsed],
        read_bytes_per_second: record.fields[enums_1.ResourceSnapshotField.ReadBytes],
        read_packets_per_second: record.fields[enums_1.ResourceSnapshotField.ReadPackets],
        write_bytes_per_second: record.fields[enums_1.ResourceSnapshotField.WriteBytes],
        write_packets_per_second: record.fields[enums_1.ResourceSnapshotField.WritePackets],
        received_bytes_per_second: record.fields[enums_1.ResourceSnapshotField.ReceivedBytes],
        received_packets_per_second: record.fields[enums_1.ResourceSnapshotField.ReceivedPackets],
        transmitted_bytes_per_second: record.fields[enums_1.ResourceSnapshotField.TransmittedBytes],
        transmitted_packets_per_second: record.fields[enums_1.ResourceSnapshotField.TransmittedPackets],
        guest_stopped: record.fields[enums_1.ResourceSnapshotField.GuestStopped],
        guest_running: record.fields[enums_1.ResourceSnapshotField.GuestRunning],
        guest_unkown: record.fields[enums_1.ResourceSnapshotField.GuestUnknown],
        node_online: record.fields[enums_1.ResourceSnapshotField.NodeOnline],
        node_offline: record.fields[enums_1.ResourceSnapshotField.NodeOffline],
        node_lost: record.fields[enums_1.ResourceSnapshotField.NodeLost],
        pool_enabled: record.fields[enums_1.ResourceSnapshotField.PoolEnabled],
        pool_disabled: record.fields[enums_1.ResourceSnapshotField.PoolDisabled],
    };
    return { results: snapshot, error: undefined };
}
function copyToClipboard(text) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, copy_to_clipboard_1.default)(text);
        return true;
    });
}
function canViewResource(resource) {
    var _a;
    return ((_a = resource.actions) === null || _a === void 0 ? void 0 : _a.includes(enums_1.ResourceAction.View)) || false;
}
function canEditResource(resource) {
    var _a;
    return ((_a = resource.actions) === null || _a === void 0 ? void 0 : _a.includes(enums_1.ResourceAction.Edit)) || false;
}
function canDeleteResource(resource) {
    var _a;
    return ((_a = resource.actions) === null || _a === void 0 ? void 0 : _a.includes(enums_1.ResourceAction.Delete)) || false;
}
/**
 * 根据输入的host和port生成一个特征字符串
 * @param host 主机名或IP地址
 * @param port 端口号
 * @returns 生成的特征字符串
 */
function generateDeviceFingerprint(device, host, port) {
    const input = `${device}@${host}:${port}`;
    return (0, fnv1a_1.default)(input, { size: 64 }).toString(16);
}
function StreamEnabled() {
    return __awaiter(this, void 0, void 0, function* () {
        return false;
    });
}
