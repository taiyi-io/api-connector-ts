# Taiyi Cloud API Connector SDK 参考文档

## 目录

- [概述](#概述)
- [安装](#安装)
- [快速开始](#快速开始)
  - [TaiyiConnector 核心用法](#taiyiconnector-核心用法)
  - [Next.js 用户](#nextjs-用户)
  - [测试与开发](#测试与开发)
  - [自定义令牌管理策略](#自定义令牌管理策略)
- [核心概念](#核心概念)
- [TaiyiConnector 类](#taiyiconnector-类)
  - [构造函数与初始化](#构造函数与初始化)
  - [认证方法](#认证方法)
  - [系统管理](#系统管理)
  - [任务管理](#任务管理)
  - [云主机管理](#云主机管理)
  - [磁盘卷管理](#磁盘卷管理)
  - [网络接口管理](#网络接口管理)
  - [介质管理](#介质管理)
  - [监控管理](#监控管理)
  - [快照管理](#快照管理)
  - [资源统计](#资源统计)
  - [节点管理](#节点管理)
  - [计算资源池管理](#计算资源池管理)
  - [存储池管理](#存储池管理)
  - [地址池管理（⚠️ Deprecated）](#地址池管理-deprecated)
  - [地址池管理（新版）](#地址池管理新版)
  - [安全策略管理](#安全策略管理)
  - [文件管理](#文件管理)
  - [系统模板管理](#系统模板管理)
  - [日志与告警](#日志与告警)
  - [监控规则](#监控规则)
  - [许可证管理](#许可证管理)
  - [集群与网络](#集群与网络)
  - [SSH 密钥管理](#ssh-密钥管理)
  - [导入管理](#导入管理)
  - [用户与权限管理](#用户与权限管理)
- [辅助函数](#辅助函数)
- [数据接口定义](#数据接口定义)
- [枚举定义](#枚举定义)

---

## 概述

`@taiyi-io/api-connector-ts` 是用于访问太一云平台控制服务的 TypeScript SDK。

**核心类 `TaiyiConnector`** 封装了与太一云平台 Control 服务的全部交互逻辑，包括：鉴权、令牌自动刷新、指令发送与响应解析。通过构造函数指定后端地址和设备标识，绑定令牌存取回调后完成认证，即可调用全部管理接口。

**核心特性：**

- 支持密码认证（`authenticateByPassword`）和令牌认证（`authenticateByToken`）两种方式
- 认证成功后自动启动心跳，提前刷新访问令牌，无需手动管理
- 所有 API 方法返回统一的 `BackendResult<T>` 结果，通过 `error` / `unauthenticated` / `data` 三个字段区分状态
- 异步任务：`tryXxx` 方法返回任务ID，配合 `waitTask` 轮询完成；同名方法（如 `createGuest`）是自动等待的同步封装
- 零信任安全模型，除了 `getSystemStatus` 和 `initializeSystem` 两个接口，其他接口都必须**先完成鉴权**

**SDK 提供三种使用方式**（按推荐顺序）：

| 方式 | 入口函数 | 适用场景 |
|------|----------|----------|
| Next.js 集成 | `getNextConnector()` | Next.js 应用，自动管理设备标识和令牌存储（cookie + localStorage） |
| 测试/开发 | `getInsecureConnector()` | 开发调试，基于内存存储令牌，不持久化 |
| 自定义 | `new TaiyiConnector()` + `bindCallback()` | 需要自行控制令牌存取策略的场景 |

---

## 安装

```bash
npm install @taiyi-io/api-connector-ts
# 或
yarn add @taiyi-io/api-connector-ts
```

---

## 快速开始

### TaiyiConnector 核心用法

`TaiyiConnector` 是 SDK 的核心类。所有管理操作（云主机、节点、存储、用户等）都通过它的实例方法完成。基本流程如下：

```
创建实例 → 绑定令牌回调 → 认证 → 调用管理接口
```

以下示例展示了完整的工作流程：

```typescript
import { TaiyiConnector, AllocatedTokens } from "@taiyi-io/api-connector-ts";

// 1. 创建连接器实例
const connector = new TaiyiConnector(
  "192.168.1.100",  // 后端 Control 服务地址
  5851,             // 后端端口（默认5851）
  "my-device"       // 设备标识，用于区分客户端
);

// 2. 绑定令牌存取回调（TaiyiConnector 不自行存储令牌，需要调用者提供存取方法）
connector.bindCallback(
  "store-id",
  async (id, tokens) => { /* 存储令牌 */ },
  async (id) => { /* 读取令牌 */ return tokens; },
  (id, authenticated) => { /* 认证状态变更通知 */ }
);

// 3. 认证（支持密码或令牌两种方式）
const authResult = await connector.authenticateByPassword("admin", "password");
if (authResult.error) {
  throw new Error(authResult.error);
}
// 认证成功后，自动启动心跳刷新令牌
console.log("当前用户:", authResult.data!.user);
console.log("用户角色:", authResult.data!.roles);

// 4. 调用管理接口 —— 所有方法均返回 BackendResult<T>
// 查询云主机列表
const guests = await connector.queryGuests(0, 10);
if (guests.error) throw new Error(guests.error);
console.log("云主机总数:", guests.data!.total);

// 获取单个云主机详情
const guest = await connector.getGuest("guest-id");
if (guest.data) {
  console.log("名称:", guest.data.name, "状态:", guest.data.state);
}

// 创建云主机（同步封装，自动等待任务完成）
import { ResourceAccessLevel, GuestConfig } from "@taiyi-io/api-connector-ts";

const config: GuestConfig = {
  name: "web-server",
  cores: 4,
  memory: 4096,                            // 4GB
  disks: [51200, 102400],                   // 50GB 系统盘 + 100GB 数据盘
  access_level: ResourceAccessLevel.Private,
  auto_start: true,
};
const createResult = await connector.createGuest("pool-1", "linux-system", config, 600);
if (createResult.data) console.log("新云主机ID:", createResult.data);

// 5. 释放资源（停止心跳）
connector.release();
```

### Next.js 用户

Next.js 应用推荐使用 `getNextConnector()`，它**自动管理设备标识和令牌存储**（基于 cookie + localStorage），无需手动实现令牌回调：

```typescript
import { getNextConnector } from "@taiyi-io/api-connector-ts/next-connector";

// 基于后端地址获取稳定的 connector，设备标识自动分配并持久化
const connector = await getNextConnector(
  process.env.BACKEND_HOST!,
  Number(process.env.BACKEND_PORT)  // 默认5851
);

// 如果之前已认证过，connector 会自动恢复认证状态
// 首次使用需要认证
await connector.authenticateByToken(token);

// 后续可直接调用管理接口
const guest = await connector.getGuest(guestID);
```

> **注意**：`getNextConnector` 内部使用 `localStorage` 和 `cookie` 安全存储令牌和关键数据，并自动处理 CSRF 防护。多个 connector 实例之间也能保持令牌一致。

### 测试与开发

开发调试时可使用 `getInsecureConnector()`，它基于内存存储令牌，**不做持久化**，适用于脚本、测试和非生产场景：

```typescript
import { getInsecureConnector } from "@taiyi-io/api-connector-ts";

const connector = await getInsecureConnector(
  "test-device",      // 设备标识
  "192.168.1.100",    // 后端主机地址
  5851                // 后端端口（默认5851）
);

// 直接认证，无需手动绑定回调
await connector.authenticateByPassword("admin", "password");

// 调用接口
const result = await connector.queryGuests(0, 10);
console.log("云主机列表:", result.data?.records);
```

> **注意**：`getInsecureConnector` 将令牌存储在进程内存中，进程退出后令牌丢失。不建议在生产环境使用。

### 自定义令牌管理策略

如果需要完全控制令牌的存储和读取（例如存入数据库、Redis 或加密文件），可以直接使用 `TaiyiConnector` 构造函数并实现 `SetTokenHandler` / `GetTokenHandler` 回调：

```typescript
import {
  TaiyiConnector,
  SetTokenHandler,
  GetTokenHandler,
  StateChangeHandler,
  AllocatedTokens,
} from "@taiyi-io/api-connector-ts";

// 实现令牌存储回调
const setTokens: SetTokenHandler = async (
  storeID: string,
  tokens: AllocatedTokens
) => {
  // 安全存储令牌到你的存储介质（数据库、Redis、加密文件等）
  await saveToSecureStorage(storeID, tokens);
};

const getTokens: GetTokenHandler = async (
  storeID: string
): Promise<AllocatedTokens> => {
  return await loadFromSecureStorage(storeID);
};

const onStateChange: StateChangeHandler = (
  storeID: string,
  authenticated: boolean
) => {
  console.log(`连接器 ${storeID} 认证状态变更: ${authenticated}`);
  if (!authenticated) {
    // 认证失效，需要重新登录
  }
};

const connector = new TaiyiConnector("192.168.1.100", 5851, "my-device");
connector.bindCallback("store-1", setTokens, getTokens, onStateChange);

// 可选：绑定认证过期事件
connector.bindAuthExpiredEvent((connectorID) => {
  console.log(`连接器 ${connectorID} 认证已过期，需要重新认证`);
});

// 使用令牌认证（Base64 编码的 PrivateKey JSON）
const authResult = await connector.authenticateByToken(base64EncodedToken);
if (authResult.unauthenticated) {
  console.error("令牌无效");
}
```

### 异步任务模式

对于耗时操作（创建/删除云主机、快照、磁盘操作等），SDK 提供两种调用模式：

```typescript
// 方式一：tryXxx + waitTask（手动控制，适合需要中间状态查询的场景）
const taskResult = await connector.tryCreateGuest(poolID, systemID, config);
if (taskResult.error) throw new Error(taskResult.error);

// 可以在等待期间查询任务进度
const taskData = await connector.waitTask(taskResult.data!, 300);
if (taskData.error) throw new Error(taskData.error);
console.log("云主机已创建:", taskData.data!.target);

// 方式二：同步封装（自动等待完成，更简洁）
const createResult = await connector.createGuest(poolID, systemID, config, 300);
if (createResult.error) throw new Error(createResult.error);
console.log("云主机ID:", createResult.data);
```

---

## 核心概念

### BackendResult\<T\>

所有 API 方法的统一返回类型：

```typescript
interface BackendResult<T = void> {
  error?: string;           // 错误信息，存在则表示操作失败
  unauthenticated?: boolean; // 是否未认证（令牌失效或过期）
  data?: T;                  // 数据载荷
}
```

**使用模式：**

```typescript
const result = await connector.getGuest("guest-id");
if (result.unauthenticated) {
  // 需要重新认证
} else if (result.error) {
  // 处理错误
} else {
  // 使用 result.data
}
```

### PaginationResult\<T\>

分页查询结果：

```typescript
interface PaginationResult<T> {
  records: T[];  // 当前页记录
  total: number; // 总记录数
}
```

### 回调类型

```typescript
// 令牌存储回调
type SetTokenHandler = (storeID: string, tokens: AllocatedTokens) => Promise<void>;

// 令牌获取回调
type GetTokenHandler = (storeID: string) => Promise<AllocatedTokens>;

// 认证状态变更回调（可选）
type StateChangeHandler = (storeID: string, authenticated: boolean) => void;

// 认证过期事件回调（可选）
type AuthExpiredEvent = (connectorID: string) => void;
```

---

## TaiyiConnector 类

### 构造函数与初始化

#### constructor

```typescript
constructor(backendHost: string, backendPort: number = 5851, device: string)
```

创建 TaiyiConnector 实例。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| backendHost | string | - | 后端 Control 服务地址 |
| backendPort | number | 5851 | 后端 Control 服务端口 |
| device | string | - | 设备标识 |

```typescript
const connector = new TaiyiConnector("192.168.1.100", 5851, "my-device");
```

#### bindCallback

```typescript
bindCallback(
  receiver: string,
  setter: SetTokenHandler,
  getter: GetTokenHandler,
  stateChange?: StateChangeHandler
): void
```

绑定令牌存取回调，**必须在认证之前调用**。

```typescript
connector.bindCallback("store-1", setTokens, getTokens, onStateChange);
```

#### bindAuthExpiredEvent

```typescript
bindAuthExpiredEvent(callback: AuthExpiredEvent): void
```

绑定认证过期事件回调（可选）。

```typescript
connector.bindAuthExpiredEvent((connectorID) => {
  console.log(`连接器 ${connectorID} 认证已过期`);
});
```

#### release

```typescript
release(): void
```

释放资源，停止令牌自动刷新。

### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| id | string | 连接器唯一标识 |
| authenticated | boolean | 当前认证状态 |
| user | string | 当前用户标识 |
| roles | UserRole[] | 当前用户角色列表 |

### 认证方法

#### authenticateByPassword

```typescript
authenticateByPassword(
  user: string,
  password: string
): Promise<BackendResult<AllocatedTokens>>
```

使用用户名密码认证。

```typescript
const result = await connector.authenticateByPassword("admin", "mypassword");
if (result.data) {
  console.log("用户:", result.data.user, "角色:", result.data.roles);
}
```

#### authenticateByToken

```typescript
authenticateByToken(token: string): Promise<BackendResult<AllocatedTokens>>
```

使用秘钥字符串（Base64编码的 PrivateKey JSON）认证。

```typescript
const result = await connector.authenticateByToken(base64Token);
if (result.unauthenticated) {
  console.error("令牌无效或已过期");
}
```

#### loadTokens

```typescript
loadTokens(tokens: AllocatedTokens): BackendResult
```

直接加载已有令牌，初始化认证状态（不触发网络请求）。

#### hasRole

```typescript
hasRole(role: UserRole): boolean
```

检查当前用户是否具有指定角色。

```typescript
if (connector.hasRole(UserRole.Super)) {
  console.log("超级管理员");
}
```

### 系统管理

#### getSystemStatus

```typescript
getSystemStatus(): Promise<BackendResult<SystemStatus>>
```

获取系统状态（无需认证）。

```typescript
const result = await connector.getSystemStatus();
if (result.data) {
  console.log("已初始化:", result.data.initialized, "语言:", result.data.locale);
}
```

#### initializeSystem

```typescript
initializeSystem(user: string, password: string): Promise<BackendResult>
```

初始化系统，设置初始管理员账户（无需认证，仅在系统未初始化时可用）。

```typescript
await connector.initializeSystem("admin", "initial-password");
```

#### generateUserToken

```typescript
generateUserToken(
  user: string,
  description?: string,
  expireInMonths?: number
): Promise<BackendResult<string>>
```

为指定用户生成 API 令牌。

```typescript
const result = await connector.generateUserToken("admin", "CI/CD令牌", 12);
if (result.data) {
  console.log("令牌:", result.data); // Base64 编码的秘钥字符串
}
```

### 任务管理

#### startTask

```typescript
startTask(cmd: ControlCommandRequest): Promise<BackendResult<string>>
```

发送控制命令并返回任务ID（底层方法）。

#### executeTask

```typescript
executeTask(
  cmd: ControlCommandRequest,
  timeoutSeconds: number = 300,
  intervalSeconds: number = 1
): Promise<BackendResult<TaskData>>
```

发送控制命令并等待任务完成（底层方法）。

#### getTask

```typescript
getTask(taskID: string): Promise<BackendResult<TaskData>>
```

获取任务详情。

```typescript
const task = await connector.getTask("task-id");
if (task.data) {
  console.log("状态:", task.data.status, "进度:", task.data.progress);
}
```

#### waitTask

```typescript
waitTask(
  taskID: string,
  timeoutSeconds: number = 300,
  intervalSeconds: number = 1
): Promise<BackendResult<TaskData>>
```

等待任务完成。

```typescript
const result = await connector.waitTask("task-id", 600, 2);
if (result.data) {
  console.log("任务完成，目标资源:", result.data.target);
}
```

#### queryTasks

```typescript
queryTasks(
  offset: number,
  pageSize: number
): Promise<BackendResult<PaginationResult<TaskData>>>
```

分页查询任务列表。

#### clearTasks

```typescript
clearTasks(): Promise<BackendResult>
```

清除所有已完成任务。

### 云主机管理

#### tryCreateGuest / createGuest

```typescript
// 异步版本，返回任务ID
tryCreateGuest(
  poolID: string, system: string, config: GuestConfig
): Promise<BackendResult<string>>

// 同步版本，等待完成并返回云主机ID
createGuest(
  poolID: string, system: string, config: GuestConfig,
  timeoutSeconds: number = 300
): Promise<BackendResult<string>>
```

创建云主机。

```typescript
import { ResourceAccessLevel } from "@taiyi-io/api-connector-ts";

const config: GuestConfig = {
  name: "test-vm",
  cores: 4,
  memory: 4096,                           // 4GB
  disks: [51200, 102400],                  // 50GB系统盘 + 100GB数据盘
  access_level: ResourceAccessLevel.Private,
  auto_start: true,
  source_image: "ubuntu-22.04",
};

// 同步方式
const result = await connector.createGuest("pool-1", "linux-system", config, 600);
if (result.data) {
  console.log("云主机ID:", result.data);
}

// 异步方式
const taskResult = await connector.tryCreateGuest("pool-1", "linux-system", config);
if (taskResult.data) {
  const task = await connector.waitTask(taskResult.data, 600);
  console.log("云主机ID:", task.data?.target);
}
```

#### tryDeleteGuest / deleteGuest

```typescript
tryDeleteGuest(guestID: string): Promise<BackendResult<string>>
deleteGuest(guestID: string, timeoutSeconds?: number): Promise<BackendResult>
```

删除云主机。

```typescript
await connector.deleteGuest("guest-id", 300);
```

#### getGuest

```typescript
getGuest(guestID: string): Promise<BackendResult<GuestView>>
```

获取云主机详情。

```typescript
const result = await connector.getGuest("guest-id");
if (result.data) {
  const guest = result.data;
  console.log("名称:", guest.name, "状态:", guest.state, "CPU:", guest.cores);
}
```

#### queryGuests

```typescript
queryGuests(
  start: number, limit: number, filter?: GuestFilter
): Promise<BackendResult<PaginationResult<GuestView>>>
```

分页查询云主机。

```typescript
import { GuestState } from "@taiyi-io/api-connector-ts";

// 查询运行中的云主机
const result = await connector.queryGuests(0, 20, {
  by_state: true,
  state: GuestState.Running,
});

// 关键字搜索
const result2 = await connector.queryGuests(0, 10, {
  by_keywords: true,
  keywords: ["web", "server"],
});

// 查询指定资源池
const result3 = await connector.queryGuests(0, 10, {
  by_pool: true,
  pool: "pool-1",
});
```

#### tryStartGuest / startGuest

```typescript
tryStartGuest(guestID: string, media?: string, expectEpoch?: number): Promise<BackendResult<string>>
startGuest(guestID: string, media?: string, timeoutSeconds?: number, expectEpoch?: number): Promise<BackendResult>
```

启动云主机，可选挂载 ISO 介质。支持 HA 模式下指定 `expectEpoch` 参数。

```typescript
await connector.startGuest("guest-id");
// 挂载ISO启动
await connector.startGuest("guest-id", "iso-file-id");
// HA模式：指定epoch值启动
await connector.startGuest("guest-id", undefined, 300, 1);
```

#### tryStopGuest / stopGuest

```typescript
tryStopGuest(guestID: string, reboot: boolean, force: boolean): Promise<BackendResult<string>>
stopGuest(guestID: string, reboot: boolean, force: boolean, timeoutSeconds?: number): Promise<BackendResult>
```

停止或重启云主机。

```typescript
// 正常关机
await connector.stopGuest("guest-id", false, false);
// 强制关机
await connector.stopGuest("guest-id", false, true);
// 正常重启
await connector.stopGuest("guest-id", true, false);
// 强制重启
await connector.stopGuest("guest-id", true, true);
```

#### tryModifyGuestCPU / modifyGuestCPU

```typescript
tryModifyGuestCPU(guestID: string, cores: number): Promise<BackendResult<string>>
modifyGuestCPU(guestID: string, cores: number, timeoutSeconds?: number): Promise<BackendResult>
```

修改云主机 CPU 核心数。

```typescript
await connector.modifyGuestCPU("guest-id", 8);
```

#### tryModifyGuestMemory / modifyGuestMemory

```typescript
tryModifyGuestMemory(guestID: string, memoryMB: number): Promise<BackendResult<string>>
modifyGuestMemory(guestID: string, memoryMB: number, timeoutSeconds?: number): Promise<BackendResult>
```

修改云主机内存大小。

```typescript
await connector.modifyGuestMemory("guest-id", 8192); // 8GB
```

#### tryModifyGuestHostname / modifyGuestHostname

```typescript
tryModifyGuestHostname(guestID: string, hostname: string): Promise<BackendResult<string>>
modifyGuestHostname(guestID: string, hostname: string, timeoutSeconds?: number): Promise<BackendResult>
```

修改云主机主机名。

#### tryModifyPassword / modifyPassword

```typescript
tryModifyPassword(guestID: string, user: string, password: string): Promise<BackendResult<string>>
modifyPassword(guestID: string, user: string, password: string, timeoutSeconds?: number): Promise<BackendResult>
```

修改云主机内操作系统用户密码。

#### tryModifyAutoStart / modifyAutoStart

```typescript
tryModifyAutoStart(guestID: string, enable: boolean): Promise<BackendResult<string>>
modifyAutoStart(guestID: string, enable: boolean, timeoutSeconds?: number): Promise<BackendResult>
```

修改云主机自动启动设置。

#### couldHasMoreGuests

```typescript
couldHasMoreGuests(): Promise<boolean>
```

检查是否还能创建更多云主机（受许可证限制）。

### 磁盘卷管理

#### tryAddVolume / addVolume

```typescript
tryAddVolume(guestID: string, volume: VolumeSpec): Promise<BackendResult<string>>
addVolume(guestID: string, volume: VolumeSpec, timeoutSeconds?: number): Promise<BackendResult>
```

为云主机添加磁盘卷。

```typescript
import { VolumeFormat } from "@taiyi-io/api-connector-ts";

const volume: VolumeSpec = {
  tag: "data-disk-1",
  format: VolumeFormat.Qcow,
  size: 102400, // 100GB
};
await connector.addVolume("guest-id", volume);
```

#### tryDeleteVolume / deleteVolume

```typescript
tryDeleteVolume(guestID: string, tag: string): Promise<BackendResult<string>>
deleteVolume(guestID: string, tag: string, timeoutSeconds?: number): Promise<BackendResult>
```

删除云主机磁盘卷。

#### tryResizeDisk

```typescript
tryResizeDisk(guestID: string, volumeTag: string, sizeInMB: number): Promise<BackendResult<string>>
```

调整磁盘大小。

#### tryShrinkDisk

```typescript
tryShrinkDisk(guestID: string, volumeTag: string): Promise<BackendResult<string>>
```

收缩磁盘空间。

#### tryInstallDiskImage

```typescript
tryInstallDiskImage(guestID: string, volumeTag: string, fileID: string): Promise<BackendResult<string>>
```

安装磁盘镜像到指定卷。

#### tryCreateDiskImage

```typescript
tryCreateDiskImage(
  guestID: string, volumeTag: string,
  spec: FileSpec, access_level: ResourceAccessLevel
): Promise<BackendResult<string>>
```

从指定卷创建磁盘镜像。

### 网络接口管理

#### 外部接口

```typescript
// 添加/移除外部网络接口
tryAddExternalInterface(guestID: string, macAddress: string): Promise<BackendResult<string>>
addExternalInterface(guestID: string, macAddress: string, timeoutSeconds?: number): Promise<BackendResult>
tryRemoveExternalInterface(guestID: string, macAddress: string): Promise<BackendResult<string>>
removeExternalInterface(guestID: string, macAddress: string, timeoutSeconds?: number): Promise<BackendResult>

// 修改外部接口MAC地址
tryModifyExternalInterfaceMAC(guestID: string, device: string, macAddress: string): Promise<BackendResult<string>>
modifyExternalInterfaceMAC(guestID: string, device: string, macAddress: string, timeoutSeconds?: number): Promise<BackendResult>
```

#### 内部接口

```typescript
// 添加/移除内部网络接口
tryAddInternalInterface(guestID: string, macAddress: string): Promise<BackendResult<string>>
addInternalInterface(guestID: string, macAddress: string, timeoutSeconds?: number): Promise<BackendResult>
tryRemoveInternalInterface(guestID: string, macAddress: string): Promise<BackendResult<string>>
removeInternalInterface(guestID: string, macAddress: string, timeoutSeconds?: number): Promise<BackendResult>

// 修改内部接口MAC地址
tryModifyInternalInterfaceMAC(guestID: string, device: string, macAddress: string): Promise<BackendResult<string>>
modifyInternalInterfaceMAC(guestID: string, device: string, macAddress: string, timeoutSeconds?: number): Promise<BackendResult>
```

```typescript
// 示例：添加外部网络接口
await connector.addExternalInterface("guest-id", "52:54:00:ab:cd:ef");
```

### 介质管理

#### tryInsertMedia / insertMedia

```typescript
tryInsertMedia(guestID: string, mediaId: string): Promise<BackendResult<string>>
insertMedia(guestID: string, mediaId: string, timeoutSeconds?: number): Promise<BackendResult>
```

插入 ISO 介质到云主机光驱。

#### tryEjectMedia / ejectMedia

```typescript
tryEjectMedia(guestID: string): Promise<BackendResult<string>>
ejectMedia(guestID: string, timeoutSeconds?: number): Promise<BackendResult>
```

弹出云主机光驱介质。

### 监控管理

#### tryResetMonitor / resetMonitor

```typescript
tryResetMonitor(guestID: string): Promise<BackendResult<string>>
resetMonitor(guestID: string, timeoutSeconds?: number): Promise<BackendResult>
```

重置云主机监控密码。

#### openMonitorChannel

```typescript
openMonitorChannel(guestID: string): Promise<BackendResult<MonitorResponse>>
```

打开监控通道（用于 VNC/SPICE 连接）。

### 快照管理

#### querySnapshots

```typescript
querySnapshots(guestID: string): Promise<BackendResult<SnapshotTreeNode[]>>
```

查询云主机快照树。

```typescript
const result = await connector.querySnapshots("guest-id");
if (result.data) {
  for (const node of result.data) {
    console.log("快照:", node.record.label, "ID:", node.record.id);
  }
}
```

#### getSnapshot

```typescript
getSnapshot(guestID: string, snapshotID: string): Promise<BackendResult<SnapshotRecord>>
```

获取快照详情。

#### tryCreateSnapshot / createSnapshot（同步封装见源码）

```typescript
tryCreateSnapshot(
  guestID: string, label: string, description?: string
): Promise<BackendResult<string>>
```

创建快照。

```typescript
const result = await connector.tryCreateSnapshot("guest-id", "v1.0", "发布前快照");
if (result.data) {
  await connector.waitTask(result.data, 300);
}
```

#### tryRestoreSnapshot / restoreSnapshot

```typescript
tryRestoreSnapshot(guestID: string, snapshotID: string): Promise<BackendResult<string>>
restoreSnapshot(guestID: string, snapshotID: string, timeoutSeconds?: number): Promise<BackendResult>
```

恢复快照。

#### tryDeleteSnapshot / deleteSnapshot

```typescript
tryDeleteSnapshot(guestID: string, snapshotID: string): Promise<BackendResult<string>>
deleteSnapshot(guestID: string, snapshotID: string, timeoutSeconds?: number): Promise<BackendResult>
```

删除快照。

### 资源统计

#### queryResourceUsages

```typescript
queryResourceUsages(targets: string[]): Promise<BackendResult<GuestResourceUsageData[]>>
```

查询云主机资源使用情况。

#### queryResourceStatistic

```typescript
queryResourceStatistic(
  guest: string, range: StatisticRange
): Promise<BackendResult<ResourceStatisticUnit[]>>
```

查询云主机资源统计信息。

```typescript
import { StatisticRange } from "@taiyi-io/api-connector-ts";

const result = await connector.queryResourceStatistic("guest-id", StatisticRange.Last24Hours);
```

#### queryNodesUsage

```typescript
queryNodesUsage(targets: string[]): Promise<BackendResult<NodeResourceSnapshot[]>>
```

查询节点资源使用情况。

#### queryPoolsUsage

```typescript
queryPoolsUsage(targets: string[]): Promise<BackendResult<PoolResourceSnapshot[]>>
```

查询资源池资源用量。

#### queryClusterUsage

```typescript
queryClusterUsage(): Promise<BackendResult<ClusterResourceSnapshot>>
```

查询集群整体资源用量。

### 节点管理

```typescript
addNode(config: ClusterNode): Promise<BackendResult>              // 添加节点
removeNode(nodeID: string): Promise<BackendResult>                // 移除节点
queryNodes(): Promise<BackendResult<ClusterNodeData[]>>            // 查询节点列表
getNode(nodeID: string): Promise<BackendResult<ClusterNodeData>>   // 获取节点详情
enableNode(nodeID: string): Promise<BackendResult>                // 启用节点
disableNode(nodeID: string): Promise<BackendResult>               // 禁用节点
restartService(nodeID: string): Promise<BackendResult>            // 重启节点服务
modifyConfig(nodeID: string, config: NodeConfig): Promise<BackendResult>   // 修改节点配置
getConfig(nodeID: string): Promise<BackendResult<NodeConfigStatus>>       // 获取节点配置
```

```typescript
// 示例：查询所有节点
const result = await connector.queryNodes();
if (result.data) {
  for (const node of result.data) {
    console.log("节点:", node.name, "状态:", node.state);
  }
}
```

#### 节点本地存储

```typescript
queryResourcePools(nodeID: string): Promise<BackendResult<DataStore[]>>   // 查询本地存储池
modifyResourceStorageStrategy(nodeID: string, poolID: string, strategy: VolumeContainerStrategy): Promise<BackendResult>
addResourceContainer(nodeID: string, poolID: string, container: VolumeContainer): Promise<BackendResult>
modifyResourceContainer(nodeID: string, poolID: string, index: number, container: VolumeContainer): Promise<BackendResult>
removeResourceContainer(nodeID: string, poolID: string, index: number): Promise<BackendResult>
changeResourceContainerFlag(nodeID: string, poolID: string, index: number, enabled: boolean): Promise<BackendResult>
tryReloadResourceStorage(nodeID: string, poolID: string): Promise<BackendResult<string>>
```

### 计算资源池管理

```typescript
queryComputePools(): Promise<BackendResult<ComputePoolStatus[]>>          // 查询资源池列表
getComputePool(poolID: string): Promise<BackendResult<ComputePoolStatus>> // 获取资源池详情
addComputePool(config: ComputePoolConfig): Promise<BackendResult>         // 添加资源池
modifyComputePool(config: ComputePoolConfig): Promise<BackendResult>      // 修改资源池
deleteComputePool(poolID: string): Promise<BackendResult>                 // 删除资源池
addComputeNode(poolID: string, nodeID: string): Promise<BackendResult>    // 添加计算节点到资源池
removeComputeNode(poolID: string, nodeID: string): Promise<BackendResult> // 从资源池移除节点
queryComputeNodes(poolID: string): Promise<BackendResult<ClusterNodeData[]>> // 查询资源池内节点
changeComputePoolStrategy(poolID: string, strategy: ComputePoolStrategy): Promise<BackendResult>
```

```typescript
import { ComputePoolStrategy } from "@taiyi-io/api-connector-ts";

// 修改资源池策略
await connector.changeComputePoolStrategy("pool-1", ComputePoolStrategy.LeastMemoryLoad);
```

### 存储池管理

```typescript
queryStoragePools(): Promise<BackendResult<StoragePoolListRecord[]>>    // 查询存储池列表
getStoragePool(poolID: string): Promise<BackendResult<StoragePool>>     // 获取存储池详情
addStoragePool(config: StoragePoolConfig): Promise<BackendResult>       // 添加存储池
removeStoragePool(poolID: string): Promise<BackendResult>               // 删除存储池
modifyRemoteStorageStrategy(poolID: string, strategy: VolumeContainerStrategy): Promise<BackendResult>
changeRemoteContainerFlag(poolID: string, index: number, enabled: boolean): Promise<BackendResult>
```

#### 远程容器操作

```typescript
tryAddRemoteContainer(poolID: string, container: VolumeContainer): Promise<BackendResult<string>>
addRemoteContainer(poolID: string, container: VolumeContainer, timeoutSeconds?: number): Promise<BackendResult>
tryModifyRemoteContainer(poolID: string, index: number, container: VolumeContainer): Promise<BackendResult<string>>
modifyRemoteContainer(poolID: string, index: number, container: VolumeContainer, timeoutSeconds?: number): Promise<BackendResult>
tryRemoveRemoteContainer(poolID: string, index: number): Promise<BackendResult<string>>
removeRemoteContainer(poolID: string, index: number, timeoutSeconds?: number): Promise<BackendResult>
```

### 地址池管理

地址池采用四集合模型（外部IPv4、外部IPv6、内部IPv4、内部IPv6），支持网关、DNS、上游网关等配置。

#### 创建/修改/删除地址池

```typescript
// 创建地址池
createAddressPool(id: string, mode: string, description?: string, gatewayV4?: string, gatewayV6?: string, dns?: string[], upstreamGateway?: string): Promise<BackendResult>

// 修改地址池
modifyAddressPool(id: string, description?: string, gatewayV4?: string, gatewayV6?: string, dns?: string[], upstreamGateway?: string): Promise<BackendResult>

// 删除地址池
deleteAddressPool(poolID: string): Promise<BackendResult>
```

```typescript
// 创建地址池
await connector.createAddressPool("pool-1", "address", "生产网络", "192.168.1.1", undefined, ["8.8.8.8"]);

// 修改地址池
await connector.modifyAddressPool("pool-1", "更新描述", "192.168.1.254");

// 删除地址池
await connector.deleteAddressPool("pool-1");
```

#### 查询/获取地址池

```typescript
queryAddressPoolConfigs(): Promise<BackendResult<AddressPoolConfig[]>>
getAddressPoolDetail(poolID: string): Promise<BackendResult<AddressPoolDetail>>
```

```typescript
// 查询所有地址池配置
const configs = await connector.queryAddressPoolConfigs();
if (configs.data) {
  for (const config of configs.data) {
    console.log("地址池:", config.id, "模式:", config.mode);
  }
}

// 获取地址池详情（含四个地址集合）
const detail = await connector.getAddressPoolDetail("pool-1");
if (detail.data) {
  console.log("外部IPv4范围:", detail.data.external_v4.ranges);
  console.log("已分配地址:", detail.data.external_v4.allocations);
}
```

#### 地址范围管理

```typescript
// 添加地址范围（setType: "ext-v4" | "ext-v6" | "int-v4" | "int-v6"）
addAddressRange(pool: string, setType: string, begin?: string, end?: string, cidr?: string): Promise<BackendResult>

// 删除地址范围
removeAddressRange(pool: string, setType: string, begin: string, end: string): Promise<BackendResult>
```

```typescript
// 添加外部IPv4地址范围
await connector.addAddressRange("pool-1", "ext-v4", "192.168.1.100", "192.168.1.200");

// 添加内部IPv4地址范围（CIDR格式）
await connector.addAddressRange("pool-1", "int-v4", undefined, undefined, "10.0.0.0/24");

// 删除地址范围
await connector.removeAddressRange("pool-1", "ext-v4", "192.168.1.100", "192.168.1.200");
```

```typescript
// 添加外部IPv4地址范围
await connector.addAddressRange("pool-1", "ext-v4", "192.168.1.100", "192.168.1.200");

// 添加内部IPv4地址范围（CIDR格式）
await connector.addAddressRange("pool-1", "int-v4", undefined, undefined, "10.0.0.0/24");

// 删除地址范围
await connector.removeAddressRange("pool-1", "ext-v4", "192.168.1.100", "192.168.1.200");
```

### 安全策略管理

安全策略组定义了网卡级别的防火墙规则模板，可应用到云主机的外部和内部网卡。

#### 策略组 CRUD

```typescript
// 创建安全策略组
createSecurityPolicy(id: string, name: string, externalRules: SecurityRule[], internalRules: SecurityRule[], description?: string, isDefault?: boolean): Promise<BackendResult>

// 查询安全策略组列表
querySecurityPolicies(): Promise<BackendResult<SecurityPolicyGroup[]>>

// 获取安全策略组详情
getSecurityPolicy(policyID: string): Promise<BackendResult<SecurityPolicyGroup>>

// 修改安全策略组
modifySecurityPolicy(id: string, name?: string, description?: string, isDefault?: boolean, externalRules?: SecurityRule[], internalRules?: SecurityRule[]): Promise<BackendResult>

// 删除安全策略组
deleteSecurityPolicy(policyID: string): Promise<BackendResult>

// 复制安全策略组
copySecurityPolicy(sourceID: string, newID: string, name: string): Promise<BackendResult>
```

```typescript
import { SecurityRule } from "@taiyi-io/api-connector-ts";

// 创建安全策略组
const externalRules: SecurityRule[] = [
  { source_address: "0.0.0.0/0", dest_port: 22, dest_port_end: 22, protocol: "tcp", action: "accept", description: "允许SSH" },
  { source_address: "0.0.0.0/0", dest_port: 80, dest_port_end: 80, protocol: "tcp", action: "accept", description: "允许HTTP" },
];
await connector.createSecurityPolicy("web-policy", "Web服务器策略", externalRules, [], "用于Web服务器");

// 查询所有策略组
const policies = await connector.querySecurityPolicies();

// 复制策略组
await connector.copySecurityPolicy("web-policy", "web-policy-v2", "Web服务器策略V2");
```

#### 云主机安全策略

```typescript
// 获取云主机安全策略
getGuestSecurityPolicy(guestID: string): Promise<BackendResult<GuestSecurityPolicy>>

// 修改云主机指定网卡的安全策略
modifyGuestSecurityPolicy(guestID: string, macAddress: string, rules: SecurityRule[]): Promise<BackendResult>

// 重置云主机指定网卡的安全策略（恢复为策略组默认规则）
resetGuestSecurityPolicy(guestID: string, macAddress: string): Promise<BackendResult>
```

```typescript
// 获取云主机安全策略
const policy = await connector.getGuestSecurityPolicy("guest-id");
if (policy.data) {
  for (const p of policy.data.policies) {
    console.log("网卡:", p.mac_address, "外部:", p.is_external, "规则数:", p.rules.length);
  }
}

// 修改指定网卡的规则
const rules: SecurityRule[] = [
  { source_address: "10.0.0.0/8", dest_port: 3306, dest_port_end: 3306, protocol: "tcp", action: "accept", description: "允许内网MySQL" },
];
await connector.modifyGuestSecurityPolicy("guest-id", "52:54:00:ab:cd:ef", rules);

// 重置为策略组默认规则
await connector.resetGuestSecurityPolicy("guest-id", "52:54:00:ab:cd:ef");
```

### 文件管理

#### ISO 文件

```typescript
createISOFile(spec: FileSpec, access_level: ResourceAccessLevel): Promise<BackendResult<string>>
deleteISOFile(fileID: string): Promise<BackendResult>
modifyISOFile(fileID: string, spec: FileSpec): Promise<BackendResult>
getISOFile(fileID: string): Promise<BackendResult<FileStatus>>
queryISOFiles(offset: number, limit: number, onlySelf?: boolean): Promise<BackendResult<PaginationResult<FileView>>>
getISOFileURL(fileID: string): string    // 获取上传URL（同步方法）
trySyncISOFiles(): Promise<BackendResult<string>>
```

#### 磁盘文件

```typescript
createDiskFile(spec: FileSpec, access_level: ResourceAccessLevel): Promise<BackendResult<string>>
deleteDiskFile(fileID: string): Promise<BackendResult>
modifyDiskFile(fileID: string, spec: FileSpec): Promise<BackendResult>
getDiskFile(fileID: string): Promise<BackendResult<FileStatus>>
queryDiskFiles(offset: number, limit: number, onlySelf?: boolean): Promise<BackendResult<PaginationResult<FileView>>>
getDiskFileURL(fileID: string): string   // 获取上传URL（同步方法）
trySyncDiskFiles(): Promise<BackendResult<string>>
updateDiskVolumeSize(fileID: string, sizeInMB: number): Promise<BackendResult>
```

```typescript
import { ResourceAccessLevel } from "@taiyi-io/api-connector-ts";

// 创建ISO文件记录
const spec: FileSpec = { name: "ubuntu-22.04.iso", description: "Ubuntu Server" };
const result = await connector.createISOFile(spec, ResourceAccessLevel.ShareView);
if (result.data) {
  const uploadURL = connector.getISOFileURL(result.data);
  // 使用 uploadURL 上传文件
}
```

### 系统模板管理

```typescript
querySystems(offset: number, pageSize: number, onlySelf?: boolean): Promise<BackendResult<PaginationResult<GuestSystemView>>>
getSystem(systemID: string): Promise<BackendResult<GuestSystemView>>
addSystem(label: string, spec: GuestSystemSpec, access_level: ResourceAccessLevel): Promise<BackendResult>
modifySystem(systemID: string, label: string, spec: GuestSystemSpec): Promise<BackendResult>
removeSystem(systemID: string): Promise<BackendResult>
resetSystems(): Promise<BackendResult>
```

### 日志与告警

```typescript
queryLogs(date: string, offset?: number, limit?: number): Promise<BackendResult<PaginationResult<ConsoleEvent>>>
queryWarnings(level?: ConsoleEventLevel, unread_only?: boolean, offset?: number, limit?: number): Promise<BackendResult<WarningRecordSet>>
countWarnings(nodeID: string): Promise<BackendResult<WarningStatistic>>
sumWarnings(nodeList: string[]): Promise<BackendResult<WarningStatistic>>
removeWarnings(idList: string[]): Promise<BackendResult>
clearWarnings(): Promise<BackendResult>
markWarningsAsRead(idList: string[]): Promise<BackendResult>
markAllWarningsAsRead(): Promise<BackendResult>
markAllWarningsAsUnread(): Promise<BackendResult>
countUnreadWarnings(): Promise<BackendResult<WarningStatistic>>
```

```typescript
// 查询最近24小时日志
const logs = await connector.queryLogs("2024-01-15", 0, 50);

// 查询未读告警
const warnings = await connector.queryWarnings(undefined, true, 0, 20);
```

### 监控规则

```typescript
getMonitorRules(): Promise<BackendResult<ResourceMonitorConfig>>
setMonitorRules(rules: ResourceMonitorConfig): Promise<BackendResult>
resetMonitorRules(): Promise<BackendResult>
```

### 许可证管理

```typescript
getActivatedLicense(): Promise<BackendResult<License>>
activateLicense(licenseID: string): Promise<BackendResult>
addLicense(license: License): Promise<BackendResult>
removeLicense(licenseID: string): Promise<BackendResult>
getLicense(licenseID: string): Promise<BackendResult<License>>
queryLicenses(): Promise<BackendResult<LicenseRecord[]>>
```

### 集群与网络

```typescript
queryClusterStatus(): Promise<BackendResult<ClusterStatus>>
queryNetworkGraph(): Promise<BackendResult<NetworkGraphNode[]>>
```

### SSH 密钥管理

```typescript
addSSHKey(label: string, content: string, access_level: ResourceAccessLevel): Promise<BackendResult>
removeSSHKey(id: string): Promise<BackendResult>
querySSHKeys(offset: number, pageSize: number, onlySelf?: boolean): Promise<BackendResult<PaginationResult<SSHKeyView>>>
```

### 导入管理

```typescript
addImportSource(vendor: ImportVendor, url: string, token: string, secret: string): Promise<BackendResult>
modifyImportSource(id: string, url: string, token: string, secret: string): Promise<BackendResult>
removeImportSource(id: string): Promise<BackendResult>
queryImportSources(start: number, limit: number): Promise<BackendResult<PaginationResult<ImportSource>>>
queryImportTargets(sourceID: string): Promise<BackendResult<ImportTarget[]>>
tryImportGuestsToNode(sourceID: string, targetIDs: string[], targetNode: string): Promise<BackendResult<string>>
tryMigrateToNode(targetNode: string, guests: string[]): Promise<BackendResult<string>>
```

### 用户与权限管理

#### 用户组

```typescript
addGroup(group: UserGroup): Promise<BackendResult>
removeGroup(group: string): Promise<BackendResult>
queryGroups(offset: number, limit: number): Promise<BackendResult<PaginationResult<UserGroupRecord>>>
queryUserRoles(): Promise<BackendResult<UserRole[]>>
modifyGroupRoles(group: string, roles: UserRole[]): Promise<BackendResult>
getGroupRoles(group: string): Promise<BackendResult<UserRole[]>>
```

#### 用户

```typescript
addUser(user: string, group: string, password: string): Promise<BackendResult>
removeUser(userId: string): Promise<BackendResult>
queryUsers(offset: number, limit: number): Promise<BackendResult<PaginationResult<UserCredentialRecord>>>
changeUserGroup(userId: string, groupId: string): Promise<BackendResult>
changeUserSecret(user: string, password: string): Promise<BackendResult>
resetUserSecret(user: string): Promise<BackendResult<string>>
```

#### 令牌与访问

```typescript
queryUserTokens(user: string, offset: number, limit: number): Promise<BackendResult<PaginationResult<UserToken>>>
revokeUserToken(user: string, serial: string): Promise<BackendResult>
revokeAccess(token: string): Promise<BackendResult>
invalidateAccess(token: string): Promise<BackendResult>
queryAccesses(user: string, offset: number, limit: number): Promise<BackendResult<PaginationResult<UserAccessRecord>>>
```

#### 白名单

```typescript
addWhiteList(address: string): Promise<BackendResult>
removeWhiteList(index: number): Promise<BackendResult>
updateWhiteList(index: number, address: string): Promise<BackendResult>
queryWhiteList(offset: number, limit: number): Promise<BackendResult<PaginationResult<string>>>
```

#### 资源权限

```typescript
setSystemResource(type: ResourceType, id: string, value: boolean): Promise<BackendResult>
getResourcePermissions(type: ResourceType, id: string): Promise<BackendResult<ResourcePermissions>>
setResourcePermissions(type: ResourceType, id: string, permissions: ResourcePermissions): Promise<BackendResult>
```

```typescript
import { UserRole, ResourceType } from "@taiyi-io/api-connector-ts";

// 创建用户组和用户
await connector.addGroup({ id: "dev-team", roles: [UserRole.User] });
await connector.addUser("developer", "dev-team", "password123");

// 设置资源权限
const permissions = await connector.getResourcePermissions(ResourceType.Guest, "guest-id");
```

---

## 辅助函数

从 `helper` 模块导出的工具函数：

### generateNonce

```typescript
generateNonce(): string
```

生成随机字符串，用于签名等场景。

### generateDeviceFingerprint

```typescript
generateDeviceFingerprint(device: string, host: string, port: number): string
```

根据设备标识、主机和端口生成特征字符串。

### findAdminSecret

```typescript
findAdminSecret(spec: GuestSpec | null): FoundAdminSecret
```

从云主机规格中查找管理员凭据。

### 资源数据解析

```typescript
// 解析资源统计数据
unmarshalResourceStatistics(records: ResourceStatisticUnitRecord[]): {
  results: ResourceStatisticUnit[]; error?: string
}

// 解析云主机资源用量
unmarshalResourceUsage(records: GuestResourceUsageRecord[]): {
  results: GuestResourceUsageData[]; error?: string
}

// 解析节点资源用量
unmarshalNodesResourceUsage(records: NodeResourceSnapshotRecord[]): {
  results: NodeResourceSnapshot[]; error?: string
}

// 解析池资源用量
unmarshalPoolsResourceUsage(records: PoolResourceSnapshotRecord[]): {
  results: PoolResourceSnapshot[]; error?: string
}

// 解析集群资源用量
unmarshalClusterResourceUsage(record: ClusterResourceSnapshotRecord): {
  results: ClusterResourceSnapshot | undefined; error?: string
}
```

### 资源权限检查

```typescript
canViewResource(resource: OperatableResource): boolean   // 检查是否可查看
canEditResource(resource: OperatableResource): boolean   // 检查是否可编辑
canDeleteResource(resource: OperatableResource): boolean // 检查是否可删除
```

### copyToClipboard

```typescript
copyToClipboard(text: string): Promise<boolean>
```

复制文本到剪贴板。

---

## 数据接口定义

### 核心接口

| 接口 | 说明 |
|------|------|
| `BackendResult<T>` | 统一 API 返回结果，含 `error`、`unauthenticated`、`data` |
| `PaginationResult<T>` | 分页结果，含 `records` 和 `total` |
| `AllocatedTokens` | 已分配令牌集合，含访问/刷新/CSRF令牌、公钥、签名算法、角色 |

### 云主机相关

| 接口 | 说明 |
|------|------|
| `GuestConfig` | 创建云主机配置：名称、核心数、内存(MB)、磁盘列表(MB)、访问级别 |
| `GuestView` | 云主机完整视图：规格 + 运行状态 + 权限 + 操作列表 |
| `GuestSpec` | 云主机规格：网络、存储、系统、CloudInit、QoS 等 |
| `GuestStatus` | 云主机状态，继承 GuestSpec 并添加运行时信息 |
| `GuestFilter` | 查询过滤条件：关键字、状态、资源池、节点、仅自己 |
| `GuestQoS` | QoS参数：CPU优先级、读写速度、IOPS、网络带宽 |
| `GuestHAConfig` | HA配置：是否启用、epoch值 |
| `GuestSystemSpec` | 系统规格：OS类别、磁盘模式、网络模型、显示驱动等 |
| `GuestSystemView` | 系统模板视图 |

### 存储相关

| 接口 | 说明 |
|------|------|
| `VolumeSpec` | 卷规格：标签、格式(raw/qcow2)、大小(MiB) |
| `VolumeContainer` | 卷容器配置 |
| `DiskSpec` | 磁盘规格 |
| `StoragePool` | 存储池详情 |
| `StoragePoolConfig` | 存储池配置 |
| `StoragePoolListRecord` | 存储池列表记录 |
| `DataStore` | 节点本地存储，继承 StoragePool |
| `FileSpec` | 文件规格（名称、描述） |
| `FileStatus` | 文件状态信息 |
| `FileView` | 文件视图 |

### 节点与集群

| 接口 | 说明 |
|------|------|
| `ClusterNode` | 集群节点配置 |
| `ClusterNodeData` | 集群节点数据 |
| `ClusterStatus` | 集群状态 |
| `ComputePoolConfig` | 计算资源池配置（含HA：enable_ha、interface_mode、address_mode、security_policy） |
| `ComputePoolStatus` | 计算资源池状态 |
| `NodeConfig` | 节点配置（含语言、端口、最大云主机数） |
| `NodeConfigStatus` | 节点配置状态（含是否已修改） |

### 快照

| 接口 | 说明 |
|------|------|
| `SnapshotRecord` | 快照记录 |
| `SnapshotTreeNode` | 快照树节点（含父子关系） |

### 网络

| 接口 | 说明 |
|------|------|
| `NetworkInterface` | 网络接口：MAC、IP(v4/v6)、DNS、网关 |
| `NetworkInterfaces` | 网络接口集合（内部+外部） |
| `NetworkGraphNode` | 网络拓扑图节点 |
| `AddressPool` / `AddressPoolRecord` | 地址池（旧版） |
| `AddressPoolConfig` | 地址池配置（新版） |
| `AddressPoolDetail` | 地址池详情（新版四集合模型） |
| `AddressSet` | 地址集（含范围和已分配地址） |
| `AddressSetRange` | 地址范围（新版，含begin/end/cidr） |
| `AddressAllocation` | 已分配地址（含云主机ID、接口类型、分配时间） |
| `AddressRange` | 地址范围 |
| `MonitorResponse` | 监控通道响应 |

### 安全策略

| 接口 | 说明 |
|------|------|
| `SecurityRule` | 安全策略规则：源地址、目标端口、协议、动作 |
| `SecurityPolicyGroup` | 安全策略组：名称、描述、外部/内部规则模板 |
| `GuestSecurityPolicy` | 云主机安全策略：接口策略列表 |
| `InterfaceSecurityPolicy` | 接口安全策略：MAC地址、来源策略组、规则列表 |

### 用户与权限

| 接口 | 说明 |
|------|------|
| `UserGroup` | 用户组（ID、成员列表、角色列表） |
| `UserGroupRecord` | 用户组列表记录 |
| `UserCredentialRecord` | 用户凭证记录 |
| `UserToken` | 用户令牌（含公钥、描述、最后访问时间） |
| `UserAccessRecord` | 用户访问记录 |
| `ResourcePermissions` | 资源权限（命名空间、所有者、查看/编辑范围） |
| `PublicKeySerial` / `PrivateKeySerial` / `PrivateKey` | 密钥相关 |

### 统计与监控

| 接口 | 说明 |
|------|------|
| `ResourceStatisticUnit` / `ResourceStatisticValue` | 资源统计数据 |
| `GuestResourceUsageData` | 云主机资源使用数据 |
| `NodeResourceSnapshot` | 节点资源快照 |
| `PoolResourceSnapshot` | 池资源快照 |
| `ClusterResourceSnapshot` | 集群资源快照 |
| `ResourceMonitorConfig` | 资源监控配置 |
| `AlertRule` / `MachineAlertRules` | 告警规则 |
| `StatisticChartData` | 统计图表数据 |
| `ConsoleEvent` | 控制台事件 |
| `WarningRecord` / `WarningStatistic` / `WarningRecordSet` | 告警相关 |

### 其他

| 接口 | 说明 |
|------|------|
| `SystemStatus` | 系统状态（是否初始化、语言） |
| `TaskData` | 任务数据（ID、类型、状态、进度、错误等） |
| `License` / `LicenseRecord` / `AuthorizedAbility` | 许可证相关 |
| `SSHKey` / `SSHKeyView` | SSH密钥 |
| `ImportSource` / `ImportTarget` | 导入源与目标 |
| `CloudInitSpec` | CloudInit配置 |
| `FoundAdminSecret` | 管理员凭据查找结果 |
| `OperatableResource` | 可操作资源（权限检查辅助） |

---

## 枚举定义

### 云主机相关

| 枚举 | 说明 | 主要值 |
|------|------|--------|
| `GuestState` | 云主机状态 | `Stopped`, `Starting`, `Running`, `Stopping`, `Suspending`, `Suspended`, `Unknown` |
| `SystemCategory` | 操作系统类别 | `Linux`, `Windows`, `BSD`, `Darwin` 等 |
| `GuestDiskMode` | 磁盘模式 | `IDE`, `SATA`, `SCSI`, `VirtIO` |
| `NetworkModelType` | 网络模型 | `VIRTIO`, `E1000`, `E1000E`, `RTL8139`, `VMXNET3` |
| `DisplayDriver` | 显示驱动 | `Cirrus`, `QXL`, `VGA`, `VirtIO`, `None` |
| `RemoteProtocol` | 远程协议 | `SPICE`, `VNC` |
| `USBModel` | USB控制器 | `PIIX3UHCI`, `PIIX4UHCI`, `EHCI`, `XHCI`, `NECXHCI`, `Disabled` |
| `GuestFirmwareMode` | 固件模式 | `BIOS`, `EFI` |
| `GuestSoundModel` | 声卡模型 | `SB16`, `AC97`, `ICH6`, `ICH9`, `VirtIO`, `Disabled` 等 |
| `GuestTabletMode` | 平板模式 | `Disabled`, `USB`, `VirtIO` |

### 任务与命令

| 枚举 | 说明 | 主要值 |
|------|------|--------|
| `TaskStatus` | 任务状态 | `Pending`, `Running`, `Completed` |
| `TaskType` | 任务类型 | 对应各种操作类型 |
| `controlCommandEnum` | 控制命令 | `CreateGuest`, `DeleteGuest`, `ModifyCPU` 等80+命令 |

### 资源与权限

| 枚举 | 说明 | 主要值 |
|------|------|--------|
| `ResourceAccessLevel` | 资源访问级别 | `GlobalView`, `ShareEdit`, `ShareView`, `Private` |
| `ResourceAccessScope` | 访问范围 | 全局/共享/私有等 |
| `ResourceAction` | 操作类型 | `View`, `Edit`, `Delete` 等 |
| `ResourceType` | 资源类型 | `Guest`, `System`, `ISOFile`, `DiskFile`, `SSHKey` |
| `UserRole` | 用户角色 | `Super`, `Manager`, `User` |

### 存储与网络

| 枚举 | 说明 | 主要值 |
|------|------|--------|
| `StorageType` | 存储类型 | `Local`, `NFS`, `CephFS`, `SMB`, `WebDav`, `S3`, `iSCSI` |
| `VolumeFormat` | 卷格式 | `Raw`, `Qcow` |
| `VolumeContainerStrategy` | 容器策略 | `LeastVolumes`, `LeastUsed`, `MaximumAvailable` |
| `NetworkMode` | 网络模式 | `Bridge` |
| `InterfaceMode` | 接口模式 | `Direct`, `NAT`, `DualNIC` |
| `NodeMode` | 节点模式 | `Control`, `Resource` |
| `NodeState` | 节点状态 | `Connected`, `Disconnected`, `Ready`, `Lost` |
| `ComputePoolStrategy` | 计算池策略 | `MostAvailableMemory`, `LeastMemoryLoad` 等 |

### 文件与统计

| 枚举 | 说明 | 主要值 |
|------|------|--------|
| `FileCategory` | 文件类别 | `ISO`, `Disk` |
| `FileFormat` | 文件格式 | `ISO`, `Qcow2` |
| `FileState` | 文件状态 | `Allocated`, `Ready`, `Updating`, `Corrupted` |
| `StatisticRange` | 统计范围 | `LastHour`, `Last24Hours`, `Last7Days`, `Last30Days` |
| `StatisticUnitRecordField` | 统计字段 | CPU/内存/磁盘/网络相关指标 |
| `ResourceSnapshotField` | 资源快照字段 | 核心数/内存/磁盘/云主机数量等 |
| `ResourceUsageDurationField` | 使用时长字段 | 读写请求/字节数/IOPS等 |

### 事件与告警

| 枚举 | 说明 | 主要值 |
|------|------|--------|
| `ConsoleEventLevel` | 事件级别 | `Info`, `Warning`, `Alert`, `Critical` |
| `ConsoleEventRange` | 事件范围 | `System`, `Cluster`, `Pool`, `Node` |
| `ConsoleEventCategory` | 事件分类 | `Guest`, `Storage`, `Network`, `System`, `Security` 等 |

### 认证与许可

| 枚举 | 说明 | 主要值 |
|------|------|--------|
| `TokenSigningMethod` | 令牌签名方法 | `HS256`-`HS512`, `RS256`-`RS512`, `ES256`-`ES512` |
| `SignatureAlgorithm` | 签名算法 | `Ed25519` |
| `PasswordHasher` | 密码哈希算法 | `Bcrypt` |
| `AuthorizationMode` | 授权模式 | `Machine`, `Project`, `Account` |
| `LicenseFeature` | 许可证功能 | `Snapshot`, `Backup`, `HighAvailability`, `Migration`, `SecurityPolicy`, `AddressPool` 等 |
| `ImportVendor` | 导入供应商 | `VMWareESXi` |

### 其他

| 枚举 | 说明 | 主要值 |
|------|------|--------|
| `Locale` | 语言 | `Chinese` ("zh-cn"), `English` ("en-us") |
| `Priority` | 优先级 | `High` (0), `Medium` (1), `Low` (2) |
| `CloudInitBootMode` | CloudInit 启动模式 | `None`, `DMI`, `ISO`, `ISONet` |

### 常量

```typescript
// 节点资源快照字段数量
export const NODE_RESOURCE_SNAPSHOT_FIELD_COUNT: number;

// 池资源快照字段数量
export const POOL_RESOURCE_SNAPSHOT_FIELD_COUNT: number;
```

