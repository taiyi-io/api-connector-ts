## ADDED Requirements

### Requirement: Guest security policy operations are synchronous
`modifyGuestSecurityPolicy` 和 `resetGuestSecurityPolicy` SHALL 使用 `sendCommand`（同步调用）而非 `requestCommandResponse` + `waitTask`，签名中不包含 `timeoutSeconds` 参数，直接返回 `Promise<BackendResult>`。

#### Scenario: modifyGuestSecurityPolicy succeeds synchronously
- **WHEN** 调用 `modifyGuestSecurityPolicy(guestID, macAddress, rules)`
- **THEN** 连接器 SHALL 发送 `modify_guest_security_policy` 命令并同步等待后端响应，成功时返回 `{}`，无需轮询任务

#### Scenario: resetGuestSecurityPolicy succeeds synchronously
- **WHEN** 调用 `resetGuestSecurityPolicy(guestID, macAddress)`
- **THEN** 连接器 SHALL 发送 `reset_guest_security_policy` 命令并同步等待后端响应，成功时返回 `{}`，无需轮询任务

### Requirement: tryModifyGuestSecurityPolicy and tryResetGuestSecurityPolicy are removed
连接器 SHALL NOT 暴露 `tryModifyGuestSecurityPolicy` 或 `tryResetGuestSecurityPolicy` 方法。这两个方法对应后端同步命令，不存在 task ID 返回。

#### Scenario: Removed methods are not accessible
- **WHEN** 消费者尝试调用 `connector.tryModifyGuestSecurityPolicy(...)` 或 `connector.tryResetGuestSecurityPolicy(...)`
- **THEN** TypeScript 编译器 SHALL 报告类型错误（方法不存在）

### Requirement: Address pool operations are synchronous only
`createAddressPool`、`modifyAddressPool`、`deleteAddressPool`、`addAddressRange`、`removeAddressRange` SHALL 仅以同步方式实现（`sendCommand`），不存在对应的 `tryXxx` 异步版本。

#### Scenario: tryCreateAddressPool is not accessible
- **WHEN** 消费者尝试调用 `connector.tryCreateAddressPool(...)`
- **THEN** TypeScript 编译器 SHALL 报告类型错误（方法不存在）

#### Scenario: tryModifyAddressPool is not accessible
- **WHEN** 消费者尝试调用 `connector.tryModifyAddressPool(...)`
- **THEN** TypeScript 编译器 SHALL 报告类型错误（方法不存在）

#### Scenario: tryDeleteAddressPool is not accessible
- **WHEN** 消费者尝试调用 `connector.tryDeleteAddressPool(...)`
- **THEN** TypeScript 编译器 SHALL 报告类型错误（方法不存在）

#### Scenario: tryAddAddressRange is not accessible
- **WHEN** 消费者尝试调用 `connector.tryAddAddressRange(...)`
- **THEN** TypeScript 编译器 SHALL 报告类型错误（方法不存在）

#### Scenario: tryRemoveAddressRange is not accessible
- **WHEN** 消费者尝试调用 `connector.tryRemoveAddressRange(...)`
- **THEN** TypeScript 编译器 SHALL 报告类型错误（方法不存在）

### Requirement: Async guest lifecycle operations remain unchanged
云主机生命周期（`tryCreateGuest`/`createGuest`、`tryDeleteGuest`/`deleteGuest`、`tryStartGuest`/`startGuest`、`tryStopGuest`/`stopGuest`）SHALL 维持异步模式（`requestCommandResponse` 获取 task ID + `waitTask` 轮询），与 Go 后端 `warpTaskID` 行为一致。

#### Scenario: createGuest returns guest ID after task completion
- **WHEN** 调用 `createGuest(poolID, system, config)`
- **THEN** 连接器 SHALL 先获取 task ID，再轮询任务直到 `Completed`，最终返回 `{ data: guestID }`

### Requirement: Remaining 35 async operations are validated consistent
所有返回 task ID 的 `tryXxx` 方法 SHALL 对应 Go 后端 `dispatchCommand` 中设置了 `warpTaskID` 的命令分支。任何不设置 `warpTaskID` 的命令 SHALL NOT 实现为异步 `tryXxx` 方法。

#### Scenario: Async method set matches backend warp task ID set
- **WHEN** 对比 Go 后端 `control_api.go` 中 `warpTaskID` 的使用位置与 TS 连接器中所有 `tryXxx` 方法
- **THEN** 两个集合 SHALL 完全一致（无多余、无缺漏）
