# Change Log

## [0.12.4] - 2026-04-24

### 修复

- **API 路由尾斜杠规范化**：`commandURL` 函数返回值由 `${backendURL}commands/` 改为 `${backendURL}commands`，`openMonitorChannel` 中监控分配 URL 由 `${backendURL}monitor/` 改为 `${backendURL}monitor`，去除尾斜杠。配合 node 后端一刀切路由规范化，解决 Vercel 等反向代理自动去尾斜杠后 `gorilla/mux` 精确匹配失败返回 404 的问题

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
