import React, { useEffect, useState } from "react";
import { Card, Input } from "./AnimalUI";
import { Calendar, RotateCcw, Sun, Moon } from "lucide-react";
import { Preset } from "../types";
import { LocaleData } from "../locales";

interface WorkRhythmPresetsProps {
  startTime: string;
  setStartTime: (t: string) => void;
  endTime: string;
  setEndTime: (t: string) => void;
  presets: Preset[];
  loadPreset: (preset: Preset) => void;
  t: LocaleData;
  className?: string;
}

export const WorkRhythmPresets: React.FC<WorkRhythmPresetsProps> = ({
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  presets,
  loadPreset,
  t,
  className = "",
}) => {
  const [draftStartTime, setDraftStartTime] = useState(startTime);
  const [draftEndTime, setDraftEndTime] = useState(endTime);
  const [editingField, setEditingField] = useState<"start" | "end" | null>(null);

  useEffect(() => {
    if (editingField !== "start") {
      setDraftStartTime(startTime);
    }
  }, [startTime, editingField]);

  useEffect(() => {
    if (editingField !== "end") {
      setDraftEndTime(endTime);
    }
  }, [endTime, editingField]);

  const commitStartTime = () => {
    setEditingField((current) => (current === "start" ? null : current));
    if (draftStartTime !== startTime) {
      setStartTime(draftStartTime);
    }
  };

  const commitEndTime = () => {
    setEditingField((current) => (current === "end" ? null : current));
    if (draftEndTime !== endTime) {
      setEndTime(draftEndTime);
    }
  };

  return (
    <Card pattern="none" className={`p-3.5 sm:p-4 bg-white border-2 border-[#c4b89e] flex flex-col gap-3 sm:gap-3.5 shadow-sm shrink-0 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="font-extrabold text-[12px] sm:text-[14px] md:text-[15px] text-[#794f27] tracking-wide flex items-center gap-[6px]">
          <Calendar className="w-[18px] h-[18px] text-[#19c8b9]" />
          {t.workScheduleTitle}
        </span>

        <button
          onClick={() => {
            setStartTime("09:00");
            setEndTime("18:00");
          }}
          className="text-[11px] font-bold text-[#19c8b9] hover:text-[#11a89b] flex items-center gap-[3px] bg-[#e6f9f6] px-[8px] py-[4px] rounded-full border border-[#19c8b9]/30 transition-all cursor-pointer"
        >
          <RotateCcw className="w-[11px] h-[11px]" />
          {t.standardRhythm}
        </button>
      </div>

      <div className="flex flex-col gap-[6px]">
        <span className="text-[10px] sm:text-[11px] font-bold text-[#c4b89e] uppercase tracking-wider">
          {t.presetText}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-[6px] sm:gap-[8px]">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(p)}
              className="bg-[#f8f8f0] border-2 border-[#bdaea0]/60 hover:border-[#19c8b9] hover:bg-[#fffbe7] text-[#725d42] font-semibold text-[10px] min-[360px]:text-[11px] sm:text-[12px] py-[6px] px-[6px] rounded-[10px] text-center transition-all cursor-pointer truncate"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[10px] sm:gap-[14px]">
        <div className="flex flex-col gap-[4px] sm:gap-[6px]">
          <label className="text-[11px] sm:text-[12px] md:text-[13px] font-extrabold text-[#725d42] flex items-center gap-[4px]">
            <Sun className="w-[14px] h-[14px] text-[#f7cd67]" />
            {t.workStartLabel}
          </label>
          <Input
            type="time"
            size="middle"
            value={draftStartTime}
            overlayValue={startTime}
            hideValueWhileFocused
            onFocus={() => setEditingField("start")}
            onBlur={commitStartTime}
            onChange={(e) => setDraftStartTime(e.target.value)}
            className="!py-[4px] sm:!py-[6px] !font-bold text-[11px] sm:text-[13px]"
          />
        </div>

        <div className="flex flex-col gap-[4px] sm:gap-[6px]">
          <label className="text-[11px] sm:text-[12px] md:text-[13px] font-extrabold text-[#725d42] flex items-center gap-[4px]">
            <Moon className="w-[14px] h-[14px] text-[#889df0]" />
            {t.workEndLabel}
          </label>
          <Input
            type="time"
            size="middle"
            value={draftEndTime}
            overlayValue={endTime}
            hideValueWhileFocused
            onFocus={() => setEditingField("end")}
            onBlur={commitEndTime}
            onChange={(e) => setDraftEndTime(e.target.value)}
            className="!py-[4px] sm:!py-[6px] !font-bold text-[11px] sm:text-[13px]"
          />
        </div>
      </div>
    </Card>
  );
};
