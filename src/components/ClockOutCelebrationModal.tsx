import React from "react";
import {Volume2, VolumeX} from "lucide-react";

interface ClockOutCelebrationModalProps {
  visible: boolean;
  onClose: () => void;
  isMusicPaused: boolean;
  onTogglePlayback: () => void;
}

export const ClockOutCelebrationModal: React.FC<ClockOutCelebrationModalProps> = ({
  visible,
  onClose,
  isMusicPaused,
  onTogglePlayback,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <div
      id="clockout-celebration-container"
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 overflow-hidden"
    >
      <div
        data-layout="clockout-modal-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-[3px]"
      />

      <div
        data-layout="clockout-modal-shell"
        className="relative w-full max-w-[680px] min-h-[420px] rounded-[48px] shadow-[0_24px_56px_rgba(74,56,41,0.35)] z-20 overflow-hidden select-none"
      >
        <div
          data-layout="clockout-modal-cover-layer"
          aria-hidden="true"
          className="absolute inset-0 z-0 rounded-[48px] bg-[url('/pop-cover.jpeg')] bg-no-repeat bg-center bg-cover pointer-events-none opacity-60"
        />
        <img
          data-layout="clockout-modal-celebrate-art"
          aria-hidden="true"
          alt=""
          src="/celebrate.png"
          className="absolute inset-0 z-10 h-full w-full rounded-[48px] object-cover pointer-events-none select-none"
          style={{ filter: 'drop-shadow(0 0 4px #ffffff) drop-shadow(0 0 1px #ffffff)' }}
        />
        <div
          data-layout="clockout-modal-frame-layer"
          aria-hidden="true"
          className="absolute inset-[14px] z-20 rounded-[34px] border border-[#fff8ef]/65 shadow-[inset_0_0_0_1px_rgba(140,90,46,0.08),0_10px_24px_rgba(85,54,27,0.06)] pointer-events-none"
        />
        <button
          data-layout="clockout-modal-playback-button"
          aria-label={isMusicPaused ? "继续播放背景音乐" : "暂停背景音乐"}
          onClick={onTogglePlayback}
          className="absolute top-[20px] right-[20px] z-30 flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[#fff7ea]/80 bg-[rgba(255,249,238,0.72)] text-[#7f5a33] shadow-[0_8px_20px_rgba(92,63,34,0.12)] backdrop-blur-[6px] transition-[background-color,transform,box-shadow] duration-200 hover:bg-[rgba(255,250,241,0.88)] hover:shadow-[0_10px_24px_rgba(92,63,34,0.16)] active:scale-[0.96] sm:h-[36px] sm:w-[36px]"
          title={isMusicPaused ? "Resume background music / 继续播放背景音乐" : "Pause background music / 暂停背景音乐"}
        >
          {isMusicPaused ? (
            <VolumeX className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          ) : (
            <Volume2 className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          )}
        </button>
      </div>
    </div>
  );
};
