# nook-break

一个基于 `Vite + React + Tailwind CSS v4` 的纯静态前端项目，主题是“动物森友会风格的下班倒计时与健康提醒面板”。

项目当前聚焦于 3 件事：

- 上下班倒计时与显示单位切换
- 工作中休息提醒与健康节奏设置
- 下班庆祝弹框与背景音乐预热/缓存

它不是组件库，也不是多页面应用，而是一个单页前端应用，适合直接静态部署。

## 功能概览

- PC / 移动双端布局，移动端使用底部菜单切换主视图与健康面板
- 支持多语言界面：`zh`、`tc`、`en`、`ja`、`ko`
- 支持自定义上下班时间、工作间隔、休息时长
- 支持倒计时显示切换：时分秒、小时、分钟、秒、百分比
- 下班时自动弹出庆祝弹框并循环播放背景音乐
- 背景音乐支持构建期转码为网页更友好的 `ogg + mp3`
- 页面首次进入后空闲预热音频资源，降低真正触发播放时的加载等待
- 使用最小化 `Service Worker` 缓存下班音乐资源
- 关键运行状态持久化到本地，页面刷新后可基于本地状态重新计算恢复

## 技术栈

- `React 19`
- `Vite 6`
- `Tailwind CSS v4`
- `TypeScript`
- `lucide-react`
- `motion`

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

默认启动在 `http://localhost:3000`。

### 3. 类型检查

```bash
npm run lint
```

### 4. 构建

```bash
npm run build
```

说明：

- `build` 会先执行 `npm run audio:prepare`
- 如果 `public/audio/clockout-theme.ogg` 和 `public/audio/clockout-theme.mp3` 已经存在，则会直接复用
- 如果这两个文件不存在，则需要提供原始音频路径并确保系统可调用 `ffmpeg`

## 音频构建

下班庆祝弹框当前只保留一套背景音乐：

- `public/audio/clockout-theme.ogg`
- `public/audio/clockout-theme.mp3`

- `ogg`：优先兼容现代浏览器，体积通常更优
- `mp3`：作为兼容兜底格式

## 静态部署说明

本项目按“纯静态前端”设计，可直接部署到静态站点托管平台。

部署要点：

- 不依赖服务端数据库或接口
- 页面状态主要保存在浏览器本地存储
- `Service Worker` 只缓存下班音乐资源，不承担完整离线应用能力
- 构建产物位于 `dist/`

如果部署环境不会重新执行构建，只要确保以下资源已经进入仓库或构建产物即可：

- `public/audio/clockout-theme.ogg`
- `public/audio/clockout-theme.mp3`

## 状态与持久化

项目运行时会把部分状态写入 `localStorage`，包括但不限于：

- 当前语言
- 上班时间 / 下班时间
- 当前倒计时显示单位
- 休息提醒开关
- 工作间隔 / 休息时长
- 健康积分
- 静音状态
- 定时器状态机快照

核心逻辑不是简单“刷新即重置”，而是：

- 先读取本地状态机快照
- 再结合当前时间重新派生出当前应处于的状态
- 从而恢复工作中、休息中、已下班等状态

相关实现位于：

- src/hooks/useAppController.ts
- src/lib/timerMachine.ts
- src/lib/timerMachineStorage.ts

## 音频预热与缓存

下班音乐相关逻辑位于：

- src/lib/clockOutMusic.ts
- src/lib/registerServiceWorker.ts
- public/sw.js

当前策略：

- 页面初始化后，在浏览器空闲时预热音频资源
- 弹框真正显示时直接尝试循环播放
- `Service Worker` 仅缓存 `/audio/clockout-theme.ogg` 和 `/audio/clockout-theme.mp3`

## 项目结构

```text
src/
  App.tsx                         应用入口装配
  hooks/
    useAppController.ts           页面级状态、事件与副作用编排
  components/
    AppHeader.tsx                 顶部头部区域
    MainWorkspace.tsx             PC / 移动主工作区布局
    AnimalUI.tsx                  通用动物森风格 UI 组件
    CountdownCard.tsx             下班倒计时主卡片
    WorkRhythmPresets.tsx         工作作息设置卡片
    HealthPhonePanel.tsx          健康面板
    RestBonusModal.tsx            休息提醒弹窗
    ClockOutCelebrationModal.tsx  下班庆祝弹窗
  lib/
    clockOutMusic.ts              下班背景音乐服务
    registerServiceWorker.ts      SW 注册
    timerMachine.ts               定时器状态机
    timerMachineStorage.ts        状态机存储
  locales.ts                      多语言文案
  types.ts                        公共类型
  index.css                       全局样式与设计 token

public/
  audio/
    clockout-theme.ogg
    clockout-theme.mp3
  celebrate.png                   下班弹框主背景图
  pop-cover.jpeg                  下班弹框覆盖背景图
  favicon.svg                     站点图标
  sw.js                           最小化音频缓存 SW

scripts/
  prepare-clockout-audio.mjs      音频转码脚本
```

## 资源说明

- `public/celebrate.png`：下班弹框主视觉图
- `public/pop-cover.jpeg`：下班弹框半透明覆盖层
- `public/favicon.svg`：页面 favicon
- `PROMPT.md`：项目内固化的提示词文档
