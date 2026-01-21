# 核心概念

## 设计理念

本连接器库遵循以下核心设计理念：

1. **零信任安全模型** - 除系统状态查询外，所有操作都需要先完成认证
2. **令牌存储解耦** - 安全令牌存储与连接器分离，调用者根据业务场景实现存储策略
3. **统一结果封装** - 所有 API 方法返回 `BackendResult<T>`，不抛出异常
4. **异步任务模式** - 长时间操作使用任务机制，支持进度查询和超时控制

## 核心数据结构

### BackendResult\<T\>

所有 API 方法的统一返回类型：

```typescript
export interface BackendResult<T = undefined> {
  data?: T;              // 成功时的数据
  error?: string;        // 错误信息
  unauthenticated?: boolean;  // 认证失败标识
}
```

使用模式：
```typescript
const result = await connector.queryGuests(0, 10);
if (result.error) {
  // 处理错误
}
if (result.unauthenticated) {
  // 处理认证失效
}
const data = result.data;  // 使用数据
```

### AllocatedTokens

认证成功后分配的令牌集合：

```typescript
export interface AllocatedTokens {
  user: string;             // 用户标识
  roles: UserRole[];        // 用户角色
  access_token: string;     // 访问令牌
  refresh_token: string;    // 刷新令牌
  csrf_token: string;       // CSRF 令牌
  public_key: string;       // 公钥
  algorithm: string;        // 算法
  access_expired_at: string;   // 访问令牌过期时间
  refresh_expired_at: string;  // 刷新令牌过期时间
}
```

### GuestConfig

创建云主机的配置：

```typescript
export interface GuestConfig {
  name: string;           // 名称
  cores: number;          // CPU 核心数
  memory: number;         // 内存 (MB)
  disks: number[];        // 磁盘大小数组 (MB) [系统盘, 数据盘...]
  access_level: ResourceAccessLevel;  // 访问权限级别
  source_image?: string;  // 源镜像（可选）
  auto_start?: boolean;   // 自动启动（可选）
  cloud_init?: ControlCloudInitConfig;  // Cloud-Init 配置（可选）
  qos?: GuestQoS;         // QoS 配置（可选）
}
```

### TaskData

异步任务数据：

```typescript
export interface TaskData {
  id: string;            // 任务 ID
  type: TaskType;        // 任务类型
  status: TaskStatus;    // 任务状态
  progress?: number;     // 进度 (0-100)
  error?: string;        // 错误信息
  guest?: string;        // 关联的云主机 ID
  // ... 其他字段
}
```

## 主要流程

### 认证流程

```
1. 创建连接器实例
   └─> new TaiyiConnector(host, port, deviceID)

2. 绑定令牌存储回调
   └─> connector.bindCallback(storeID, setTokens, getTokens, stateChange)

3. 执行认证
   ├─> authenticateByPassword(user, password)  // 密码认证
   └─> authenticateByToken(accessString)       // 令牌认证

4. 令牌自动刷新
   └─> 内部定时器自动在过期前刷新 access_token
```

### 异步任务流程

对于创建云主机、镜像等耗时操作：

```
1. 发起异步请求
   └─> tryCreateGuest(poolID, system, config)
       └─> 返回 taskID

2. 等待任务完成
   └─> waitTask(taskID, timeoutSeconds)
       ├─> 轮询任务状态
       └─> 返回 TaskData（包含结果）

3. 或使用便捷封装
   └─> createGuest(poolID, system, config, timeout)
       └─> 内部自动执行 try + wait
```

### API 调用流程

```
1. 构建控制命令
   └─> ControlCommandRequest

2. 发送请求
   └─> requestCommandResponse(cmd)
       ├─> 使用 access_token 认证
       └─> 失败时自动尝试刷新令牌

3. 解析响应
   └─> ControlCommandResponse
       └─> 封装为 BackendResult<T>
```

## 架构概述

```
┌─────────────────────────────────────────────────────────┐
│                      应用层                               │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │ NextJS 应用     │  │ Node.js 应用    │               │
│  └────────┬────────┘  └────────┬────────┘               │
└───────────┼─────────────────────┼───────────────────────┘
            │                     │
┌───────────┼─────────────────────┼───────────────────────┐
│           ▼                     ▼        连接器层         │
│  ┌─────────────────────────────────────────────┐        │
│  │              TaiyiConnector                  │        │
│  │  - 认证管理                                   │        │
│  │  - API 方法封装                               │        │
│  │  - 令牌刷新                                   │        │
│  └──────────────────────┬──────────────────────┘        │
│                         │                                │
│  ┌──────────────────────┼──────────────────────┐        │
│  │                      ▼                       │        │
│  │           request-forwarder                  │        │
│  │  - HTTP 请求                                  │        │
│  │  - 签名验证                                   │        │
│  └──────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│                   太一云 Control API                      │
│                   (端口 5851)                             │
└─────────────────────────────────────────────────────────┘
```

## 基本用例

### 1. 初始化并认证

```typescript
const connector = new TaiyiConnector(host, port, deviceID);
connector.bindCallback(storeID, setTokens, getTokens, stateChange);
const result = await connector.authenticateByToken(accessString);
```

### 2. 查询云主机

```typescript
const result = await connector.queryGuests(0, 10, {
  by_state: true,
  state: GuestState.Running
});
if (!result.error) {
  console.log(`共 ${result.data.total} 台云主机`);
}
```

### 3. 创建云主机

```typescript
const config: GuestConfig = {
  name: "my-vm",
  cores: 2,
  memory: 2048,
  disks: [20480],
  access_level: ResourceAccessLevel.Private
};
const result = await connector.createGuest("default", "", config, 300);
```

### 4. 管理云主机生命周期

```typescript
// 启动
await connector.startGuest(guestID);
// 停止
await connector.stopGuest(guestID, false, false);
// 删除
await connector.deleteGuest(guestID);
```
