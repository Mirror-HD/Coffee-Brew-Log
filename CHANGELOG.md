# 更新日志 / Changelog

## v1.1 (2026-08-14)

### 新增
- **冲煮记录日期可编辑**：所有冲煮方式的表单新增"日期"时间选择器，新建时默认当前时间，编辑时可回填并修改原记录时间；列表排序与仪表盘统计自动跟随。

### 修复
- **离线/弱网打开白屏、只剩文字的问题**：Tailwind CSS 和字体此前从 CDN 运行时加载，断网时样式全部丢失。现为构建期打包进本地资源，不再依赖任何外部 CDN。
- **Service Worker 离线缓存失效**：旧版预缓存的全是失效外链。重写后缓存本地构建产物（带内容哈希），断网时可完整离线打开应用。
- 移除 `index.html` 中失效的 `/index.css` 引用与 AI Studio 残留的 importmap 外链。

### 变更
- 字体从 Google Fonts 的 Inter 改为系统字体栈（含中文字体），减少网络依赖，首屏渲染更快。
- Service Worker 缓存版本升级（v1 → v2），旧缓存自动清理。

### 工程
- 新增 Tailwind CSS v3 构建期集成（`tailwind.config.js`、`postcss.config.js`、`index.css`）。
- `tsconfig.json` 补充 `vite/client` 类型，新增依赖后类型检查通过（`tsc --noEmit`）。

## v1.0 (2026-08-14)

- 首个发布版本：咖啡豆管理、冲煮记录、设备管理、特调配方、仪表盘图表、AI 冲煮分析、数据备份/恢复。
