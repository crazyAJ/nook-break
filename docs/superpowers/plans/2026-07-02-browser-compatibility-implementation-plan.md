# Browser Compatibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 Safari 下班遮罩动物 hover/拖动失效问题，并为项目内高风险浏览器能力建立统一 fallback，保证 Chrome / Edge / Firefox / Safari（macOS + iOS）主流程可用且不依赖 UA 判断。

**Architecture:** 将浏览器兼容问题拆成两层处理。第一层是交互兼容层，重点改造 `ClockOutCelebrationScene.tsx`，把当前高度依赖 Pointer Events 的动物交互改成 `pointer` 优先、`mouse/touch` 兜底、`window` 级 move/up 生命周期托底。第二层是能力兼容层，抽离 `requestIdleCallback`、`ResizeObserver`、`showPicker`、`backdrop-filter` 等能力检测与降级逻辑，收口为轻量工具函数或 CSS 兼容 class，避免业务组件散落判断。

**Tech Stack:** React 19、TypeScript、Vite、Tailwind CSS、原生 DOM 事件、Safari/Chrome/Firefox 手工兼容验证

---

## File Structure

### New Files

- `src/lib/browserCompat.ts`
  - 收口浏览器能力检测、事件坐标提取、空闲回调 fallback、observer fallback 等通用工具

### Modified Files

- `src/components/ClockOutCelebrationScene.tsx`
  - 重构动物 hover/拖动输入层，补 `mouse/touch` fallback，并修复拖动结束后的重新入队时序
- `src/components/AnimalUI.tsx`
  - 收敛时间输入的 Safari 兼容路径，保留原生 time input 的可用性
- `src/components/ClockOutFireworksLayer.tsx`
  - 为边界测量补 `ResizeObserver` fallback
- `src/hooks/useAppController.ts`
  - 统一使用兼容工具处理 `requestIdleCallback`、`ResizeObserver`
- `src/components/ClockOutCelebrationModal.tsx`
  - 若存在对兼容工具或视觉降级 class 的依赖，补最小接入
- `src/index.css`
  - 增加 `backdrop-filter` 渐进降级样式

## Shared Types And Constants

以下名字在实施中保持一致，避免中途再次发散命名：

```ts
export type CompatiblePoint = {
  clientX: number;
  clientY: number;
};

export type CompatibleDragSource = "pointer" | "mouse" | "touch";

export type CompatibleDragStart = {
  point: CompatiblePoint;
  pointerId: number | null;
  source: CompatibleDragSource;
};

export const POINTER_CAPTURE_UNSUPPORTED = -1;
```

---

### Task 1: 建立浏览器兼容工具层

**Files:**
- Create: `src/lib/browserCompat.ts`
- Modify: `src/hooks/useAppController.ts`
- Modify: `src/components/ClockOutCelebrationScene.tsx`
- Modify: `src/components/ClockOutFireworksLayer.tsx`

- [ ] **Step 1: 新建兼容工具文件并收口能力检测**

在 `src/lib/browserCompat.ts` 中实现以下工具，避免组件继续各自判断：

```ts
export function supportsPointerEvents() {
  return typeof window !== "undefined" && "PointerEvent" in window;
}

export function supportsResizeObserver() {
  return typeof window !== "undefined" && "ResizeObserver" in window;
}

export function supportsBackdropFilter() {
  return (
    typeof CSS !== "undefined" &&
    (CSS.supports("backdrop-filter: blur(2px)") ||
      CSS.supports("-webkit-backdrop-filter: blur(2px)"))
  );
}

export function scheduleIdleCallback(callback: () => void) {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    const id = window.requestIdleCallback(() => callback());
    return () => window.cancelIdleCallback?.(id);
  }

  const timeoutId = window.setTimeout(callback, 120);
  return () => window.clearTimeout(timeoutId);
}
```

- [ ] **Step 2: 提供统一坐标提取与触摸事件辅助**

同文件补齐以下函数，供动物拖动层复用：

```ts
export function getEventPoint(
  event: PointerEvent | MouseEvent | TouchEvent,
): CompatiblePoint | null

export function isTouchEvent(
  event: Event,
): event is TouchEvent
```

要求：

- `touchstart/touchmove` 取 `touches[0]`
- `touchend/touchcancel` 取 `changedTouches[0]`
- 无法取到点位时返回 `null`

- [ ] **Step 3: 提供 observer fallback 安装函数**

在 `src/lib/browserCompat.ts` 增加一个统一 helper：

```ts
export function observeElementRect(
  element: Element,
  onMeasure: () => void,
) {
  onMeasure();

  if (supportsResizeObserver()) {
    const observer = new ResizeObserver(() => onMeasure());
    observer.observe(element);
    return () => observer.disconnect();
  }

  window.addEventListener("resize", onMeasure, {passive: true});
  return () => window.removeEventListener("resize", onMeasure);
}
```

- [ ] **Step 4: 将 `useAppController.ts` 改为调用兼容工具**

替换当前文件内散落的：

- `requestIdleCallback`
- `ResizeObserver`

要求：

- 暖启动预加载统一改走 `scheduleIdleCallback`
- 移动端 dock/内容区高度测量统一改走 `observeElementRect`
- 保持现有业务逻辑不变，只替换能力层

- [ ] **Step 5: 将烟花层测量逻辑改为调用兼容工具**

在 `src/components/ClockOutFireworksLayer.tsx` 中把现有 `ResizeObserver` 直接使用改为 `observeElementRect`，确保 Safari / 低能力浏览器至少能在首帧和窗口 resize 时更新边界。

---

### Task 2: 重构下班动物交互为 pointer 优先 + mouse/touch fallback

**Files:**
- Modify: `src/components/ClockOutCelebrationScene.tsx`

- [ ] **Step 1: 扩充拖动状态，记录输入源**

把当前仅依赖 `pointerId` 的拖动态改成同时记录：

```ts
type DragState = {
  actorId: string;
  pointerId: number | null;
  source: CompatibleDragSource;
  offsetX: number;
  offsetY: number;
};
```

要求：

- `pointer` 路径继续优先使用 `pointerId`
- `mouse/touch` 路径允许 `pointerId` 为 `null`

- [ ] **Step 2: 拆出统一的开始拖动、移动拖动、结束拖动处理函数**

把当前混在 `attachPointerHandlers` 里的逻辑拆成以下 3 类内部函数：

```ts
function beginActorInteraction(...)
function updateActorDrag(...)
function finishActorInteraction(...)
```

要求：

- 入参不再直接依赖某一种事件类型
- 全部通过 `getEventPoint()` 取点位
- hover 只在非触摸路径生效
- 当前被交互动物立刻提到最高 z-index

- [ ] **Step 3: 建立 pointer / mouse / touch 三套事件接入**

重写当前 `attachPointerHandlers`：

- 支持 `pointerenter/pointerleave/pointerdown`
- 同时兜底 `mouseenter/mouseleave/mousedown`
- 触摸兜底 `touchstart`

并新增 `window` 级监听：

- `pointermove/pointerup/pointercancel`
- `mousemove/mouseup`
- `touchmove/touchend/touchcancel`

要求：

- 不再依赖 `setPointerCapture` 才能完成拖动
- 若支持 `setPointerCapture` 可继续尝试，但失败不能影响后续逻辑
- `touchmove` 拖动期间显式 `preventDefault()`

- [ ] **Step 4: 修复 Safari hover 与移动端拖动兼容**

目标行为：

- Safari 桌面：hover 可暂停并放大当前动物
- Safari 桌面：按下后可拖动，松开后正常吸附或掉落
- iOS Safari：长按/拖动可移动动物，页面不抢滚动

实现要求：

- 触摸设备不依赖 hover
- `touch-action: none` 继续保留，但不能单独作为拖动成立前提
- 拖动中的动物临时从轮换队列中摘出

- [ ] **Step 5: 修复重新入队后等待两倍切换周期的问题**

在当前轮换逻辑中补一层“本轮跳过”控制：

- 动物交互结束重新入队时，若恰好撞上切换 tick，本次跳过切换
- 但不能重新开启一个完整双倍等待周期

要求：

- 只跳过当前一次轮换
- 下一次轮换按原节奏继续

- [ ] **Step 6: 处理极端场景：多个动物同时不在队列**

保持之前确认过的规则：

- 正常队列只消费仍处于 `queue` 状态的动物
- 若当前可轮换动物为空，则暂停轮换，不报错
- 任意动物结束交互并回到边缘或安全区域后，按它落位时的当前排列顺序插回队列

---

### Task 3: 修复时间输入与视觉效果的兼容路径

**Files:**
- Modify: `src/components/AnimalUI.tsx`
- Modify: `src/index.css`
- Modify: `src/components/ClockOutCelebrationModal.tsx`

- [ ] **Step 1: 收口 `showPicker` 兼容逻辑**

在 `src/components/AnimalUI.tsx` 中保留点击时间框即可弹原生选择器的交互，但逻辑调整为：

- `showPicker` 存在时尝试调用
- 调用失败时静默 fallback 到 `focus()`
- 不能因为 Safari 不支持 `showPicker` 导致时间输入不可操作

- [ ] **Step 2: 保持时间文字不可选中但不破坏系统选择按钮**

要求：

- `input[type="time"]` 文字不可选中
- 右侧系统 picker 图标/按钮仍然可见且可点击
- 不通过 `pointer-events: none` 之类方式破坏系统控件

- [ ] **Step 3: 为毛玻璃区域增加渐进降级 class**

在 `src/index.css` 中增加类似：

```css
.supports-backdrop .glass-surface {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.no-backdrop .glass-surface {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
```

要求：

- 现有依赖 blur 的区域在不支持时退化成纯半透明背景
- 不额外引入重布局或 JS 频繁切 class

- [ ] **Step 4: 将弹框/头部/手机面板接到统一降级 class**

把当前直接写死的高风险 blur 样式最小调整为统一 class 接入，重点覆盖：

- 下班遮罩层
- 头部或顶栏
- 手机内部 panel / dock

目标：

- 功能不依赖 blur
- Safari / 低能力浏览器即使不支持 blur，也只牺牲视觉，不影响布局与点击

---

### Task 4: 手工回归验证与清理

**Files:**
- Modify: `src/components/ClockOutCelebrationScene.tsx`
- Modify: `src/components/AnimalUI.tsx`
- Modify: `src/components/ClockOutFireworksLayer.tsx`
- Modify: `src/hooks/useAppController.ts`
- Modify: `src/index.css`
- Modify: `src/lib/browserCompat.ts`

- [ ] **Step 1: 手工验证桌面 Safari/Chrome/Firefox**

至少逐项验证以下场景：

- 打开下班遮罩
- hover 某只动物，动物停止、放大、置顶
- 鼠标按下拖动动物，松开后吸附或掉落
- 动物回队列后恢复轮换，且不会出现双倍等待
- 时间输入点击后仍可完成时分选择

- [ ] **Step 2: 手工验证 iPhone Safari**

重点验证：

- 长按/拖动动物可移动
- 拖动时页面不误滚动
- 松手后动物能回到边缘并重新进入轮换
- 音乐、遮罩开关、烟花层不受兼容改造影响

- [ ] **Step 3: 回归 Chrome/Edge 不回退**

确认以下行为无回归：

- 卡片内时间输入
- 下班遮罩打开/关闭
- 动物 hover/拖动/轮换
- 内容区和移动端底部菜单布局

- [ ] **Step 4: 清理兼容改造中的冗余分支**

完成实现后检查并删除：

- 已不再使用的局部事件工具函数
- 重复的 `ResizeObserver` / `requestIdleCallback` 判断
- 无效或重复的 blur class

- [ ] **Step 5: 构建验证**

Run:

```bash
npm run lint
npm run build
codegraph sync
```

Expected:

```text
lint 通过
build 通过
codegraph sync 完成
```

- [ ] **Step 6: 提交**

```bash
git add src/lib/browserCompat.ts src/components/ClockOutCelebrationScene.tsx src/components/AnimalUI.tsx src/components/ClockOutFireworksLayer.tsx src/hooks/useAppController.ts src/components/ClockOutCelebrationModal.tsx src/index.css docs/superpowers/plans/2026-07-02-browser-compatibility-implementation-plan.md
git commit -m "fix: harden browser compatibility across celebration flows"
```

如果当前工作区仍有不属于本次任务的用户改动，提交时只 stage 本次兼容修复涉及文件。
