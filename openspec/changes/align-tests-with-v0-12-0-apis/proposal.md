## Why

v0.11.0 → v0.12.0 期间 SDK 新增了云主机 QoS、流量限额（TrafficQuota）、套餐（GuestProfile）以及 IPv6 双栈字段等接口变更（共 17 个新方法、13 个新枚举命令、4 个新数据类型、若干字段扩展），但 `test/` 下尚未补齐任何对应的集成测试，存在回归风险；同时 `ControlModifyGuestProfileParams`/`DeleteGuestProfileParams`/`GetGuestProfileParams` 将 `id` 字段重命名为 `profile_id`，需在测试中按新契约覆盖，避免未来消费方因字段命名漂移而踩坑。

## What Changes

- 扩展 `test/guest/config.test.ts`，补齐 `modifyGuestCPUPriority`、`modifyGuestDiskQoS`、`modifyGuestNetworkQoS` 三个 QoS 方法的集成测试
- 新增 `test/guest/traffic-quota.test.ts`，覆盖 `tryQueryGuestTraffic`、`tryModifyGuestTrafficQuota`、`tryExtendGuestTrafficTemp`、`tryResetGuestTraffic` 四个方法
- 新增 `test/guest/profile.test.ts`，覆盖 7 个 GuestProfile 方法（Create/Modify/Delete/Get/Query/CreateGuestFromProfile/ReplaceGuestConfig），并按 `profile_id` 参数约定编写
- 在相关节点/云主机回读断言中对 `host_address_v6`、`host_ipv6`、`published_host_ipv6` 做"存在即 string"的弱类型校验
- 清理与新接口契约冲突的过时测试用例（若有）
- 不允许 `it.skip`：所有新用例必须在 `.env` 指向的 v0.12.0 后端严格跑通
- 伴随对齐：SDK 在 7 个 `tryXxx` 方法中抽取 `extractTaskID` 辅助函数以兼容后端两种响应形态（`{data:"<id>"}` 与 `{data:{id:"<id>"}}`），`tryReplaceGuestConfig` 改走 `sendCommand` 兼容同步空响应；`vitest.config.js` 迁移到 Vitest 4 的 `fileParallelism: false` 顶层配置

## Capabilities

### New Capabilities

- `guest-qos-tests`: 覆盖云主机 CPU 优先级、磁盘 QoS、网络 QoS 修改方法的集成测试
- `guest-traffic-quota-tests`: 覆盖云主机流量限额查询/修改/临时扩容/重置的集成测试
- `guest-profile-tests`: 覆盖云主机套餐的 CRUD、基于套餐创建云主机、替换配置等行为的集成测试
- `dualstack-field-assertions`: 针对 `GuestStatus`/`GuestView`/`NodeData` 的 IPv6 字段在回读断言中的类型校验

### Modified Capabilities

## Impact

- **test/guest/config.test.ts**：新增 3 个 QoS 相关 `it`
- **test/guest/traffic-quota.test.ts**：新增文件，fixture 独立创建/清理 guest
- **test/guest/profile.test.ts**：新增文件，fixture 独立创建/清理 profile + guest
- **test/cluster/**、**test/guest/lifecycle.test.ts** 等：在合适的回读处补充 IPv6 字段类型弱断言
- **后端依赖**：`.env` 指向的后端必须支持 v0.12.0 命令集，否则测试失败
- **无源代码变更**：本次 change 仅涉及测试与文档
