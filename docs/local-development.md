# Fit Job 本地开发环境说明

> 最后验证：2026-07-18，Windows 11 / PowerShell，Node.js 24.14.0，npm 10.8.2。

本文档对应 M1 的 GitHub Issue #1，用于统一 React Web 原型的本地开发环境、依赖和验证方式。

## 1. 当前范围

当前已配置 `web/` 前端工程，包含：

- React 18、TypeScript、Vite 6；
- Tailwind CSS 3，以及可接入 shadcn/ui / Radix UI 的基础配置；
- React Router、Framer Motion、Recharts、Lucide 图标；
- Mock Service Worker（MSW）依赖，handlers 与 worker 将随 Mock 数据任务接入；
- ESLint、Prettier、路径别名 `@/*`；
- npm 锁文件与 VS Code 推荐配置。

M1 使用本地 Mock 数据，不需要数据库或后端服务。Java、Maven、PostgreSQL、Docker 和金蝶 AI 苍穹环境将在 M2/M3 对应工程建立后再接入，避免当前阶段引入不可验证的空配置。

## 2. 必需工具

| 工具    | 最低版本 | 本次验证版本 | 用途                      |
| ------- | -------- | ------------ | ------------------------- |
| Git     | 2.40     | 2.52.0       | 拉取与提交源码            |
| Node.js | 24.0.0   | 24.14.0      | Vite、ESLint 与前端工具链 |
| npm     | 9.0.0    | 10.8.2       | 安装锁定依赖、运行脚本    |

仓库根目录的 `.nvmrc` 固定了本次验证版本。

### 方案 A：nvm（推荐）

```bash
nvm install 24.14.0
nvm use 24.14.0
```

上述命令兼容常见的 nvm-windows；它通常不会自动读取 `.nvmrc`，因此这里显式写出版本。

### 方案 B：复用本机已有运行时

Windows/Codex 工作站可运行 `scripts/setup-local-runtime.ps1`。该脚本不会联网下载 Node.js，只会从以下位置复用兼容运行时：显式传入的 `-NodeExecutable`、当前 PATH，或本机 Codex bundled runtime。若这些位置都没有 Node.js 24，脚本会停止并提示先通过 nvm 或 Node.js 官方安装程序安装。

脚本会验证 Node/npm 组合后，在仓库的 `.tools/` 中原子重建便携运行时；`.tools/` 已被 Git 忽略，不会提交机器相关二进制：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-local-runtime.ps1
Set-ExecutionPolicy -Scope Process Bypass
. .\scripts\activate-environment.ps1
```

每次打开新的 PowerShell 后，只需重新点源 `activate-environment.ps1`。

Node.js 18 已停止维护，且安全修复后的工具链依赖要求更高版本，因此不再作为项目基线。

## 3. 首次安装

完成上述任一方案后，在仓库根目录执行环境自检：

```powershell
.\scripts\check-environment.ps1
```

然后安装锁文件中的依赖：

```powershell
cd web
npm ci
```

`npm ci` 适合全新克隆和 CI，可确保安装结果与 `package-lock.json` 一致。只有在主动新增或升级依赖时才使用 `npm install`，并同时提交更新后的锁文件。

## 4. 启动与验证

启动开发服务器：

```powershell
cd web
npm run dev
```

默认访问地址为 `http://localhost:5173`。若端口被占用，Vite 会自动选择下一个可用端口，并在终端输出实际地址。

提交代码前执行完整检查：

```powershell
npm run check
```

常用脚本：

| 命令                   | 说明                               |
| ---------------------- | ---------------------------------- |
| `npm run dev`          | 启动带热更新的开发服务器           |
| `npm run typecheck`    | 运行 TypeScript 类型检查           |
| `npm run lint`         | 运行 ESLint，警告也会导致失败      |
| `npm run format`       | 使用 Prettier 格式化工程文件       |
| `npm run format:check` | 检查格式但不修改文件               |
| `npm run audit`        | 使用 npm 官方安全源检查高危依赖    |
| `npm run build`        | 类型检查并生成生产构建             |
| `npm run preview`      | 本地预览生产构建                   |
| `npm run check`        | 依次执行类型、Lint、格式与构建检查 |

## 5. 目录约定

```text
web/
├─ public/              # 不经打包处理的静态资源
├─ src/
│  ├─ app/             # 应用入口与全局装配
│  ├─ components/ui/   # 可复用基础组件
│  ├─ features/        # 按业务能力组织的功能模块
│  ├─ hooks/           # 跨功能复用的 React hooks
│  ├─ lib/             # 无业务状态的通用工具
│  ├─ mocks/           # 预留 MSW handlers 与模拟数据
│  ├─ pages/           # 路由页面
│  ├─ routes/          # 路由配置和演示故事线
│  ├─ styles/          # 全局样式与 Tailwind 入口
│  └─ types/           # 跨模块共享类型
├─ components.json     # shadcn/ui 兼容配置
├─ tailwind.config.ts
└─ vite.config.ts
```

源码内使用 `@/` 指向 `web/src/`，例如：

```ts
import { cn } from '@/lib/utils'
```

## 6. 依赖选择说明

- `react-router-dom`：后续串联首页、学生工作台和各 AI 页面；
- `@radix-ui/react-slot`、`class-variance-authority`、`clsx`、`tailwind-merge`：为 shadcn/ui 风格的可复用组件提供基础能力；
- `framer-motion`：页面切换与关键交互动效；
- `recharts`：院系就业驾驶舱图表；
- `lucide-react`：统一的界面图标；
- `msw`：已预装，后续在 Mock 数据任务中接入 worker 与 handlers；
- `tailwindcss`：M1 的样式组织方式。

依赖版本由 `web/package-lock.json` 锁定。不要删除锁文件，也不要同时引入 yarn/pnpm 锁文件。

仓库默认 npm 镜像如果未实现安全审计接口，`npm run audit` 会临时使用 npm 官方 registry；该命令不会修改项目的持久化 registry 配置。

## 7. 环境变量与敏感信息

当前 M1 启动不需要环境变量。后续如需增加配置：

1. 提交 `.env.example`，只放变量名和安全示例；
2. 本机值写入 `.env.local`；
3. 只有以 `VITE_` 开头的变量可以在浏览器代码中读取；
4. API Key、Token、真实学生信息不得写入仓库或前端变量。

## 8. 常见问题

### `npm ci` 提示 Node 版本不兼容

先运行 `node --version`。升级到 Node.js 24 或更高版本后，删除未完成的 `node_modules` 并重新执行 `npm ci`。

### PowerShell 阻止脚本执行

先执行 `Set-ExecutionPolicy -Scope Process Bypass`，它只影响当前 PowerShell 会话，无需永久修改系统执行策略。激活脚本必须使用 `. .\scripts\activate-environment.ps1` 点源运行，才能修改当前会话的 PATH。

### 依赖状态异常

不要手工修改 `node_modules`。在 `web/` 中删除该目录后重新执行 `npm ci`。如确需升级依赖，使用 `npm install <package>@<version>` 并提交 `package.json` 与 `package-lock.json`。
