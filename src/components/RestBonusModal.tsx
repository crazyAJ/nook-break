import React from "react";
import { Modal, Button } from "./AnimalUI";
import { Quote } from "../types";
import { LocaleData } from "../locales";

interface RestBonusModalProps {
  isResting: boolean;
  onClose: () => void;
  restTimeLeft: number;
  currentQuote: Quote;
  onSkipRest: () => void;
  onFinishRest: () => void;
  t: LocaleData;
  lang: "zh" | "tc" | "en" | "ja" | "ko";
}

export const RestBonusModal: React.FC<RestBonusModalProps> = ({
  isResting,
  onClose,
  restTimeLeft,
  currentQuote,
  onSkipRest,
  onFinishRest,
  t,
  lang,
}) => {
  return (
    <Modal
      visible={isResting}
      onClose={onClose}
      title={t.benchRestTitle}
      footer={
        <div className="flex flex-col w-full gap-[8px] animate-fade-in select-none">
          {/* Rest progress timing */}
          <div className="p-[10px] bg-[#fff9e3] border-2 border-[#f7cd67] rounded-[16px] text-center font-bold shadow-sm">
            <span className="text-[#725d42] text-[13px] block animate-pulse">{t.suggestedRestTime}</span>
            <span className="text-[24px] font-mono text-[#794f27] tracking-[1px] leading-tight block">
            {Math.floor(restTimeLeft / 60)}{(lang === "zh" || lang === "tc") ? "分" : "m"} {restTimeLeft % 60}{(lang === "zh" || lang === "tc") ? "秒" : "s"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-[8px] mt-1">
            <Button
              type="default"
              size="middle"
              onClick={onSkipRest}
              className="cursor-pointer"
            >
              {t.skipRestBtn}
            </Button>
            <Button
              type="primary"
              size="middle"
              onClick={onFinishRest}
              className="shadow-[0_4px_0_0_#bdaea0] bg-white text-[#794f27] cursor-pointer"
            >
              {t.finishRestBtn}
            </Button>
          </div>
          <span className="text-[10px] text-center text-[#9f927d] font-semibold block mt-1">
            {t.modalSubtext}
          </span>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-[12px] text-center select-none">
        {/* Pulsing leaf logo */}
        <div className="w-[56px] h-[56px] rounded-full bg-[#19c8b9]/15 flex items-center justify-center animate-leaf-wiggle shrink-0">
          <svg
            className="w-[32px] h-[32px] text-[#19c8b9]"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12C2 12.55 2.45 13 3 13C3.55 13 4 12.55 4 12C4 7.58 7.58 4 12 4C12.55 4 13 3.55 13 3C13 2.45 12.55 2 12 2ZM21.94 10.3C21.6 8.7 19.34 3.75 13.7 2.06C13.16 1.9 12.63 2.25 12.56 2.81C12.49 3.37 12.92 3.84 13.48 3.96C18.15 4.97 20 9.07 20.3 10.3C20.44 10.86 21 11.2 21.56 11.06C22.12 10.92 22.11 10.36 21.94 10.3ZM12 13V21C12 21.55 12.45 22 13 22C13.55 22 14 21.55 14 21V13C14 12.45 13.55 12 13 12C12.45 12 12 12.45 12 13ZM18.57 14.54C16.89 12.86 13.91 1 13.91 1C13.91 1 2.05 13.91 3.73 15.59C5.41 17.27 15.22 17.89 18.57 14.54ZM10 13C9.45 13 9 12.55 9 12C9 11.45 9.45 11 10 11C10.55 11 11 11.45 11 12C11 12.55 10.55 13 10 13Z" />
          </svg>
        </div>

        <div className="bg-[#fff9e3] p-[14px] rounded-[18px] border-2 border-[#f7cd67]/50 max-w-[340px] text-[13px] sm:text-[14px] leading-[1.6] shadow-sm">
          <p className="font-extrabold text-[#794f27] mb-[4px]">
            {lang === "zh" ? `📢 岛民【${currentQuote.author}】嘱咐：` : lang === "tc" ? `📢 島民【${currentQuote.author}】囑咐：` : lang === "ja" ? `📢 島民【${currentQuote.author}】からのお願い：` : lang === "ko" ? `📢 섬 주민【${currentQuote.author}】의 조언: ` : `📢 Resident [ ${currentQuote.author} ] says:`}
          </p>
          <p className="font-medium text-[#725d42] italic">
            &ldquo;{currentQuote.text}&rdquo;
          </p>
        </div>

        <div className="text-left w-full pl-[8px] flex flex-col gap-[4px] text-[12px] text-[#725d42]/90 font-semibold mt-1">
          <span className="flex items-center gap-[6px]">💧 {t.modalTip1}</span>
          <span className="flex items-center gap-[6px]">👀 {t.modalTip2}</span>
          <span className="flex items-center gap-[6px]">🧘 {t.modalTip3}</span>
        </div>
      </div>
    </Modal>
  );
};
