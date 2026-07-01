export type AppLanguage = "zh" | "en" | "ja" | "ko" | "tc";

export interface TimerCalc {
  statusText: string; // 'beforeWork' | 'workHours' | 'afterWork'
  secondsRemaining: number;
  formattedCombination: string;
  hoursExact: string;
  minutesExact: string;
  secondsExact: string;
  progressPercentage: string;
  isDuring: boolean;
}

export interface Preset {
  name: string;
  start: string;
  end: string;
}
