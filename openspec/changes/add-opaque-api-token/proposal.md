## Why

`api-connector-ts` 当前 `generateUserToken` 输出 `base64(JSON({id, serial, algorithm, public_key, private_key, ...}))` 格式字符串，但服务端 `validateBearerToken` 期望的是 `base64(<id>:<serial>:<algorithm>:<private_key>)` 冒号编码格式。两端编码约定从一开始就不对齐，导致 `authenticateByToken` 签发的令牌**100% 无法**通过 MCP 通道认证（一律 401），现实中 SDK 的「令牌认证」分支从未跑通。

更深层的问题是设计层面：

- **私钥透传**：bearer 中携带 ed25519 私钥本体，任何反向代理日志、APM 采集器、调试代理都能截获长期可冒名身份；
- **复杂度泄露**：客户端需要做密钥序列化与签名拼装，与 GitHub PAT / GCP API Key / AWS access key 等业界惯例严重背离；
- **死代码**：编码侧 `Marshall()` 被 SDK 调用、解码侧 `UnmarshallPrivateKey()` 仅服务于该路径，整套链路除了被 401 拦截外没有任何活体调用方。

服务端已在 node 仓库本次升级中切换为「不透明 API Token + sha256 哈希入库」模式（前缀 `tyat_`），SDK 必须同步迁移。

## What Changes

- `generateUserToken(user, description?, months?)` 直接返回服务端响应中的 `bearer_token` 字符串（形如 `tyat_<32 字符>`），不再做任何 `JSON.stringify` / `btoa` 包装
- `authenticateByToken(token)` 接受 `tyat_*` 字符串：
  - 校验前缀，不合规立即返回 `error: "令牌格式错误，必须以 tyat_ 起头"`
  - 调用 `/auth/by-token` 端点校验不透明令牌，获取当前用户标识与角色
  - 回填 `connector.user` 和 `connector.roles`，设置认证状态
  - 后续所有控制请求注入 `Authorization: Bearer tyat_*`，**严禁**再发送 `X-CSRF-Token`
- 删除 `signEd25519`、`PrivateKey` 序列化辅助、`base64(JSON)` 编码相关代码；保留 `/auth/by-token` HTTP 调用（语义改为不透明令牌校验 + 返回用户身份）
- `test/setup.ts` 与 `test/basic/auth.test.ts` 适配新令牌格式；新增覆盖错误前缀 / 旧格式 / 空串的负向用例
- `package.json` 升 patch（0.12.4 → 0.12.5），`CHANGELOG.md` 在 0.12.5 条目下站在调用方视角描述变更与不兼容声明
- README「测试配置」与「认证方式」章节更新示例

## Capabilities

### Modified Capabilities

- `user-token-issuance`: `generateUserToken` 返回值由 `base64(JSON)` 复合字符串改为不透明 `tyat_*` 字符串
- `token-based-authentication`: `authenticateByToken` 改为接受不透明令牌，内部不再持有私钥与签名链路
- `request-header-injection`: 控制请求按 `AuthMethod.Token` 模式注入单 header `Authorization: Bearer tyat_*`，移除 CSRF 头

### Removed Capabilities

- `ed25519-bearer-signature`: SDK 不再在客户端持有用户私钥，也不再在登录时对 timestamp + nonce + serial 做 ed25519 签名
- `ed25519-auth-by-token`: SDK 不再通过 `/auth/by-token` 发送 ed25519 签名换取 JWT；该端点改为接受不透明令牌并返回用户身份

## Impact

- **不兼容变更**：所有使用 `authenticateByToken` 的调用方必须升级到 0.12.5；旧版本 SDK 与 0.12.0 服务端 / 旧服务端的「令牌登录」组合均失效
- **最低后端版本**：node 服务端必须包含本次「不透明 token」改造（同窗口发布的 0.12.0 修订版）
- **Portal 接入路径**：Portal 走密码登录 + JWT + CSRF 标准会话，**不受影响**，无需升级
