## ADDED Requirements

### Requirement: openspec/concepts.md documents node system architecture
`openspec/concepts.md` SHALL 包含对 node 系统核心概念的说明：控制节点与资源节点的角色和职责、关键组件（ControlAPI、ResourceAPI、TaskManager）的职责及交互方式、同步命令与异步命令（warpTaskID）的区别。

#### Scenario: Concepts document covers node roles
- **WHEN** 阅读 `openspec/concepts.md`
- **THEN** 文档 SHALL 明确描述控制节点（Control Node）和资源节点（Resource Node）的角色区别

#### Scenario: Concepts document explains sync vs async commands
- **WHEN** 阅读 `openspec/concepts.md`
- **THEN** 文档 SHALL 解释同步命令（直接返回结果）和异步命令（返回 warpTaskID，需轮询）的区别及判断依据

### Requirement: openspec/modules.md classifies all connector methods with sync/async label
`openspec/modules.md` SHALL 包含 `TaiyiConnector` 所有公共方法的分类表，每个方法 SHALL 明确标注为同步（`sync`）或异步（`async`）。

#### Scenario: Modules document lists all public methods
- **WHEN** 阅读 `openspec/modules.md`
- **THEN** 文档中的方法列表 SHALL 与 `src/connector.ts` 实际导出的公共方法一一对应，无遗漏

#### Scenario: Sync/async labels are accurate
- **WHEN** 对比 `openspec/modules.md` 中的标注与实际代码实现
- **THEN** 每个方法的同步/异步标注 SHALL 与代码中使用 `sendCommand`（同步）还是 `requestCommandResponse`（异步）完全一致

### Requirement: REFERENCE.md reflects post-fix API signatures
`REFERENCE.md` SHALL 反映修复后的接口签名，`modifyGuestSecurityPolicy` 和 `resetGuestSecurityPolicy` 的文档 SHALL 不包含 `timeoutSeconds` 参数，被删除的 7 个 `tryXxx` 方法 SHALL 不在文档中出现。

#### Scenario: Removed methods absent from REFERENCE.md
- **WHEN** 搜索 `REFERENCE.md` 中的 `tryModifyGuestSecurityPolicy`、`tryResetGuestSecurityPolicy`、`tryCreateAddressPool` 等
- **THEN** REFERENCE.md SHALL NOT 包含这些已删除方法的描述

#### Scenario: Sync method signatures are accurate in REFERENCE.md
- **WHEN** 阅读 `REFERENCE.md` 中 `modifyGuestSecurityPolicy` 的签名描述
- **THEN** 文档 SHALL 显示签名为 `modifyGuestSecurityPolicy(guestID, macAddress, rules): Promise<BackendResult>`，无 `timeoutSeconds`
