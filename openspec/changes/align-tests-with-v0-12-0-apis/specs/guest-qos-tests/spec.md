## ADDED Requirements

### Requirement: 覆盖云主机 CPU 优先级修改

集成测试 SHALL 验证 `modifyGuestCPUPriority` 可在真实后端上将 CPU 优先级切换为非默认值且不报错。

#### Scenario: 将优先级切换为 High

- **WHEN** 测试对一个已创建的云主机调用 `modifyGuestCPUPriority(guestID, Priority.High)`
- **THEN** 返回结果的 `error` 必须为 `undefined`

### Requirement: 覆盖云主机磁盘 QoS 修改

集成测试 SHALL 验证 `modifyGuestDiskQoS` 可同时设置 read/write speed 与 IOPS 限额。

#### Scenario: 设置完整四参数

- **WHEN** 测试调用 `modifyGuestDiskQoS(guestID, 10485760, 10485760, 1000, 1000)`
- **THEN** 返回结果的 `error` 必须为 `undefined`

### Requirement: 覆盖云主机网络 QoS 修改

集成测试 SHALL 验证 `modifyGuestNetworkQoS` 可设置接收与发送速率。

#### Scenario: 设置收发速率

- **WHEN** 测试调用 `modifyGuestNetworkQoS(guestID, 1048576, 1048576)`
- **THEN** 返回结果的 `error` 必须为 `undefined`
