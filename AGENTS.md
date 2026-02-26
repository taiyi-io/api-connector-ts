
# AGENTS.md - 太一云 API 连接器 TypeScript

## AI辅助约束

**重要约束**：
- 对话内容、说明、描述、注释都需要使用简体中文
- 所有的AI辅助配置都必须添加制定的约束
- 使用 openspec 文档管理、跟踪项目情况，使用文档驱动的方式进行开发
- 进行规划、搜索、设计、开发时，必须先从 openspec 文档中获取相关信息
- 当相关代码发生变化时，必须及时更新 openspec 文档

---

## 项目概述

太一云 Control API 的 TypeScript 连接器库。提供全功能服务，涵盖认证、云主机配置、状态查询和集群管理等。

**包名**: `@taiyi-io/api-connector-ts`  
**模块系统**: CommonJS  
**目标版本**: ES6  
**包管理器**: Yarn 4.x

---

## 构建、检查和测试命令

```bash
# 安装依赖
yarn install

# 构建 (TypeScript 编译)
yarn build

# 代码检查 (ESLint + TypeScript)
yarn lint

# 运行所有测试
yarn test

# 运行单个测试文件
yarn test test/connector.basic.test.ts

# 运行匹配模式的测试
yarn test --filter "basic"

# 监视模式运行测试
yarn test --watch

# 生成文档
./gendoc.sh
```

### 测试配置

测试需要在 `.env` 中设置环境变量：
```env
BACKEND_HOST=<api主机地址>
BACKEND_PORT=5851
ACCESS_STRING=<访问令牌>
```

---

## 代码风格指南

### TypeScript 配置

- **严格模式**: 启用 (`"strict": true`)
- **声明文件**: 生成 (`.d.ts`)
- **模块系统**: CommonJS
- **目标版本**: ES6
- **源代码目录**: `src/`
- **输出目录**: `dist/`

### 命名规范

| 元素 | 规范 | 示例 |
|------|------|------|
| 变量 | camelCase | `accessToken`, `backendURL` |
| 函数 | camelCase | `authenticateByToken()`, `queryGuests()` |
| 私有字段 | 下划线前缀 | `_id`, `_authenticated`, `_backendURL` |
| 类 | PascalCase | `TaiyiConnector` |
| 接口 | PascalCase | `GuestConfig`, `BackendResult` |
| 枚举 | PascalCase | `TaskStatus`, `GuestState` |
| 枚举值 | PascalCase | `TaskStatus.Completed`, `GuestState.Running` |
| 类型别名 | PascalCase | `SetTokenHandler`, `GetTokenHandler` |
| API字段 (DTO) | snake_case | `access_token`, `created_time`, `guest_id` |
| 常量 | UPPER_SNAKE_CASE | `API_VERSION`, `NODE_RESOURCE_SNAPSHOT_FIELD_COUNT` |

### 文件组织

```
src/
  index.ts           # 公共导出，便捷函数
  connector.ts       # 主 TaiyiConnector 类
  enums.ts           # 所有枚举定义
  data-defines.ts    # 数据结构和接口
  request-params.ts  # API 请求/响应类型
  request-forwarder.ts # 底层 API 通信
  helper.ts          # 工具函数
  *-store.ts         # 令牌存储实现
```

### 导入风格

```typescript
// 分组导入：先外部包，后内部模块
import { createId } from "@paralleldrive/cuid2";
import fnv1a from "@sindresorhus/fnv1a";

import { controlCommandEnum, TaskStatus } from "./enums";
import { BackendResult, GuestConfig } from "./data-defines";
import { fetchCommandResponse } from "./request-forwarder";
```

### 类型定义

**所有公共 API 使用显式类型：**
```typescript
// 正确
public async queryGuests(
  start: number,
  limit: number,
  filter?: GuestFilter
): Promise<BackendResult<PaginationResult<GuestView>>> { }

// 错误 - 避免隐式 any
public async queryGuests(start, limit, filter?) { }
```

**使用接口定义数据结构：**
```typescript
export interface GuestConfig {
  name: string;
  cores: number;
  memory: number;  // MB
  disks: number[]; // MB, [系统盘, 数据盘0, 数据盘1, ...]
  access_level: ResourceAccessLevel;
}
```

### 错误处理模式

所有 API 方法返回 `BackendResult<T>`：
```typescript
export interface BackendResult<T = undefined> {
  data?: T;
  error?: string;
  unauthenticated?: boolean;
}

// 使用模式
const result = await connector.queryGuests(0, 10);
if (result.error) {
  throw new Error(result.error);
}
if (result.unauthenticated) {
  // 处理重新认证
}
const guests = result.data!;
```

### 异步/等待

- 所有异步操作使用 `async/await`
- 服务端专用文件标记 `"use server";` 指令
- API 方法返回 `Promise<BackendResult<T>>`

### 文档 (TSDoc)

所有公共 API 使用 TSDoc 语法：
```typescript
/**
 * 创建云主机
 * @param poolID - 计算资源池 ID
 * @param system - 目标系统模板
 * @param config - 云主机配置
 * @param timeoutSeconds - 超时时间（秒），默认 300
 * @returns 成功时返回云主机 ID
 * @example
 * const result = await connector.createGuest("default", "", config);
 */
export async function createGuest(...): Promise<BackendResult<string>> { }
```

---

## 测试指南

### 测试框架：Vitest

```typescript
import { expect, test, describe, beforeEach } from "vitest";
import { TaiyiConnector, GuestFilter } from "../src/";
import { getTestConnector } from "./utils";

describe("TaiyiConnector 基础测试", () => {
  let connector: TaiyiConnector;

  beforeEach(async () => {
    connector = await getTestConnector();
  });

  test("应该成功查询云主机", async () => {
    const result = await connector.queryGuests(0, 10, {});
    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data!.total).toBeTypeOf("number");
  });
});
```

### 测试文件命名

- 测试文件：`*.test.ts` 位于 `test/` 目录
- 工具文件：`test/utils.ts`

---

## 关键模式

### 连接器初始化

```typescript
const connector = new TaiyiConnector(backendHost, backendPort, deviceID);
connector.bindCallback(storeID, setTokens, getTokens, stateChange);
await connector.authenticateByToken(accessString);
```

### 异步任务模式

长时间运行的操作使用 `tryXXX` + `waitTask`：
```typescript
// 启动异步任务
const taskResult = await connector.tryCreateGuest(poolID, system, config);
if (taskResult.error) { throw new Error(taskResult.error); }

// 等待完成
const taskData = await connector.waitTask(taskResult.data!, timeoutSeconds);
if (taskData.error) { throw new Error(taskData.error); }

const guestID = taskData.data!.guest;
```

或使用便捷封装：
```typescript
const result = await connector.createGuest(poolID, system, config, 300);
```

### 枚举使用

```typescript
import { GuestState, ResourceAccessLevel, UserRole } from "./enums";

const config: GuestConfig = {
  name: "my-vm",
  cores: 2,
  memory: 2048,
  disks: [20480],
  access_level: ResourceAccessLevel.Private,
};
```

---

## 注意事项

### 应该做

- 所有 API 方法返回 `BackendResult<T>`
- 为参数和返回值使用显式 TypeScript 类型
- 使用 TSDoc 记录公共 API
- DTO 字段使用 snake_case
- 处理 `unauthenticated` 响应进行令牌刷新
- 使用 `generateNonce()` 进行加密操作

### 不应该做

- 使用 `any` 类型 - 使用正确的接口
- 使用 `@ts-ignore` 或 `@ts-expect-error`
- 从 API 方法抛出异常（使用 `BackendResult.error`）
- 混用命名规范（仅 DTO 字段使用 snake_case）
- 从 `dist/` 导入 - 开发时始终从 `src/` 导入

---

## 依赖

**运行时：**
- `@noble/ed25519` - Ed25519 加密
- `@paralleldrive/cuid2` - ID 生成
- `@sindresorhus/fnv1a` - 哈希函数
- `next`, `react`, `react-dom` - NextJS 集成

**开发：**
- `typescript` ^5.9
- `vitest` - 测试
- `eslint` + `@typescript-eslint/*` - 代码检查
- `eslint-plugin-tsdoc` - 文档检查
- `typedoc` - 文档生成
