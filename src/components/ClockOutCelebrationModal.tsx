import React, { useMemo } from "react";
import {Volume2, VolumeX} from "lucide-react";
import { ClockOutFireworksLayer } from "./ClockOutFireworksLayer";
import { ClockOutCelebrationScene } from "./ClockOutCelebrationScene";

interface ClockOutCelebrationModalProps {
  visible: boolean;
  onClose: () => void;
  isMusicPaused: boolean;
  onTogglePlayback: () => void;
  isMobile: boolean;
}

export const ClockOutCelebrationModal: React.FC<ClockOutCelebrationModalProps> = ({
  visible,
  onClose,
  isMusicPaused,
  onTogglePlayback,
  isMobile,
}) => {
  const perfDebug = useMemo(() => getClockOutPerfDebugOptions(), []);

  if (!visible) {
    return null;
  }

  return (
    <div
      id="clockout-celebration-container"
      className="fixed inset-0 z-[1100] overflow-hidden"
    >
      {perfDebug.showBackdrop ? (
        <div
          data-layout="clockout-modal-backdrop"
          onClick={onClose}
          className="absolute inset-0 bg-black/32"
        />
      ) : null}

      {perfDebug.showFireworks ? <ClockOutFireworksLayer isMobile={isMobile} /> : null}
      {perfDebug.showAnimals ? (
        <ClockOutCelebrationScene isMobile={isMobile} />
      ) : null}

      <button
        data-layout="clockout-modal-playback-button"
        aria-label={isMusicPaused ? "继续播放背景音乐" : "暂停背景音乐"}
        onClick={onTogglePlayback}
        className="absolute top-[18px] right-[18px] z-30 flex h-[36px] w-[36px] items-center justify-center rounded-full border border-[#fff7ea]/70 bg-[rgba(255,249,238,0.62)] text-[#7f5a33] shadow-[0_8px_20px_rgba(92,63,34,0.12)] backdrop-blur-[8px] transition-[background-color,transform,box-shadow] duration-200 hover:bg-[rgba(255,250,241,0.82)] hover:shadow-[0_10px_24px_rgba(92,63,34,0.16)] active:scale-[0.96] sm:top-[24px] sm:right-[24px] sm:h-[40px] sm:w-[40px]"
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

function getClockOutPerfDebugOptions() {
  if (typeof window === "undefined") {
    return {
      showBackdrop: true,
      showFireworks: true,
      showAnimals: true,
    };
  }

  const query = new URLSearchParams(window.location.search);
  return {
    showBackdrop: readPerfFlag(query, "perfBackdrop"),
    showFireworks: readPerfFlag(query, "perfFireworks"),
    showAnimals: readPerfFlag(query, "perfAnimals"),
  };
}

function readPerfFlag(query: URLSearchParams, key: string) {
  const rawValue = query.get(key);
  if (rawValue === null) {
    return true;
  }

  const normalizedValue = rawValue.trim().toLowerCase();
  return !["0", "false", "off", "no"].includes(normalizedValue);
}
