## 1. 修复同步/异步分类（sync-async-fix）

- [x] 1.1 删除 `tryModifyGuestSecurityPolicy` 方法（整个方法块从 connector.ts 中移除）
- [x] 1.2 删除 `tryResetGuestSecurityPolicy` 方法（整个方法块从 connector.ts 中移除）
- [x] 1.3 将 `modifyGuestSecurityPolicy` 改为同步实现：去掉 `timeoutSeconds` 参数，将内部实现改为 `sendCommand`，直接返回 `Promise<BackendResult>`
- [x] 1.4 将 `resetGuestSecurityPolicy` 改为同步实现：去掉 `timeoutSeconds` 参数，将内部实现改为 `sendCommand`，直接返回 `Promise<BackendResult>`
- [x] 1.5 删除 `tryCreateAddressPool` 方法
- [x] 1.6 删除 `tryModifyAddressPool` 方法
- [x] 1.7 删除 `tryDeleteAddressPool` 方法
- [x] 1.8 删除 `tryAddAddressRange` 方法
- [x] 1.9 删除 `tryRemoveAddressRange` 方法
- [x] 1.10 运行 `yarn build` 确认无 TypeScript 编译错误

## 2. 接口完整性对齐（api-completeness）

- [x] 2.1 逐一比对 Go 后端 `dispatchCommand` switch-case 分支与 TS 连接器公共方法，记录遗漏的命令
- [x] 2.2 检查 `controlCommandEnum` 枚举是否覆盖所有 Go 后端命令字符串，补充遗漏条目
- [x] 2.3 逐一检查现有方法的请求参数字段名与 Go 后端 JSON tag 是否一致，修正不一致项
- [x] 2.4 逐一检查现有方法的响应字段名（`resp.data?.xxx`）与 Go 后端响应结构体 JSON tag 是否一致
- [x] 2.5 补充遗漏的接口方法（以 2.1 对比结果为准）
- [x] 2.6 检查 `src/enums.ts` 是否有遗漏的枚举值，对照 Go 后端常量补充
- [x] 2.7 运行 `yarn build` 确认补充后无编译错误

## 3. 版本号更新 (已取消)

- [x] 3.1 保持版本号为 `0.11.0` (原计划升至 0.12.0)

## 4. 测试基础设施

- [x] 4.1 创建 `test/setup.ts`：实现 `getTestConnector()` 工厂函数，用 `dotenv` 加载 `.env.test`，缺少变量时抛出明确错误
- [x] 4.2 创建 `test/helpers/resource-guard.ts`：提供资源前置检查工具函数（检查计算池、存储池、节点可用性）
- [x] 4.3 更新 `vitest.config.js`：添加 `envDir` 配置以加载 `.env.test`
- [x] 4.4 创建 `.env.test.example`：提供 `BACKEND_HOST`、`BACKEND_PORT`、`ACCESS_STRING`、`DEVICE_ID` 示例

## 5. 基础功能测试

- [x] 5.1 创建 `test/basic/auth.test.ts`：测试密码认证和令牌认证
- [x] 5.2 创建 `test/basic/system.test.ts`：测试系统状态查询和初始化接口
- [x] 5.3 创建 `test/basic/task.test.ts`：测试任务查询和管理接口

## 6. 集群管理测试

- [x] 6.1 创建 `test/cluster/node.test.ts`：测试节点 CRUD（添加/查询/移除节点、启用/禁用节点）
- [x] 6.2 创建 `test/cluster/compute-pool.test.ts`：测试计算池 CRUD（创建/查询/修改/删除池、添加/移除节点）
- [x] 6.3 创建 `test/cluster/storage-pool.test.ts`：测试存储池 CRUD

## 7. 云主机测试

- [x] 7.1 创建 `test/guest/lifecycle.test.ts`：测试完整生命周期（创建→启动→停止→删除），含资源前置检查
- [x] 7.2 创建 `test/guest/config.test.ts`：测试 CPU/内存/主机名/密码/自动启动修改
- [x] 7.3 创建 `test/guest/network.test.ts`：测试外部/内部网络接口添加删除和 MAC 修改
- [x] 7.4 创建 `test/guest/volume.test.ts`：测试磁盘卷添加、删除、扩容、缩容
- [x] 7.5 创建 `test/guest/media.test.ts`：测试 ISO 媒体插入和弹出
- [x] 7.6 创建 `test/guest/snapshot.test.ts`：测试快照创建、恢复、删除

## 8. 文件管理测试

- [x] 8.1 创建 `test/file/iso.test.ts`：测试 ISO 文件 CRUD（创建/查询/修改/删除）
- [x] 8.2 创建 `test/file/disk-image.test.ts`：测试磁盘镜像 CRUD

## 9. 地址池测试

- [x] 9.1 创建 `test/address-pool/address-pool.test.ts`：测试地址池 CRUD + 地址范围添加/删除，验证同步调用成功（无 "invalid task" 错误）

## 10. 安全策略测试

- [x] 10.1 创建 `test/security/security-policy.test.ts`：测试安全策略组 CRUD + 复制
- [x] 10.2 创建 `test/security/guest-security.test.ts`：测试云主机安全策略获取、修改（同步）、重置（同步），验证无 "invalid task" 错误

## 11. 用户管理测试

- [x] 11.1 创建 `test/user/user-group.test.ts`：测试用户和组管理（添加用户/组、查询、移除）
- [x] 11.2 创建 `test/user/token-access.test.ts`：测试令牌生成/撤销和访问管理
- [x] 11.3 创建 `test/user/permissions.test.ts`：测试资源权限和白名单管理

## 12. 监控测试

- [x] 12.1 创建 `test/monitor/monitor.test.ts`：测试资源使用量查询、统计、监控规则

## 13. 系统配置测试

- [x] 13.1 创建 `test/system-config/config.test.ts`：测试节点配置读取和修改
- [x] 13.2 创建 `test/system-config/license.test.ts`：测试许可证查询和管理
- [x] 13.3 创建 `test/system-config/ssh-key.test.ts`：测试 SSH 密钥添加/查询/删除
- [x] 13.4 创建 `test/system-config/system-template.test.ts`：测试系统模板 CRUD

## 14. 导入和迁移测试

- [x] 14.1 创建 `test/import/import.test.ts`：测试导入源管理（添加/查询/修改/删除导入源，不含实际导入）
- [x] 14.2 创建 `test/migration/migration.test.ts`：stub 测试，仅验证 `migrateToNode`、`importGuests` 方法存在

## 15. 文档更新（api-docs-sync）

- [x] 15.1 更新 `openspec/concepts.md`：补充控制节点 vs 资源节点角色、ControlAPI/ResourceAPI/TaskManager 组件说明、同步命令与异步命令的区别
- [x] 15.2 更新 `openspec/modules.md`：完善所有 `TaiyiConnector` 公共方法的分类表，明确标注同步/异步
- [x] 15.3 更新 `REFERENCE.md`：移除被删除的 7 个 `tryXxx` 方法描述，更新 `modifyGuestSecurityPolicy`/`resetGuestSecurityPolicy` 签名（去掉 `timeoutSeconds`）

## 16. 最终验证

- [x] 16.1 运行 `yarn build` 确认无编译错误
- [x] 16.2 运行 `yarn test` 确认所有测试通过（或有意 skip 的测试套件显示 skip 而非 fail）
- [x] 16.3 人工核对 Go 后端 `dispatchCommand` 分支数量与 TS 连接器公共方法数量
