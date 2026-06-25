# Local Timer State Machine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在刷新页面或应用更新后，基于本地持久化状态机和真实时间重建工作/休息/下班状态，避免计时重新开始。

**Architecture:** 将当前分散在 `src/App.tsx` 的计时运行态收拢为一份持久化状态机快照。新增纯函数状态机模块负责恢复和派生显示值，新增存储模块负责读写和迁移，`App.tsx` 只负责把当前配置和当前时间送入状态机并消费派生结果。

**Tech Stack:** React 19、TypeScript、Vitest、localStorage

---

## File Structure

### New Files

- `src/lib/timerMachine.ts`
  - 定义状态机类型、初始化逻辑、恢复逻辑、配置迁移逻辑、派生显示值逻辑
- `src/lib/timerMachineStorage.ts`
  - 负责快照加载、保存、清除、迁移、脏数据降级
- `src/lib/timerMachine.test.ts`
  - 覆盖状态机纯函数的核心场景
- `src/lib/timerMachineStorage.test.ts`
  - 覆盖存储层的加载、迁移、异常降级

### Modified Files

- `src/App.tsx`
  - 移除运行态双真源，改为从状态机派生 `nextBreakSeconds`、`restTimeLeft`、`isResting`、`hasCelebratedToday`
- `src/components/layoutRegression.test.tsx`
  - 若现有 `App` 初始化测试受新增持久化层影响，补最小兼容调整

## Shared Types And Constants

以下代码片段会在多个任务中复用，后续任务均以这些名字为准：

```ts
export type TimerMachineMode =
  | "idle_before_work"
  | "working"
  | "resting"
  | "after_work";

export type TimerMachineConfig = {
  startTime: string;
  endTime: string;
  restInterval: number;
  restDuration: number;
  restReminderActive: boolean;
};

export type TimerMachineSnapshot = {
  version: 1;
  mode: TimerMachineMode;
  enteredAt: number;
  restCycleAnchorAt: number | null;
  restEndsAt: number | null;
  celebratedWorkdayKey: string | null;
  configSnapshot: TimerMachineConfig;
};

export type TimerMachineDerived = {
  snapshot: TimerMachineSnapshot;
  nextBreakSeconds: number;
  restTimeLeft: number;
  isResting: boolean;
  hasCelebratedToday: boolean;
};

export const TIMER_MACHINE_STORAGE_KEY = "timerMachineSnapshot";
export const TIMER_MACHINE_VERSION = 1 as const;
```

---

### Task 1: 建立状态机类型与失败测试

**Files:**
- Create: `src/lib/timerMachine.ts`
- Test: `src/lib/timerMachine.test.ts`

- [ ] **Step 1: 写状态机恢复失败测试**

在 `src/lib/timerMachine.test.ts` 新建以下测试骨架：

```ts
import {describe, expect, it} from "vitest";
import {
  createInitialTimerMachineSnapshot,
  deriveTimerMachineState,
  reconcileTimerMachineSnapshot,
} from "./timerMachine";

describe("timerMachine", () => {
  it("restores working countdown after reload by elapsed real time", () => {
    const config = {
      startTime: "09:00",
      endTime: "18:00",
      restInterval: 60,
      restDuration: 5,
      restReminderActive: true,
    };

    const snapshot = {
      version: 1 as const,
      mode: "working" as const,
      enteredAt: Date.UTC(2026, 5, 24, 1, 0, 0),
      restCycleAnchorAt: Date.UTC(2026, 5, 24, 1, 0, 0),
      restEndsAt: null,
      celebratedWorkdayKey: null,
      configSnapshot: config,
    };

    const derived = deriveTimerMachineState(
      snapshot,
      config,
      Date.UTC(2026, 5, 24, 1, 30, 0),
      "2026-06-24",
    );

    expect(derived.isResting).toBe(false);
    expect(derived.nextBreakSeconds).toBe(30 * 60);
  });

  it("prefers after_work over rest_due when both happen at the same moment", () => {
    const config = {
      startTime: "09:00",
      endTime: "10:00",
      restInterval: 60,
      restDuration: 5,
      restReminderActive: true,
    };

    const snapshot = createInitialTimerMachineSnapshot(
      config,
      Date.UTC(2026, 5, 24, 1, 0, 0),
      "2026-06-24",
    );

    const derived = reconcileTimerMachineSnapshot(
      snapshot,
      config,
      Date.UTC(2026, 5, 24, 2, 0, 0),
      "2026-06-24",
    );

    expect(derived.snapshot.mode).toBe("after_work");
    expect(derived.isResting).toBe(false);
    expect(derived.hasCelebratedToday).toBe(true);
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
npm run test -- src/lib/timerMachine.test.ts
```

Expected:

```text
FAIL  src/lib/timerMachine.test.ts
Error: Failed to resolve import "./timerMachine"
```

- [ ] **Step 3: 写最小状态机实现骨架**

在 `src/lib/timerMachine.ts` 新建最小实现，先导出测试所需符号：

```ts
export type TimerMachineMode =
  | "idle_before_work"
  | "working"
  | "resting"
  | "after_work";

export type TimerMachineConfig = {
  startTime: string;
  endTime: string;
  restInterval: number;
  restDuration: number;
  restReminderActive: boolean;
};

export type TimerMachineSnapshot = {
  version: 1;
  mode: TimerMachineMode;
  enteredAt: number;
  restCycleAnchorAt: number | null;
  restEndsAt: number | null;
  celebratedWorkdayKey: string | null;
  configSnapshot: TimerMachineConfig;
};

export type TimerMachineDerived = {
  snapshot: TimerMachineSnapshot;
  nextBreakSeconds: number;
  restTimeLeft: number;
  isResting: boolean;
  hasCelebratedToday: boolean;
};

const TIMER_MACHINE_VERSION = 1 as const;

function toSeconds(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 3600 + minute * 60;
}

function getDaySeconds(timestamp: number) {
  const date = new Date(timestamp);
  return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
}

export function createInitialTimerMachineSnapshot(
  config: TimerMachineConfig,
  now: number,
  workdayKey: string,
): TimerMachineSnapshot {
  const current = getDaySeconds(now);
  const start = toSeconds(config.startTime);
  const end = toSeconds(config.endTime);

  if (current >= end) {
    return {
      version: TIMER_MACHINE_VERSION,
      mode: "after_work",
      enteredAt: now,
      restCycleAnchorAt: null,
      restEndsAt: null,
      celebratedWorkdayKey: workdayKey,
      configSnapshot: config,
    };
  }

  if (current < start) {
    return {
      version: TIMER_MACHINE_VERSION,
      mode: "idle_before_work",
      enteredAt: now,
      restCycleAnchorAt: null,
      restEndsAt: null,
      celebratedWorkdayKey: null,
      configSnapshot: config,
    };
  }

  return {
    version: TIMER_MACHINE_VERSION,
    mode: "working",
    enteredAt: now,
    restCycleAnchorAt: now,
    restEndsAt: null,
    celebratedWorkdayKey: null,
    configSnapshot: config,
  };
}

export function deriveTimerMachineState(
  snapshot: TimerMachineSnapshot,
  config: TimerMachineConfig,
  now: number,
  workdayKey: string,
): TimerMachineDerived {
  return reconcileTimerMachineSnapshot(snapshot, config, now, workdayKey);
}

export function reconcileTimerMachineSnapshot(
  snapshot: TimerMachineSnapshot,
  config: TimerMachineConfig,
  now: number,
  workdayKey: string,
): TimerMachineDerived {
  const current = getDaySeconds(now);
  const start = toSeconds(config.startTime);
  const end = toSeconds(config.endTime);
  const restIntervalSeconds = config.restInterval * 60;
  const restDurationSeconds = config.restDuration * 60;

  if (current >= end) {
    const nextSnapshot: TimerMachineSnapshot = {
      version: TIMER_MACHINE_VERSION,
      mode: "after_work",
      enteredAt: now,
      restCycleAnchorAt: null,
      restEndsAt: null,
      celebratedWorkdayKey: workdayKey,
      configSnapshot: config,
    };

    return {
      snapshot: nextSnapshot,
      nextBreakSeconds: restIntervalSeconds,
      restTimeLeft: restDurationSeconds,
      isResting: false,
      hasCelebratedToday: true,
    };
  }

  if (snapshot.mode === "working" && snapshot.restCycleAnchorAt !== null) {
    const elapsedSeconds = Math.floor((now - snapshot.restCycleAnchorAt) / 1000);
    const nextBreakSeconds = Math.max(0, restIntervalSeconds - elapsedSeconds);

    return {
      snapshot: {
        ...snapshot,
        configSnapshot: config,
      },
      nextBreakSeconds,
      restTimeLeft: restDurationSeconds,
      isResting: false,
      hasCelebratedToday: snapshot.celebratedWorkdayKey === workdayKey,
    };
  }

  return {
    snapshot,
    nextBreakSeconds: restIntervalSeconds,
    restTimeLeft: restDurationSeconds,
    isResting: false,
    hasCelebratedToday: snapshot.celebratedWorkdayKey === workdayKey,
  };
}
```

- [ ] **Step 4: 运行测试并确认通过**

Run:

```bash
npm run test -- src/lib/timerMachine.test.ts
```

Expected:

```text
PASS  src/lib/timerMachine.test.ts
2 passed
```

- [ ] **Step 5: 提交**

```bash
git add src/lib/timerMachine.ts src/lib/timerMachine.test.ts
git commit -m "feat: add timer machine core"
```

如果 `git status` 返回 `not a git repository`，在当前工作区跳过这一步，只保留文件变更。

---

### Task 2: 完成状态机恢复、迁移与下班优先规则

**Files:**
- Modify: `src/lib/timerMachine.ts`
- Test: `src/lib/timerMachine.test.ts`

- [ ] **Step 1: 扩充失败测试覆盖全部恢复场景**

在 `src/lib/timerMachine.test.ts` 追加以下测试：

```ts
it("restores an active rest by remaining real time", () => {
  const config = {
    startTime: "09:00",
    endTime: "18:00",
    restInterval: 60,
    restDuration: 5,
    restReminderActive: true,
  };

  const snapshot = {
    version: 1 as const,
    mode: "resting" as const,
    enteredAt: Date.UTC(2026, 5, 24, 2, 0, 0),
    restCycleAnchorAt: Date.UTC(2026, 5, 24, 1, 0, 0),
    restEndsAt: Date.UTC(2026, 5, 24, 2, 5, 0),
    celebratedWorkdayKey: null,
    configSnapshot: config,
  };

  const derived = reconcileTimerMachineSnapshot(
    snapshot,
    config,
    Date.UTC(2026, 5, 24, 2, 2, 0),
    "2026-06-24",
  );

  expect(derived.isResting).toBe(true);
  expect(derived.restTimeLeft).toBe(3 * 60);
});

it("ends a finished rest and starts a new working cycle from rest end time", () => {
  const config = {
    startTime: "09:00",
    endTime: "18:00",
    restInterval: 60,
    restDuration: 5,
    restReminderActive: true,
  };

  const snapshot = {
    version: 1 as const,
    mode: "resting" as const,
    enteredAt: Date.UTC(2026, 5, 24, 2, 0, 0),
    restCycleAnchorAt: Date.UTC(2026, 5, 24, 1, 0, 0),
    restEndsAt: Date.UTC(2026, 5, 24, 2, 5, 0),
    celebratedWorkdayKey: null,
    configSnapshot: config,
  };

  const derived = reconcileTimerMachineSnapshot(
    snapshot,
    config,
    Date.UTC(2026, 5, 24, 2, 10, 0),
    "2026-06-24",
  );

  expect(derived.snapshot.mode).toBe("working");
  expect(derived.snapshot.restCycleAnchorAt).toBe(Date.UTC(2026, 5, 24, 2, 5, 0));
  expect(derived.nextBreakSeconds).toBe(55 * 60);
});

it("rebuilds the machine from current time when schedule changes", () => {
  const oldConfig = {
    startTime: "09:00",
    endTime: "18:00",
    restInterval: 60,
    restDuration: 5,
    restReminderActive: true,
  };
  const newConfig = {
    ...oldConfig,
    endTime: "17:00",
  };

  const snapshot = createInitialTimerMachineSnapshot(
    oldConfig,
    Date.UTC(2026, 5, 24, 1, 0, 0),
    "2026-06-24",
  );

  const derived = reconcileTimerMachineSnapshot(
    snapshot,
    newConfig,
    Date.UTC(2026, 5, 24, 9, 30, 0),
    "2026-06-24",
  );

  expect(derived.snapshot.mode).toBe("after_work");
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
npm run test -- src/lib/timerMachine.test.ts
```

Expected:

```text
FAIL
Expected "resting" handling or config migration assertions to pass, but received default working values
```

- [ ] **Step 3: 完成状态机纯函数**

在 `src/lib/timerMachine.ts` 中补齐恢复与迁移逻辑，保持以下函数签名：

```ts
export function reconcileTimerMachineSnapshot(
  snapshot: TimerMachineSnapshot,
  config: TimerMachineConfig,
  now: number,
  workdayKey: string,
): TimerMachineDerived
```

关键实现片段：

```ts
function hasConfigChanged(
  snapshot: TimerMachineSnapshot,
  config: TimerMachineConfig,
) {
  return JSON.stringify(snapshot.configSnapshot) !== JSON.stringify(config);
}

function buildWorkingDerived(
  snapshot: TimerMachineSnapshot,
  config: TimerMachineConfig,
  now: number,
  workdayKey: string,
): TimerMachineDerived {
  const anchor = snapshot.restCycleAnchorAt ?? now;
  const elapsedSeconds = Math.floor((now - anchor) / 1000);
  const nextBreakSeconds = Math.max(0, config.restInterval * 60 - elapsedSeconds);

  if (config.restReminderActive && nextBreakSeconds <= 0) {
    const restEndsAt = now + config.restDuration * 60 * 1000;
    return {
      snapshot: {
        version: TIMER_MACHINE_VERSION,
        mode: "resting",
        enteredAt: now,
        restCycleAnchorAt: anchor,
        restEndsAt,
        celebratedWorkdayKey: snapshot.celebratedWorkdayKey,
        configSnapshot: config,
      },
      nextBreakSeconds: config.restInterval * 60,
      restTimeLeft: config.restDuration * 60,
      isResting: true,
      hasCelebratedToday: snapshot.celebratedWorkdayKey === workdayKey,
    };
  }

  return {
    snapshot: {
      ...snapshot,
      mode: "working",
      configSnapshot: config,
    },
    nextBreakSeconds,
    restTimeLeft: config.restDuration * 60,
    isResting: false,
    hasCelebratedToday: snapshot.celebratedWorkdayKey === workdayKey,
  };
}

function rebuildForConfigChange(
  snapshot: TimerMachineSnapshot,
  config: TimerMachineConfig,
  now: number,
  workdayKey: string,
): TimerMachineSnapshot {
  if (!config.restReminderActive) {
    return {
      ...createInitialTimerMachineSnapshot(config, now, workdayKey),
      celebratedWorkdayKey: snapshot.celebratedWorkdayKey,
    };
  }

  if (
    snapshot.configSnapshot.startTime !== config.startTime ||
    snapshot.configSnapshot.endTime !== config.endTime
  ) {
    return {
      ...createInitialTimerMachineSnapshot(config, now, workdayKey),
      celebratedWorkdayKey: snapshot.celebratedWorkdayKey,
    };
  }

  if (snapshot.mode === "resting") {
    return {
      version: TIMER_MACHINE_VERSION,
      mode: "resting",
      enteredAt: now,
      restCycleAnchorAt: now,
      restEndsAt: now + config.restDuration * 60 * 1000,
      celebratedWorkdayKey: snapshot.celebratedWorkdayKey,
      configSnapshot: config,
    };
  }

  return {
    version: TIMER_MACHINE_VERSION,
    mode: "working",
    enteredAt: now,
    restCycleAnchorAt: now,
    restEndsAt: null,
    celebratedWorkdayKey: snapshot.celebratedWorkdayKey,
    configSnapshot: config,
  };
}
```

在 `reconcileTimerMachineSnapshot()` 中按以下顺序处理：

1. 配置变更迁移
2. 下班优先
3. `resting` 恢复
4. `working` 恢复
5. `idle_before_work`

- [ ] **Step 4: 运行测试并确认通过**

Run:

```bash
npm run test -- src/lib/timerMachine.test.ts
```

Expected:

```text
PASS  src/lib/timerMachine.test.ts
5 passed
```

- [ ] **Step 5: 提交**

```bash
git add src/lib/timerMachine.ts src/lib/timerMachine.test.ts
git commit -m "feat: complete timer machine recovery rules"
```

如果 `git status` 返回 `not a git repository`，在当前工作区跳过这一步，只保留文件变更。

---

### Task 3: 新增存储层与快照迁移保护

**Files:**
- Create: `src/lib/timerMachineStorage.ts`
- Create: `src/lib/timerMachineStorage.test.ts`

- [ ] **Step 1: 写存储层失败测试**

在 `src/lib/timerMachineStorage.test.ts` 中加入：

```ts
import {beforeEach, describe, expect, it, vi} from "vitest";
import {
  clearTimerMachineSnapshot,
  loadTimerMachineSnapshot,
  saveTimerMachineSnapshot,
} from "./timerMachineStorage";

describe("timerMachineStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trips a valid snapshot", () => {
    const snapshot = {
      version: 1 as const,
      mode: "working" as const,
      enteredAt: 1,
      restCycleAnchorAt: 1,
      restEndsAt: null,
      celebratedWorkdayKey: null,
      configSnapshot: {
        startTime: "09:00",
        endTime: "18:00",
        restInterval: 60,
        restDuration: 5,
        restReminderActive: true,
      },
    };

    saveTimerMachineSnapshot(snapshot);
    expect(loadTimerMachineSnapshot()).toEqual(snapshot);
  });

  it("returns null for broken payloads", () => {
    localStorage.setItem("timerMachineSnapshot", "{broken");
    expect(loadTimerMachineSnapshot()).toBeNull();
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
npm run test -- src/lib/timerMachineStorage.test.ts
```

Expected:

```text
FAIL  src/lib/timerMachineStorage.test.ts
Error: Failed to resolve import "./timerMachineStorage"
```

- [ ] **Step 3: 编写存储层最小实现**

在 `src/lib/timerMachineStorage.ts` 中实现：

```ts
import {TimerMachineSnapshot} from "./timerMachine";

export const TIMER_MACHINE_STORAGE_KEY = "timerMachineSnapshot";

function isValidSnapshot(value: unknown): value is TimerMachineSnapshot {
  if (!value || typeof value !== "object") return false;

  const snapshot = value as Record<string, unknown>;
  return (
    snapshot.version === 1 &&
    typeof snapshot.mode === "string" &&
    typeof snapshot.enteredAt === "number" &&
    "configSnapshot" in snapshot
  );
}

export function loadTimerMachineSnapshot(): TimerMachineSnapshot | null {
  const raw = localStorage.getItem(TIMER_MACHINE_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return isValidSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveTimerMachineSnapshot(snapshot: TimerMachineSnapshot) {
  localStorage.setItem(TIMER_MACHINE_STORAGE_KEY, JSON.stringify(snapshot));
}

export function clearTimerMachineSnapshot() {
  localStorage.removeItem(TIMER_MACHINE_STORAGE_KEY);
}
```

- [ ] **Step 4: 运行测试并确认通过**

Run:

```bash
npm run test -- src/lib/timerMachineStorage.test.ts
```

Expected:

```text
PASS  src/lib/timerMachineStorage.test.ts
2 passed
```

- [ ] **Step 5: 提交**

```bash
git add src/lib/timerMachineStorage.ts src/lib/timerMachineStorage.test.ts
git commit -m "feat: add timer machine storage"
```

如果 `git status` 返回 `not a git repository`，在当前工作区跳过这一步，只保留文件变更。

---

### Task 4: 将 App 接入状态机单一真源

**Files:**
- Modify: `src/App.tsx`
- Test: `src/components/layoutRegression.test.tsx`
- Test: `src/lib/timerMachine.test.ts`

- [ ] **Step 1: 写 App 级失败测试**

在 `src/components/layoutRegression.test.tsx` 追加一个最小集成场景：

```ts
it("restores persisted working countdown after App reload", async () => {
  const snapshot = {
    version: 1,
    mode: "working",
    enteredAt: Date.UTC(2026, 5, 24, 1, 0, 0),
    restCycleAnchorAt: Date.UTC(2026, 5, 24, 1, 0, 0),
    restEndsAt: null,
    celebratedWorkdayKey: null,
    configSnapshot: {
      startTime: "09:00",
      endTime: "18:00",
      restInterval: 60,
      restDuration: 5,
      restReminderActive: true,
    },
  };

  window.localStorage.setItem("timerMachineSnapshot", JSON.stringify(snapshot));
  vi.setSystemTime(new Date("2026-06-24T09:30:00+08:00"));

  const container = await renderMobileApp();

  expect(container.textContent).toContain("00 : 30 : 00");
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
npm run test -- src/components/layoutRegression.test.tsx
```

Expected:

```text
FAIL
Expected restored countdown text, but App still resets from default interval
```

- [ ] **Step 3: 重构 `src/App.tsx` 为状态机协调层**

先在文件顶部引入：

```ts
import {
  createInitialTimerMachineSnapshot,
  deriveTimerMachineState,
  type TimerMachineConfig,
  type TimerMachineSnapshot,
} from "./lib/timerMachine";
import {
  loadTimerMachineSnapshot,
  saveTimerMachineSnapshot,
} from "./lib/timerMachineStorage";
```

将计时配置收拢成一个对象：

```ts
  const timerMachineConfig: TimerMachineConfig = {
    startTime,
    endTime,
    restInterval,
    restDuration,
    restReminderActive,
  };
```

新增本地状态机快照状态并在初始化时恢复：

```ts
  const [timerMachineSnapshot, setTimerMachineSnapshot] = useState<TimerMachineSnapshot | null>(
    () => loadTimerMachineSnapshot(),
  );

  useEffect(() => {
    const workdayKey = now.toISOString().slice(0, 10);
    const seed =
      timerMachineSnapshot ??
      createInitialTimerMachineSnapshot(timerMachineConfig, now.getTime(), workdayKey);

    const derived = deriveTimerMachineState(
      seed,
      timerMachineConfig,
      now.getTime(),
      workdayKey,
    );

    setTimerMachineSnapshot(derived.snapshot);
    setNextBreakSeconds(derived.nextBreakSeconds);
    setRestTimeLeft(derived.restTimeLeft);
    setIsResting(derived.isResting);
    setHasCelebratedToday(derived.hasCelebratedToday);
  }, [
    now,
    startTime,
    endTime,
    restInterval,
    restDuration,
    restReminderActive,
  ]);
```

持久化快照：

```ts
  useEffect(() => {
    if (timerMachineSnapshot) {
      saveTimerMachineSnapshot(timerMachineSnapshot);
    }
  }, [timerMachineSnapshot]);
```

删除或收敛旧的运行态推进逻辑，避免这几类双写：

- `setNextBreakSeconds((prev) => prev - 1)`
- `setRestTimeLeft((prev) => prev - 1)`
- 旧的 `setIsResting(true/false)` 分支

保留 UI 事件入口，但入口改为更新状态机种子，而不是直接推进倒计时 state。

- [ ] **Step 4: 运行测试并确认通过**

Run:

```bash
npm run test -- src/components/layoutRegression.test.tsx
npm run test -- src/lib/timerMachine.test.ts src/lib/timerMachineStorage.test.ts
```

Expected:

```text
PASS  src/components/layoutRegression.test.tsx
PASS  src/lib/timerMachine.test.ts
PASS  src/lib/timerMachineStorage.test.ts
```

- [ ] **Step 5: 提交**

```bash
git add src/App.tsx src/lib/timerMachine.ts src/lib/timerMachineStorage.ts src/components/layoutRegression.test.tsx
git commit -m "feat: restore timer state from persisted machine"
```

如果 `git status` 返回 `not a git repository`，在当前工作区跳过这一步，只保留文件变更。

---

### Task 5: 全量验证与清理

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/lib/timerMachine.ts`
- Modify: `src/lib/timerMachineStorage.ts`
- Test: `src/components/layoutRegression.test.tsx`
- Test: `src/lib/timerMachine.test.ts`
- Test: `src/lib/timerMachineStorage.test.ts`

- [ ] **Step 1: 补齐缺失回归测试**

确认以下场景均在测试中有明确断言；若缺失则补充：

```ts
it("drops to after_work when reload happens after end time", () => {
  const config = {
    startTime: "09:00",
    endTime: "18:00",
    restInterval: 60,
    restDuration: 5,
    restReminderActive: true,
  };

  const snapshot = {
    version: 1 as const,
    mode: "working" as const,
    enteredAt: Date.UTC(2026, 5, 24, 8, 0, 0),
    restCycleAnchorAt: Date.UTC(2026, 5, 24, 8, 0, 0),
    restEndsAt: null,
    celebratedWorkdayKey: null,
    configSnapshot: config,
  };

  const derived = reconcileTimerMachineSnapshot(
    snapshot,
    config,
    Date.UTC(2026, 5, 24, 10, 30, 0),
    "2026-06-24",
  );

  expect(derived.snapshot.mode).toBe("after_work");
  expect(derived.hasCelebratedToday).toBe(true);
});

it("does not restore clock-out modal visibility from storage", async () => {
  window.localStorage.setItem(
    "timerMachineSnapshot",
    JSON.stringify({
      version: 1,
      mode: "after_work",
      enteredAt: Date.UTC(2026, 5, 24, 10, 0, 0),
      restCycleAnchorAt: null,
      restEndsAt: null,
      celebratedWorkdayKey: "2026-06-24",
      configSnapshot: {
        startTime: "09:00",
        endTime: "18:00",
        restInterval: 60,
        restDuration: 5,
        restReminderActive: true,
      },
    }),
  );

  const container = await renderMobileApp();

  expect(container.textContent).not.toContain("下班啦！");
});

it("restarts break cycle from now when reminder is re-enabled", () => {
  const oldConfig = {
    startTime: "09:00",
    endTime: "18:00",
    restInterval: 60,
    restDuration: 5,
    restReminderActive: false,
  };
  const newConfig = {
    ...oldConfig,
    restReminderActive: true,
  };

  const snapshot = {
    version: 1 as const,
    mode: "working" as const,
    enteredAt: Date.UTC(2026, 5, 24, 1, 0, 0),
    restCycleAnchorAt: Date.UTC(2026, 5, 24, 1, 0, 0),
    restEndsAt: null,
    celebratedWorkdayKey: null,
    configSnapshot: oldConfig,
  };

  const now = Date.UTC(2026, 5, 24, 1, 45, 0);
  const derived = reconcileTimerMachineSnapshot(
    snapshot,
    newConfig,
    now,
    "2026-06-24",
  );

  expect(derived.snapshot.restCycleAnchorAt).toBe(now);
  expect(derived.nextBreakSeconds).toBe(60 * 60);
});
```

- [ ] **Step 2: 运行全量验证**

Run:

```bash
npm run test -- src/lib/timerMachine.test.ts src/lib/timerMachineStorage.test.ts src/components/layoutRegression.test.tsx
npm run lint
npm run build
```

Expected:

```text
All targeted tests pass
tsc --noEmit exits 0
vite build exits 0
```

- [ ] **Step 3: 清理命名和注释**

检查并统一以下命名：

```ts
timerMachineSnapshot
deriveTimerMachineState
reconcileTimerMachineSnapshot
loadTimerMachineSnapshot
saveTimerMachineSnapshot
```

仅在状态恢复顺序和优先级处添加简短注释，例如：

```ts
// 下班优先于休息提醒，避免同一时刻双弹框。
```

- [ ] **Step 4: 最终提交**

```bash
git add src/App.tsx src/lib/timerMachine.ts src/lib/timerMachineStorage.ts src/lib/timerMachine.test.ts src/lib/timerMachineStorage.test.ts src/components/layoutRegression.test.tsx
git commit -m "feat: persist and restore timer machine state"
```

如果 `git status` 返回 `not a git repository`，在当前工作区跳过这一步，只保留文件变更。
