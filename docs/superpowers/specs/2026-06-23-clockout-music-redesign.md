# 下班弹框背景音乐重构设计

日期：2026-06-23

## 目标

将当前下班弹框的程序合成背景音乐替换为用户提供的新音频文件，并完成一套适用于纯静态前端部署的轻量播放架构。

本次设计目标：

- 移除旧的程序合成主题曲逻辑
- 使用新的完整音频文件作为下班弹框循环背景音乐
- 保持首屏尽量轻，不阻塞页面首次渲染
- 在用户首次进入页面后后台渐进预加载音乐
- 在纯静态前端部署条件下尽量保证弹框出现时秒播
- 利用浏览器原生缓存体系优化后续访问
- 保留跨浏览器兼容和故障兜底能力

## 约束

- 部署形态：纯静态前端部署，不依赖独立后端服务
- 音频来源：用户上传的 `C:/Users/Administrator/Desktop/Main Theme.mp3`
- 构建期允许转码为更适合网页播放的资源
- 不允许裁剪音频内容
- 下班弹框中的背景音乐需要循环播放
- 首屏应尽量轻，允许后台渐进预加载
- 不引入运行时自定义压缩/解压协议

## 现状

当前项目的下班弹框背景音乐来自 [src/lib/titleMusic.ts](D:/aj/work/nook-break/src/lib/titleMusic.ts)，其实现方式是前端使用 Web Audio API 程序合成旋律，而不是播放真实音频文件。

当前播放链路：

- [src/App.tsx](D:/aj/work/nook-break/src/App.tsx) 中通过 `startTitleThemeLoop` / `stopTitleThemeLoop` 控制播放
- [src/components/ClockOutCelebrationModal.tsx](D:/aj/work/nook-break/src/components/ClockOutCelebrationModal.tsx) 中保留音乐开关 UI
- 仓库中当前没有现成的服务端实现，虽然依赖里存在 `express`，但未落地使用

这意味着现有音乐链路可以整体替换为“静态音频文件 + 客户端预热播放服务”。

## 方案选择

经过约束收敛，本次采用组合方案：

1. 构建期转码为网页友好音频格式
2. 页面首次进入后后台渐进预加载
3. 使用当前页内存缓存保证本次访问尽快播放
4. 使用 Service Worker + Cache Storage 优化后续访问
5. 保留静态 URL 直接播放作为最后兜底

不采用以下方案：

- 运行时“服务端高压缩、客户端解压”方案
  原因：纯静态部署下不存在稳定可控的服务端传输链路，复杂度高且收益低
- 将音频直接打进 JS 包或 base64 内嵌
  原因：会明显增大首屏包体，与“首屏尽量轻”的目标冲突
- 使用 IndexedDB 做自定义持久化音频缓存
  原因：维护成本高，超出当前需求

## 架构设计

### 一、文件落点

本次改造拆分为以下文件边界：

- `public/audio/clockout-theme.ogg`
  构建期生成的主播放资源，优先给支持 OGG 的现代浏览器使用
- `public/audio/clockout-theme.mp3`
  构建期生成的兼容兜底资源
- `src/lib/clockOutMusic.ts`
  新的前端音乐服务，负责预热、格式选择、播放、停止、静音同步和状态管理
- `public/sw.js`
  轻量 Service Worker，仅负责缓存下班背景音乐资源
- 构建期音频准备脚本
  负责将用户上传的原始 MP3 转码到 `public/audio/`

旧文件 [src/lib/titleMusic.ts](D:/aj/work/nook-break/src/lib/titleMusic.ts) 将被移除，原有调用点改接入新的 `clockOutMusic` 服务。

### 二、服务接口

`clockOutMusic` 采用单例服务，暴露最小接口：

- `warmup(): Promise<void>`
  页面首次进入后后台执行，用于预加载音频资源并准备当前页内存缓存
- `playLoop(): Promise<void>`
  下班弹框出现时调用，播放循环背景音乐
- `stop(): void`
  关闭弹框或静音时停止播放
- `setMuted(muted: boolean): void`
  同步静音状态
- `getStatus(): 'idle' | 'warming' | 'ready' | 'playing' | 'error'`
  调试用状态查询接口

### 三、播放器技术选型

播放器优先采用 `HTMLAudioElement`，而不是 `AudioBufferSourceNode`。

原因：

- 完整背景音乐循环播放场景下语义更直接
- 浏览器媒体缓存和解码路径更成熟
- 代码更轻，维护成本更低
- 不需要频谱控制、实时合成和复杂音效处理

Web Audio API 不再作为主要播放方案，仅在未来出现淡入淡出、混音、特效需求时再考虑引入。

## 数据流

### 首次访问

1. 应用启动
2. 注册 Service Worker
3. 页面进入稳定态后，在空闲时调用 `clockOutMusic.warmup()`
4. `warmup()` 检测浏览器是否支持 `audio/ogg`
5. 选择主资源 URL，优先 OGG，回退 MP3
6. 发起后台 `fetch`
7. 将结果保存在当前页可直接播放的内存结构中
8. 通知 Service Worker 将该音频写入 `Cache Storage`

### 弹框出现

1. 下班弹框显示
2. 调用 `clockOutMusic.playLoop()`
3. 若当前页已预热完成，则立即循环播放
4. 若当前页未预热完成，则回退到静态 URL 直接播放
5. 若浏览器缓存或 Service Worker 已命中，则快速响应

### 弹框关闭或静音

1. 弹框关闭或音乐开关切换为静音
2. 调用 `clockOutMusic.stop()`
3. 当前播放器实例停止
4. 保留已下载音频缓存，避免下次再次下载

## 缓存策略

### 当前页缓存

- `warmup()` 只执行一次
- 成功后保留已准备的播放资源，供本次访问秒播
- 不重复拉取相同资源

### Service Worker 缓存

- 仅缓存 `clockout-theme.ogg` 和 `clockout-theme.mp3`
- 使用独立缓存名，例如 `clockout-audio-v1`
- 后续更换音乐时通过升级缓存版本触发失效
- 不接管整站离线逻辑，避免引入额外风险

### HTTP 缓存

- 静态部署平台可继续利用原生静态资源缓存
- Service Worker 仅作为额外增强，不替代原生缓存体系

## 失败兜底

系统按三层优先级降级：

1. 当前页内存已预热资源
2. 浏览器缓存 / Service Worker Cache Storage 命中资源
3. 直接请求 `public/audio/*.ogg|mp3`

异常场景处理：

- OGG 不支持：自动回退 MP3
- 预加载失败：记录为 `error`，播放时走静态 URL 兜底
- SW 注册失败：不影响主流程，只失去后续访问加速
- 浏览器自动播放策略拦截：保留用户手势恢复通道，例如弹框内音乐按钮

## UI 与行为影响

### App 层

[src/App.tsx](D:/aj/work/nook-break/src/App.tsx) 将承担以下职责：

- 页面首次进入后触发 `warmup()`
- 下班弹框出现时触发 `playLoop()`
- 下班弹框关闭时触发 `stop()`
- 静音状态变化时调用 `setMuted()`

### 弹框层

[src/components/ClockOutCelebrationModal.tsx](D:/aj/work/nook-break/src/components/ClockOutCelebrationModal.tsx) 保持以下职责：

- 展示音乐开关 UI
- 将“切换静音”事件继续上抛到 `App`
- 不直接参与音频下载、缓存、格式选择与播放器状态控制

## 音频准备策略

原始文件为 [Main Theme.mp3](C:/Users/Administrator/Desktop/Main%20Theme.mp3)。

构建期处理原则：

- 保留完整内容，不裁剪
- 生成适合网页播放的 `ogg` 与 `mp3` 资源
- 文件名固定为：
  - `public/audio/clockout-theme.ogg`
  - `public/audio/clockout-theme.mp3`
- 音频循环逻辑由前端播放器控制，不在素材层裁切循环点

## 测试方案

### 功能验证

1. 首次访问时页面正常打开，首屏不因音频阻塞
2. 页面空闲后开始后台预热音频
3. 下班弹框出现时，预热完成场景可立即循环播放
4. 关闭弹框时音乐立即停止
5. 静音按钮能立即停播，再次取消静音后可恢复
6. 浏览器不支持 OGG 时能正确回退到 MP3

### 缓存验证

1. 首次访问后音频能写入 SW 缓存
2. 刷新后二次访问时预热请求明显更快
3. SW 注册失败时，功能仍可通过静态 URL 正常播放
4. 更换资源版本后旧缓存不会错误复用

### 兼容性验证

1. Chromium 系浏览器正常播放
2. Safari / iOS 环境下格式回退与循环行为正常
3. 自动播放策略拦截时，用户手势可恢复播放

## 风险与边界

- 浏览器自动播放限制无法被完全规避，本方案只能通过预加载和用户手势恢复降低失败概率，不能承诺“绝对无交互自动出声”
- Service Worker 增加了缓存版本管理要求，后续换音乐时必须同步更新版本号
- 如果部署平台对 SW 或缓存头有限制，则二次访问优化效果会下降，但不影响主功能

## 实施边界

本次实现只覆盖：

- 更换下班弹框背景音乐资源
- 移除旧程序合成逻辑
- 引入轻量播放器服务
- 引入轻量 SW 缓存增强
- 保持现有 UI 交互语义基本不变

本次不包含：

- 全站音频系统抽象
- 多首背景音乐切换
- 音量滑杆、淡入淡出、音频可视化
- 离线完整 PWA 化改造
