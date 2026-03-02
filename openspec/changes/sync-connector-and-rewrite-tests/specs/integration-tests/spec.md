## ADDED Requirements

### Requirement: Test infrastructure provides connector factory and env loading
`test/setup.ts` SHALL 提供 `getTestConnector()` 工厂函数，从 `.env.test` 加载 `BACKEND_HOST`、`BACKEND_PORT`、`ACCESS_STRING`、`DEVICE_ID` 四个环境变量，并在缺少必要变量时抛出明确错误。

#### Scenario: Connector factory returns authenticated connector
- **WHEN** 测试调用 `getTestConnector()`
- **THEN** 函数 SHALL 返回已通过 `ACCESS_STRING` 认证的 `TaiyiConnector` 实例

#### Scenario: Missing env variables cause clear error
- **WHEN** `.env.test` 缺少 `BACKEND_HOST` 等必要变量
- **THEN** `getTestConnector()` SHALL 抛出包含缺失变量名称的错误

### Requirement: Tests execute serially to avoid token conflicts
所有集成测试 SHALL 以串行方式运行（`singleFork: true`），`vitest.config.js` SHALL 配置加载 `.env.test` 文件。

#### Scenario: Serial test execution
- **WHEN** 运行 `yarn test`
- **THEN** 所有测试 SHALL 在单一进程中串行执行，令牌刷新不产生竞争

### Requirement: Each test module checks prerequisite resources
每个需要特定资源的测试模块 SHALL 在 `beforeAll` 中检查所需资源是否可用，不满足条件时调用 `describe.skip()` 并打印 `console.warn` 说明原因。

#### Scenario: Guest tests skip when no compute pool available
- **WHEN** 运行 guest 相关测试时，后端无可用计算池
- **THEN** 该测试套件 SHALL 自动 skip，不报告 fail

#### Scenario: Node tests skip when no resource node available
- **WHEN** 运行节点管理测试时，后端无可用资源节点
- **THEN** 该测试套件 SHALL 自动 skip，不报告 fail

### Requirement: Each test module covers full CRUD lifecycle
每个测试模块 SHALL 按照 创建→查询验证→修改→查询验证→删除→查询验证已删除 的顺序覆盖完整生命周期。

#### Scenario: Address pool CRUD lifecycle
- **WHEN** 运行 `test/address-pool/address-pool.test.ts`
- **THEN** 测试 SHALL 依次执行：创建地址池、查询验证存在、修改地址池、查询验证修改、删除地址池、查询验证已删除

#### Scenario: Security policy CRUD lifecycle
- **WHEN** 运行 `test/security/security-policy.test.ts`
- **THEN** 测试 SHALL 依次执行安全策略组的完整 CRUD 及复制操作

### Requirement: Tests clean up created resources after completion
所有测试 SHALL 在 `afterAll` 中删除本次创建的资源，无论测试成功还是失败。

#### Scenario: Resources cleaned up after test failure
- **WHEN** 某个测试步骤失败（如修改失败）
- **THEN** `afterAll` 回调 SHALL 仍然执行资源删除，避免残留

### Requirement: Long-running operations have stub tests only
`migrate_to_node`、`sync_iso_files`、`sync_disk_files`、`import_guests` 的测试 SHALL 仅验证方法存在性（stub），不实际触发操作。

#### Scenario: Migration method existence check
- **WHEN** 运行 `test/migration/migration.test.ts`
- **THEN** 测试 SHALL 验证 `connector.migrateToNode` 为函数类型，不发起真实迁移

### Requirement: Tests connect directly to backend without mocking
所有集成测试 SHALL 直连真实后端服务，不使用任何 Mock 或 Stub 替代后端响应。

#### Scenario: No mock imports in test files
- **WHEN** 检查所有测试文件
- **THEN** 测试文件 SHALL NOT 导入任何 mock 库或使用 `vi.mock()`

### Requirement: Test modules cover all major feature areas
测试套件 SHALL 覆盖以下模块：
- `basic/`：认证（password/token）、系统状态、任务管理
- `cluster/`：节点 CRUD、计算池 CRUD、存储池 CRUD
- `guest/`：生命周期、CPU/内存/主机名/密码/自动启动、网络接口、磁盘卷、媒体、快照
- `file/`：ISO 文件、磁盘镜像
- `address-pool/`：地址池及地址范围管理
- `security/`：安全策略组、云主机安全策略
- `user/`：用户组、令牌访问、资源权限
- `monitor/`：监控和统计
- `system-config/`：节点配置、许可证、SSH 密钥、系统模板
- `import/`：导入源管理（不含实际导入）
- `migration/`：迁移 stub

#### Scenario: All modules have test files
- **WHEN** 列出 `test/` 目录下的文件
- **THEN** SHALL 存在上述所有模块对应的测试文件
