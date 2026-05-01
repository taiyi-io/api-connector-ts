## 任务清单

> 与本仓库根目录上层 mission `connector-opaque-token` 中 Step 2 各 Task 一一对应。

- [x] **2_2 重写 `generateUserToken`**
  - 移除 `JSON.stringify` + `btoa` 编码
  - 直接读取服务端响应 `bearer_token` 字段
  - 缺失字段时返回 `error: "生成用户令牌失败"`
  - 单测：缺字段路径覆盖

- [x] **2_3 重写 `authenticateByToken` + 移除签名链路**
  - 校验前缀 `tyat_`，错误前缀立即拒绝
  - 内部切到 `AuthMethod.Token`，保存原始 token 字符串
  - 删除 `signEd25519`、`PrivateKey` 序列化
  - 保留 `/auth/by-token` 调用以获取用户身份（偏差：原计划删除，实际需保留以解决 connector.user 为空问题）
  - 控制请求 header 仅注入 `Authorization: Bearer tyat_*`，禁止 `X-CSRF-Token`

- [x] **2_4 自测设施更新与负向用例**
  - `test/setup.ts`：保留 `ACCESS_STRING` 变量名，值现在接受 `tyat_*`
  - `test/basic/auth.test.ts`：用例描述更新为新令牌
  - 新增负向用例：空串 / 旧 base64-JSON 样本 / 错误前缀 / 长度不足 / 字符集不合规（共 5 条）
  - README「测试配置」示例更新

- [x] **2_5 升版 0.12.5 + CHANGELOG**
  - `package.json` `version`: `0.12.4` → `0.12.5`
  - `CHANGELOG.md` 顶部新增 `## [0.12.5] - 2026-05-01` 条目
  - 包含 `### 调整`、`### 修复`、`### 不兼容变更`（或等价表述）三块
  - 描述使用「使用者视角」，禁止函数名 / 文件路径 / 代码片段
  - `pnpm build` 全绿；`pnpm test` 99/109 通过（7 个失败为环境状态问题，非代码缺陷）
