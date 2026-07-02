# 浏览器兼容性修复设计

日期：2026-07-02

## 背景

当前项目在 Safari 下已经暴露出核心交互兼容问题：下班遮罩中的动物在 Safari 浏览器中无法正常 hover，也无法稳定拖动。项目中同时还存在一批高风险浏览器能力点，包括 `PointerEvent`、`setPointerCapture`、`touch-action`、`showPicker`、`requestIdleCallback`、`ResizeObserver`、`backdrop-filter`、`AudioContext` 及 `webkitAudioContext` 兼容路径。

项目部署形态为纯静态前端，正式支持目标采用行业主流基线：

- Chrome 最新版及前 1 个大版本
- Edge 最新版及前 1 个大版本
- Firefox 最新版及前 1 个大版本
- macOS Safari 最新版及前 1 个大版本
- iOS Safari 最新版及前 1 个大版本

本次修复目标不是单点补丁，而是建立一套稳定的兼容策略，优先解决 Safari 下班遮罩交互失效，并对项目中其他高风险浏览器能力做集中兜底。

## 目标

- 修复 Safari 下班遮罩动物 hover 与拖动失效问题
- 保证桌面端与移动端交互在 Safari 上可用
- 对现有高风险浏览器 API 建立 feature detection 与 fallback
- 保证视觉效果可以降级，但功能不可中断
- 不引入 UA 判断分支，统一采用能力检测
- 不扩大需求范围到旧版 IE、旧版 Android WebView 或非目标浏览器特判

## 非目标

- 不为 IE 或历史遗留浏览器新增兼容层
- 不重构整体页面架构
- 不改变现有产品交互规则，只修复兼容性与稳定性
- 不为视觉效果强行保持完全一致；允许 Safari 或低能力浏览器走功能优先的降级表现

## 方案对比

### 方案 A：关键交互兼容层 + 视觉渐进降级（推荐）

将 Safari 问题视为输入模型和浏览器能力兜底问题，新增统一兼容策略：

- 动物交互从“仅依赖 PointerEvent”改成“pointer 优先、mouse/touch 兜底”
- 关键 move/up 生命周期不再依赖单一元素级高级事件
- 将 `showPicker`、`ResizeObserver`、`requestIdleCallback`、`backdrop-filter`、音频播放限制等改成显式能力检测
- 视觉特效保留，但失效时提供静态降级

优点：

- 改动集中，适合当前项目
- 能系统性解决 Safari 兼容问题
- 后续新增交互时有统一模式可复用

缺点：

- 需要梳理多处组件，不是最小补丁

### 方案 B：只修 Safari 已暴露问题

仅修复 Safari 下班遮罩动物 hover/拖动、时间选择和音频。

优点：

- 速度快

缺点：

- 仍然会保留其它兼容隐患
- 后续可能继续补洞

### 方案 C：以 polyfill 为主

通过 polyfill 尽可能补齐浏览器能力，再少量改代码。

优点：

- 表面上改动较少

缺点：

- 对 PointerEvent / 触摸拖动 / 音频限制这类问题帮助有限
- 最终仍然需要改交互实现

结论：采用方案 A。

## 架构设计

### 1. 下班遮罩动物交互兼容层

核心组件是 `src/components/ClockOutCelebrationScene.tsx`。现状中，动物交互高度依赖：

- `pointerenter`
- `pointerleave`
- `pointerdown`
- `pointermove`
- `pointerup`
- `setPointerCapture`

这在 Safari 尤其是移动端 Safari 上并不稳定。修复后改成统一输入适配模型：

- 首选 `PointerEvent`，但不假设其完整可用
- 桌面 hover 与点击兜底使用 `mouseenter` / `mouseleave` / `mousedown` / `mousemove` / `mouseup`
- 触摸拖动兜底使用 `touchstart` / `touchmove` / `touchend` / `touchcancel`
- 关键拖动生命周期中的 move/up 事件绑定到 `window`，不依赖单个元素是否继续持有事件

坐标提取统一收敛为一个辅助函数，输入可以是：

- `PointerEvent`
- `MouseEvent`
- `TouchEvent`

该辅助函数输出统一的 `clientX` / `clientY`。

### 2. 动物 hover 与拖动状态机

当前动物存在以下状态：移动、hover、拖动、旋转切换、掉落、回队列。Safari 问题的根因之一是这些状态依赖事件源行为稳定。修复后将交互状态改成显式状态管理：

- `idle`
- `hovered`
- `dragging`
- `returning`
- `falling`
- `switching`

其中：

- hover 只在桌面端启用
- 触摸设备不依赖 hover
- dragging 开始后，当前动物临时从正常轮换逻辑中摘出
- dragging 结束时，根据位置进入 returning 或 falling
- returning / falling 完成后，再重新并入轮换队列
- 若刚回队列时正好遇到轮换时刻，则本轮跳过，避免双倍等待或瞬间换场

### 3. Safari 下拖动实现策略

具体规则：

- `pointerdown` 可用时继续使用
- 若浏览器不稳定或事件不完整，则改用 `mousedown + touchstart`
- 开始拖动后，在 `window` 上监听 `move/up/end/cancel`
- 触摸拖动期间显式 `preventDefault`
- 被交互动物提升 z-index，避免被其他动物覆盖
- 若释放点过近，则吸附到安全区域并回队列
- 若释放点超出阈值，则执行自由落体并在结束后回队列

这保证了即使 Safari 不稳定支持 `setPointerCapture`，拖动仍然完整。

### 4. 输入组件兼容策略

`src/components/AnimalUI.tsx` 中 time input 目前使用 `showPicker()`。该 API 在不同浏览器上的支持不统一。修复策略：

- 保留 `typeof input.showPicker === "function"` 检测
- 不支持时直接允许原生 time input 自己接管
- 不再让“无法调起 picker”影响整个输入交互
- 继续保证时间文字不可选中，但不影响点击、聚焦和系统选择器

### 5. 平台能力 fallback

#### `requestIdleCallback`

统一走 feature detection：

- 支持时用 `requestIdleCallback`
- 不支持时退回 `setTimeout`

并将这部分收口成内部通用 fallback，而不是散落在业务逻辑里。

#### `ResizeObserver`

统一走 feature detection：

- 支持时使用 `ResizeObserver`
- 不支持时退回首次测量 + `window.resize` 监听

适用于：

- 移动内容区间距测量
- 动物遮罩边界测量
- 烟花层画布边界测量

#### `AudioContext`

继续兼容：

- `window.AudioContext`
- `window.webkitAudioContext`

同时明确所有恢复播放逻辑必须由用户手势触发，避免 Safari 音频策略导致静默失败。

### 6. 视觉降级策略

项目当前多处使用 `backdrop-blur` / `backdrop-filter`。在 Safari 某些版本、低性能移动设备或兼容路径上，可能表现异常或成本过高。策略如下：

- 功能层不依赖 blur 是否生效
- blur 不可用时退化为纯半透明背景
- 主要应用于：
  - 顶部头部
  - 弹框/遮罩
  - 手机内部 panel
  - 移动端底部 dock

这样视觉可降级，但布局与交互保持不变。

## 影响范围

预计涉及：

- `src/components/ClockOutCelebrationScene.tsx`
- `src/components/ClockOutCelebrationModal.tsx`
- `src/components/AnimalUI.tsx`
- `src/components/ClockOutFireworksLayer.tsx`
- `src/hooks/useAppController.ts`
- `src/index.css`
- 可能新增一个小型兼容工具文件，例如 `src/lib/browserCompat.ts`

## 数据流与交互流

### 下班动物交互流

1. 用户 hover 或触摸动物
2. 输入适配层统一解析事件坐标
3. 当前动物状态从 `idle` 切到 `hovered` 或 `dragging`
4. 拖动中使用 `window` 级 move/up 维持连续性
5. 结束时根据释放位置判定：
   - 吸附回队列
   - 自由落体到边缘后回队列
6. 轮换队列感知该动物是否正处于交互中，避免切换时机冲突

### 降级流

1. 启动时检测能力
2. 按能力选择 pointer / mouse / touch 路径
3. 按能力选择 blur / no-blur 渲染
4. 按能力选择 showPicker / 原生输入
5. 按能力选择 requestIdleCallback / setTimeout

## 错误处理

- 事件绑定失败时使用基础鼠标/触摸兜底，不抛出运行时错误
- `showPicker` 被浏览器拦截时静默回退到原生 input
- `AudioContext` 不可恢复时，不阻断页面其他交互
- `ResizeObserver` 不可用时，仍保证有默认布局与 resize 更新

## 验收标准

### Safari 桌面端

- 下班遮罩动物 hover 生效
- 鼠标按下可拖动
- 拖动过程中不丢事件
- 松手后可正确吸附或掉落
- 重新入队后可继续参与轮换

### iPhone Safari

- 动物可按住并拖动
- 拖动时页面不抢滚动
- 松手后行为符合现有规则
- 音乐按钮、遮罩关闭、烟花与动物渲染不中断

### 全浏览器共同要求

- Chrome / Edge / Firefox 行为不回归
- 时间输入仍可用
- 背景音乐与提醒音效不因兼容层改造而失效
- 毛玻璃失效时视觉可退化，但功能不可中断
- 不依赖 UA 判断

## 测试与验证

本次不新增自动化测试用例，验证方式以手工兼容验证为主：

- Safari macOS
- iOS Safari
- Chrome
- Firefox

重点场景：

- 下班遮罩打开
- 动物 hover
- 动物拖动/释放
- 时间输入点击与选择
- 音频播放/暂停
- 移动端底部菜单与内容滚动

## 实施顺序

1. 抽离浏览器能力检测和事件适配辅助函数
2. 重写 `ClockOutCelebrationScene` 交互监听层
3. 修复 time input 的 Safari 兼容路径
4. 修复 blur / observer / idle callback 的 fallback
5. 回归桌面与移动主流程

## 风险

- `ClockOutCelebrationScene` 逻辑复杂，兼容层改造时最容易引入状态回归
- Safari 触摸事件与桌面 hover 行为差异大，需要严格区分输入场景
- move/up 改到 `window` 后，若清理不严谨，可能出现事件泄漏

## 结论

本次兼容修复采用“关键交互兼容层 + 视觉渐进降级”方案。优先解决 Safari 下班遮罩动物交互问题，并系统性兜底项目中已知高风险浏览器能力点，保证主流现代浏览器中的功能一致性与可用性。
