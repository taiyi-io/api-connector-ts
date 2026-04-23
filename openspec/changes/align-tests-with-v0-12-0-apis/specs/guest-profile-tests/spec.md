## ADDED Requirements

### Requirement: 创建并读取云主机套餐

集成测试 SHALL 通过 `tryCreateGuestProfile` 创建套餐并立即通过 `tryGetGuestProfile` 回读，字段内容与入参一致。

#### Scenario: 创建后 GET 回读一致

- **WHEN** 测试创建 `{name, cores:2, memory:1024, disks:[10240]}` 的 profile
- **AND** 使用 `tryGetGuestProfile(profileID)` 回读
- **THEN** 两次调用均 `error` 为 `undefined`，回读数据 `name`、`cores`、`memory`、`disks[0]` 与入参一致

### Requirement: 分页查询云主机套餐

集成测试 SHALL 通过 `tryQueryGuestProfiles` 能检索到刚创建的套餐。

#### Scenario: 通过 keyword 查询

- **WHEN** 测试调用 `tryQueryGuestProfiles({offset:0, limit:10, keyword: <profile name>})`
- **THEN** `error` 为 `undefined`，返回的 `profiles` 数组至少包含一个 `id === profileID` 的条目

### Requirement: 修改云主机套餐

集成测试 SHALL 通过 `tryModifyGuestProfile` 按新的 `profile_id` 字段名修改 `cores`/`memory`，并通过回读校验。

#### Scenario: 更新 cores 与 memory

- **WHEN** 测试调用 `tryModifyGuestProfile({profile_id, cores:4, memory:2048})` 后回读
- **THEN** 回读数据 `cores` 为 4、`memory` 为 2048

### Requirement: 基于套餐创建云主机

集成测试 SHALL 通过 `tryCreateGuestFromProfile` 基于套餐创建云主机，`getGuest` 回读关键配置与套餐一致。

#### Scenario: 从 profile 创建 guest

- **WHEN** 测试调用 `tryCreateGuestFromProfile({profile_id, pool_id, name})` 后再通过 `getGuest` 读取
- **THEN** `error` 为 `undefined`，guest 的 `cores`、`memory` 与套餐对齐

### Requirement: 用套餐替换云主机配置

集成测试 SHALL 通过 `tryReplaceGuestConfig` 用另一个套餐替换现有云主机配置。

#### Scenario: 用第二个 profile 替换

- **WHEN** 测试先创建第二个 profile，再调用 `tryReplaceGuestConfig({guest_id, profile_id: secondProfileID})`
- **THEN** 返回 `error` 为 `undefined`

### Requirement: 删除云主机套餐

集成测试 SHALL 通过 `tryDeleteGuestProfile` 使用新的 `profile_id` 参数删除套餐。

#### Scenario: 删除后再 GET 应出错

- **WHEN** 测试调用 `tryDeleteGuestProfile(profileID)` 后再次 `tryGetGuestProfile`
- **THEN** 删除调用 `error` 为 `undefined`；再次 GET 的返回 `error` 不为 `undefined`
