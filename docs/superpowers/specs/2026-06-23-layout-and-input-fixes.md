# PC 与移动端布局/输入修复设计

日期：2026-06-23

## 目标

修复当前页面在 PC 与移动端上的 3 组明确问题：

- PC 端第一个卡片中“切换显示单位”区域超出卡片高度
- PC 端第二个卡片的时间设置虽然保留原生时间选择器，但当前无法正常选中/点选
- 移动端健康手机外框会随着页面继续向下滚动，而不是固定在可视区内
- 移动端窄宽屏/横屏下，标题区域与右侧时间框之间缺少稳定留白

本次修复只解决上述问题，不重做整体信息架构，不替换现有交互模型。

## 约束

- 时间设置必须保留当前原生时间选择器，不改为项目内自定义时分下拉
- 时间设置的目标是“保持现在可以选择”，只修复无法选中/聚焦的问题
- 移动端健康手机采用“外框固定在可视区，只有手机内部内容滚动”的方式
- 现有 `dashboard / nookphone` tab 结构保持不变
- 不新增复杂测量逻辑、额外状态机或重型响应式方案

## 现状

### PC 第一个卡片

[src/components/CountdownCard.tsx](D:/aj/work/nook-break/src/components/CountdownCard.tsx) 当前在卡片底部使用多行 wrap 的切换按钮组：

- `combination`
- `hours`
- `minutes`
- `seconds`
- `percentage`

该区域在桌面端固定卡片高度 `h-[348px]` 下，会与上方提示区、进度条和提交按钮叠加挤压，导致整体高度超出卡片。

### PC 第二个卡片

[src/components/WorkRhythmPresets.tsx](D:/aj/work/nook-break/src/components/WorkRhythmPresets.tsx) 中通过 [src/components/AnimalUI.tsx](D:/aj/work/nook-break/src/components/AnimalUI.tsx) 的 `Input` 组件包裹原生 `type="time"`。

当前问题不是时间模型错误，而是输入控件外层样式/交互区域影响了原生时间控件的点选或焦点行为，导致“不能选中”。

### 移动端健康手机

[src/App.tsx](D:/aj/work/nook-break/src/App.tsx) 中移动端内容区当前由统一的主滚动容器承载：

- 外层页面区域可滚动
- `nookphone` tab 下手机内容也在这个滚动流里

这会让手机外框跟随整页继续向下滚动，而不是保持在视口内。

### 移动端标题与时间框

[src/App.tsx](D:/aj/work/nook-break/src/App.tsx) 顶部 header 在窄宽屏或旋转屏幕下，标题区与右侧 `HUDClock` 之间缺少稳定的压缩策略和安全间距，导致右侧时间框贴边或留白不足。

## 方案选择

本次采用局部布局修正方案。

### 采用

1. 收紧 PC 第一个卡片底部切换单位区域的垂直占用
2. 保留原生 `type="time"`，只修复输入组件包裹方式导致的点击/聚焦问题
3. 将移动端 `nookphone` 视图改为“外框固定、内部滚动”
4. 为移动端 header 加入更稳定的宽度压缩与右侧留白策略

### 不采用

- 把时间选择器改成自定义时分下拉
  原因：用户明确要求保留当前可选择方式，只修复不能选中
- 重做移动端整体页面滚动架构
  原因：当前问题集中在滚动容器归属，不需要整体重构
- 通过 JS 运行时测量高度来动态压缩卡片
  原因：问题可通过现有布局和 Tailwind 约束解决，没必要增加脆弱逻辑

## 架构设计

### 一、PC 第一个卡片

[src/components/CountdownCard.tsx](D:/aj/work/nook-break/src/components/CountdownCard.tsx) 将做以下调整：

- 压缩“切换显示单位”标题与按钮区之间的垂直间距
- 收紧按钮本身的 padding、字号和行高
- 让底部切换区在桌面固定高度下优先保持紧凑展示
- 不删除任何选项，不修改 `activeUnit` 数据结构

目标是保证卡片在桌面既定高度下不再溢出，同时保持按钮仍然可点、语义不变。

### 二、PC 第二个卡片时间输入

[src/components/AnimalUI.tsx](D:/aj/work/nook-break/src/components/AnimalUI.tsx) 中 `Input` 组件将做针对 `type="time"` 的兼容修正：

- 保持原生 `input[type="time"]`
- 避免外层容器样式覆盖原生时间控件的可点击区域
- 确保聚焦、点选系统时间选择器、键盘输入仍可正常工作

[src/components/WorkRhythmPresets.tsx](D:/aj/work/nook-break/src/components/WorkRhythmPresets.tsx) 不改动数据流，只允许做与原生时间输入兼容相关的最小调用调整。

### 三、移动端健康手机固定

[src/App.tsx](D:/aj/work/nook-break/src/App.tsx) 中移动端布局会区分两种滚动行为：

- `dashboard` tab：继续使用页面滚动
- `nookphone` tab：手机外框固定在可视区内，高度由视口决定，手机内部内容滚动

为实现这一点：

- 页面主滚动不再驱动手机外框
- 手机外壳容器保持在固定高度范围内
- `HealthPhonePanel` 内部负责自身 `overflow-y-auto`

这样用户滚动时，视觉上会感受到“拿着固定手机看内部内容”，而不是整只手机被页面拖走。

### 四、移动端标题与右侧时间框间距

[src/App.tsx](D:/aj/work/nook-break/src/App.tsx) 的 header 区将补充以下约束：

- 标题区域允许更早进入压缩/截断
- 右侧时钟区域保持独立的最小展示空间
- 窄宽屏与横屏时，标题区和右侧时间框之间保留稳定 gap
- 参考当前宽屏/正常横向布局的视觉关系，不改变整体风格

目标不是把标题完整展开，而是在宽度不足时优先保证结构稳定，不让时间框贴边。

## 文件边界

本次改动预计仅涉及：

- [src/components/CountdownCard.tsx](D:/aj/work/nook-break/src/components/CountdownCard.tsx)
- [src/components/AnimalUI.tsx](D:/aj/work/nook-break/src/components/AnimalUI.tsx)
- [src/components/HealthPhonePanel.tsx](D:/aj/work/nook-break/src/components/HealthPhonePanel.tsx)
- [src/App.tsx](D:/aj/work/nook-break/src/App.tsx)

如无必要，不新增组件文件。

## 数据流与行为

### 时间设置

- `startTime` / `endTime` 继续沿用当前字符串格式
- 不修改 localStorage key
- 不修改倒计时计算逻辑
- 不新增时间转换层

### 切换显示单位

- `activeUnit` 继续使用现有状态与持久化方式
- 只修布局，不修业务逻辑

### 移动端手机

- `mobileTab === "nookphone"` 时，手机外框固定在视口内
- 只有手机内部面板滚动
- 底部 dock 继续固定

## 测试方案

### 组件与交互验证

1. PC 第一个卡片在常见桌面高度下不再因切换单位区域溢出
2. 时间输入框可正常点开系统时间选择器
3. 时间输入框仍可通过原生方式修改时间值

### 移动端布局验证

1. 切换到 `nookphone` tab 时，滚动不会带走手机外框
2. 手机内部面板可以独立滚动
3. 窄宽屏/横屏下标题与右侧时间框之间保留稳定间距

### 回归验证

1. `dashboard` tab 正常滚动
2. `HUDClock` 显示不被压坏
3. `CountdownCard` 的单位切换行为保持原有功能
4. 页面构建通过

## 风险与边界

- 原生 `type="time"` 在不同浏览器上的可视样式不完全一致，本次只保证其交互恢复正常，不追求完全一致外观
- 移动端固定手机外框需要谨慎处理高度与 `safe-area`，否则可能在极端小高度设备上压缩内容区域
- 这次不会顺手重构 `App.tsx` 的全部布局，只做与本问题直接相关的调整

## 实施边界

本次实现只覆盖：

- PC 卡片高度溢出修复
- 时间选择器可点击/可选中修复
- 移动端健康手机固定与内部滚动
- 移动端标题与时间框间距修复

本次不包含：

- 时间选择器重做
- 整体 header 视觉重设计
- 移动端页面架构重写
- 其他未提及的响应式微调
