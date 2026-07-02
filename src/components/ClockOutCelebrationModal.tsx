import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { ClockOutFireworksLayer } from "./ClockOutFireworksLayer";
import { ClockOutCelebrationScene } from "./ClockOutCelebrationScene";
import type { LocaleData } from "../locales";

interface ClockOutCelebrationModalProps {
  visible: boolean;
  onClose: () => void;
  isMusicPaused: boolean;
  onTogglePlayback: () => void;
  isMobile: boolean;
  t: LocaleData;
}

export const ClockOutCelebrationModal: React.FC<ClockOutCelebrationModalProps> = ({
  visible,
  onClose,
  isMusicPaused,
  onTogglePlayback,
  isMobile,
  t,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <div
      id="clockout-celebration-container"
      className="fixed inset-0 z-[1100] overflow-hidden"
    >
      <div
        data-layout="clockout-modal-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-black/32"
      />

      <ClockOutFireworksLayer isMobile={isMobile} />
      <ClockOutCelebrationScene isMobile={isMobile} />

      <button
        data-layout="clockout-modal-playback-button"
        aria-label={isMusicPaused ? t.clockOutResumeAriaLabel : t.clockOutPauseAriaLabel}
        onClick={onTogglePlayback}
        className="glass-blur glass-blur-lg absolute top-[18px] right-[18px] z-30 flex h-[36px] w-[36px] items-center justify-center rounded-full border border-[#fff7ea]/70 bg-[rgba(255,249,238,0.62)] text-[#7f5a33] shadow-[0_8px_20px_rgba(92,63,34,0.12)] transition-[background-color,transform,box-shadow] duration-200 hover:bg-[rgba(255,250,241,0.82)] hover:shadow-[0_10px_24px_rgba(92,63,34,0.16)] active:scale-[0.96] sm:top-[24px] sm:right-[24px] sm:h-[40px] sm:w-[40px]"
      >
        {isMusicPaused ? (
          <VolumeX className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        ) : (
          <Volume2 className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        )}
      </button>
    </div>
  );
};
