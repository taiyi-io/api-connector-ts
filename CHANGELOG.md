# Change Log

## [0.12.6] - 2026-05-08

### 新增

- 「按套餐创建云主机」请求参数新增可选的访问权限与开机自启动两个字段，调用方可在不修改套餐的前提下，对单次创建临时指定云主机的资源权限与是否开机自动启动；不携带这两个字段的旧调用方行为完全保持不变

### 修复

- 在仅配置 IPv6 地址的 Taiyi 后端环境下使用连接器时，不再因为构造出的 API 地址形如 `http://2001:db8::1:5851/...`（IPv6 字面量未加方括号）而被浏览器或 Node 的 URL 解析器判定为非法、所有调用 502 失败；连接器会自动识别 IPv6 字面量并以 `[host]:port` 形式拼装，IPv4 与域名行为保持不变。

## [0.12.5] - 2026-05-01

### 调整

- **用户 API 令牌升级为不透明 Token（重大不兼容变更）**：`generateUserToken` 返回值由原先携带私钥的复合字符串，改为由后端直接下发的不透明令牌（以 `tyat_` 起头、总长 37 字符）。调用方取到后只需视作黑盒字符串保管，无需再做 base64 / JSON 的解析或拼装；服务端仅落库哈希指纹，明文仅此一次返回，显著降低长期凭据被中间环节截获的风险。
- **`authenticateByToken` 语义简化**：现在先做本地格式自检（前缀 / 长度 / 字符集），再由服务端校验不透明令牌并返回当前用户身份；连接器不再持有用户私钥，认证成功后可继续通过 `user` 和 `roles` 获取调用方身份，并在后续控制调用中自动注入 `Authorization: Bearer tyat_<令牌>` 单 header，**不再**附带 `X-CSRF-Token`，与 MCP / Agent 直连场景的主流约定对齐。格式不合规时立即返回可读中文错误（空值 / 错误前缀 / 长度不符 / 字符集不合规四类）。
- **保留令牌认证后的身份可见性**：令牌本身不再携带用户名等可解析信息，但认证成功响应会包含当前用户与角色信息，调用方从旧版本迁移后无需额外查询即可继续获得当前身份。
- **测试模板更新**：`.env.test.example` 中 `ACCESS_STRING` 示例改为新令牌格式，便于调用方参照最新约定填写本地环境。
- **文档同步**：README 和 REFERENCE 文档中的安装指令统一为 pnpm；令牌认证相关描述和示例从旧版 Base64/PrivateKey 更新为不透明 `tyat_*` 令牌格式；补充构建、发布到 npm 和测试配置说明。

### 修复

- 修复 `authenticateByToken` 在历史版本中与服务端编码约定错位、令牌实际上 100% 无法通过 MCP 通道认证的缺陷：旧实现输出 `base64(JSON)`，服务端解析为冒号分隔字符串，两端永远对不齐；新版本改走不透明令牌直连，签发即可使用。
- 修复不透明令牌认证后当前用户为空，导致依赖当前身份的令牌列表、访问记录等管理场景无法继续调用的问题。
- 修复不透明令牌认证时因通用会话校验逻辑要求刷新令牌、CSRF 令牌等仅用于密码登录的字段，导致所有令牌认证均被拒绝的问题。

### 不兼容变更

- 所有使用 `authenticateByToken` 的调用方必须升级到 0.12.5 **并且**将服务端令牌重新签发为新格式后再行接入；旧版本 SDK 与任何历史格式的令牌均无法继续工作。
- `PrivateKey`、`ControlAuthByTokenParams` 等以私钥复合编码为核心的类型已从公开 API 中移除；原先依赖这些类型做序列化 / 签名辅助的二次封装需要同步清理。
- 最低后端版本要求同窗口发布的 Node 0.12.0 修订版（已完成不透明令牌改造）。

## [0.12.4] - 2026-04-26

### 修复

- 解决某些反向代理（如 Vercel）自动去除请求路径尾斜杠后，管理 API 与监控通道分配 URL 在后端精确路由匹配失败、返回 404 的问题：连接器对外发起的请求路径统一改为不带尾斜杠形式，与后端规范化后的路由对齐，调用方升级即可恢复在去尾斜杠代理后部署的可用性

## [0.12.3] - 2026-04-24

### 调整

- **剥离 Next.js 专属模块到 portal 项目**：将 `next-store-internals.ts`、`next-secure-store.ts`、`next-middleware.ts`、`next-connector.ts` 迁移至 portal 的 `lib/connector/`，消除库对 `next/headers` 的直接依赖，解决 Next.js 16 Turbopack 无法识别 `node_modules` 内 `"use server"` 指令导致 `cookies was called outside a request scope` 的问题
- 删除已废弃的 `next-headers.d.ts` 类型声明文件
- 移除 `package.json` 中 `dependencies` 末尾的 JSON 尾逗号，修复 `pnpm build` 解析失败

## [0.12.2] - 2026-04-24

### 修复

- **HTTP/2 下非 200 响应错误消息丢失**：`request-forwarder.ts` 中 `parseCommandResponse` / `parseCommandResult` / `parseAuthoriedToken` 原来直接使用 `response.statusText` 作为错误消息；但 HTTP/2 协议规范不再传递 status text，浏览器/Node `fetch` 对 HTTP/2 响应返回空字符串，导致上层 `else if (tokenResult.error)` 判断为 falsy 而被跳过，最终以误导性的「无有效令牌」等消息掩盖真实 HTTP 错误。新增 `formatHTTPError` 辅助函数，统一以 `HTTP <code> <statusText?> <body 摘要>` 格式构造错误消息，保证始终非空。影响场景：通过 fly.io / tunnelto / Caddy 等 HTTP/2 反向代理访问后端时，后端拒连或 5xx 错误可正确向上传播
- **服务端 `getDeviceID()` 缺失兜底逻辑导致登录 `device required`**：`next-secure-store.ts::getDeviceID` 原来仅从 `taiyi_device` cookie 读取，缺失时返回空字符串；客户端 `getDeviceFromBrowser()`（仅在 `getNextConnector()` 路径触发）虽有自动生成逻辑，但依赖 `localStorage`/`navigator`，用户首次访问登录页或在隐身模式下时 cookie 未建立，服务端登录路由 `/api/auth` 直接以空设备 ID 调用 `authenticateByPassword` → 后端返回 `device required`。修复后 `getDeviceID()` 在 cookie 缺失时自动生成 `server-<cuid2>` 并以 30 天有效期写入 cookie，保证所有服务端调用点获得稳定非空设备 ID

### 测试

- `test/setup.ts` 新增 `USE_TLS` 环境变量支持，将其传入 `getInsecureConnector` 第 4 个参数，允许测试针对启用 HTTPS 的后端（如通过 tunnelto 暴露的公网 `https://*.tunn.dev`）运行
- `.env.test.example` 补充 `USE_TLS=false` 示例说明

## [0.12.1] - 2026-04-23

### 修复

- 移除 `package.json` 中的 `"type": "module"` 声明。之前该字段与 `tsconfig.json` 的 `"module": "CommonJS"` 产物冲突：`dist/*.js` 实际编译为 CJS，但包声明为 ESM，导致 Next.js 16 / Turbopack 将其按 ESM 静态解析时报 `"The module has no exports at all"`，Vercel 构建失败（本地 webpack 容错未暴露该问题）

## [0.12.0] - 2026-04-20

### 修复

- `tryDeleteGuestProfile` 改用 `sendCommand` 直接发送并处理 `unauthenticated` 重试，修复令牌过期时无法自动刷新的问题
- `tryGetGuestProfile` 返回值从 `resp.data?.profile` 改为 `resp.data` 整体，与后端响应结构一致
- `ControlModifyGuestProfileParams` / `ControlDeleteGuestProfileParams` / `ControlGetGuestProfileParams` 中 `id` 字段重命名为 `profile_id`，与后端参数契约对齐
- 新增内部 `extractTaskID` 辅助函数，兼容后端两种响应形态 `{data:"<id>"}` 与 `{data:{id:"<id>"}}`，修复 `tryCreateGuestFromProfile` 等 6 个方法（`tryResetGuestTraffic` / `tryModifyGuestTrafficQuota` / `tryExtendGuestTrafficTemp` / `tryCreateGuestProfile` / `tryModifyGuestProfile` / `tryCreateGuestFromProfile`）在后端直接以字符串形式返回任务 ID 时拿不到有效值的问题
- `tryReplaceGuestConfig` 改用 `sendCommand` 直发，兼容后端将该命令实现为同步空响应（`{}`）的情形，避免 `no data in task response` 误报

### 新增

- `ModifyGuestCPUPriority` / `ModifyGuestDiskQoS` / `ModifyGuestNetworkQoS` 枚举值
- `ControlModifyGuestCPUPriorityParams` / `ControlModifyGuestDiskQoSParams` / `ControlModifyGuestNetworkQoSParams` 参数接口
- `connector.modifyGuestCPUPriority` / `modifyGuestDiskQoS` / `modifyGuestNetworkQoS` 及对应 `try` 版本（共 6 个方法）
- `TrafficQuotaSpec` / `TrafficQuotaState` / `GuestTrafficInfo` 数据接口
- `connector.tryQueryGuestTraffic` / `tryResetGuestTraffic` / `tryModifyGuestTrafficQuota` / `tryExtendGuestTrafficTemp`（共 4 个方法）
- `GuestProfile` 接口及 7 个 `tryXxx` 方法（`tryCreateGuestProfile` / `tryModifyGuestProfile` / `tryDeleteGuestProfile` / `tryGetGuestProfile` / `tryQueryGuestProfiles` / `tryCreateGuestFromProfile` / `tryReplaceGuestConfig`）
- **双栈地址透传**：`GuestStatus` / `GuestView` 接口新增 `host_address_v6?: string` 可选字段，与 node 侧跨节点双栈扩展契约对齐，便于 portal 等调用方在 v4 缺失时回退显示 IPv6 地址

### 测试

- `test/guest/config.test.ts`：新增 QoS（CPU 优先级 / 磁盘 QoS / 网络 QoS）3 个用例及 `host_address_v6` 弱类型断言
- `test/guest/traffic-quota.test.ts`：新增 TrafficQuota 4 方法的端到端集成测试
- `test/guest/profile.test.ts`：新增 GuestProfile CRUD + 基于套餐创建/替换云主机共 7 个用例（按 `profile_id` 新契约编写）
- `test/cluster/node.test.ts`：补齐 `host_ipv6` / `published_host_ipv6` 弱类型断言
- `test/file/disk-image.test.ts` / `test/file/iso.test.ts` / `test/security/security-policy.test.ts`：增加 `beforeAll` 幂等预清理，修正 `copySecurityPolicy` 调用参数
- `vitest.config.js`：迁移至 Vitest 4 顶层 `fileParallelism: false`，解决并发刷新 Token 冲突

## [0.11.0] - 2026-02-27

### 新增

- 高可用地址池安全策略管理功能
- 安全策略组的增删改查接口
- 云主机安全策略绑定与解绑接口
- 安全规则管理接口
- 地址池管理新版API文档

### 改进

- 完善单元测试，覆盖率达到85%以上
- 更新API文档

## [0.10.1] - 2025-10-15

### 修复

- 修复 nextjs 安全漏洞
- 移除多余的 console.log 输出

## [0.10.0] - 2025-09-26

### 新增

- first commit
