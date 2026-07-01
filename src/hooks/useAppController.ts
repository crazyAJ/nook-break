import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { clockOutMusic } from "../lib/clockOutMusic";
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
import { locales, ERGONOMIC_QUOTES } from "../locales";
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

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(runWarmup);
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(runWarmup, 1200);
    return () => globalThis.clearTimeout(timeoutId);
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

    measureMobileContentSpacing();
    window.addEventListener("resize", measureMobileContentSpacing);

    let resizeObserver: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(measureMobileContentSpacing);
      resizeObserver.observe(headerElement);
      resizeObserver.observe(dockElement);
      resizeObserver.observe(layoutRootElement);
    }

    return () => {
      window.removeEventListener("resize", measureMobileContentSpacing);
      resizeObserver?.disconnect();
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
      const quotesCount = ERGONOMIC_QUOTES(lang).length;
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

  const presets: Preset[] = [
    { name: lang === "zh" ? "标准作息 965" : lang === "tc" ? "標準作息 965" : lang === "ja" ? "標準 965" : lang === "ko" ? "표준 965" : "Standard 965", start: "09:00", end: "18:00" },
    { name: lang === "zh" ? "国企养生 855" : lang === "tc" ? "國企養生 855" : lang === "ja" ? "健康養生 855" : lang === "ko" ? "웰빙 855" : "Relaxed 855", start: "08:00", end: "17:00" },
    { name: lang === "zh" ? "奋斗极客 996" : lang === "tc" ? "奮鬥極客 996" : lang === "ja" ? "不屈ハード 996" : lang === "ko" ? "하드코어 996" : "Hardcore 996", start: "09:00", end: "21:00" },
    { name: lang === "zh" ? "半天班 84" : lang === "tc" ? "半天班 84" : lang === "ja" ? "半日 84" : lang === "ko" ? "반일 84" : "Half-Day 84", start: "08:30", end: "12:30" },
  ];

  const timerCalc = getOffWorkCalculation({ startTime, endTime, now, lang });

  const helperSubtext = getHelperSubtext(lang, timerCalc.progressPercentage, timerCalc.statusText);

  const formatNextBreakTimer = () => {
    const h = Math.floor(nextBreakSeconds / 3600);
    const m = Math.floor((nextBreakSeconds % 3600) / 60);
    const s = nextBreakSeconds % 60;
    if (lang === "zh") {
      return `${h ? h + "小时" : ""} ${m}分钟 ${s}秒`;
    }
    if (lang === "tc") {
      return `${h ? h + "小時" : ""} ${m}分鐘 ${s}秒`;
    }
    if (lang === "ja") {
      return `${h ? h + "時間" : ""} ${m}分 ${s}秒`;
    }
    if (lang === "ko") {
      return `${h ? h + "시간" : ""} ${m}분 ${s}초`;
    }
    return `${h ? h + "h" : ""} ${m}m ${s}s`;
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
    currentQuote: ERGONOMIC_QUOTES(lang)[tipIndex],
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

  const formattedCombination = lang === "zh"
    ? `${hoursPart}小时 ${minutesPart}分钟 ${secondsPart}秒`
    : lang === "tc"
      ? `${hoursPart}小時 ${minutesPart}分鐘 ${secondsPart}秒`
      : lang === "ja"
        ? `${hoursPart}時間 ${minutesPart}分 ${secondsPart}秒`
        : lang === "ko"
          ? `${hoursPart}시간 ${minutesPart}분 ${secondsPart}초`
          : `${hoursPart}h ${minutesPart}m ${secondsPart}s`;

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

function getHelperSubtext(
  lang: AppLanguage,
  progressPercentage: string,
  statusText: string,
) {
  if (statusText === "beforeWork") {
    return lang === "zh"
      ? "还没有开始正式工作哟。放轻松，享受静谧清晨吧！"
      : lang === "tc"
        ? "還沒有開始正式工作喲。放輕鬆，享受靜謐清晨吧！"
        : lang === "ja"
          ? "まだ勤務時間が始まっていませんね。リラックスして静かな朝を楽しみましょう！"
          : lang === "ko"
            ? "아직 공식 근무 시간이 시작되지 않았어요. 편안하게 조용한 아침을 즐겨보세요!"
            : "Shift hasn't officially started. Sit back, relax, and enjoy the quiet morning!";
  }

  if (statusText === "afterWork") {
    return lang === "zh"
      ? "下班探针任务圆满达成！快背上行囊散步去吧！"
      : lang === "tc"
        ? "下班探針任務圓滿達成！快背上行囊散步去吧！"
        : lang === "ja"
          ? "退勤時間がやってきました！急いで荷物をまとめてお散歩に行きましょう！"
          : lang === "ko"
            ? "즐거운 퇴근 시간입니다오늘 하루 최고였구리 어서 퇴근해서 산책을 가볼까요!"
            : "Off-work objective secured! Travel safe and have a delightful evening!";
  }

  const percentNum = parseFloat(progressPercentage);
  if (percentNum < 30) {
    return lang === "zh"
      ? "刚开启元气满满的一天！狸村今日也是充满动力 and 生机！"
      : lang === "tc"
        ? "剛開啟元氣滿滿的一天！狸村今日也是充滿動力 and 生機！"
        : lang === "ja"
          ? "一日が元気よく始まりました！今日もたぬき村はパワーいっぱいです！"
          : lang === "ko"
            ? "가뿐하게 아침을 시작했구리! 오늘도 건강하고 생기 넘치는 섬 생활을 시작해봐요!"
            : "Plunge into an energetic shift! The village is thriving with a vivid breeze today!";
  }

  if (percentNum < 70) {
    return lang === "zh"
      ? "不知不觉工作过半！让我们的心情就像岛上的晴天一样灿烂。"
      : lang === "tc"
        ? "不知不覺工作過半！讓我們的心情就像島上的晴天一樣燦爛。"
        : lang === "ja"
          ? "いつの間にか勤務時間が半分に！島の晴れ渡る空のように元気に行きましょう！"
          : lang === "ko"
            ? "어느덧 근무 시간의 절반이 훌쩍 지나갔어요! 쾌청한 하늘처럼 행복한 하루 보내세요!"
            : "Midshift completed! May your mood be as radiant as the island's clear sky.";
  }

  return lang === "zh"
    ? "太棒啦！夕阳已染红椰树梢，今天的下班钟声就要敲响啦！"
    : lang === "tc"
      ? "太棒啦！夕陽已染紅椰樹梢，今天的下班鐘聲就要敲響啦！"
      : lang === "ja"
        ? "素晴らしい！夕日がココナッツの木陰を赤く染め、終業ベルが鳴り響きます！"
        : lang === "ko"
          ? "근무 종료가 임박했구리 야자수 사이로 지는 멋진 노을을 감상하며 하루를 마무리해요!"
          : "Marvelous! Sunset has gilded the coconut palms, clock-out chimes are imminent!";
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
