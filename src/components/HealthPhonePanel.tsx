import React from "react";
import { CheckCircle, Clock } from "lucide-react";
import { Switch, Radio, Button, Wallet, Card } from "./AnimalUI";
import { motion, AnimatePresence } from "motion/react";
import { LocaleData } from "../locales";

interface HealthPhonePanelProps {
  miles: number;
  restReminderActive: boolean;
  setRestReminderActive: (val: boolean) => void;
  statusText: string;
  formatNextBreakTimer: () => string;
  restInterval: number;
  setRestInterval: (val: number) => void;
  restDuration: number;
  setRestDuration: (val: number) => void;
  isCustomRhythm: boolean;
  setIsCustomRhythm: (val: boolean) => void;
  onSimulateRest: () => void;
  t: LocaleData;
}

export const HealthPhonePanel: React.FC<HealthPhonePanelProps> = ({
  miles,
  restReminderActive,
  setRestReminderActive,
  statusText,
  formatNextBreakTimer,
  restInterval,
  setRestInterval,
  restDuration,
  setRestDuration,
  isCustomRhythm,
  setIsCustomRhythm,
  onSimulateRest,
  t,
}) => {
  return (
    <div
      data-layout="phone-panel-scroll"
      className="flex flex-col gap-[12px] flex-1 min-h-0 w-full overflow-y-auto pt-1.5 px-1 pb-1.5 scrollbar-none select-none"
    >
      {/* Miles/Points Wallet */}
      <div className="flex flex-col items-center py-[2px] shrink-0">
        <Wallet value={miles} size="medium" />
      </div>

      {/* Stretch Switch card */}
      <Card
        pattern="none"
        hoverable={false}
        className="bg-white/80 p-[10px] sm:p-[12px] rounded-[18px] border-2 border-[#edeae0] flex items-center justify-between shrink-0"
      >
        <div className="flex items-center gap-[8px]">
          <CheckCircle className={`w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] ${restReminderActive ? "text-[#6fba2c]" : "text-[#9f927d]"}`} />
          <div className="flex flex-col">
            <span className="font-extrabold text-[clamp(11px,1.3vw,13px)] text-[#725d42]">{t.mainToggleTitle}</span>
            <span className="text-[clamp(10px,1.1vw,12px)] text-[#9f927d]">{t.mainToggleSub}</span>
          </div>
        </div>
        <Switch
          checked={restReminderActive}
          onChange={(checked) => {
            setRestReminderActive(checked);
          }}
        />
      </Card>

      {/* Break Chime info panel */}
      <AnimatePresence mode="popLayout">
        {restReminderActive && (
          <motion.div
            key="break-timer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-[10px] sm:p-[12px] rounded-[16px] bg-[#e6f9f6] border border-[#82d5bb]/60 flex flex-col gap-[4px] sm:gap-[6px] shrink-0 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[clamp(11px,1.2vw,12px)] font-black text-[#19c8b9] uppercase tracking-wider flex items-center gap-[4px]">
                <Clock className="w-[14px] h-[14px]" />
                {t.clockPaceLabel}
              </span>
              <span className="text-[clamp(9px,1vw,11px)] bg-[#19c8b9]/25 text-[#19c8b9] font-black px-[8px] py-[1.5px] rounded-full">
                {isCustomRhythm ? t.customRhythmMode : t.recomHealthMode}
              </span>
            </div>

            {statusText !== "workHours" ? (
              <span className="text-[clamp(11px,1.3vw,13px)] font-semibold text-[#725d42]">
                {t.notWorkHoursStatus}
              </span>
            ) : (
              <div className="flex flex-col gap-[4px]">
                <div className="flex items-center justify-between">
                  <span className="text-[clamp(10px,1.2vw,12px)] font-bold text-[#725d42]">{t.countdownNextRest}</span>
                  <span className="text-[clamp(11px,1.3vw,14px)] font-black font-mono text-[#794f27]">{formatNextBreakTimer()}</span>
                </div>
                <div className="w-full h-[5px] sm:h-[6px] bg-[#19c8b9]/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#19c8b9] transition-all duration-1000"
                    style={{
                      width: `${Math.max(0, Math.min(100, (1 - restInterval) * 100))}%`, 
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mechanism choice config */}
      <div className="bg-white/50 border border-[#edeae0] p-[10px] sm:p-[12px] rounded-[18px] flex flex-col gap-[6px] sm:gap-[8px] shrink-0">
        <div className="flex flex-col gap-[4px]">
          <span className="text-[clamp(11px,1.3vw,13px)] font-extrabold text-[#794f27]">{t.mechanismToggleLabel}</span>
          <Radio
            direction="vertical"
            size="small"
            options={[
              { label: t.optDefaultTitle, value: "default" },
              { label: t.optCustomTitle, value: "custom" },
            ]}
            value={isCustomRhythm ? "custom" : "default"}
            onChange={(val) => {
              const custom = val === "custom";
              setIsCustomRhythm(custom);
              if (!custom) {
                setRestInterval(60);
                setRestDuration(5);
              }
            }}
          />
        </div>

        <AnimatePresence>
          {isCustomRhythm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-[6px] pb-[6px] border-t border-[#edeae0] flex flex-col gap-[8px] sm:gap-[10px] overflow-hidden"
            >
              <div className="flex flex-col gap-[4px] py-1">
                <div className="flex justify-between text-[clamp(10px,1.1vw,12px)] font-[600] text-stone-600">
                  <span>{t.workIntervalLabel}</span>
                  <span className="font-extrabold text-[#19c8b9]">{restInterval} {t.minutesUnit}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="120"
                  step="1"
                  value={restInterval}
                  onChange={(e) => setRestInterval(parseInt(e.target.value, 10))}
                  className="w-full accent-[#19c8b9] h-[4px] rounded-full cursor-pointer bg-stone-200"
                />
              </div>

              <div className="flex flex-col gap-[4px] py-1">
                <div className="flex justify-between text-[clamp(10px,1.1vw,12px)] font-[600] text-stone-600">
                  <span>{t.singleRestLabel}</span>
                  <span className="font-extrabold text-[#19c8b9]">{restDuration} {t.minutesUnit}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={restDuration}
                  onChange={(e) => setRestDuration(parseInt(e.target.value, 10))}
                  className="w-full accent-[#19c8b9] h-[4px] rounded-full cursor-pointer bg-stone-200"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Suggestions details */}
      <div className="bg-[#fffbe7] p-[10px] sm:p-[12px] border-2 border-[#f7cd67]/40 rounded-[18px] text-[clamp(11px,1.1vw,12px)] text-[#725d42] font-medium shrink-0 leading-normal">
        <span className="font-extrabold text-[#794f27] mb-[2px] block">
          {t.tipTitle}
        </span>
        {t.tipContent}
      </div>

      <Button
        type="dashed"
        size="small"
        onClick={onSimulateRest}
        className="!text-[clamp(11px,1.1vw,12px)] border-[#bdaea0] hover:border-[#19c8b9] cursor-pointer shrink-0 !h-[34px]"
      >
        {t.simulateBtn}
      </Button>
    </div>
  );
};
