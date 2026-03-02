## ADDED Requirements

### Requirement: All Go backend commands have corresponding TS connector methods
TS 连接器 SHALL 为 Go 后端 `dispatchCommand` switch-case 中的每条命令提供对应的公共方法（查询类、配置类、操作类均包含）。对比基准为 Go 后端 `control_api.go` 的命令枚举。

#### Scenario: Command count matches
- **WHEN** 统计 Go 后端 `dispatchCommand` 的 case 分支数量与 TS 连接器公共方法数量
- **THEN** TS 连接器公共方法 SHALL 覆盖所有后端命令，无遗漏

#### Scenario: Missing commands are identified and added
- **WHEN** 逐一比对 Go 后端命令与 TS 连接器方法
- **THEN** 任何缺失命令 SHALL 在本次变更中补充实现

### Requirement: Request parameter names match Go backend JSON fields exactly
每个连接器方法的参数名称和 JSON 字段名 SHALL 与 Go 后端 `ControlCommandRequest` 结构体的 JSON tag 完全一致（含下划线命名风格）。

#### Scenario: JSON field names are consistent
- **WHEN** 检查 TS 连接器中 `ControlCommandRequest` 对象的字段名
- **THEN** 字段名 SHALL 与 Go 后端对应 struct 的 JSON tag 字段名完全匹配

#### Scenario: Optional parameters are correctly typed
- **WHEN** Go 后端某字段为可选（pointer 类型或 `omitempty`）
- **THEN** TS 连接器对应参数 SHALL 标注为可选（`?`）

### Requirement: Response data fields match Go backend response structures
连接器从响应中提取的字段名 SHALL 与 Go 后端 `ControlCommandResponse` 结构体的 JSON tag 完全匹配。

#### Scenario: Response fields are correctly mapped
- **WHEN** 连接器读取响应数据（如 `resp.data?.guest`、`resp.data?.address_pool_detail`）
- **THEN** 字段名 SHALL 与 Go 后端响应结构体的 JSON tag 一致

### Requirement: Enums cover all Go backend constant values
`src/enums.ts` 中的枚举 SHALL 覆盖 Go 后端所有相关常量值，无缺漏。

#### Scenario: No missing enum values
- **WHEN** 对比 Go 后端常量定义与 TS 枚举
- **THEN** 所有 Go 常量值 SHALL 在 TS 枚举中存在对应条目
