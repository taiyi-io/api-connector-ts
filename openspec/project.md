# 项目上下文

## 项目概述

**项目名称**: 太一云 API 连接器 TypeScript  
**包名**: `@taiyi-io/api-connector-ts`  
**版本**: 0.10.1  
**许可证**: MIT

太一云 Control API 的 TypeScript 连接器库。提供全功能服务，涵盖认证、云主机配置、状态查询和集群管理等。官方管理门户同样基于本接口，使用本接口可使用与官方版本一致的功能，便于系统集成与定制开发。

## 技术栈

- **语言**: TypeScript 5.9+
- **模块系统**: CommonJS
- **目标版本**: ES6
- **包管理器**: Yarn 4.x
- **测试框架**: Vitest
- **代码检查**: ESLint + @typescript-eslint
- **文档生成**: TypeDoc

### 运行时依赖
- `@noble/ed25519` - Ed25519 加密
- `@paralleldrive/cuid2` - ID 生成
- `@sindresorhus/fnv1a` - 哈希函数
- `next`, `react`, `react-dom` - NextJS 集成

### 开发依赖
- `typescript` - TypeScript 编译器
- `vitest` - 测试框架
- `eslint` + `@typescript-eslint/*` - 代码检查
- `eslint-plugin-tsdoc` - 文档检查
- `typedoc` - 文档生成

## 项目约定

### 代码风格

- **严格模式**: 启用 (`"strict": true`)
- **声明文件**: 生成 (`.d.ts`)
- **导入分组**: 先外部包，后内部模块

#### 命名规范

| 元素 | 规范 | 示例 |
|------|------|------|
| 变量 | camelCase | `accessToken`, `backendURL` |
| 函数 | camelCase | `authenticateByToken()`, `queryGuests()` |
| 私有字段 | 下划线前缀 | `_id`, `_authenticated` |
| 类 | PascalCase | `TaiyiConnector` |
| 接口 | PascalCase | `GuestConfig`, `BackendResult` |
| 枚举 | PascalCase | `TaskStatus`, `GuestState` |
| API 字段 (DTO) | snake_case | `access_token`, `created_time` |
| 常量 | UPPER_SNAKE_CASE | `API_VERSION` |

### 架构模式

- 所有 API 方法返回 `BackendResult<T>` 包装结果
- 使用 `async/await` 进行异步操作
- **异步 API**: 长时间运行操作（如创建云主机）控制节点会返回 Task ID。TypeScript 中应提供 `tryXXX` 返回任务 ID，并提供封装了 `waitTask` 的高级方法。
- **同步 API**: 对立刻完成的操作（如删除安全策略组、修改地址池），控制节点同步返回操作结果。TypeScript 中**严禁**使用 `tryXXX` 模式，应直接调用 `sendCommand` 或 `requestCommandResponse`，避免因把对象 `ID` 误当成 `Task ID` 送去 `waitTask` 导致超时或报错。
- 令牌存储与连接器解耦，调用者需实现 `SetTokenHandler` 和 `GetTokenHandler`

### 测试策略

- 测试文件放置于 `test/` 目录
- 测试文件命名：`*.test.ts`
- 测试需要配置环境变量（`.env`）
- 使用 `getTestConnector()` 工具函数初始化测试连接器

### Git 工作流

- 主分支：main
- 提交消息使用简体中文或英文
- 提交前运行 `yarn lint` 和 `yarn test`

## 领域上下文

本连接器用于与太一云虚拟化平台交互，主要领域概念包括：

- **云主机 (Guest)**: 虚拟机实例
- **计算资源池 (Compute Pool)**: 节点分组和资源调度
- **存储池 (Storage Pool)**: 磁盘卷管理
- **地址池 (Address Pool)**: IP 地址分配
- **任务 (Task)**: 异步操作跟踪
- **认证 (Authentication)**: 密码/令牌认证机制

## 重要约束

- 所有 API 响应使用 `BackendResult<T>` 封装，不抛出异常
- 禁止使用 `any` 类型
- 禁止使用 `@ts-ignore` 或 `@ts-expect-error`
- DTO 字段使用 snake_case，内部字段使用 camelCase
- 开发时从 `src/` 导入，不从 `dist/` 导入

## 外部依赖

- **太一云 Control API**: 后端服务 API（默认端口 5851）
- **认证服务**: 支持密码认证和令牌认证

## 相关文档

详细规范文档请参阅 `openspec/` 目录：

- `structure.md` - 项目结构描述
- `concepts.md` - 核心设计和架构
- `modules.md` - 核心模块和函数入口
- `deployment.md` - 部署配置和环境要求
