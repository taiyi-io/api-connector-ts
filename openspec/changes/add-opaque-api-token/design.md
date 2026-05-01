## 设计概要

### 决策一：令牌格式与编码

- 服务端签发：`tyat_<32 字符 base32-Crockford 小写无填充>`，总长 37 字符
- SDK 端：**完全不解码**令牌内容；视作不透明字符串，仅做：
  1. 接收：从 `generateUserToken` 响应的 `bearer_token` 字段直接拿到
  2. 持久化：交给调用方传入的 `setTokens` 回调（与现有 JWT/CSRF 持久化路径一致）
  3. 注入：每次请求 header `Authorization: Bearer ${token}`
- 不再使用 `JSON.stringify` / `btoa` / `atob` / 任何序列化包装

### 决策二：认证模式枚举语义

- 保留 `AuthMethod.Token` 枚举值，但其内涵从「ed25519 签名 + 服务端换 JWT」改为「直接用 tyat 不透明 token，无 JWT 换发」
- 枚举值不变带来的好处：调用方代码无需修改 import；只需将传入的字符串从旧 base64-JSON 替换为新 tyat 字符串
- 枚举值不变带来的代价：行为不兼容必须由 CHANGELOG 明确告知

### 决策三：`authenticateByToken` 是否需要请求服务端

- 旧实现：调用 `/auth/by-token` 端点，发送 ed25519 签名，换取 JWT + CSRF
- 新实现：保留 `/auth/by-token` 调用，但语义完全改变。具体行为：
  1. 本地格式校验（前缀 `tyat_`、长度 37、字符集 base32-Crockford）
  2. 调用 `POST /auth/by-token` 端点，发送不透明令牌，服务端校验哈希并返回当前用户标识与角色
  3. 从响应中提取 `user` 和 `roles`，回填 `connector.user` 和 `connector.roles`
  4. 设置 `_authenticated = true`，将不透明令牌作为 `access_token` 保存
- **为什么保留 HTTP 调用**：不透明令牌本身不携带用户信息，而后续管理场景（令牌列表、访问记录等）依赖 `connector.user` 非空；若不调服务端，连接器无法知道当前身份，导致所有依赖用户标识的接口失败

### 决策四：CSRF 头的处理

- 在 `_authMethod === Token` 分支：构造 header 时**不**加 `X-CSRF-Token`
- 在 `_authMethod === Secret`（密码登录后走 JWT 会话）分支：保持现状，注入双 header
- 这一行为差异在 `request-forwarder.ts` 的 header 拼装函数中通过 `_authMethod` 分支判断

### 决策五：删除范围（破坏性）

| 函数 / 字段 | 处置 | 原因 |
|------------|------|------|
| `signEd25519` | 删除 | 客户端不再签名 |
| `PrivateKey` 类的 `marshallToBearer` 等方法 | 删除 | 不再做密钥序列化 |
| `request-forwarder.ts` 的 `authenticateByToken` HTTP 函数 | **保留**（语义改变） | 端点改为不透明令牌校验 + 返回用户身份 |
| `_privateKey` / `_signatureAlgorithm` 等 connector 内部字段 | 删除 | 不再使用 |
| `_user` / `_roles` 字段 | **保留**，令牌认证路径下由 `/auth/by-token` 响应回填 | 不透明令牌不携带用户信息，必须由服务端返回 |

### 决策六：错误信息标准化

| 场景 | error 字段内容 |
|------|--------------|
| token 为空字符串 | `"令牌不能为空"` |
| token 不以 `tyat_` 起头 | `"令牌格式错误，必须以 tyat_ 起头"` |
| token 长度或字符集不合法 | `"令牌格式错误，长度或字符集不合规"` |
| 服务端返回 401 | 由 `requestCommandResponse` 统一处理，置 `unauthenticated: true` |

### 不变量

- 公共 API 形状：`generateUserToken(user, description?, months?)`、`authenticateByToken(token)` 函数签名不变
- 返回类型：`Promise<BackendResult<string>>`、`Promise<BackendResult>` 不变
- 调用方代码无需修改 import / 类型声明，只需在配置层面替换 token 字符串
