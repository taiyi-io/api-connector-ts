# Change Log

## [0.12.0] - 2026-04-20

### 修复

- `tryDeleteGuestProfile` 改用 `sendCommand` 直接发送并处理 `unauthenticated` 重试，修复令牌过期时无法自动刷新的问题
- `tryGetGuestProfile` 返回值从 `resp.data?.profile` 改为 `resp.data` 整体，与后端响应结构一致
- `ControlModifyGuestProfileParams` / `ControlDeleteGuestProfileParams` / `ControlGetGuestProfileParams` 中 `id` 字段重命名为 `profile_id`，与后端参数契约对齐

### 新增

- `ModifyGuestCPUPriority` / `ModifyGuestDiskQoS` / `ModifyGuestNetworkQoS` 枚举值
- `ControlModifyGuestCPUPriorityParams` / `ControlModifyGuestDiskQoSParams` / `ControlModifyGuestNetworkQoSParams` 参数接口
- `connector.modifyGuestCPUPriority` / `modifyGuestDiskQoS` / `modifyGuestNetworkQoS` 及对应 `try` 版本（共 6 个方法）
- `TrafficQuotaSpec` / `TrafficQuotaState` / `GuestTrafficInfo` 数据接口
- `connector.tryQueryGuestTraffic` / `tryResetGuestTraffic` / `tryModifyGuestTrafficQuota` / `tryExtendGuestTrafficTemp`（共 4 个方法）
- `GuestProfile` 接口及 7 个 `tryXxx` 方法（`tryCreateGuestProfile` / `tryModifyGuestProfile` / `tryDeleteGuestProfile` / `tryGetGuestProfile` / `tryQueryGuestProfiles` / `tryCreateGuestFromProfile` / `tryReplaceGuestConfig`）
- **双栈地址透传**：`GuestStatus` / `GuestView` 接口新增 `host_address_v6?: string` 可选字段，与 node 侧跨节点双栈扩展契约对齐，便于 portal 等调用方在 v4 缺失时回退显示 IPv6 地址

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
