# 项目结构

## 目录结构

```
api-connector-ts/
├── src/                          # 源代码目录
│   ├── index.ts                  # 公共导出入口，便捷函数
│   ├── connector.ts              # 主 TaiyiConnector 类
│   ├── enums.ts                  # 所有枚举定义
│   ├── data-defines.ts           # 数据结构和接口定义
│   ├── request-params.ts         # API 请求/响应类型
│   ├── request-forwarder.ts      # 底层 API 通信
│   ├── helper.ts                 # 工具函数
│   ├── insecure-store.ts         # 非安全令牌存储实现
│   ├── next-connector.ts         # NextJS 适配连接器
│   └── next-secure-store.ts      # NextJS 安全令牌存储
│
├── test/                         # 测试目录
│   ├── *.test.ts                 # 测试文件
│   └── utils.ts                  # 测试工具函数
│
├── dist/                         # 编译输出目录（生成）
│   ├── *.js                      # 编译后的 JavaScript
│   └── *.d.ts                    # TypeScript 类型声明
│
├── openspec/                     # OpenSpec 规范文档
│   ├── AGENTS.md                 # AI 辅助说明
│   ├── project.md                # 项目上下文
│   ├── structure.md              # 项目结构（本文件）
│   ├── concepts.md               # 核心概念
│   ├── modules.md                # 核心模块
│   ├── deployment.md             # 部署配置
│   ├── specs/                    # 能力规范
│   └── changes/                  # 变更提案
│
├── AGENTS.md                     # 根目录 AI 辅助配置
├── README.md                     # 项目说明文档
├── package.json                  # 包配置
├── tsconfig.json                 # TypeScript 配置
├── eslint.config.mjs             # ESLint 配置
├── vitest.config.ts              # Vitest 测试配置
├── typedoc.json                  # TypeDoc 文档配置
├── gendoc.sh                     # 文档生成脚本
└── .env                          # 环境变量（不提交）
```

## 源代码文件说明

### 入口文件

| 文件 | 说明 |
|------|------|
| `index.ts` | 公共导出入口，导出所有模块并提供 `newInsecureConnector` 便捷函数 |

### 核心文件

| 文件 | 说明 |
|------|------|
| `connector.ts` | 主类 `TaiyiConnector`，提供所有 API 方法 |
| `enums.ts` | 所有枚举定义（命令类型、任务状态、资源类型等） |
| `data-defines.ts` | 数据结构和接口定义（GuestConfig、BackendResult 等） |
| `request-params.ts` | API 请求/响应类型定义 |
| `request-forwarder.ts` | 底层 HTTP 通信，认证和命令转发 |
| `helper.ts` | 工具函数（nonce 生成、数据解析等） |

### 令牌存储实现

| 文件 | 说明 |
|------|------|
| `insecure-store.ts` | 内存存储，仅用于开发测试 |
| `next-secure-store.ts` | NextJS Cookie + LocalStorage 安全存储 |
| `next-connector.ts` | NextJS 框架适配的连接器封装 |

## 配置文件说明

| 文件 | 说明 |
|------|------|
| `tsconfig.json` | TypeScript 编译配置（严格模式、ES6 目标） |
| `eslint.config.mjs` | ESLint 代码检查规则 |
| `vitest.config.ts` | Vitest 测试框架配置 |
| `typedoc.json` | API 文档生成配置 |
| `.env` | 测试环境变量（BACKEND_HOST、ACCESS_STRING 等） |

## 输出文件

编译后的文件输出到 `dist/` 目录：

- `*.js` - CommonJS 模块
- `*.d.ts` - TypeScript 类型声明
- `index.js` - 包入口点
