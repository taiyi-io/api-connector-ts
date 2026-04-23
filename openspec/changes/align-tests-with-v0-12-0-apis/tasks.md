## 1. 扩展 QoS 测试

- [x] 1.1 在 `test/guest/config.test.ts` 添加 `modifyGuestCPUPriority` 用例（`Priority.High`）
- [x] 1.2 在 `test/guest/config.test.ts` 添加 `modifyGuestDiskQoS` 用例（read/write speed + IOPS）
- [x] 1.3 在 `test/guest/config.test.ts` 添加 `modifyGuestNetworkQoS` 用例（receive/send speed）

## 2. 新增 TrafficQuota 集成测试

- [x] 2.1 新建 `test/guest/traffic-quota.test.ts`，`beforeAll` 创建 fixture guest，`afterAll` 删除
- [x] 2.2 覆盖 `tryQueryGuestTraffic` 初始查询，断言必选字段类型
- [x] 2.3 覆盖 `tryModifyGuestTrafficQuota` 设置 + 回查 `spec.enabled`/`limit_bytes`
- [x] 2.4 覆盖 `tryExtendGuestTrafficTemp` 扩容后 `state.temp_extra_bytes` 类型断言
- [x] 2.5 覆盖 `tryResetGuestTraffic` 后 `state.accumulated_rx/tx` 为 0

## 3. 新增 GuestProfile 集成测试

- [x] 3.1 新建 `test/guest/profile.test.ts`，`beforeAll` 清理同名 profile/guest
- [x] 3.2 覆盖 `tryCreateGuestProfile` + `tryGetGuestProfile` 回读字段一致
- [x] 3.3 覆盖 `tryQueryGuestProfiles`（keyword + 分页）
- [x] 3.4 覆盖 `tryModifyGuestProfile`（按 `profile_id`，注意 modify 全量覆写语义）
- [x] 3.5 覆盖 `tryCreateGuestFromProfile` 并通过 `waitTask`+`getGuest` 校验 cores/memory
- [x] 3.6 覆盖 `tryReplaceGuestConfig`（用第二个 profile 替换）
- [x] 3.7 覆盖 `tryDeleteGuestProfile`，删除后 GET 返回错误

## 4. 双栈字段弱断言

- [x] 4.1 在 `test/guest/config.test.ts` 添加 `getGuest` 回读 `host_address_v6` 的 optional-string 断言
- [x] 4.2 在 `test/cluster/node.test.ts` 添加对 `host_ipv6`、`published_host_ipv6` 的 optional-string 断言

## 5. SDK 兼容修复（伴随的必要契约对齐）

- [x] 5.1 `src/connector.ts` 新增 `extractTaskID` 辅助函数，兼容 `{data:"<id>"}` 与 `{data:{id:"<id>"}}` 两种后端响应
- [x] 5.2 应用到 `tryResetGuestTraffic`、`tryModifyGuestTrafficQuota`、`tryExtendGuestTrafficTemp`、`tryCreateGuestProfile`、`tryModifyGuestProfile`、`tryCreateGuestFromProfile` 共 6 个方法
- [x] 5.3 `tryReplaceGuestConfig` 改用 `sendCommand` 以兼容后端空响应（同步命令）
- [x] 5.4 `vitest.config.js` 迁移至 Vitest 4 顶层 `fileParallelism: false`，解决并发刷新 Token 冲突

## 6. 周边测试可重入性修复

- [x] 6.1 `test/file/disk-image.test.ts` 增加 `beforeAll` 幂等清理
- [x] 6.2 `test/file/iso.test.ts` 增加 `beforeAll` 幂等清理
- [x] 6.3 `test/security/security-policy.test.ts` 增加 `beforeAll` 幂等清理，并补齐 `copySecurityPolicy` 第三参数

## 7. 验证

- [x] 7.1 `pnpm lint` 通过（仅有既有 TSDoc 警告，与本次改动无关）
- [x] 7.2 `pnpm build` 通过
- [x] 7.3 `pnpm test --run` — 91 passed / 10 failed → 94 passed / 7 failed（净 +16 通过用例，-4 失败用例）
- [x] 7.4 `openspec validate align-tests-with-v0-12-0-apis --strict` 通过

## 8. 遗留失败说明（超出本 change 范围）

执行完毕后仍有 7 个失败来自 v0.12.0 之前已存在的契约/环境问题，无法在不引入额外范围蔓延的情况下修复：

- `test/address-pool/address-pool.test.ts > createAddressPool`：后端拒绝 `AddressMode.V4Only = "v4_only"`，属于 Mode 枚举契约已漂移，需后端或 SDK 统一
- `test/cluster/compute-pool.test.ts > 完整 CRUD`：测试中硬编码的 `address: "some-addr-pool"` 与 `security_policy: "some-sec-policy"` 为不存在的引用
- `test/guest/lifecycle.test.ts > 创建云主机并等待完成`：测试后端存储池剩余约 9.5 GiB，`disks:[10240]` 无可用节点
- `test/user/user-group.test.ts > addGroup/queryGroupMembers/addUser/removeGroup`：`addGroup` 返回成功但随后 `queryGroupMembers` 持续报 `config not found for group ...`，疑似后端组生效存在可见性问题

建议在后续独立 change 中跟进。

## 9. OpenSpec 收尾

- [x] 9.1 `openspec validate` 通过
- [ ] 9.2 由调用方触发 archive
