# Change Log

## [0.12.0] - 2026-04-20

### 修复

- `tryDeleteGuestProfile` 改用 `sendCommand` 直接发送并处理 `unauthenticated` 重试，修复令牌过期时无法自动刷新的问题
- `tryGetGuestProfile` 返回值从 `resp.data?.profile` 改为 `resp.data` 整体，与后端响应结构一致
- `ControlModifyGuestProfileParams` / `ControlDeleteGuestProfileParams` / `ControlGetGuestProfileParams` 中 `id` 字段重命名为 `profile_id`，与后端参数契约对齐
- 新增内部 `extractTaskID` 辅助函数，兼容后端两种响应形态 `{data:"<id>"}` 与 `{data:{id:"<id>"}}`，修复 `tryCreateGuestFromProfile` 等 6 个方法（`tryResetGuestTraffic` / `tryModifyGuestTrafficQuota` / `tryExtendGuestTrafficTemp` / `tryCreateGuestProfile` / `tryModifyGuestProfile` / `tryCreateGuestFromProfile`）在后端直接以字符串形式返回任务 ID 时拿不到有效值的问题
- `tryReplaceGuestConfig` 改用 `sendCommand` 直发，兼容后端将该命令实现为同步空响应（`{}`）的情形，避免 `no data in task response` 误报

### 新增

- `ModifyGuestCPUPriority` / `ModifyGuestDiskQoS` / `ModifyGuestNetworkQoS` 枚举值
- `ControlModifyGuestCPUPriorityParams` / `ControlModifyGuestDiskQoSParams` / `ControlModifyGuestNetworkQoSParams` 参数接口
- `connector.modifyGuestCPUPriority` / `modifyGuestDiskQoS` / `modifyGuestNetworkQoS` 及对应 `try` 版本（共 6 个方法）
- `TrafficQuotaSpec` / `TrafficQuotaState` / `GuestTrafficInfo` 数据接口
- `connector.tryQueryGuestTraffic` / `tryResetGuestTraffic` / `tryModifyGuestTrafficQuota` / `tryExtendGuestTrafficTemp`（共 4 个方法）
- `GuestProfile` 接口及 7 个 `tryXxx` 方法（`tryCreateGuestProfile` / `tryModifyGuestProfile` / `tryDeleteGuestProfile` / `tryGetGuestProfile` / `tryQueryGuestProfiles` / `tryCreateGuestFromProfile` / `tryReplaceGuestConfig`）
- **双栈地址透传**：`GuestStatus` / `GuestView` 接口新增 `host_address_v6?: string` 可选字段，与 node 侧跨节点双栈扩展契约对齐，便于 portal 等调用方在 v4 缺失时回退显示 IPv6 地址

### 测试

- `test/guest/config.test.ts`：新增 QoS（CPU 优先级 / 磁盘 QoS / 网络 QoS）3 个用例及 `host_address_v6` 弱类型断言
- `test/guest/traffic-quota.test.ts`：新增 TrafficQuota 4 方法的端到端集成测试
- `test/guest/profile.test.ts`：新增 GuestProfile CRUD + 基于套餐创建/替换云主机共 7 个用例（按 `profile_id` 新契约编写）
- `test/cluster/node.test.ts`：补齐 `host_ipv6` / `published_host_ipv6` 弱类型断言
- `test/file/disk-image.test.ts` / `test/file/iso.test.ts` / `test/security/security-policy.test.ts`：增加 `beforeAll` 幂等预清理，修正 `copySecurityPolicy` 调用参数
- `vitest.config.js`：迁移至 Vitest 4 顶层 `fileParallelism: false`，解决并发刷新 Token 冲突

## [0.11.0] - 2026-02-27

### 新增

- 高可用地址池安全策略管理功能
- 安全策略组的增删改查接口
- 云主机安全策略绑定与解绑接口
- 安全规则管理接口
- 地址池管理新版API文档

### 改进

- 完善单元测试，覆盖率达到85%以上
- 更新API文档

## [0.10.1] - 2025-10-15

### 修复

- 修复 nextjs 安全漏洞
- 移除多余的 console.log 输出

## [0.10.0] - 2025-09-26

### 新增

- first commit
