## Context

v0.11.0 → v0.12.0 期间，`src/` 引入三类新 API（QoS、TrafficQuota、GuestProfile）共 17 个方法、13 个枚举命令、4 个数据类型，以及 `host_address_v6`、`host_ipv6`、`published_host_ipv6`、`GuestConfig.traffic_quota` 等字段扩展。`test/` 目录完全没有针对这些接口的覆盖，并且 `ControlModifyGuestProfileParams`/`DeleteGuestProfileParams`/`GetGuestProfileParams` 已将字段 `id` 重命名为 `profile_id`、`tryGetGuestProfile` 返回形状调整为直接使用 `resp.data`。测试体系需要与最新契约对齐。

## Goals / Non-Goals

**Goals:**
- 在现有 vitest 集成测试风格下补齐 v0.12.0 新 API 的真实后端调用覆盖
- 用例直接使用 `profile_id` 等新参数名，暴露未来契约漂移
- 对 IPv6 / 双栈字段在已有用例的回读中做"存在即 string"的类型弱断言
- 所有测试严格执行，不使用 `it.skip`；执行者必须在 v0.12.0 后端环境下运行

**Non-Goals:**
- 不修改 `src/` 下任何 SDK 代码
- 不引入 Mock 或 record/replay 框架
- 不覆盖 Go 后端特定错误路径（仅覆盖正向契约）

## Decisions

1. **测试位置**：QoS 并入 `test/guest/config.test.ts`；TrafficQuota 与 Profile 各自新建独立文件，fixture 独立创建/清理。理由：config 已是云主机配置类测试天然归属；Profile/Traffic 生命周期复杂，独立文件隔离 `beforeAll`/`afterAll`。
2. **fixture 命名**：统一使用 `ci-test-profile-*`、`ci-test-traffic-*` 前缀，`beforeAll` 先按名称清理残留，`afterAll` 再执行销毁，沿用当前仓库风格。
3. **Traffic Quota 断言策略**：`tryQueryGuestTraffic` 初始数据中字段许多是 optional，测试只断言必选字段（`effective_limit`、`used_bytes`、`usage_percent`）类型正确；`modify` / `extend` / `reset` 后回查行为性字段（`spec.limit_bytes`、`state.temp_extra_bytes`、`state.accumulated_*`）。
4. **Profile 断言策略**：创建即 `get` 回读，对比 name/cores/memory/disks/access_level，避免对服务端自动填充字段做硬匹配；`createGuestFromProfile` 后用 `getGuest` 校验关键配置；`replaceGuestConfig` 用第二个 profile 做切换再回查。
5. **IPv6 字段校验**：封装简单 helper `expectOptionalString(value)`，在 `getGuest` / `queryNodes` 的回读处调用；字段为 undefined 亦视为合法，仅在存在时断言为 string。
6. **严格失败**：当后端不支持某个新命令时测试会真实失败，这是期望行为（符合用户的"严格失败"选择）。

## Risks / Trade-offs

- [后端未升级 v0.12.0] → 测试直接红。需要运维/后端侧同步完成部署后再执行本 change。
- [Profile/Traffic 副作用大，可能污染环境] → 使用专用命名前缀 + 前后清理；失败重试时也能幂等恢复。
- [对 IPv6 字段的弱断言可能掩盖契约回退] → 通过单元级类型断言补足；完整校验留待后续有真实 IPv6 环境时再强化。
- [扩展 `config.test.ts` 会拉长该文件测试时长] → 可接受；单个 guest fixture 被多 `it` 复用反而降低总开销。

## Migration Plan

无运行时迁移；change 仅新增/修改测试文件：

1. 先合入 openspec 文档（proposal/design/specs/tasks）
2. 在本地 `.env` 指向的 v0.12.0 后端跑通 `yarn lint && yarn build && yarn test`
3. 合入 `dev` 分支，CI 通过后 archive 本 change

如需回滚，仅需 `git revert` 相关测试 commit，不影响 SDK。

## Open Questions

- 暂无。后端在 v0.12.0 上的命令字节点行为以 `src/connector.ts` 与 `changelog` 记录为准。
