import type {TimerMachineSnapshot} from './timerMachine';

export const TIMER_MACHINE_STORAGE_KEY = 'timerMachineSnapshot';

const SNAPSHOT_VERSION = 1;
const TIMER_MACHINE_MODES: ReadonlySet<TimerMachineSnapshot['mode']> = new Set([
  'idle_before_work',
  'working',
  'resting',
  'after_work',
] as const);

export function loadTimerMachineSnapshot(): TimerMachineSnapshot | null {
  try {
    const raw = localStorage.getItem(TIMER_MACHINE_STORAGE_KEY);

    if (raw === null) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    return isValidSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveTimerMachineSnapshot(snapshot: TimerMachineSnapshot) {
  try {
    localStorage.setItem(TIMER_MACHINE_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {}
}

export function clearTimerMachineSnapshot() {
  try {
    localStorage.removeItem(TIMER_MACHINE_STORAGE_KEY);
  } catch {}
}

function isValidSnapshot(value: unknown): value is TimerMachineSnapshot {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.version === SNAPSHOT_VERSION &&
    isTimerMachineMode(value.mode) &&
    isFiniteNumber(value.enteredAt) &&
    isFiniteNumberOrNull(value.restCycleAnchorAt) &&
    isFiniteNumberOrNull(value.restEndsAt) &&
    isStringOrNull(value.celebratedWorkdayKey) &&
    isValidConfigSnapshot(value.configSnapshot)
  );
}

function isValidConfigSnapshot(value: unknown) {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isValidTimeString(value.startTime) &&
    isValidTimeString(value.endTime) &&
    isPositiveNumber(value.restInterval) &&
    isPositiveNumber(value.restDuration) &&
    typeof value.restReminderActive === 'boolean'
  );
}

function isTimerMachineMode(value: unknown): value is TimerMachineSnapshot['mode'] {
  return (
    typeof value === 'string' &&
    TIMER_MACHINE_MODES.has(value as TimerMachineSnapshot['mode'])
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isFiniteNumberOrNull(value: unknown): value is number | null {
  return value === null || isFiniteNumber(value);
}

function isPositiveNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0;
}

function isStringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isValidTimeString(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const match = /^(\d{2}):(\d{2})$/.exec(value);

  if (match === null) {
    return false;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
