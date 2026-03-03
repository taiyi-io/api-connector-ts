## Why

TypeScript API 连接器与 Go 后端（`node/service/control_api.go`）在同步/异步操作分类上存在不一致：部分后端同步命令被错误地实现为异步（带 `tryXxx` + `waitTask`），导致调用时触发 "invalid task" 错误；同时旧测试已删除、新测试未建立，无法验证接口正确性。

## What Changes

- **BREAKING** 移除 `tryModifyGuestSecurityPolicy`、`tryResetGuestSecurityPolicy` 方法，将 `modifyGuestSecurityPolicy`/`resetGuestSecurityPolicy` 改为同步调用（`sendCommand`），去掉 `timeoutSeconds` 参数
- **BREAKING** 移除地址池相关的错误异步版本：`tryCreateAddressPool`、`tryModifyAddressPool`、`tryDeleteAddressPool`、`tryAddAddressRange`、`tryRemoveAddressRange`，仅保留同步版本
- 审查全部 35 个异步接口（`tryXxx` + `waitTask`），确认它们与 Go 后端 `warpTaskID` 分类一致
- 对比 Go 后端 ~180 个命令，补齐 TS 连接器遗漏的接口和参数差异
- 建立完整的集成测试体系（直连后端，无 Mock），覆盖所有模块的 CRUD 生命周期
- 更新 OpenSpec 文档（concepts、modules、REFERENCE），反映修复后的同步/异步分类

## Capabilities

### New Capabilities

- `sync-async-fix`: 修复同步/异步操作分类，移除错误的异步包装方法，确保与 Go 后端一致
- `api-completeness`: 对比 Go 后端所有命令，补齐遗漏的接口和参数
- `integration-tests`: 建立完整的集成测试体系，覆盖认证、集群、云主机、文件、地址池、安全策略、用户等所有模块
- `api-docs-sync`: 同步更新 OpenSpec 文档和 REFERENCE.md，反映接口变更

### Modified Capabilities

## Impact

- **src/connector.ts**: 主要修改文件，移除错误的 `tryXxx` 方法，修改同步调用签名，可能新增遗漏接口
- **src/enums.ts / data-defines.ts / request-params.ts**: 可能补充遗漏的枚举、类型和请求参数定义
- **test/**: 全部新建，~20 个测试文件覆盖所有模块
- **openspec/**: 更新 concepts.md、modules.md、REFERENCE.md
- **API 兼容性**: `tryModifyGuestSecurityPolicy` 等 7 个方法被移除属于 **破坏性变更**，消费者需要更新调用代码
