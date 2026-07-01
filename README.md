# nook-break

一个基于 `Vite + React + TypeScript + Tailwind CSS v4` 的纯静态前端项目，主题是“动物森友会风格的下班倒计时、健康休息提醒与下班庆祝遮罩”。

项目当前聚焦 4 个核心能力：

- 上下班倒计时与多种显示单位切换
- 工作中休息提醒与健康节奏设置
- 下班庆祝遮罩、动物动画、烟花与背景音乐
- 本地状态机持久化，刷新后按当前时间恢复状态

它是单页静态应用，不依赖服务端接口、数据库或登录系统，适合直接部署到任意静态托管平台。

## 当前特性

- PC / 移动双端布局
- 多语言界面：`zh`、`tc`、`en`、`ja`、`ko`
- 自定义上下班时间、工作间隔、休息时长
- 倒计时显示支持：时分秒、小时、分钟、秒、百分比
- 工作中自动休息提醒与休息完成奖励
- 下班后自动弹出庆祝遮罩
- 下班背景音乐构建期转码为 `ogg + mp3`
- 首屏尽量轻，进入页面后空闲预热音频资源
- `Service Worker` 仅缓存下班音乐资源
- 本地状态机恢复工作中 / 休息中 / 已下班等状态

## 技术栈

- `React 19`
- `TypeScript`
- `Vite 6`
- `Tailwind CSS v4`
- `lucide-react`
- `motion`

## 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

默认地址：

```text
http://localhost:3000
```

### 类型检查

```bash
npm run lint
```

### 生产构建

```bash
npm run build
```

### 清理构建产物

```bash
npm run clean
```

## 音频构建说明

下班庆祝只保留一套背景音乐：

- `public/audio/clockout-theme.ogg`
- `public/audio/clockout-theme.mp3`

构建时会先执行：

```bash
npm run audio:prepare
```

当前策略：

- 如果 `ogg` 和 `mp3` 已经存在，则直接复用
- 如果缺失，则由 `scripts/prepare-clockout-audio.mjs` 负责准备
- 浏览器优先使用 `ogg`，`mp3` 作为兼容兜底

## 静态部署

本项目按“纯静态前端”设计，部署时只需要构建产物 `dist/`。

适合的部署方式：

- Cloudflare Pages
- Vercel 静态站点
- Netlify
- GitHub Pages
- 任意 Nginx / OSS 静态托管

部署要点：

- 不需要 Node 服务端常驻运行
- 直接构建后发布 `dist/` 即可
- 如果平台支持“从 Git 自动构建”，构建命令填 `npm run build`
- 发布目录填 `dist`

## 状态与持久化

项目运行时会把核心状态写入 `localStorage`，包括但不限于：

- 当前语言
- 上班时间 / 下班时间
- 当前倒计时显示单位
- 休息提醒开关
- 工作间隔 / 休息时长
- 健康积分
- 全局静音状态
- 下班音乐偏好状态
- 定时器状态机快照

核心逻辑不是“刷新即重置”，而是：

1. 读取本地状态机快照
2. 结合当前真实时间重新派生状态
3. 恢复到工作中、休息中、已下班等正确状态

相关实现：

- `src/hooks/useAppController.ts`
- `src/lib/timerMachine.ts`
- `src/lib/timerMachineStorage.ts`

## 下班庆祝相关实现

下班庆祝遮罩当前由 3 层组成：

- 遮罩层
- 动物庆祝场景层
- 烟花层

相关文件：

- `src/components/ClockOutCelebrationModal.tsx`
- `src/components/ClockOutCelebrationScene.tsx`
- `src/components/ClockOutFireworksLayer.tsx`
- `src/lib/clockOutMusic.ts`
- `src/lib/clockOutAnimalSprites.ts`

当前下班音乐行为：

- 打开下班遮罩时，从头播放背景音乐
- 手动关闭遮罩时停止背景音乐
- 卡片喇叭和遮罩喇叭共享同一份下班音乐偏好状态
- 只有“遮罩显示 && 喇叭开启”时才会实际播放

## Service Worker

项目只注册一个非常轻量的 `Service Worker`：

- `public/sw.js`

作用仅限：

- 缓存下班音乐资源

不负责：

- 整站离线缓存
- 页面数据同步
- 复杂资源更新策略

相关注册逻辑：

- `src/lib/registerServiceWorker.ts`

## 项目结构

```text
src/
  App.tsx
  main.tsx
  index.css
  locales.ts
  types.ts
  hooks/
    useAppController.ts
  components/
    AnimalUI.tsx
    AppHeader.tsx
    CountdownCard.tsx
    MainWorkspace.tsx
    WorkRhythmPresets.tsx
    HealthPhonePanel.tsx
    RestBonusModal.tsx
    ClockOutCelebrationModal.tsx
    ClockOutCelebrationScene.tsx
    ClockOutFireworksLayer.tsx
  lib/
    clockOutMusic.ts
    clockOutAnimalSprites.ts
    registerServiceWorker.ts
    timerMachine.ts
    timerMachineStorage.ts

public/
  favicon.svg
  rainbow.png
  robots.txt
  sw.js
  audio/
    clockout-theme.ogg
    clockout-theme.mp3
  images/
    clockout/
      animals/

scripts/
  prepare-clockout-audio.mjs
```

## 资源来源

- 下班动物素材：`Kenney - Animal Pack Remastered`
- 资源页：`https://kenney.nl/assets/animal-pack-remastered`
- 站点图标：`public/favicon.svg`
- 提示词固化文档：`PROMPT.md`

## 仓库清理现状

本轮已完成的清理方向：

- 删除未引用的历史平台配置文件
- 去掉一处真实未使用的场景变量
- 清理一段已失效的注释代码
- 修正一处配置文件乱码注释
- 将构建期依赖归位到 `devDependencies`

当前仓库仍保留：

- `docs/superpowers/` 设计文档与计划文档
- `PROMPT.md` 项目提示词文档

这些文件不是运行时依赖，但属于项目过程资产，因此默认保留。

## 校验

每次清理或改动后，建议至少执行：

```bash
npm run lint
npm run build
```

如果这两个命令通过，说明当前代码、类型和构建链路基本保持可用。
