# 部署配置

## 环境要求

开发和构建本项目需要满足以下环境要求：

### 基础环境
- **操作系统**: Linux, macOS, Windows (WSL2 推荐)
- **Node.js**: v20.0.0 或更高版本
- **包管理器**: Yarn 4.x (本项目启用 Corepack)

### 依赖安装

首次使用前，请安装项目依赖：

```bash
# 启用 Corepack (如果尚未启用)
corepack enable

# 安装依赖
yarn install
```

## 构建流程

项目使用 TypeScript 编写，需要编译为 JavaScript 才能在生产环境中使用。

### 执行构建

```bash
# 编译 TypeScript 代码
yarn build
```

构建产物将输出到 `dist/` 目录：
- `dist/*.js`: 编译后的 CommonJS 模块
- `dist/*.d.ts`: 类型定义文件

### 代码检查

在提交代码前，请确保代码符合风格规范：

```bash
# 运行 ESLint 检查
yarn lint
```

## 测试环境

项目使用 Vitest 进行单元测试和集成测试。

### 环境变量配置

在运行集成测试前，必须在项目根目录创建 `.env` 文件：

```env
# Control API 服务地址
BACKEND_HOST=192.168.1.100

# Control API 服务端口 (默认 5851)
BACKEND_PORT=5851

# 测试用的访问令牌 (在 API 门户生成)
ACCESS_STRING=your_test_token_here
```

### 运行测试

```bash
# 运行所有测试
yarn test

# 运行特定测试文件
yarn test test/connector.basic.test.ts

# 监视模式 (开发时使用)
yarn test --watch
```

## 文档生成

项目使用 TypeDoc 生成 API 文档。

```bash
# 生成文档
yarn docs

# 或者使用脚本
./gendoc.sh
```

文档将生成在 `docs/` 目录下，可直接用浏览器打开 `docs/index.html` 查看。

## 发布流程

1. **版本更新**: 更新 `package.json` 中的版本号
2. **构建**: 运行 `yarn build` 确保构建成功
3. **测试**: 运行 `yarn test` 确保功能正常
4. **发布**: 
   ```bash
   npm publish
   ```

## 常见问题

### Yarn 版本问题
如果遇到 `yarn` 版本不匹配错误，请尝试：
```bash
yarn set version stable
yarn install
```

### 权限问题
如果在 Linux 下遇到权限错误，避免使用 `sudo` 运行 yarn 命令，建议检查目录权限或使用 nvm 管理 Node 版本。
