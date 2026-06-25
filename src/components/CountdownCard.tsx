import React from "react";
import { Coffee, Sparkles, Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";
import { Card, Divider } from "./AnimalUI";
import { TimerCalc } from "../types";
import { LocaleData } from "../locales";

interface CountdownCardProps {
  timerCalc: TimerCalc;
  activeUnit: string;
  setActiveUnit: (unit: string) => void;
  muteSound: boolean;
  setMuteSound: (val: boolean) => void;
  onSubmitClockOut?: () => void;
  helperSubtext: string;
  t: LocaleData;
  lang: "zh" | "en" | "ja" | "ko" | "tc";
  className?: string;
}

export const CountdownCard: React.FC<CountdownCardProps> = ({
  timerCalc,
  activeUnit,
  setActiveUnit,
  muteSound,
  setMuteSound,
  onSubmitClockOut,
  helperSubtext,
  t,
  lang,
  className = "",
}) => {
  const getDisplayTimer = () => {
    switch (activeUnit) {
      case "hours":
        return `${timerCalc.hoursExact} ${lang === "zh" ? "小时" : lang === "tc" ? "小時" : lang === "ja" ? "時間" : lang === "ko" ? "시간" : "hrs"}`;
      case "minutes":
        return `${timerCalc.minutesExact} ${lang === "zh" ? "分钟" : lang === "tc" ? "分鐘" : lang === "ja" ? "分" : lang === "ko" ? "분" : "mins"}`;
      case "seconds":
        return `${timerCalc.secondsExact} ${(lang === "zh" || lang === "tc") ? "秒" : lang === "ja" ? "秒" : lang === "ko" ? "초" : "secs"}`;
      case "percentage":
        return `${timerCalc.progressPercentage} %`;
      case "combination":
      default:
        return timerCalc.formattedCombination;
    }
  };

  const getSwitchLabel = () => {
    switch (lang) {
      case "ja":
        return "🏷️ 表示単位の切り替え：";
      case "ko":
        return "🏷️ 표시 단위 전환：";
      case "en":
        return "🏷️ Switch display units:";
      case "zh":
      default:
        return "🏷️ 切换显示单位：";
    }
  };

  return (
    <Card pattern="app-pink" className={`relative p-4 sm:p-5 md:p-6 flex flex-col justify-between shadow-md shrink-0 ${className}`}>
      <div className="absolute top-[12px] right-[12px] sm:top-[14px] sm:right-[14px] flex items-center gap-[8px] z-10">
        <button
          onClick={() => setMuteSound(!muteSound)}
          className="w-[32px] h-[32px] sm:w-[34px] sm:h-[34px] rounded-full bg-white/65 border-2 border-[#f8a6b2] flex items-center justify-center text-[#7a3542] hover:bg-[#fff9e3] transition-all cursor-pointer shadow-sm"
          title={muteSound ? "Enable Sound / 开启音效" : "Mute Sound / 静音"}
        >
          {muteSound ? <VolumeX className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> : <Volume2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
        </button>
      </div>

      <div className="flex items-center gap-[8px] mb-[5px] sm:mb-[8px]">
        <Coffee className="w-[18px] h-[18px] text-[#7a3542] animate-bounce" />
        <span className="font-extrabold text-[12px] sm:text-[13px] md:text-[14px] text-[#7a3542] tracking-wider uppercase">
          {timerCalc.statusText === "beforeWork" && t.beforeWorkTitle}
          {timerCalc.statusText === "workHours" && t.workHoursTitle}
          {timerCalc.statusText === "afterWork" && t.afterWorkTitle}
        </span>
      </div>

      <div className="py-3 sm:py-4 min-h-[44px] flex items-center justify-center">
        {timerCalc.statusText === "afterWork" ? (
          <div className="text-center py-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-[900] text-[#7a3542] tracking-wide leading-tight mb-2">
              {t.afterWorkCelebrate}
            </h1>
            <p className="text-[10px] sm:text-[11px] md:text-[12px] font-bold text-[#7a3542]/85">
              {t.afterWorkSub}
            </p>
          </div>
        ) : (
          <div className="text-center select-none w-full">
            <div
              className="text-2xl sm:text-3xl md:text-4xl font-[950] tracking-[1.5px] text-[#7a3542] font-mono leading-none drop-shadow-sm transition-all"
              style={{
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {getDisplayTimer()}
            </div>
          </div>
        )}
      </div>

      {/* Progress slider bar */}
      <div className="mt-3 bg-white/50 border-2 border-[#f8a6b2] rounded-full h-[20px] sm:h-[22px] relative overflow-hidden flex items-center justify-start shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${timerCalc.progressPercentage}%` }}
          className="bg-gradient-to-r from-[#fc736d] to-[#f8a6b2] h-full"
          transition={{ duration: 0.5 }}
        />
        <span className="absolute inset-0 flex items-center justify-center font-black text-[10px] sm:text-[11px] text-[#7a3542] drop-shadow-sm">
          {t.progressLabel}: {timerCalc.progressPercentage} %
        </span>
      </div>

      {/* Submit Work & Clock Out Button */}
      {onSubmitClockOut && (
        <div className="mt-2">
          <button
            onClick={onSubmitClockOut}
            className="w-full py-2.5 sm:py-3 px-3 bg-gradient-to-r from-[#fc736d] to-[#ff94a2] hover:from-[#fd5f58] hover:to-[#ff8191] text-white rounded-[16px] border-b-4 border-[#b73731] font-black text-[11px] sm:text-[12px] tracking-wide active:translate-y-1 active:border-b-0 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>🎉</span>
            {lang === "zh"
              ? "提交今日成果，敲响快乐下班钟！"
              : lang === "tc"
              ? "提交今日成果，敲響快樂下班鐘！"
              : lang === "ja"
              ? "仕事の提出＆終業チャイムを鳴らす！"
              : lang === "ko"
              ? "오늘의 성과물 제출하고 퇴근벨 치기!"
              : "Submit work & ring the clock-out chime!"}
          </button>
        </div>
      )}

      {/* Tips block */}
      <div className="mt-3 flex items-start gap-[5px] text-[9px] min-[360px]:text-[10px] sm:text-[11px] leading-[1.35] text-[#7a3542]/90 font-semibold bg-white/40 p-2 sm:p-2.5 rounded-[14px] border border-[#f8a6b2]/40">
        <Sparkles className="w-[13px] h-[13px] text-[#f7cd67] shrink-0 mt-[1px] animate-pulse" />
        <span className="min-w-0">{helperSubtext}</span>
      </div>

      <Divider type="dashed-teal" className="my-2 sm:my-2.5" />

      <div data-layout="unit-switcher" className="flex flex-col gap-[4px] sm:gap-[5px]">
        <span className="text-[9px] sm:text-[10px] font-black text-[#7a3542] tracking-wide leading-[1.2] uppercase">
          {getSwitchLabel()}
        </span>
        <div data-layout="unit-switcher-buttons" className="flex flex-wrap gap-[4px] sm:gap-[5px]">
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
              className={`px-2 py-[2px] sm:px-2.5 sm:py-[3px] text-[9px] sm:text-[10px] leading-[1.1] font-bold rounded-full border-2 transition-all cursor-pointer ${
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
    </Card>
  );
};
