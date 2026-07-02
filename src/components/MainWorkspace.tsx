import React from "react";
import { Compass, Smartphone } from "lucide-react";
import { Phone } from "./AnimalUI";
import { CountdownCard } from "./CountdownCard";
import { WorkRhythmPresets } from "./WorkRhythmPresets";
import { HealthPhonePanel } from "./HealthPhonePanel";
import type { LocaleData } from "../locales";
import type { Preset, TimerCalc } from "../types";

type MobileTab = "dashboard" | "nookphone";

interface MainWorkspaceProps {
  activeUnit: string;
  endTime: string;
  helperSubtext: string;
  isCustomRhythm: boolean;
  isMobile: boolean;
  loadPreset: (preset: Preset) => void;
  miles: number;
  mobileContentEdgeGap: number;
  mobileDockOverlap: number;
  mobileDockRef: React.RefObject<HTMLDivElement | null>;
  mobileLayoutRootRef: React.RefObject<HTMLDivElement | null>;
  mobileTab: MobileTab;
  isClockOutMusicPaused: boolean;
  presets: Preset[];
  restDuration: number;
  restInterval: number;
  restReminderActive: boolean;
  scaleFactor: number;
  setActiveUnit: (unit: string) => void;
  setEndTime: (time: string) => void;
  setIsCustomRhythm: (value: boolean) => void;
  setMobileTab: (tab: MobileTab) => void;
  setRestDuration: (value: number) => void;
  setRestInterval: (value: number) => void;
  setRestReminderActive: (value: boolean) => void;
  setStartTime: (time: string) => void;
  startTime: string;
  t: LocaleData;
  timerCalc: TimerCalc;
  formatNextBreakTimer: () => string;
  onSimulateRest: () => void;
  onSubmitClockOut: () => void;
  onToggleClockOutPlayback: () => void;
}

export const MainWorkspace: React.FC<MainWorkspaceProps> = ({
  activeUnit,
  endTime,
  helperSubtext,
  isCustomRhythm,
  isMobile,
  loadPreset,
  miles,
  mobileContentEdgeGap,
  mobileDockOverlap,
  mobileDockRef,
  mobileLayoutRootRef,
  mobileTab,
  isClockOutMusicPaused,
  presets,
  restDuration,
  restInterval,
  restReminderActive,
  scaleFactor,
  setActiveUnit,
  setEndTime,
  setIsCustomRhythm,
  setMobileTab,
  setRestDuration,
  setRestInterval,
  setRestReminderActive,
  setStartTime,
  startTime,
  t,
  timerCalc,
  formatNextBreakTimer,
  onSimulateRest,
  onSubmitClockOut,
  onToggleClockOutPlayback,
}) => {
  return (
    <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto p-4 md:p-6 overflow-hidden z-10 select-none">
      {!isMobile ? (
        <div className="h-full w-full flex items-center justify-center overflow-hidden min-h-0 relative">
          <div
            style={{
              transform: `scale(${scaleFactor})`,
              transformOrigin: "center center",
              width: "1000px",
              height: "680px",
            }}
            className="grid grid-cols-12 gap-6 max-w-none shrink-0"
          >
            <div className="col-span-6 h-full flex flex-col gap-4 min-h-0 overflow-hidden pt-3 px-3 pb-1.5">
              <CountdownCard
                timerCalc={timerCalc}
                activeUnit={activeUnit}
                setActiveUnit={setActiveUnit}
                isClockOutMusicPaused={isClockOutMusicPaused}
                onToggleClockOutPlayback={onToggleClockOutPlayback}
                onSubmitClockOut={onSubmitClockOut}
                helperSubtext={helperSubtext}
                t={t}
                className="h-[364px]"
              />

              <div className="flex-1 min-h-0 pt-1.5 px-0.5 overflow-visible">
                <WorkRhythmPresets
                  startTime={startTime}
                  setStartTime={setStartTime}
                  endTime={endTime}
                  setEndTime={setEndTime}
                  presets={presets}
                  loadPreset={loadPreset}
                  t={t}
                  className="h-[252px]"
                />
              </div>
            </div>

            <div className="col-span-6 h-full flex flex-col items-center justify-start pt-3 px-3 pb-1.5 min-h-0 overflow-hidden">
              <Phone
                title={t.appName}
                versionLabel={t.phoneVersionLabel}
                networkLabel={t.phoneNetworkLabel}
                className="h-[632px] max-h-[632px]"
              >
                <HealthPhonePanel
                  miles={miles}
                  restReminderActive={restReminderActive}
                  setRestReminderActive={setRestReminderActive}
                  statusText={timerCalc.statusText}
                  formatNextBreakTimer={formatNextBreakTimer}
                  restInterval={restInterval}
                  setRestInterval={setRestInterval}
                  restDuration={restDuration}
                  setRestDuration={setRestDuration}
                  isCustomRhythm={isCustomRhythm}
                  setIsCustomRhythm={setIsCustomRhythm}
                  onSimulateRest={onSimulateRest}
                  t={t}
                />
              </Phone>
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={mobileLayoutRootRef}
          className="h-full w-full flex flex-col min-h-0 select-none pb-[calc(var(--mobile-dock-overlap)+var(--mobile-content-edge-gap))]"
          style={
            {
              "--mobile-dock-overlap": `${mobileDockOverlap}px`,
              "--mobile-content-edge-gap": `${mobileContentEdgeGap}px`,
            } as React.CSSProperties
          }
        >
          <div className="flex-1 min-h-0 overflow-hidden">
            {mobileTab === "dashboard" && (
              <div className="h-full overflow-y-auto scrollbar-none">
                <div className="flex flex-col gap-3.5 animate-scale-up pt-1.5 px-1">
                  <CountdownCard
                    timerCalc={timerCalc}
                    activeUnit={activeUnit}
                    setActiveUnit={setActiveUnit}
                    isClockOutMusicPaused={isClockOutMusicPaused}
                    onToggleClockOutPlayback={onToggleClockOutPlayback}
                    onSubmitClockOut={onSubmitClockOut}
                    helperSubtext={helperSubtext}
                    t={t}
                  />

                  <WorkRhythmPresets
                    startTime={startTime}
                    setStartTime={setStartTime}
                    endTime={endTime}
                    setEndTime={setEndTime}
                    presets={presets}
                    loadPreset={loadPreset}
                    t={t}
                  />
                </div>
              </div>
            )}

            {mobileTab === "nookphone" && (
              <div data-layout="mobile-shell" className="h-full animate-scale-up">
                <Phone
                  title={t.appName}
                  versionLabel={t.phoneVersionLabel}
                  networkLabel={t.phoneNetworkLabel}
                  className="h-full max-h-full"
                >
                  <HealthPhonePanel
                    miles={miles}
                    restReminderActive={restReminderActive}
                    setRestReminderActive={setRestReminderActive}
                    statusText={timerCalc.statusText}
                    formatNextBreakTimer={formatNextBreakTimer}
                    restInterval={restInterval}
                    setRestInterval={setRestInterval}
                    restDuration={restDuration}
                    setRestDuration={setRestDuration}
                    isCustomRhythm={isCustomRhythm}
                    setIsCustomRhythm={setIsCustomRhythm}
                    onSimulateRest={onSimulateRest}
                    t={t}
                  />
                </Phone>
              </div>
            )}
          </div>

          <div
            ref={mobileDockRef}
            className="glass-blur glass-blur-md fixed bottom-0 left-0 right-0 h-[64px] pb-[safe-area-inset-bottom] bg-[#fcfaf2]/95 border-t-2 border-[#e6dec9] flex items-center justify-around px-6 z-20 shadow-[0_-4px_16px_rgba(114,93,66,0.08)] select-none"
          >
            <button
              onClick={() => setMobileTab("dashboard")}
              className={`flex flex-col items-center justify-center h-[46px] w-[110px] rounded-[16px] transition-all cursor-pointer relative ${
                mobileTab === "dashboard"
                  ? "text-white bg-[#19c8b9] shadow-sm font-black scale-105"
                  : "text-[#9f927d] hover:bg-[#fff9e3]"
              }`}
            >
              <Compass className="w-[18px] h-[18px]" />
              <span className="text-[10px] uppercase tracking-wider font-extrabold mt-0.5">
                {t.mobileDashboardTab}
              </span>
            </button>

            <button
              onClick={() => setMobileTab("nookphone")}
              className={`flex flex-col items-center justify-center h-[46px] w-[110px] rounded-[16px] transition-all cursor-pointer relative ${
                mobileTab === "nookphone"
                  ? "text-white bg-[#19c8b9] shadow-sm font-black scale-105"
                  : "text-[#9f927d] hover:bg-[#fff9e3]"
              }`}
            >
              <Smartphone className="w-[18px] h-[18px]" />
              <span className="text-[10px] uppercase tracking-wider font-extrabold mt-0.5">
                {t.mobilePhoneTab}
              </span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
