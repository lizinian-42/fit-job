import { CheckCircle2, Code2, PackageCheck } from 'lucide-react'

const environmentChecks = [
  {
    icon: Code2,
    title: 'React 工程',
    description: 'React 18、TypeScript 与 Vite 6 已连接。',
  },
  {
    icon: PackageCheck,
    title: '基础依赖',
    description: '路由、动效、图表、Mock 与 UI 基础依赖已锁定。',
  },
  {
    icon: CheckCircle2,
    title: '开发规范',
    description: 'ESLint、Prettier、Tailwind CSS 与路径别名已启用。',
  },
]

function App() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground sm:py-24">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Fit Job</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          React Web 原型开发环境已就绪。下一步将从统一视觉系统和产品首页开始构建完整演示故事线。
        </p>

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-3">
          {environmentChecks.map(({ description, icon: Icon, title }) => (
            <article className="bg-background p-6" key={title}>
              <Icon aria-hidden="true" className="h-5 w-5 text-primary" strokeWidth={1.8} />
              <h2 className="mt-5 text-base font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          本地启动命令：<code className="font-mono text-foreground">npm run dev</code>
        </p>
      </section>
    </main>
  )
}

export default App
