# Layout And Input Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the PC countdown card overflow, restore native time input usability, keep the mobile health phone shell fixed while its content scrolls, and preserve right-side clock spacing in narrow mobile header layouts.

**Architecture:** Keep the existing component structure and solve the issues through focused layout and input adjustments. Add small regression tests around rendered markup and targeted helper behavior so the fixes are locked without introducing a heavier UI test stack.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, react-dom/server, Tailwind utility classes

---

## File Structure

- Modify: `src/components/CountdownCard.tsx`
  Purpose: tighten the PC countdown card footer layout so the display-unit switcher no longer pushes the card past its fixed desktop height.
- Modify: `src/components/AnimalUI.tsx`
  Purpose: make the shared `Input` component treat native `type="time"` inputs as first-class so clicking/focus/selecting continues to use the browser picker.
- Modify: `src/components/HealthPhonePanel.tsx`
  Purpose: make the panel safe to host inside a fixed-height phone shell by giving it explicit inner scrolling behavior.
- Modify: `src/App.tsx`
  Purpose: separate mobile `dashboard` scrolling from `nookphone` shell positioning, and stabilize mobile header spacing around the right-side clock.
- Create: `src/components/layoutRegression.test.tsx`
  Purpose: lock the key rendered classes and attributes for the countdown card, native time input, and mobile phone shell layout.

## Assumptions

- The workspace already has `vitest` and `jsdom`; no additional test library is required.
- These fixes should preserve existing state shape and storage keys.
- The native browser time picker remains the intended UX for time fields.

### Task 1: Add markup-level regression coverage

**Files:**
- Create: `src/components/layoutRegression.test.tsx`

- [ ] **Step 1: Write the failing regression tests**

Create `src/components/layoutRegression.test.tsx`:

```tsx
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it, vi} from 'vitest';
import {CountdownCard} from './CountdownCard';
import {Input} from './AnimalUI';

const locale = {
  beforeWorkTitle: 'Before work',
  workHoursTitle: 'Work hours',
  afterWorkTitle: 'After work',
  afterWorkCelebrate: 'Done',
  afterWorkSub: 'Done subtext',
  progressLabel: 'Progress',
  combinationTab: 'H/M/S',
  hoursTab: 'Hours',
  minutesTab: 'Minutes',
  secondsTab: 'Seconds',
  percentageTab: 'Percent',
} as const;

describe('layout regressions', () => {
  it('renders the countdown footer switcher in a compact layout container', () => {
    const markup = renderToStaticMarkup(
      <CountdownCard
        timerCalc={{
          statusText: 'workHours',
          hoursExact: '1',
          minutesExact: '60',
          secondsExact: '3600',
          progressPercentage: 42,
          formattedCombination: '01:00:00',
        }}
        activeUnit="combination"
        setActiveUnit={() => {}}
        muteSound={false}
        setMuteSound={() => {}}
        playAlertChime={() => {}}
        helperSubtext="helper"
        t={locale as never}
        lang="zh"
      />,
    );

    expect(markup).toContain('data-layout="unit-switcher"');
    expect(markup).toContain('data-layout="unit-switcher-buttons"');
  });

  it('keeps native time inputs opt-in clickable and focusable', () => {
    const markup = renderToStaticMarkup(
      <Input type="time" value="09:00" onChange={() => {}} />,
    );

    expect(markup).toContain('type="time"');
    expect(markup).toContain('data-native-time="true"');
  });

  it('marks the mobile phone shell as fixed-shell and panel as inner-scroll', async () => {
    vi.stubGlobal(
      'localStorage',
      {
        getItem: vi.fn((key: string) => {
          if (key === 'lang') return 'zh';
          if (key === 'startTime') return '09:00';
          if (key === 'endTime') return '18:00';
          if (key === 'activeUnit') return 'combination';
          return null;
        }),
        setItem: vi.fn(),
      } as Storage,
    );

    const {default: App} = await import('../App');
    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain('data-layout="mobile-shell"');
    expect(markup).toContain('data-layout="phone-panel-scroll"');
    expect(markup).toContain('data-layout="mobile-header-clock"');
  });
});
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run:

```bash
npm run test -- src/components/layoutRegression.test.tsx
```

Expected: FAIL because the current components do not render the `data-layout` / `data-native-time` markers yet.

### Task 2: Fix the PC countdown card overflow and native time input behavior

**Files:**
- Modify: `src/components/CountdownCard.tsx`
- Modify: `src/components/AnimalUI.tsx`
- Test: `src/components/layoutRegression.test.tsx`

- [ ] **Step 1: Update the countdown card footer to use compact spacing markers**

In `src/components/CountdownCard.tsx`, replace the switcher footer block with:

```tsx
      <Divider type="dashed-teal" className="my-2.5 sm:my-3" />

      <div
        data-layout="unit-switcher"
        className="flex flex-col gap-[4px] sm:gap-[6px] min-h-0"
      >
        <span className="text-[10px] sm:text-[11px] font-black text-[#7a3542] tracking-wide uppercase leading-tight">
          {getSwitchLabel()}
        </span>
        <div
          data-layout="unit-switcher-buttons"
          className="flex flex-wrap gap-[4px] min-h-0"
        >
          {[
            { key: "combination", label: t.combinationTab },
            { key: "hours", label: t.hoursTab },
            { key: "minutes", label: t.minutesTab },
            { key: "seconds", label: t.secondsTab },
            { key: "percentage", label: t.percentageTab },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveUnit(tab.key);
              }}
              className={`px-2.5 py-[3px] text-[10px] sm:text-[11px] font-bold leading-none rounded-full border-2 transition-all cursor-pointer ${
                activeUnit === tab.key
                  ? "bg-[#0CC0B5] border-[#0CC0B5] text-white shadow-sm"
                  : "bg-white/70 border-[#bdaea0] text-[#725d42] hover:bg-[#fff9e3]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
```

- [ ] **Step 2: Teach the shared input component to mark native time inputs and preserve their click target**

In `src/components/AnimalUI.tsx`, update the `Input` component body to:

```tsx
  const isNativeTimeInput = rest.type === "time";

  return (
    <div
      id={id}
      data-native-time-wrapper={isNativeTimeInput ? "true" : "false"}
      className={`relative inline-flex items-center w-full bg-[rgb(247,243,223)] border-2 rounded-full overflow-hidden transition-all duration-150 ${borderCol} ${
        disabled ? "opacity-60 bg-[#ece8dc] border-[#d4c9b4]" : "hover:border-[#a89878]"
      }`}
      style={{ boxShadow: shadowStyle !== "none" ? shadowStyle : undefined }}
    >
      {prefix && <span className="pl-[14px] pr-[2px] text-[#a0936e]">{prefix}</span>}
      <input
        data-native-time={isNativeTimeInput ? "true" : "false"}
        disabled={disabled}
        className={`w-full bg-transparent focus:outline-none placeholder-[#c4b89e] placeholder-font-[400] text-[#725d42] font-[500] leading-none ${
          isNativeTimeInput ? "appearance-none min-w-0 pr-[10px]" : ""
        } ${heightClasses[size]} ${className}`}
        {...rest}
      />
      {suffix && <span className="pr-[14px] pl-[2px] text-[#a0936e]">{suffix}</span>}
    </div>
  );
```

- [ ] **Step 3: Run the regression tests to verify they still partially fail**

Run:

```bash
npm run test -- src/components/layoutRegression.test.tsx
```

Expected: the first two tests PASS, but the mobile shell test still FAILS because `App.tsx` has not been updated yet.

### Task 3: Fix the mobile fixed phone shell and header spacing

**Files:**
- Modify: `src/components/HealthPhonePanel.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/layoutRegression.test.tsx`

- [ ] **Step 1: Make the phone panel explicitly own its inner scrolling**

In `src/components/HealthPhonePanel.tsx`, update the root wrapper div to:

```tsx
    <div
      data-layout="phone-panel-scroll"
      className="flex flex-col gap-[12px] flex-1 min-h-0 w-full overflow-y-auto pt-1.5 px-1 pb-1.5 scrollbar-none select-none"
    >
```

- [ ] **Step 2: Restructure the mobile header layout and fixed phone shell container**

In `src/App.tsx`, update the header control area:

```tsx
        <div className="flex items-center justify-between md:justify-end gap-[8px] sm:gap-[12px] relative shrink-0 min-w-0">
```

Update the clock container:

```tsx
          <div
            data-layout="mobile-header-clock"
            className="scale-75 sm:scale-90 origin-right shrink-0 mr-1 sm:mr-0"
          >
            <HUDClock />
          </div>
```

Update the mobile outer container and tab bodies:

```tsx
          <div className="h-full w-full flex flex-col min-h-0 select-none pb-[60px]">
            <div className="flex-1 min-h-0 overflow-hidden">
              {mobileTab === "dashboard" && (
                <div className="h-full overflow-y-auto scrollbar-none">
                  <div className="flex flex-col gap-3.5 animate-scale-up pt-1.5 px-1 pb-1">
                    {/* existing dashboard content */}
                  </div>
                </div>
              )}

              {mobileTab === "nookphone" && (
                <div
                  data-layout="mobile-shell"
                  className="h-full flex items-start justify-center overflow-hidden px-1 pt-1.5"
                >
                  <Phone title={t.appName} className="h-full max-h-full">
                    <HealthPhonePanel
                      miles={miles}
                      restReminderActive={restReminderActive}
                      setRestReminderActive={setRestReminderActive}
                      statusText={timerCalc.statusText}
                      formatNextBreakTimer={formatNextBreakTimer}
                      nextBreakSeconds={nextBreakSeconds}
                      restInterval={restInterval}
                      setRestInterval={setRestInterval}
                      restDuration={restDuration}
                      setRestDuration={setRestDuration}
                      isCustomRhythm={isCustomRhythm}
                      setIsCustomRhythm={setIsCustomRhythm}
                      playAlertChime={playAlertChime}
                      onSimulateRest={handleSimulateRest}
                      t={t}
                    />
                  </Phone>
                </div>
              )}
            </div>
```

Keep the mobile footer dock unchanged.

- [ ] **Step 3: Allow the phone shell to honor fixed-height mobile hosting**

In `src/components/AnimalUI.tsx`, update the `PhoneProps` interface and root class:

```tsx
interface PhoneProps {
  title: string;
  children: React.ReactNode;
  id?: string;
  className?: string;
}
```

```tsx
    <div
      id={id}
      className={`relative mx-auto w-full max-w-[390px] h-full max-h-[82vh] rounded-[64px] border-[12px] border-[#edeae0] bg-[#f8f4e8] pt-[18px] pb-[2px] px-[20.5px] sm:pt-[22px] sm:pb-[3px] sm:px-[24px] shadow-[0_18px_48px_rgba(114,93,66,0.22)] overflow-hidden animate-grasswave flex flex-col justify-between ${className}`}
```

- [ ] **Step 4: Run the regression tests to verify they pass**

Run:

```bash
npm run test -- src/components/layoutRegression.test.tsx
```

Expected: PASS with 3 passing tests.

### Task 4: Run full verification and clean handoff

**Files:**
- Verify only

- [ ] **Step 1: Run the full test suite**

Run:

```bash
npm run test
```

Expected: PASS with the existing audio tests plus the new layout regression tests.

- [ ] **Step 2: Run the production build**

Run:

```bash
$env:FFMPEG_BIN='C:\ffmpeg-8.1.1-essentials_build\bin\ffmpeg.exe'; $env:CLOCKOUT_THEME_SOURCE='C:\Users\Administrator\Desktop\Main Theme.mp3'; npm run build
```

Expected: PASS, including audio preparation and a successful Vite build.

- [ ] **Step 3: Do manual spot checks in the running app**

Run:

```bash
npm run dev
```

Manual checks:

- Resize to a normal desktop viewport and confirm the first card no longer overflows vertically.
- Click both time inputs in the second card and confirm the native time picker opens.
- Switch to a mobile viewport, open the `nookphone` tab, and confirm the phone shell stays fixed while only the phone content scrolls.
- In a narrow mobile width or rotated viewport, confirm the title area no longer crowds the right-side clock.

- [ ] **Step 4: Commit**

```bash
git add src/components/CountdownCard.tsx src/components/AnimalUI.tsx src/components/HealthPhonePanel.tsx src/App.tsx src/components/layoutRegression.test.tsx docs/superpowers/specs/2026-06-23-layout-and-input-fixes.md docs/superpowers/plans/2026-06-23-layout-and-input-fixes.md
git commit -m "fix: tighten layout and restore native time input"
```

## Self-Review

### Spec coverage

- PC 第一个卡片高度溢出：Task 2 covers the compact switcher layout.
- 时间设置保留原生选择器并恢复可用：Task 2 covers the shared input fix.
- 移动端健康手机外框固定、内部滚动：Task 3 covers the mobile shell/container split.
- 移动端标题与时间框间距：Task 3 covers the header spacing and right-side clock preservation.

### Placeholder scan

- No `TBD`, `TODO`, or “implement later” placeholders remain.
- Each code-changing step includes concrete code.
- Each verification step includes an exact command and expected result.

### Type consistency

- The regression markers are consistently named `data-layout="unit-switcher"`, `data-layout="unit-switcher-buttons"`, `data-layout="mobile-shell"`, and `data-layout="mobile-header-clock"`.
- Native time input detection consistently uses `data-native-time`.
- `Phone` already supports `className`, so the fixed-shell layout can be applied without changing its public API shape.
