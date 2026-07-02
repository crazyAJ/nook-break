import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Smile } from "lucide-react";
import { formatHudMonthDay, getHudWeekday } from "../locales";
import type { AppLanguage } from "../types";

/**
 * ============================================================================
 * DESIGN TOKENS & TYPOGRAPHY INFO
 * ============================================================================
 * Primary Font: Segoe UI / PingFang SC / Microsoft YaHei system stack
 * Primary Colors: Mint Teal (#19c8b9), Warm Brown text (#725d42, #794f27)
 * Warm background: rgb(247, 243, 223) / #f8f8f0
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// Button Component
// ----------------------------------------------------------------------------
interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  type?: "primary" | "danger" | "default" | "dashed" | "text" | "link";
  size?: "small" | "middle" | "large";
  loading?: boolean;
  block?: boolean;
  ghost?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  type = "default",
  size = "middle",
  loading = false,
  block = false,
  ghost = false,
  disabled = false,
  children,
  className = "",
  id,
  ...rest
}) => {
  // Size classes
  const sizeClasses = {
    small: "h-[32px] px-[16px] text-[12px] rounded-[16px]",
    middle: "h-[45px] px-[20px] text-[14px] rounded-[50px]",
    large: "h-[48px] px-[32px] text-[16px] rounded-[24px]",
  };

  // Type-specific classes
  let typeClasses = "";
  let shadowStyle = {};

  if (loading) {
    typeClasses = "animate-btn-loading border-none text-white pointer-events-none";
  } else if (disabled) {
    typeClasses = "opacity-50 cursor-not-allowed bg-[#f0ece2] border-[#d4c9b4] text-[#c4b89e]";
  } else {
    switch (type) {
      case "primary":
        typeClasses = `bg-[#f8f8f0] border-[#9f927d] text-[#794f27] hover:border-[#794f27] hover:text-[#794f27] active:transform active:translate-y-[2px] transition-all duration-[0.15s] ease-[cubic-bezier(0.4,0,0.2,1)]`;
        shadowStyle = {
          border: "2px solid #794f27",
          boxShadow: "0 5px 0 0 #bdaea0",
        };
        break;
      case "danger":
        typeClasses = `bg-[#e05a5a] border-[#e05a5a] text-white hover:bg-[#e05a5a]/90 active:transform active:translate-y-[2px] transition-all duration-[0.15s] ease-[cubic-bezier(0.4,0,0.2,1)]`;
        shadowStyle = {
          border: "2px solid #c94444",
          boxShadow: "0 5px 0 0 #c94444",
        };
        break;
      case "default":
      case "dashed":
        const borderStyle = type === "dashed" ? "dashed" : "solid";
        typeClasses = `bg-[#f8f8f0] border-2 border-${borderStyle} border-[#9f927d] text-[#725d42] hover:border-[#19c8b9] hover:text-[#19c8b9] active:translate-y-0 transition-all duration-[0.15s] ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_2px_4px_0_rgba(61,52,40,0.06)] hover:shadow-[0_3px_10px_0_rgba(61,52,40,0.1)] hover:-translate-y-[1px]`;
        break;
      case "text":
      case "link":
        typeClasses = `bg-transparent border-none text-[#725d42] hover:text-[#19c8b9] active:translate-y-0 transition-all duration-[0.15s]`;
        break;
    }
  }

  // Ghost adjustments
  if (ghost && !loading && !disabled) {
    typeClasses += " !bg-transparent";
  }

  return (
    <button
      id={id}
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center font-semibold leading-none tracking-[0.02em] select-none cursor-pointer border-2 ${
        block ? "w-full flex" : ""
      } ${sizeClasses[size]} ${typeClasses} ${className}`}
      style={shadowStyle}
      {...rest}
    >
      {loading && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      )}
      {children}
    </button>
  );
};

// ----------------------------------------------------------------------------
// Card Component
// ----------------------------------------------------------------------------
type PatternType =
  | "none"
  | "default"
  | "app-pink"
  | "app-teal"
  | "app-yellow"
  | "app-green"
  | "purple"
  | "app-blue"
  | "app-orange";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  pattern?: PatternType;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  pattern = "default",
  hoverable = true,
  children,
  className = "",
  id,
  ...rest
}) => {
  const patternClass = pattern === "none" ? "bg-white border-2 border-[#c4b89e]" : `pattern-${pattern}`;

  return (
    <div
      id={id}
      className={`rounded-[20px] p-[20px] text-[#725d42] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        hoverable ? "hover:-translate-y-[2px]" : ""
      } ${patternClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

// ----------------------------------------------------------------------------
// HUD Clock/Time Component
// ----------------------------------------------------------------------------
interface TimeProps {
  id?: string;
  className?: string;
  lang: AppLanguage;
}

export const HUDClock: React.FC<TimeProps> = ({ id, className = "", lang }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const padZero = (num: number) => num.toString().padStart(2, "0");

  const hours = padZero(time.getHours());
  const minutes = padZero(time.getMinutes());
  const seconds = padZero(time.getSeconds());

  return (
    <div
      id={id}
      className={`inline-flex items-center justify-between p-[12px] px-[24px] max-[379px]:px-[12px] max-[379px]:py-[10px] sm:px-[36px] gap-[16px] max-[379px]:gap-[8px] sm:gap-[24px] bg-gradient-to-b from-white to-[#f8f8f0] border-3 border-[#d4cfc3] rounded-[18px] shadow-sm ${className}`}
    >
      {/* Date HUD element */}
      <div className="flex flex-col border-r-3 border-[#9f927d]/35 pr-[16px] max-[379px]:pr-[8px] sm:pr-[24px]">
        <div className="text-[#6fba2c] font-[900] text-[12px] max-[379px]:text-[10px] sm:text-[14px] tracking-[1.5px] uppercase">
          {getHudWeekday(lang, time)}
        </div>
        <div className="text-[#8b7355] font-[800] text-[18px] max-[379px]:text-[14px] sm:text-[22px] whitespace-nowrap">
          {formatHudMonthDay(lang, time)}
        </div>
      </div>

      {/* Time Digits HUD element */}
      <div className="flex items-center text-[#8b7355] font-[900] text-[34px] max-[379px]:text-[26px] sm:text-[44px] tracking-[2px] max-[379px]:tracking-[1px] font-mono leading-none">
        <span>{hours}</span>
        <span className="animate-blink px-[2px]">:</span>
        <span>{minutes}</span>
        <span className="text-[18px] max-[379px]:text-[14px] @sm:text-[22px] text-[#9f927d] ml-[6px] max-[379px]:ml-[4px] font-bold align-bottom self-end pb-1 max-[379px]:pb-0.5 sm:pb-2">
          {seconds}
        </span>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// Switch Component
// ----------------------------------------------------------------------------
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  checkedChildren?: React.ReactNode;
  unCheckedChildren?: React.ReactNode;
  disabled?: boolean;
  size?: "default" | "small";
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  checkedChildren,
  unCheckedChildren,
  disabled = false,
  size = "default",
  id,
}) => {
  const isSmall = size === "small";

  const handleToggle = () => {
    if (disabled) return;
    onChange(!checked);
  };

  const trackWidth = isSmall ? "w-[44px]" : "w-[62px]";
  const trackHeight = isSmall ? "h-[24px]" : "h-[32px]";
  const handleSize = isSmall ? "w-[16px] h-[16px]" : "w-[24px] h-[24px]";
  const handleLeft = checked
    ? isSmall
      ? "left-[calc(100%-19px)]"
      : "left-[calc(100%-27px)]"
    : "left-[3px]";

  const activeBg = checked ? "bg-[#86d67a] border-[#6fba2c]" : "bg-[#d4c9b4] border-[#c4b89e]";
  const hoverBorder = disabled ? "" : "hover:border-[#a89878]";

  return (
    <div
      id={id}
      onClick={handleToggle}
      className={`relative inline-flex items-center cursor-pointer rounded-full border-2.5 transition-all duration-300 select-none ${trackWidth} ${trackHeight} ${activeBg} ${hoverBorder} ${
        disabled ? "opacity-55 cursor-not-allowed" : ""
      }`}
      style={{
        boxShadow: checked ? "inset 0 2px 4px rgba(90,158,30,0.20)" : "inset 0 2px 4px rgba(114,93,66,0.15)",
      }}
    >
      {/* Inner Label text */}
      <span
        className={`absolute text-[10px] font-black tracking-wider text-white select-none whitespace-nowrap transition-all duration-250 ${
          checked
            ? isSmall
              ? "left-[6px] opacity-100"
              : "left-[8px] opacity-100"
            : isSmall
            ? "right-[6px] opacity-100"
            : "right-[8px] opacity-100"
        }`}
      >
        {checked ? checkedChildren : unCheckedChildren}
      </span>

      {/* Floating center Handle circle */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-[rgb(247,243,223)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${handleSize} ${handleLeft}`}
        style={{
          border: checked ? "2.5px solid #6fba2c" : "2.5px solid #c4b89e",
        }}
      />
    </div>
  );
};

// ----------------------------------------------------------------------------
// Radio Component
// ----------------------------------------------------------------------------
interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface RadioProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  direction?: "horizontal" | "vertical";
  size?: "small" | "middle" | "large";
  id?: string;
}

export const Radio: React.FC<RadioProps> = ({
  options,
  value,
  onChange,
  direction = "horizontal",
  size = "middle",
  id,
}) => {
  const sizeMap = {
    small: "h-[18px] w-[18px] rounded-[10px] text-[12px]",
    middle: "h-[22px] w-[22px] rounded-[13px] text-[14px]",
    large: "h-[28px] w-[28px] rounded-[16px] text-[16px]",
  };

  const isVertical = direction === "vertical";

  return (
    <div id={id} className={`flex flex-wrap gap-[12px] ${isVertical ? "flex-col" : "flex-row"}`}>
      {options.map((opt) => {
        const isChecked = opt.value === value;
        const isDisabled = opt.disabled;

        const borderCol = isChecked ? "border-[#11a89b]" : "border-[#c4b89e]";
        const bgCol = isChecked ? "bg-[#19c8b9]" : "bg-[rgb(247,243,223)]";

        return (
          <label
            key={opt.value}
            className={`inline-flex items-center gap-[8px] cursor-pointer select-none ${
              isDisabled ? "opacity-55 cursor-not-allowed" : ""
            }`}
          >
            {/* Custom checkmark, heavily rounded square instead of circle */}
            <input
              type="radio"
              checked={isChecked}
              disabled={isDisabled}
              onChange={() => !isDisabled && onChange(opt.value)}
              className="sr-only"
            />
            <div
              className={`flex items-center justify-center border-2.5 transition-all duration-150 hover:-translate-y-[1px] active:translate-y-0 ${sizeMap[size]} ${borderCol} ${bgCol}`}
              style={{
                boxShadow: isChecked ? "0 0 0 2.5px rgba(255,204,0,0.18)" : "none",
              }}
            >
              {isChecked && (
                <Check
                  className="text-white font-[950]"
                  style={{
                    width: "70%",
                    height: "70%",
                    strokeWidth: 4,
                  }}
                />
              )}
            </div>
            <span
              className={`font-[600] text-[#725d42] transition-colors ${
                isChecked ? "text-[#794f27] font-bold" : ""
              }`}
            >
              {opt.label}
            </span>
          </label>
        );
      })}
    </div>
  );
};

// ----------------------------------------------------------------------------
// Custom Input Component
// ----------------------------------------------------------------------------
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix" | "size"> {
  size?: "small" | "middle" | "large";
  shadow?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: boolean;
  warning?: boolean;
  overlayValue?: string;
  hideValueWhileFocused?: boolean;
}

export const Input: React.FC<InputProps> = ({
  size = "middle",
  shadow = false,
  prefix,
  suffix,
  error = false,
  warning = false,
  disabled = false,
  overlayValue,
  hideValueWhileFocused = false,
  className = "",
  id,
  style,
  onClick,
  onBlur,
  onFocus,
  onMouseDown,
  onMouseUp,
  onSelect,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isNativeTimeInput = rest.type === "time";
  const showOverlayValue = hideValueWhileFocused && isFocused && overlayValue !== undefined;
  const heightClasses = {
    small: "h-[32px] px-[12px] text-[12px] rounded-[40px]",
    middle: "h-[40px] px-[16px] text-[14px] rounded-[50px]",
    large: "h-[48px] px-[20px] text-[16px] rounded-[50px]",
  };
  const overlayPaddingClasses = {
    small: "left-[12px] right-[12px] text-[12px]",
    middle: "left-[16px] right-[16px] text-[14px]",
    large: "left-[20px] right-[20px] text-[16px]",
  };

  const borderCol = error ? "border-[#e05a5a]" : warning ? "border-[#dba90e]" : "border-[#c4b89e] focus-visible:border-[#ffcc00]";
  const shadowStyle = error
    ? "shadow-[0_3px_0_0_#c94444]"
    : warning
    ? "shadow-[0_3px_0_0_#dba90e]"
    : shadow
    ? "shadow-[0_3px_0_0_#d4c9b4] hover:shadow-[0_3px_0_0_#c4b89e] focus-within:shadow-[0_4px_0_0_#e0b800]"
    : "none";

  const clearNativeTimeSelection = (input: HTMLInputElement) => {
    try {
      input.setSelectionRange?.(0, 0);
    } catch {
      // Some time inputs do not support selection APIs.
    }

    try {
      globalThis.getSelection?.()?.removeAllRanges();
    } catch {
      // Ignore unavailable selection APIs.
    }
  };

  const openNativeTimePicker = (input: HTMLInputElement) => {
    if (!isNativeTimeInput) {
      return;
    }

    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        // Ignore browsers that block programmatic picker access and fall back to focus().
      }
    }

    try {
      input.focus({ preventScroll: true });
    } catch {
      input.focus();
    }
  };

  return (
    <div
      id={id}
      data-native-time-wrapper={isNativeTimeInput ? "true" : undefined}
      className={`relative inline-flex items-center w-full min-w-0 bg-[rgb(247,243,223)] border-2 rounded-full transition-all duration-150 ${isNativeTimeInput ? "overflow-visible" : "overflow-hidden"} ${borderCol} ${
        disabled ? "opacity-60 bg-[#ece8dc] border-[#d4c9b4]" : "hover:border-[#a89878]"
      }`}
      style={{ boxShadow: shadowStyle !== "none" ? shadowStyle : undefined }}
    >
      {prefix && <span className="pl-[14px] pr-[2px] text-[#a0936e]">{prefix}</span>}
      {showOverlayValue && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 flex items-center text-[#725d42] font-[500] leading-none whitespace-nowrap ${overlayPaddingClasses[size]}`}
        >
          {overlayValue}
        </span>
      )}
      <input
        disabled={disabled}
        data-native-time={isNativeTimeInput ? "true" : undefined}
        className={`w-full bg-transparent focus:outline-none placeholder-[#c4b89e] placeholder-font-[400] text-[#725d42] font-[500] leading-none ${heightClasses[size]} ${isNativeTimeInput ? "appearance-none min-w-0 pr-[10px] select-none" : ""} ${showOverlayValue ? "text-transparent caret-transparent" : ""} ${className}`}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || !isNativeTimeInput) {
            return;
          }

          openNativeTimePicker(event.currentTarget);
        }}
        onMouseDown={(event) => {
          onMouseDown?.(event);
          if (event.defaultPrevented || !isNativeTimeInput) {
            return;
          }

          globalThis.setTimeout(() => {
            clearNativeTimeSelection(event.currentTarget);
          }, 0);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
          if (!isNativeTimeInput) {
            return;
          }

          clearNativeTimeSelection(event.currentTarget);
        }}
        onMouseUp={(event) => {
          onMouseUp?.(event);
          if (!isNativeTimeInput) {
            return;
          }

          clearNativeTimeSelection(event.currentTarget);
        }}
        onSelect={(event) => {
          onSelect?.(event);
          if (!isNativeTimeInput) {
            return;
          }

          clearNativeTimeSelection(event.currentTarget);
        }}
        style={
          isNativeTimeInput
            ? {
                ...style,
                userSelect: "none",
                WebkitUserSelect: "none",
              }
            : style
        }
        {...rest}
      />
      {suffix && <span className="pr-[14px] pl-[2px] text-[#a0936e]">{suffix}</span>}
    </div>
  );
};

// ----------------------------------------------------------------------------
// Custom Modal Component
// ----------------------------------------------------------------------------
interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  confirmText?: string;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
  confirmText,
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-[16px] overflow-y-auto">
          {/* Backdrop layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="glass-blur glass-blur-xs fixed inset-0 bg-black/40"
          />

          {/* Organic blob content panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: "spring", damping: 18, stiffness: 220 }}
            className="relative w-full max-w-[480px] bg-[rgb(247,243,223)] p-[36px] sm:p-[48px] text-[#725d42] z-[1000] border-2 border-[#725d42]"
            style={{
              clipPath: "url(#animal-modal-clip)",
            }}
          >
            {/* Modal Title */}
            <div className="text-center mb-[18px]">
              <h2 className="text-[20px] sm:text-[23px] font-[900] text-[#794f27] tracking-wider leading-tight">
                {title}
              </h2>
            </div>

            {/* Scrollable description or child list */}
            <div className="text-[14px] sm:text-[15px] font-[500] leading-[1.6] mb-[26px]">
              {children}
            </div>

            {/* Action buttons footer */}
            <div className="flex flex-col sm:flex-row gap-[12px] items-stretch justify-center">
              {footer ? (
                footer
              ) : (
                <Button type="primary" size="middle" block onClick={onClose}>
                  {confirmText ?? ""}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ----------------------------------------------------------------------------
// Custom Wallet Component
// ----------------------------------------------------------------------------
interface WalletProps {
  value: number | string;
  size?: "small" | "medium" | "large";
  thousandSeparator?: string;
  id?: string;
}

export const Wallet: React.FC<WalletProps> = ({
  value,
  size = "medium",
  thousandSeparator = ",",
  id,
}) => {
  const sizeMap = {
    small: { pillW: "w-[110px]", pillH: "h-[32px]", text: "text-[12px]", halo: "3px" },
    medium: { pillW: "w-[150px]", pillH: "h-[42px]", text: "text-[16px]", halo: "4px" },
    large: { pillW: "w-[190px]", pillH: "h-[54px]", text: "text-[21px]", halo: "6px" },
  };

  const { pillW, pillH, text, halo } = sizeMap[size];

  const formattedValue = () => {
    if (typeof value === "number") {
      if (thousandSeparator) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
      }
      return value.toString();
    }
    return value || "0";
  };

  return (
    <div id={id} className="relative inline-flex flex-col items-center select-none pt-[16px] group">
      {/* Absolute floating Leaf wallet bag icon overlapping */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[4] pointer-events-none transition-transform duration-300 group-hover:-translate-y-[4px] group-hover:rotate-6">
        <svg
          className="w-[36px] h-[36px] sm:w-[42px] sm:h-[42px] drop-shadow-[0_2px_4px_rgba(91,78,30,0.18)]"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cute canvas coin bag icon with leaf stamp */}
          <path
            d="M18 4C14 4 12 8 10 12C8 16 7 24 10 28C13 32 23 32 26 28C29 24 28 16 26 12C24 8 22 4 18 4Z"
            fill="#e8cd71"
            stroke="#9c7834"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Tie string */}
          <path d="M7 13.5H29" stroke="#924e2c" strokeWidth="4.5" strokeLinecap="round" />
          {/* Leaf emblem on the bag */}
          <path
            d="M16 18C16 18 19 16.5 21.5 18.5C21.5 18.5 20.5 21.5 17.5 21.5C16.5 21.5 16 20.5 16 18Z"
            fill="#6fba2c"
          />
          <path d="M16 18C16 18 14.5 20.5 15.5 22.5" stroke="#488c1b" strokeWidth="2.5" />
        </svg>
      </div>

      {/* Pill background bar */}
      <div
        className={`flex items-center justify-center rounded-full bg-[#b3a046] ${pillW} ${pillH} transition-all duration-200`}
        style={{
          boxShadow: `inset 0 -5px 0 rgba(91,78,30,0.18), inset 0 0 0 2px rgba(91,78,30,0.12), 0 0 0 ${halo} #fffbe7, 0 6px 14px rgba(91,78,30,0.18)`,
        }}
      >
        <div
          className={`font-[900] letter-spacing-wider text-white text-center whitespace-nowrap font-mono pt-[3px] select-none ${text}`}
          style={{
            textShadow: "0 2px 0 rgba(91,78,30,0.7), 0 0 2px rgba(91,78,30,0.7)",
          }}
        >
          {formattedValue()}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// Custom Divider Component
// ----------------------------------------------------------------------------
interface DividerProps {
  type?: "line-brown" | "dashed-brown" | "line-teal" | "dashed-teal";
  id?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ type = "line-brown", id, className = "" }) => {
  const isDashed = type.startsWith("dashed");
  const colorClass = type.includes("teal") ? "border-[#19c8b9]" : "border-[#d8d0c3]";

  return (
    <div id={id} className={`w-full py-[12px] flex items-center justify-center ${className}`}>
      <div
        className={`w-full border-t-[2.5px] ${isDashed ? "border-dashed" : "border-solid"} ${colorClass}`}
      />
    </div>
  );
};

// ----------------------------------------------------------------------------
// Custom Nook Phone Side-drawer layout decoration
// ----------------------------------------------------------------------------
interface PhoneProps {
  title: string;
  versionLabel: string;
  networkLabel: string;
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export const Phone: React.FC<PhoneProps> = ({
  title,
  versionLabel,
  networkLabel,
  children,
  id,
  className = "",
}) => {
  return (
    <div
      id={id}
      className={`relative mx-auto w-full max-w-[390px] h-full max-h-[82vh] rounded-[64px] border-[12px] border-[#edeae0] bg-[#f8f4e8] pt-[18px] pb-[2px] px-[20.5px] sm:pt-[22px] sm:pb-[3px] sm:px-[24px] shadow-none sm:shadow-[0_18px_48px_rgba(114,93,66,0.22)] overflow-hidden animate-grasswave flex flex-col justify-between ${className}`}
      data-layout="phone-shell"
      style={{
        boxShadow: "inset 0 0 16px rgba(114,93,66,0.06)",
      }}
    >
      {/* Dynamic Nook Phone Top Notch */}
      <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[124px] h-[18px] bg-[#edeae0] rounded-b-[18px] z-10 flex items-center justify-center">
        <div className="w-[42px] h-[4px] bg-[#cbc7bb] rounded-full" />
      </div>

      {/* Screen top status indicators widget */}
      <div className="flex items-center justify-between pt-[10px] pb-[6px] px-[12px] text-[#725d42]/70 font-bold text-[11px] tracking-[1px] shrink-0">
        <div className="flex items-center gap-[4px]">{/* Screen notch gap space */}
          <span className="w-[8px] h-[8px] bg-[#82d5bb] rounded-full" />
          <span>{versionLabel}</span>
        </div>
        <div className="flex items-center gap-[4px]">
          <span>{networkLabel}</span>
          <span className="w-[12px] h-[8px] border-1.5 border-[#725d42]/60 rounded-[2px] inline-flex items-center">
            <span className="h-full w-2/3 bg-[#725d42]/80" />
          </span>
        </div>
      </div>

      {/* Main interactive viewport */}
      <div className="glass-blur glass-blur-sm bg-white/45 border-2 border-[#edeae0] p-[8px] sm:p-[16px] rounded-[42px] flex-1 min-h-0 relative z-[2] flex flex-col">
        <div className="text-center shrink-0">
          <span className="bg-[#19c8b9]/15 text-[#19c8b9] font-black text-[11px] uppercase tracking-wider py-[4px] px-[12px] rounded-full">
            {title}
          </span>
        </div>

        {children}
      </div>

      {/* NookPhone home button ring (emoji) shifted down and reduced margin */}
      <div className="mt-[4px] flex justify-center shrink-0">
        <div className="w-[36px] h-[36px] rounded-full border-3 border-[#edeae0] flex items-center justify-center cursor-pointer hover:bg-[#edeae0]/60 active:scale-95 transition-all">
          <Smile className="w-[16px] h-[16px] text-[#725d42]" />
        </div>
      </div>
    </div>
  );
};
