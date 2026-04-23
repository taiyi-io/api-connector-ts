## ADDED Requirements

### Requirement: 查询云主机流量配额

集成测试 SHALL 通过 `tryQueryGuestTraffic` 获取一个新建云主机的流量信息，并对必选字段做类型断言。

#### Scenario: 初始查询返回必选字段

- **WHEN** 测试对新建 guest 调用 `tryQueryGuestTraffic(guestID)`
- **THEN** `result.error` 为 `undefined`，且 `result.data.guest_id`、`effective_limit`、`used_bytes`、`usage_percent` 均为合法类型（string/number）

### Requirement: 修改云主机流量配额

集成测试 SHALL 通过 `tryModifyGuestTrafficQuota` 设置一份完整 `TrafficQuotaSpec`，并通过再次查询校验生效。

#### Scenario: 设置月度限额并回查

- **WHEN** 测试用 `{enabled:true, limit_bytes, count_mode:'both', cycle_mode:'rolling-days', cycle_days:30, over_action:'alert'}` 调用 `tryModifyGuestTrafficQuota`
- **AND** 随后再次调用 `tryQueryGuestTraffic`
- **THEN** 两次调用均 `error` 为 `undefined`，回查数据中 `spec.enabled` 为 `true` 且 `spec.limit_bytes` 与提交值一致

### Requirement: 临时扩容流量配额

集成测试 SHALL 通过 `tryExtendGuestTrafficTemp` 追加临时字节数，并通过回查校验 `state.temp_extra_bytes` 被累加。

#### Scenario: 扩容 100MB

- **WHEN** 测试调用 `tryExtendGuestTrafficTemp(guestID, 104857600)` 后再次查询
- **THEN** `tryExtendGuestTrafficTemp` 的 `error` 为 `undefined`，回查结果中 `state.temp_extra_bytes` 为数字

### Requirement: 重置云主机流量配额

集成测试 SHALL 通过 `tryResetGuestTraffic` 重置累计流量并通过回查校验 `state.accumulated_rx`、`accumulated_tx` 为 0。

#### Scenario: 重置后累计清零

- **WHEN** 测试调用 `tryResetGuestTraffic(guestID)` 后再次查询
- **THEN** reset 调用 `error` 为 `undefined`；回查 `state.accumulated_rx`、`state.accumulated_tx` 均为 0
