## Context

`TaiyiConnector`（`src/connector.ts`）是 TypeScript 客户端的核心类，封装了对 Go 后端 Control API 的所有调用。后端通过 `dispatchCommand` 分发命令，每条命令要么是**同步**（直接返回结果）要么是**异步**（返回 `warpTaskID`，调用方需轮询任务状态）。

当前 TS 连接器存在以下问题：

1. **同步/异步分类错误**：`modify_guest_security_policy`、`reset_guest_security_policy` 及全部地址池操作（`create/modify/delete_address_pool`、`add/remove_address_range`）在 Go 后端是同步命令，但 TS 连接器为它们实现了 `tryXxx`（返回 task ID）包装，导致 "invalid task" 运行时错误。

2. **接口冗余**：地址池操作同时暴露了正确的同步版本（`createAddressPool` 等，使用 `sendCommand`）和错误的异步版本（`tryCreateAddressPool` 等，使用 `requestCommandResponse` 期望拿到 task ID），造成 API 面混乱。

3. **测试缺失**：旧测试文件已删除，无任何覆盖。

## Goals / Non-Goals

**Goals:**

- 修复 7 个方法的同步/异步分类（移除错误的 `tryXxx` 版本，修正 `modifyGuestSecurityPolicy`/`resetGuestSecurityPolicy` 为 `sendCommand`）
- 确认并保持已正确实现的 35 个异步接口不变
- 建立完整集成测试体系，直连真实后端（无 Mock），覆盖全部模块 CRUD
- 补齐遗漏的 Go 后端接口和参数（以对比结果为准）
- 同步更新文档

**Non-Goals:**

- 不重构 `TaiyiConnector` 的整体架构（认证、心跳、令牌刷新机制不变）
- 不引入新的外部依赖
- 不修改 `request-forwarder.ts` 的底层传输逻辑
- 不添加单元测试（保持纯集成测试策略）

## Decisions

### 决策 1：直接删除错误的 `tryXxx` 方法，不做兼容层

**选项 A（采用）**：直接删除 `tryModifyGuestSecurityPolicy`、`tryResetGuestSecurityPolicy`、`tryCreateAddressPool`、`tryModifyAddressPool`、`tryDeleteAddressPool`、`tryAddAddressRange`、`tryRemoveAddressRange`，无兼容过渡。

**选项 B（放弃）**：保留旧方法并标记为 deprecated，下一版本再删除。

**理由**：这些方法是错误的（调用时必然失败），保留没有意义。版本号应从 0.11.x 升至 0.12.0 以标记 breaking change。

---

### 决策 2：`modifyGuestSecurityPolicy`/`resetGuestSecurityPolicy` 签名简化

**选项 A（采用）**：去掉 `timeoutSeconds` 参数，直接调用 `sendCommand`（同步命令无需超时控制）。

**选项 B（放弃）**：保留 `timeoutSeconds` 参数但忽略它，降低破坏性。

**理由**：参数语义与行为不符会造成混淆，趁 breaking change 一并清理。

---

### 决策 3：集成测试使用 `singleFork: true` 串行执行

已有 `vitest.config.js` 配置，维持不变。原因是并发测试会导致令牌刷新竞争和资源创建冲突。

---

### 决策 4：测试按模块分目录，每个模块独立文件

```
test/
├── setup.ts                    # getTestConnector() 工厂
├── helpers/resource-guard.ts   # 前置资源检查
├── basic/                      # 认证、系统、任务
├── cluster/                    # 节点、计算池、存储池
├── guest/                      # 云主机生命周期、配置、网络、卷、媒体、快照
├── file/                       # ISO、磁盘镜像
├── address-pool/               # 地址池
├── security/                   # 安全策略
├── user/                       # 用户组、令牌、访问权限
├── monitor/                    # 监控统计
├── system-config/              # 节点配置、许可证、SSH密钥、系统模板
├── import/                     # 导入源
└── migration/                  # 迁移（stub）
```

每个测试模块开头检查所需资源，不满足则 `describe.skip()`，避免无效失败。

---

### 决策 5：测试配置通过 `.env.test` 注入

变量：`BACKEND_HOST`、`BACKEND_PORT`、`ACCESS_STRING`、`DEVICE_ID`。`setup.ts` 使用 `dotenv` 加载（已在依赖中）。

## Risks / Trade-offs

- **Breaking API** → 消费者需检查是否使用了被删除的 7 个方法。缓解：version bump + changelog 说明。
- **集成测试依赖真实环境** → CI 需要配置 `.env.test` 和可达后端。测试不满足条件时自动 skip 而非 fail，降低 CI 噪音。
- **接口对比遗漏** → Go 后端 ~180 个命令数量大，人工对比可能有遗漏。缓解：按模块逐一比对，结果记录在 `api-completeness` spec 中。
- **地址池 `tryXxx` 删除** → 部分使用者可能依赖这些错误方法（即使实际上无法成功）。缓解：同上 breaking change 说明。

## Migration Plan

1. 修改 `src/connector.ts`：删除 7 个错误方法，修正 2 个签名
2. 运行 `yarn build` 确认编译无误
3. 补齐遗漏接口（如有）
4. 新建 `test/` 目录结构和所有测试文件
5. 更新 `vitest.config.js` 加载 `.env.test`
6. 提供 `.env.test.example`
7. 更新 `openspec/concepts.md`、`openspec/modules.md`、`REFERENCE.md`
8. 版本号 bump 到 0.12.0

**回滚**：所有变更在同一 feature 分支，未合并前可直接废弃分支。

## Open Questions

- Go 后端是否有 TS 连接器完全缺失的命令？（需要在实施阶段逐一比对 `dispatchCommand` switch-case）
- 测试环境是否有现成的计算池和存储池可用，以支持云主机相关测试？（影响测试 skip 逻辑设计）
