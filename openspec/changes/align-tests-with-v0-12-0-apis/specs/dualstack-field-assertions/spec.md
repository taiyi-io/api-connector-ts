## ADDED Requirements

### Requirement: 云主机响应的 IPv6 字段类型弱断言

已有集成测试在回读 `GuestView` 或 `GuestStatus` 时 SHALL 对可选的 `host_address_v6` 字段做"存在即 string"的断言。

#### Scenario: getGuest 返回结果包含可选 host_address_v6

- **WHEN** 测试调用 `getGuest(guestID)` 获取 `GuestStatus`
- **THEN** 若 `host_address_v6` 存在，其必须为字符串；若不存在则跳过

### Requirement: 节点响应的 IPv6 字段类型弱断言

集群相关集成测试在读取 `NodeData` 时 SHALL 对 `host_ipv6` 与 `published_host_ipv6` 做"存在即 string"的断言。

#### Scenario: queryNodes 返回字段类型合法

- **WHEN** 测试读取任意节点记录
- **THEN** 若 `host_ipv6` 或 `published_host_ipv6` 存在，必须为字符串
