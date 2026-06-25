# 本地计时状态机恢复设计

日期：2026-06-24

## 背景

当前应用在刷新页面或更新应用后，会重新初始化部分运行态，导致计时重新开始。现有实现只把配置类数据写入 `localStorage`，例如：

- `startTime`
- `endTime`
- `restInterval`
- `restDuration`
- `restReminderActive`
- `muteSound`

但以下运行态不会可靠恢复：

- `nextBreakSeconds`
- `isResting`
- `restTimeLeft`
- `hasCelebratedToday`

结果是页面重载后，用户会看到休息计时、休息弹框、下班状态与刷新前不一致。

## 目标

引入一份本地持久化的计时状态机快照，在页面重新加载时基于当前真实时间重新计算业务态，而不是简单恢复旧秒数。

目标范围：

- 恢复计时相关运行态
- 恢复当天是否已经触发过下班庆祝
- 刷新期间流逝的真实时间需要补算
- 当“下班”和“休息提醒”同时发生时，只处理下班，不弹休息弹框

非目标：

- 不恢复瞬时 UI 态，例如 `showClockOutModal`
- 不恢复背景音乐播放/暂停瞬时态
- 不把 React 组件内部所有 state 都做成持久化

## 现状问题

当前 `App.tsx` 中存在两类状态来源：

1. 配置态
   - 通过 `localStorage` 初始化和保存
2. 运行态
   - 依赖内存中的 `useState`
   - 依赖每秒 `setInterval` 驱动的 `now`

问题在于运行态没有统一真源。刷新时会出现：

- `nextBreakSeconds` 回到 `restInterval * 60`
- `restTimeLeft` 回到 `restDuration * 60`
- `isResting` 回到 `false`
- 当天已下班状态丢失或重新计算不一致

## 方案对比

### 方案 A：本地持久化业务状态机加时间戳

做法：

- 用一份快照表达业务状态
- 存储状态进入时间、休息周期锚点、休息结束时间、当天庆祝标记
- 页面加载时基于 `Date.now()` 和快照重建当前状态

优点：

- 能正确补算刷新期间流逝时间
- 业务规则集中，后续扩展稳定
- 最符合“本地状态机恢复”的目标

缺点：

- 需要把分散逻辑收拢进纯函数模块

### 方案 B：继续保留分散 state，加持久化快照

做法：

- 保存 `nextBreakSeconds/isResting/restTimeLeft/hasCelebratedToday`
- 刷新时根据 `lastSavedAt` 补算

优点：

- 接入较快

缺点：

- 运行态仍然分散
- 后续容易遗漏某个状态的迁移和恢复

### 方案 C：只保存时间锚点

做法：

- 只存“下一次休息触发时间”“休息结束时间”“当日庆祝标记”

优点：

- 数据最少

缺点：

- 模型脆弱
- 不适合继续扩展更多业务规则

## 选型

采用方案 A：本地持久化业务状态机加时间戳。

理由：

- 本次需求已经不是单点修复，而是引入稳定的刷新恢复模型
- 方案 A 的状态边界最清晰
- 后续增加规则时，不需要继续在 `App.tsx` 里堆补丁逻辑

## 状态机模型

### 状态枚举

```ts
type TimerMachineMode =
  | "idle_before_work"
  | "working"
  | "resting"
  | "after_work";
```

语义：

- `idle_before_work`：未到上班时间
- `working`：工作中，休息倒计时推进
- `resting`：正在休息，休息倒计时推进
- `after_work`：已下班，禁止新的休息提醒

### 快照结构

```ts
type TimerMachineSnapshot = {
  version: 1;
  mode: TimerMachineMode;
  enteredAt: number;
  restCycleAnchorAt: number | null;
  restEndsAt: number | null;
  celebratedWorkdayKey: string | null;
  configSnapshot: {
    startTime: string;
    endTime: string;
    restInterval: number;
    restDuration: number;
    restReminderActive: boolean;
  };
};
```

字段语义：

- `version`：快照版本号，用于后续迁移
- `mode`：当前业务阶段
- `enteredAt`：进入当前状态的绝对时间戳
- `restCycleAnchorAt`：当前工作周期中本轮休息计时的起点
- `restEndsAt`：休息结束时间，仅在 `resting` 时有效
- `celebratedWorkdayKey`：已完成下班庆祝的工作日标识，建议使用 `YYYY-MM-DD`
- `configSnapshot`：快照生成时的关键配置

### 派生数据

以下值不作为持久化真源，只由快照和当前时间推导：

- `nextBreakSeconds`
- `restTimeLeft`
- `isResting`
- `hasCelebratedToday`

## 事件优先级

为避免“下班和休息同时触发”的冲突，事件优先级固定为：

1. `clock_out`
2. `rest_due`

规则：

- 同一轮计算中如果下班和休息同时满足，只处理下班
- 一旦进入 `after_work`，禁止触发新的休息提醒
- 刷新恢复时如果离线期间同时跨过休息点与下班点，只落到 `after_work`
- 不补弹休息弹框

## 页面加载恢复流程

页面加载时执行以下步骤：

1. 读取本地状态机快照
2. 如果没有快照，按当前配置和当前时间初始化一份新快照
3. 校验快照版本与结构
4. 比较 `configSnapshot` 与当前配置
5. 如有差异，先执行配置迁移
6. 使用当前时间 `now` 重放状态
7. 输出新的快照和派生显示数据

### 恢复判定顺序

恢复时必须按以下顺序判断：

1. 是否已经 `after_work`
2. 是否处于 `resting`
3. 是否处于 `working`
4. 否则为 `idle_before_work`

这个顺序与事件优先级一致，确保下班优先于休息。

## 各状态恢复规则

### `idle_before_work`

条件：

- 当前时间早于上班时间

恢复结果：

- `mode = "idle_before_work"`
- `nextBreakSeconds = restInterval * 60`
- `isResting = false`
- `restTimeLeft = restDuration * 60`

说明：

- 未开始工作时，不推进休息倒计时

### `working`

条件：

- 当前时间在上班时间和下班时间之间
- 未进入休息窗口

恢复规则：

- 使用 `restCycleAnchorAt` 作为本轮休息周期起点
- 计算 `elapsed = now - restCycleAnchorAt`
- `nextBreakSeconds = max(0, restIntervalSeconds - elapsed)`

特殊规则：

- 在判定进入休息前，必须先判定是否已经下班
- 如果恢复时发现 `nextBreakSeconds <= 0` 且当前已到下班时间，则直接进入 `after_work`
- 不进入 `resting`

### `resting`

条件：

- 快照已进入休息态，且当前时间尚未超过 `restEndsAt`

恢复规则：

- `restTimeLeft = max(0, restEndsAt - now)`
- `isResting = true`

结束规则：

- 如果 `restEndsAt <= now`，恢复时不继续停留在 `resting`
- 直接结束休息并切回 `working`
- 新的 `restCycleAnchorAt = restEndsAt`

### `after_work`

条件：

- 当前时间已到或超过下班时间

恢复结果：

- `mode = "after_work"`
- `isResting = false`
- 不触发休息提醒
- `nextBreakSeconds` 与 `restTimeLeft` 重置为配置默认值，仅作为 UI 显示备用值
- `hasCelebratedToday` 根据 `celebratedWorkdayKey` 计算

## 配置变更迁移规则

### 上下班时间变更

如果 `startTime/endTime` 变化：

- 立即以新作息重建整台状态机
- 放弃沿用旧的工作周期定位

原因：

- 上下班边界变化会直接改变状态优先级和是否已下班的判断

### 休息间隔或时长变更

如果 `restInterval/restDuration` 变化：

- 保留当前大状态
- 若当前为 `working`，以“当前时刻”作为新的 `restCycleAnchorAt`
- 若当前为 `resting`，按新的 `restDuration` 从当前时刻重新开启本轮休息

### 休息提醒开关关闭

如果 `restReminderActive` 被关闭：

- 退出休息子流程
- 停止推进休息提醒状态
- 当前若处于 `resting`，直接结束休息并回到非休息流程

### 休息提醒开关重新开启

如果 `restReminderActive` 被重新开启：

- 从当前时刻开始新一轮休息周期
- 不沿用关闭前旧的剩余秒数

## UI 恢复范围

本次恢复范围限定为业务运行态，不包含瞬时 UI 态。

恢复：

- `nextBreakSeconds`
- `restTimeLeft`
- `isResting`
- `hasCelebratedToday`

不恢复：

- `showClockOutModal`
- 背景音乐是否正在播放
- 背景音乐是否暂停到哪个播放位置

原因：

- 这些属于瞬时展示行为
- 刷新后直接恢复可能造成体验和预期不一致

## 模块拆分

建议新增以下模块：

### `src/lib/timerMachine.ts`

职责：

- 定义状态机类型
- 初始化默认快照
- 纯函数恢复当前状态
- 处理事件优先级与状态迁移
- 派生 `nextBreakSeconds/restTimeLeft/isResting/hasCelebratedToday`

### `src/lib/timerMachineStorage.ts`

职责：

- `loadSnapshot()`
- `saveSnapshot()`
- `clearSnapshot()`
- `migrateSnapshot()`
- 处理脏数据和版本升级

### `src/App.tsx`

职责：

- 读取当前配置
- 在启动时加载并恢复状态机
- 每秒将 `now` 输入状态机
- 配置变化时触发迁移或重建
- UI 只消费派生结果，不再手写第二套运行真源

## 实施边界

### 保持不变

- 现有 UI 组件结构尽量不改
- 现有 `CountdownCard`、`HealthPhonePanel`、`RestBonusModal` 输入接口尽量保持兼容

### 允许变化

- `App.tsx` 内的计时推进逻辑需要被收敛
- 现有分散的运行态 `useState` 可能会减少或改成派生值

## 测试策略

至少覆盖以下场景：

1. 页面刷新前在工作中，刷新后正确恢复剩余休息倒计时
2. 页面刷新前在休息中，刷新后正确恢复 `restTimeLeft`
3. 刷新期间跨过休息开始点，刷新后进入 `resting`
4. 刷新期间休息已结束，刷新后回到 `working`
5. 刷新期间跨过下班时间，刷新后进入 `after_work`
6. 下班和休息同时发生时，只进入 `after_work`
7. 切换上下班时间后，状态机按新配置重建
8. 关闭再打开休息提醒后，周期从当前时刻重新开始
9. 损坏快照或旧版本快照能安全降级到默认初始化

## 风险与控制

### 风险 1：状态迁移与现有 UI 双真源冲突

控制：

- 明确状态机为唯一业务真源
- UI 显示值全部从派生函数获取

### 风险 2：时间边界处理不一致

控制：

- 统一使用绝对时间戳
- 统一定义“先判定下班，再判定休息”

### 风险 3：持久化数据损坏导致页面异常

控制：

- 存储层做版本校验与结构校验
- 异常时回退到默认初始化

## 验收标准

- 刷新页面后，工作中和休息中的计时都能按真实时间恢复
- 应用更新后重新打开，计时不从零开始
- 下班与休息同时触发时，只出现下班结果
- 页面刷新后不自动恢复旧弹框或旧音乐播放瞬时态
- 配置变更后状态机按规则迁移，不出现旧秒数污染
