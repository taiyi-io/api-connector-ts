# 核心模块

## 模块概览

| 模块 | 文件 | 说明 |
|------|------|------|
| 连接器 | `connector.ts` | 主类 TaiyiConnector，提供所有平台 API |
| 枚举定义 | `enums.ts` | 控制命令、状态、类型等枚举 |
| 数据结构 | `data-defines.ts` | 接口和类型定义 |
| 请求转发 | `request-forwarder.ts` | 底层 HTTP 通信 |
| 工具函数 | `helper.ts` | 辅助函数 |
| 入口导出 | `index.ts` | 公共 API 导出 |

---

## TaiyiConnector 类

**文件**: `src/connector.ts`

主要的 API 连接器类，提供与太一云 Control 服务交互的所有方法。

### 构造函数

```typescript
constructor(backendHost: string, backendPort: number = 5851, device: string)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| backendHost | string | Control 模块 API 地址 |
| backendPort | number | API 端口（默认 5851） |
| device | string | 设备标识 |

### 核心方法

#### 认证相关

| 方法 | 说明 |
|------|------|
| `bindCallback(receiver, setter, getter, stateChange?)` | 绑定令牌存储回调 |
| `bindAuthExpiredEvent(callback)` | 绑定认证过期事件 |
| `authenticateByPassword(user, password)` | 密码认证 |
| `authenticateByToken(token)` | 令牌认证 |
| `loadTokens(tokens)` | 直接加载令牌 |

#### 系统管理

| 方法 | 说明 |
|------|------|
| `getSystemStatus()` | 获取系统状态 |
| `initializeSystem(user, password)` | 初始化系统 |

#### 云主机管理

| 方法 | 说明 |
|------|------|
| `queryGuests(start, limit, filter?)` | 查询云主机列表 |
| `getGuest(guestID)` | 获取云主机详情 |
| `createGuest(poolID, system, config, timeout?)` | 创建云主机 |
| `tryCreateGuest(poolID, system, config)` | 异步创建云主机 |
| `deleteGuest(guestID, timeout?)` | 删除云主机 |
| `startGuest(guestID, media?, timeout?)` | 启动云主机 |
| `stopGuest(guestID, reboot, force, timeout?)` | 停止云主机 |

#### 资源配置

| 方法 | 说明 |
|------|------|
| `modifyGuestCPU(guestID, cores, timeout?)` | 修改 CPU |
| `modifyGuestMemory(guestID, memoryMB, timeout?)` | 修改内存 |
| `modifyGuestHostname(guestID, hostname, timeout?)` | 修改主机名 |
| `modifyPassword(guestID, user, password, timeout?)` | 修改密码 |
| `modifyAutoStart(guestID, enable, timeout?)` | 修改自动启动 |
| `addVolume(guestID, volume, timeout?)` | 添加磁盘卷 |
| `deleteVolume(guestID, tag, timeout?)` | 删除磁盘卷 |

#### 网络管理

| 方法 | 说明 |
|------|------|
| `addExternalInterface(guestID, macAddress, timeout?)` | 添加外部网卡 |
| `removeExternalInterface(guestID, macAddress, timeout?)` | 移除外部网卡 |
| `addInternalInterface(guestID, macAddress, timeout?)` | 添加内部网卡 |
| `removeInternalInterface(guestID, macAddress, timeout?)` | 移除内部网卡 |

#### 任务管理

| 方法 | 说明 |
|------|------|
| `startTask(cmd)` | 启动异步任务 |
| `executeTask(cmd, timeout?, interval?)` | 执行并等待任务 |
| `getTask(taskID)` | 获取任务详情 |
| `waitTask(taskID, timeout?, interval?)` | 等待任务完成 |
| `queryTasks(offset, pageSize)` | 查询任务列表 |

#### 集群管理

| 方法 | 说明 |
|------|------|
| `queryNodes()` | 查询节点列表 |
| `getNode(nodeID)` | 获取节点详情 |
| `addNode(config)` | 添加节点 |
| `removeNode(nodeID)` | 移除节点 |
| `enableNode(nodeID)` | 启用节点 |
| `disableNode(nodeID)` | 禁用节点 |

#### 资源池管理

| 方法 | 说明 |
|------|------|
| `queryComputePools()` | 查询计算资源池 |
| `getComputePool(poolID)` | 获取计算资源池详情 |
| `queryStoragePools()` | 查询存储池 |
| `queryAddressPools()` | 查询地址池 |

---

## 请求转发模块

**文件**: `src/request-forwarder.ts`

底层 HTTP 通信，处理认证和命令转发。

### 主要函数

| 函数 | 说明 |
|------|------|
| `authenticateByPassword(url, user, device, password)` | 密码认证请求 |
| `authenticateByToken(url, user, device, serial, algorithm, privateKey)` | 令牌认证请求 |
| `refreshAccessToken(url, user, device, refreshToken)` | 刷新访问令牌 |
| `fetchCommandResponse(url, accessToken, csrfToken, cmd)` | 发送命令获取响应 |
| `sendCommand(url, accessToken, csrfToken, cmd)` | 发送命令无响应 |
| `checkSystemStatus(url)` | 检查系统状态 |
| `initialSystem(url, user, password)` | 初始化系统 |

---

## 枚举模块

**文件**: `src/enums.ts`

定义所有枚举类型。

### 主要枚举

| 枚举 | 说明 |
|------|------|
| `controlCommandEnum` | 控制命令类型（CreateGuest, DeleteGuest 等） |
| `TaskType` | 任务类型 |
| `TaskStatus` | 任务状态（Pending, Running, Completed） |
| `GuestState` | 云主机状态（Stopped, Running 等） |
| `ResourceAccessLevel` | 资源访问级别 |
| `UserRole` | 用户角色（Super, Manager, User） |
| `NodeState` | 节点状态 |
| `ComputePoolStrategy` | 计算池分配策略 |

---

## 数据结构模块

**文件**: `src/data-defines.ts`

定义所有接口和类型。

### 主要接口

| 接口 | 说明 |
|------|------|
| `BackendResult<T>` | API 统一返回类型 |
| `AllocatedTokens` | 认证令牌集合 |
| `GuestConfig` | 云主机创建配置 |
| `GuestView` | 云主机视图 |
| `TaskData` | 任务数据 |
| `ClusterNode` | 集群节点 |
| `ComputePoolConfig` | 计算资源池配置 |
| `StoragePool` | 存储池 |
| `PaginationResult<T>` | 分页结果 |

---

## 工具函数模块

**文件**: `src/helper.ts`

提供辅助工具函数。

### 主要函数

| 函数 | 说明 |
|------|------|
| `generateNonce()` | 生成随机 nonce |
| `unmarshalResourceStatistics(data)` | 解析资源统计数据 |
| `unmarshalResourceUsage(data)` | 解析资源使用数据 |
| `unmarshalNodesResourceUsage(data)` | 解析节点资源使用 |
| `unmarshalPoolsResourceUsage(data)` | 解析资源池使用 |
| `unmarshalClusterResourceUsage(data)` | 解析集群资源使用 |

---

## 入口模块

**文件**: `src/index.ts`

公共 API 导出和便捷函数。

### 导出

导出所有模块的公共接口：
- `TaiyiConnector` 类
- 所有枚举
- 所有接口类型
- 工具函数

### 便捷函数

```typescript
async function newInsecureConnector(
  deviceID: string,
  accessString: string,
  backendHost: string,
  backendPort: number = 5851
): Promise<TaiyiConnector>
```

创建一个使用内存存储的连接器，仅用于开发测试。
