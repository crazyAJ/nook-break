import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { clockOutMusic } from "../lib/clockOutMusic";
import {
  observeElementRect,
  scheduleIdleCallback,
  supportsResizeObserver,
} from "../lib/browserCompat";
import { registerServiceWorker } from "../lib/registerServiceWorker";
import {
  createInitialTimerMachineSnapshot,
  deriveTimerMachineState,
  type TimerMachineConfig,
  type TimerMachineSnapshot,
} from "../lib/timerMachine";
import {
  loadTimerMachineSnapshot,
  saveTimerMachineSnapshot,
} from "../lib/timerMachineStorage";
import {
  buildPresets,
  formatLocalizedDuration,
  formatNextBreakTimerLabel,
  getErgonomicQuotes,
  getHelperSubtext,
  locales,
} from "../locales";
import type { AppLanguage, Preset, TimerCalc } from "../types";

type MobileTab = "dashboard" | "nookphone";
const CLOCKOUT_MUSIC_PAUSED_STORAGE_KEY = "clockOutMusicPaused";

export function useAppController() {
  const [lang, setLang] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem("lang");
    return saved === "zh" || saved === "en" || saved === "ja" || saved === "ko" || saved === "tc"
      ? saved
      : "zh";
  });
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const t = locales[lang];

  const [isMobile, setIsMobile] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [mobileTab, setMobileTab] = useState<MobileTab>("dashboard");
  const [mobileDockOverlap, setMobileDockOverlap] = useState(64);
  const [mobileContentEdgeGap, setMobileContentEdgeGap] = useState(16);

  const [timerMachineSnapshot, setTimerMachineSnapshot] = useState<TimerMachineSnapshot | null>(
    () => loadTimerMachineSnapshot(),
  );
  const [startTime, setStartTime] = useState(
    () => localStorage.getItem("startTime") || timerMachineSnapshot?.configSnapshot.startTime || "09:00",
  );
  const [endTime, setEndTime] = useState(
    () => localStorage.getItem("endTime") || timerMachineSnapshot?.configSnapshot.endTime || "18:00",
  );
  const [activeUnit, setActiveUnit] = useState(
    () => localStorage.getItem("activeUnit") || "combination",
  );
  const [restReminderActive, setRestReminderActive] = useState(() => {
    const saved = localStorage.getItem("restReminderActive");
    return saved !== null
      ? saved === "true"
      : timerMachineSnapshot?.configSnapshot.restReminderActive ?? true;
  });
  const [restInterval, setRestInterval] = useState(() => {
    const saved = localStorage.getItem("restInterval");
    return saved ? parseInt(saved, 10) : timerMachineSnapshot?.configSnapshot.restInterval ?? 60;
  });
  const [restDuration, setRestDuration] = useState(() => {
    const saved = localStorage.getItem("restDuration");
    return saved ? parseInt(saved, 10) : timerMachineSnapshot?.configSnapshot.restDuration ?? 5;
  });
  const [miles, setMiles] = useState(() => {
    const saved = localStorage.getItem("miles");
    return saved ? parseInt(saved, 10) : 1200;
  });
  const [muteSound, setMuteSound] = useState(() => {
    const saved = localStorage.getItem("muteSound");
    return saved === "true";
  });
  const [nextBreakSeconds, setNextBreakSeconds] = useState(restInterval * 60);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(restDuration * 60);
  const [tipIndex, setTipIndex] = useState(0);
  const [isCustomRhythm, setIsCustomRhythm] = useState(() => {
    const saved = localStorage.getItem("isCustomRhythm");
    return saved === "true";
  });
  const [showClockOutModal, setShowClockOutModal] = useState(false);
  const [isClockOutMusicPaused, setIsClockOutMusicPaused] = useState(() => {
    return localStorage.getItem(CLOCKOUT_MUSIC_PAUSED_STORAGE_KEY) === "true";
  });
  const [now, setNow] = useState(() => new Date());

  const appHeaderRef = useRef<HTMLElement | null>(null);
  const mobileLayoutRootRef = useRef<HTMLDivElement | null>(null);
  const mobileDockRef = useRef<HTMLDivElement | null>(null);
  const clockTickRef = useRef<number | null>(null);
  const previousTimerMachineModeRef = useRef<TimerMachineSnapshot["mode"] | null>(
    timerMachineSnapshot?.mode ?? null,
  );
  const pendingRestResolutionRef = useRef<"skip" | "finish" | "disable" | null>(null);

  const timerMachineConfig: TimerMachineConfig = {
    startTime,
    endTime,
    restInterval,
    restDuration,
    restReminderActive,
  };

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  useEffect(() => {
    void registerServiceWorker();

    const runWarmup = () => {
      clockOutMusic.setMuted(muteSound);
      void clockOutMusic.warmup();
    };

    return scheduleIdleCallback(runWarmup);
  }, []);

  useEffect(() => {
    const handleViewportAndZoom = () => {
      const isMobileView = window.innerWidth < 820;
      setIsMobile(isMobileView);

      if (!isMobileView) {
        const availableW = Math.max(820, window.innerWidth - 48);
        const availableH = Math.max(500, window.innerHeight - 150);
        const scaleX = availableW / 1000;
        const scaleY = availableH / 680;
        const fitScale = Math.min(scaleX, scaleY);
        setScaleFactor(Math.max(0.5, Math.min(1.25, fitScale)));
      }
    };

    handleViewportAndZoom();
    window.addEventListener("resize", handleViewportAndZoom);
    return () => window.removeEventListener("resize", handleViewportAndZoom);
  }, []);

  useLayoutEffect(() => {
    if (!isMobile) {
      return;
    }

    const headerElement = appHeaderRef.current;
    const dockElement = mobileDockRef.current;
    const layoutRootElement = mobileLayoutRootRef.current;
    if (!headerElement || !dockElement || !layoutRootElement) {
      return;
    }

    const measureMobileContentSpacing = () => {
      const headerRect = headerElement.getBoundingClientRect();
      const dockRect = dockElement.getBoundingClientRect();
      const layoutRootRect = layoutRootElement.getBoundingClientRect();
      const measuredOverlap = Math.ceil(layoutRootRect.bottom - dockRect.top);
      const measuredEdgeGap = Math.max(0, Math.ceil(layoutRootRect.top - headerRect.bottom));

      if (measuredOverlap > 0) {
        setMobileDockOverlap(measuredOverlap);
      }

      setMobileContentEdgeGap(measuredEdgeGap);
    };

    const observedElements = supportsResizeObserver()
      ? [headerElement, dockElement, layoutRootElement]
      : [layoutRootElement];
    const cleanups = observedElements.map((element) =>
      observeElementRect(element, measureMobileContentSpacing),
    );

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [isMobile]);

  useEffect(() => {
    localStorage.setItem("startTime", startTime);
    localStorage.setItem("endTime", endTime);
    localStorage.setItem("activeUnit", activeUnit);
    localStorage.setItem("restReminderActive", String(restReminderActive));
    localStorage.setItem("restInterval", String(restInterval));
    localStorage.setItem("restDuration", String(restDuration));
    localStorage.setItem("miles", String(miles));
    localStorage.setItem("muteSound", String(muteSound));
    localStorage.setItem("isCustomRhythm", String(isCustomRhythm));
  }, [
    startTime,
    endTime,
    activeUnit,
    restReminderActive,
    restInterval,
    restDuration,
    miles,
    muteSound,
    isCustomRhythm,
  ]);

  useEffect(() => {
    const workdayKey = getWorkdayKey(now);
    const seed =
      timerMachineSnapshot ??
      createInitialTimerMachineSnapshot(timerMachineConfig, now.getTime(), workdayKey);
    const derived = deriveTimerMachineState(seed, timerMachineConfig, now.getTime(), workdayKey);

    if (!isSameTimerMachineSnapshot(timerMachineSnapshot, derived.snapshot)) {
      setTimerMachineSnapshot(derived.snapshot);
    }

    setNextBreakSeconds(derived.nextBreakSeconds);
    setRestTimeLeft(derived.restTimeLeft);
    setIsResting(derived.isResting);
  }, [now, timerMachineSnapshot, timerMachineConfig]);

  useEffect(() => {
    if (timerMachineSnapshot !== null) {
      saveTimerMachineSnapshot(timerMachineSnapshot);
    }
  }, [timerMachineSnapshot]);

  useEffect(() => {
    if (clockTickRef.current !== null) {
      clearInterval(clockTickRef.current);
      clockTickRef.current = null;
    }

    if (showClockOutModal) {
      return;
    }

    setNow(new Date());
    clockTickRef.current = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      if (clockTickRef.current !== null) {
        clearInterval(clockTickRef.current);
        clockTickRef.current = null;
      }
    };
  }, [showClockOutModal]);

  useEffect(() => {
    const currentMode = timerMachineSnapshot?.mode ?? null;
    const previousMode = previousTimerMachineModeRef.current;

    if (currentMode === "after_work" && previousMode !== "after_work") {
      setShowClockOutModal(true);
      if (!isClockOutMusicPaused) {
        void clockOutMusic.playLoop();
      }
    }

    if (currentMode === "resting" && previousMode === "working") {
      const quotesCount = getErgonomicQuotes(lang).length;
      setTipIndex((old) => (old + 1) % quotesCount);
      playAlertChime(muteSound);
    }

    if (previousMode === "resting" && currentMode === "working") {
      const pendingResolution = pendingRestResolutionRef.current;

      if (pendingResolution === null) {
        setMiles((m) => m + 350);
        playSuccessChime(muteSound);
      }

      pendingRestResolutionRef.current = null;
    }

    previousTimerMachineModeRef.current = currentMode;
  }, [isClockOutMusicPaused, lang, muteSound, timerMachineSnapshot?.mode]);

  const presets: Preset[] = buildPresets(lang);

  const timerCalc = getOffWorkCalculation({ startTime, endTime, now, lang });

  const helperSubtext = getHelperSubtext(lang, timerCalc.progressPercentage, timerCalc.statusText);

  const formatNextBreakTimer = () => {
    return formatNextBreakTimerLabel(lang, nextBreakSeconds);
  };

  const loadPreset = (preset: Preset) => {
    setStartTime(preset.start);
    setEndTime(preset.end);
  };

  const handleSimulateRest = () => {
    setTimerMachineSnapshot((current) => ({
      ...(current ??
        createInitialTimerMachineSnapshot(timerMachineConfig, now.getTime(), getWorkdayKey(now))),
      version: 1,
      mode: "resting",
      enteredAt: now.getTime(),
      restEndsAt: now.getTime() + restDuration * 60 * 1000,
      configSnapshot: timerMachineConfig,
    }));
  };

  const handleSkipRest = () => {
    pendingRestResolutionRef.current = "skip";
    setTimerMachineSnapshot((current) => ({
      ...(current ??
        createInitialTimerMachineSnapshot(timerMachineConfig, now.getTime(), getWorkdayKey(now))),
      version: 1,
      mode: "working",
      enteredAt: now.getTime(),
      restCycleAnchorAt: now.getTime(),
      restEndsAt: null,
      configSnapshot: timerMachineConfig,
    }));
    playSkipRestChime(muteSound);
  };

  const handleSetRestReminderActive = (checked: boolean) => {
    setRestReminderActive(checked);
    if (!checked && timerMachineSnapshot?.mode === "resting") {
      pendingRestResolutionRef.current = "disable";
    }
  };

  const handleFinishRest = () => {
    pendingRestResolutionRef.current = "finish";
    setTimerMachineSnapshot((current) => ({
      ...(current ??
        createInitialTimerMachineSnapshot(timerMachineConfig, now.getTime(), getWorkdayKey(now))),
      version: 1,
      mode: "working",
      enteredAt: now.getTime(),
      restCycleAnchorAt: now.getTime(),
      restEndsAt: null,
      configSnapshot: timerMachineConfig,
    }));
    setMiles((m) => m + 100);
    playSuccessChime(muteSound);
  };

  const handleSubmitClockOut = () => {
    if (timerMachineSnapshot?.mode === "after_work") {
      setShowClockOutModal(true);
      if (!isClockOutMusicPaused) {
        void clockOutMusic.playLoop();
      }
      return;
    }

    const currentHours = String(now.getHours()).padStart(2, "0");
    const currentMinutes = String(now.getMinutes()).padStart(2, "0");
    setEndTime(`${currentHours}:${currentMinutes}`);
  };

  const handleCloseClockOut = () => {
    setShowClockOutModal(false);
    clockOutMusic.stop();
  };

  const persistClockOutMusicPaused = (paused: boolean) => {
    setIsClockOutMusicPaused(paused);
    localStorage.setItem(CLOCKOUT_MUSIC_PAUSED_STORAGE_KEY, String(paused));
  };

  const handleToggleClockOutPlayback = () => {
    const nextPaused = !isClockOutMusicPaused;
    persistClockOutMusicPaused(nextPaused);

    if (nextPaused) {
      clockOutMusic.pause();
      return;
    }

    void clockOutMusic.playLoop();
  };

  const handleToggleClockOutMusicPreference = () => {
    const nextPaused = !isClockOutMusicPaused;
    persistClockOutMusicPaused(nextPaused);

    if (!showClockOutModal) {
      if (nextPaused) {
        clockOutMusic.pause();
      }
      return;
    }

    if (nextPaused) {
      clockOutMusic.pause();
      return;
    }

    void clockOutMusic.playLoop();
  };

  const handleToggleMuteSound = () => {
    const newMute = !muteSound;
    setMuteSound(newMute);
    localStorage.setItem("muteSound", String(newMute));
    clockOutMusic.setMuted(newMute);

    if (!newMute && showClockOutModal && !isClockOutMusicPaused) {
      void clockOutMusic.playLoop();
    }
  };

  return {
    activeUnit,
    appHeaderRef,
    currentQuote: getErgonomicQuotes(lang)[tipIndex],
    endTime,
    formatNextBreakTimer,
    handleCloseClockOut,
    handleFinishRest,
    handleSetRestReminderActive,
    handleSimulateRest,
    handleSkipRest,
    handleSubmitClockOut,
    handleToggleClockOutMusicPreference,
    handleToggleClockOutPlayback,
    handleToggleMuteSound,
    helperSubtext,
    isClockOutMusicPaused,
    isCustomRhythm,
    isMobile,
    isResting,
    lang,
    miles,
    mobileContentEdgeGap,
    mobileDockOverlap,
    mobileDockRef,
    mobileLayoutRootRef,
    mobileTab,
    muteSound,
    presets,
    restDuration,
    restInterval,
    restReminderActive,
    restTimeLeft,
    scaleFactor,
    setActiveUnit,
    setEndTime,
    setIsCustomRhythm,
    setLang,
    setMobileTab,
    setRestDuration,
    setRestInterval,
    setShowLanguagePicker,
    setStartTime,
    showClockOutModal,
    showLanguagePicker,
    startTime,
    t,
    timerCalc,
    loadPreset,
  };
}

function getOffWorkCalculation({
  startTime,
  endTime,
  now,
  lang,
}: {
  startTime: string;
  endTime: string;
  now: Date;
  lang: AppLanguage;
}): TimerCalc {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  const currentSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const startSecs = startHour * 3600 + startMin * 60;
  const endSecs = endHour * 3600 + endMin * 60;

  let secondsRemaining = 0;
  let statusText = "workHours";

  if (currentSecs < startSecs) {
    statusText = "beforeWork";
    secondsRemaining = startSecs - currentSecs;
  } else if (currentSecs >= endSecs) {
    statusText = "afterWork";
  } else {
    secondsRemaining = endSecs - currentSecs;
  }

  const hoursPart = Math.floor(secondsRemaining / 3600);
  const minutesPart = Math.floor((secondsRemaining % 3600) / 60);
  const secondsPart = secondsRemaining % 60;
  const totalSecsDay = endSecs - startSecs;
  const elapsedSecsDay = Math.max(0, currentSecs - startSecs);
  const progressPercent =
    totalSecsDay > 0 ? Math.min(100, Math.max(0, (elapsedSecsDay / totalSecsDay) * 100)) : 0;

  const formattedCombination = formatLocalizedDuration(
    lang,
    hoursPart,
    minutesPart,
    secondsPart,
  );

  return {
    statusText,
    secondsRemaining,
    formattedCombination,
    hoursExact: (secondsRemaining / 3600).toFixed(2),
    minutesExact: (secondsRemaining / 60).toFixed(1),
    secondsExact: secondsRemaining.toLocaleString(),
    progressPercentage: progressPercent.toFixed(1),
    isDuring: currentSecs >= startSecs && currentSecs < endSecs,
  };
}

function getWorkdayKey(now: Date) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameTimerMachineSnapshot(
  left: TimerMachineSnapshot | null,
  right: TimerMachineSnapshot,
) {
  if (left === null) {
    return false;
  }

  return (
    left.version === right.version &&
    left.mode === right.mode &&
    left.enteredAt === right.enteredAt &&
    left.restCycleAnchorAt === right.restCycleAnchorAt &&
    left.restEndsAt === right.restEndsAt &&
    left.celebratedWorkdayKey === right.celebratedWorkdayKey &&
    left.configSnapshot.startTime === right.configSnapshot.startTime &&
    left.configSnapshot.endTime === right.configSnapshot.endTime &&
    left.configSnapshot.restInterval === right.configSnapshot.restInterval &&
    left.configSnapshot.restDuration === right.configSnapshot.restDuration &&
    left.configSnapshot.restReminderActive === right.configSnapshot.restReminderActive
  );
}

function playAlertChime(muted: boolean) {
  if (muted) return;

  try {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const triggerNote = (freq: number, startDelay: number, hold: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + startDelay);
      gain.gain.setValueAtTime(0.12, now + startDelay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + startDelay + hold);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + startDelay);
      osc.stop(now + startDelay + hold);
    };

    triggerNote(523.25, 0.0, 0.35);
    triggerNote(659.25, 0.12, 0.35);
    triggerNote(783.99, 0.24, 0.35);
    triggerNote(1046.5, 0.36, 0.5);
  } catch (error) {
    console.warn("Chime blocked by browser user gesture policies:", error);
  }
}

function playSkipRestChime(muted: boolean) {
  if (muted) return;

  try {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const triggerNote = (
      freq: number,
      startDelay: number,
      hold: number,
      type: OscillatorType = "sine",
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + startDelay);
      gain.gain.setValueAtTime(0.08, now + startDelay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + startDelay + hold);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + startDelay);
      osc.stop(now + startDelay + hold);
    };

    triggerNote(932.33, 0.0, 0.08, "sine");
    triggerNote(1046.5, 0.05, 0.12, "sine");
  } catch (error) {
    console.warn("Skip chime blocked:", error);
  }
}

function playSuccessChime(muted: boolean) {
  if (muted) return;

  try {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77, 1046.5];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.1, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.2);
    });
  } catch (error) {
    console.warn("Chime blocked:", error);
  }
}
