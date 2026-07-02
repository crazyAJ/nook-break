import React from "react";
import { Check, Languages } from "lucide-react";
import { HUDClock } from "./AnimalUI";
import { LANGUAGE_LABELS, type LocaleData } from "../locales";
import type { AppLanguage } from "../types";

interface AppHeaderProps {
  headerRef: React.RefObject<HTMLElement | null>;
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  showLanguagePicker: boolean;
  setShowLanguagePicker: (show: boolean) => void;
  t: LocaleData;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  headerRef,
  lang,
  setLang,
  showLanguagePicker,
  setShowLanguagePicker,
  t,
}) => {
  return (
    <header
      ref={headerRef}
      data-layout="app-header"
      className="glass-blur glass-blur-md px-4 sm:px-6 py-2 sm:py-3.5 bg-[#fdfaf2]/90 border-b-4 border-[#e9e2cf] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4 shrink-0 z-25 shadow-[0_4px_12px_rgba(114,93,66,0.06)] select-none relative"
    >
      <div className="absolute top-0 left-12 w-8 h-2 bg-[#19c8b9]/10 rounded-b-full hidden lg:block" />
      <div className="absolute top-0 left-24 w-6 h-1.5 bg-[#f7cd67]/15 rounded-b-full hidden lg:block" />

      <div className="flex items-center gap-[10px] sm:gap-[12px] min-w-0">
        <div className="p-1 bg-[#ede6d4] rounded-[18px] shadow-[0_3px_8px_rgba(114,93,66,0.12)] border-2 border-[#d9ceb6] hover:rotate-[15deg] transition-all duration-300 ease-out cursor-pointer group shrink-0">
          <div className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-[14px] bg-[#fffbf2] border-2 border-dashed border-[#bdaea0] flex items-center justify-center relative">
            <span className="text-[18px] sm:text-[20px] select-none transform group-hover:scale-110 transition-transform duration-200">🍃</span>
          </div>
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <h1 className="text-[14px] min-[380px]:text-[15px] sm:text-[18px] font-[950] text-[#794f27] tracking-wider leading-none drop-shadow-[0_1px_0px_#fff] truncate">
              {t.appName}
            </h1>
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#19c8b9] bg-[#19c8b9]/12 px-1.5 py-0.5 rounded-full border border-[#19c8b9]/25 shrink-0">
              {t.brandBadgeLabel}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 sm:mt-1.5 min-w-0">
            <span className="text-[9px] sm:text-[11px] font-extrabold text-[#947e60] leading-none flex items-center gap-1 bg-[#f4ebd0]/55 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-[6px] border border-[#ede5cb]/60 min-w-0 max-w-full sm:max-w-md truncate">
              <span className="inline-block w-1.5 h-1.5 bg-[#f7cd67] rounded-full shrink-0 animate-ping" />
              <span className="truncate">{t.subTitle}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-[8px] max-[379px]:gap-[6px] sm:gap-[12px] relative shrink-0 min-w-0">
        <div className="relative">
          <button
            onClick={() => setShowLanguagePicker(!showLanguagePicker)}
            className="px-[12px] h-[34px] rounded-full bg-white border-2 border-[#bdaea0] text-[#725d42] font-black text-[11px] sm:text-[12px] flex items-center gap-1 hover:bg-[#fff9e3] transition-all cursor-pointer shadow-sm"
            title={t.languageSwitchTitle}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {showLanguagePicker && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowLanguagePicker(false)} />
              <div className="absolute md:right-0 md:left-auto left-0 mt-2 w-[160px] bg-[#fdfcf7] border-2 border-[#bdaea0] rounded-[16px] shadow-lg py-1.5 z-40 select-none animate-fade-in animate-scale-up">
                {(Object.keys(LANGUAGE_LABELS) as AppLanguage[]).map((langKey) => (
                  <button
                    key={langKey}
                    onClick={() => {
                      setLang(langKey);
                      setShowLanguagePicker(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-xs font-black flex items-center justify-between cursor-pointer transition-colors ${
                      lang === langKey
                        ? "bg-[#19c8b9]/15 text-[#794f27]"
                        : "text-[#725d42] hover:bg-[#fffbe7]"
                    }`}
                  >
                    <span>{LANGUAGE_LABELS[langKey]}</span>
                    {lang === langKey && <Check className="w-3.5 h-3.5 text-[#19c8b9]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div data-layout="mobile-header-clock" className="scale-75 sm:scale-90 origin-right shrink-0">
          <HUDClock lang={lang} />
        </div>
      </div>
    </header>
  );
};
