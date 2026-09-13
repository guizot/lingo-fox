"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  dotColor?: string;
  badgeClass?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps<T extends string | number = string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  variant?: "default" | "badge" | "filter" | "form";
  size?: "sm" | "md";
  isActiveFilter?: boolean;
  className?: string;
  buttonClassName?: string;
  menuWidth?: string | number;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  iconOnly?: boolean;
  align?: "left" | "right";
  title?: string;
  ariaLabel?: string;
}

export function CustomSelect<T extends string | number = string>({
  value,
  options,
  onChange,
  variant = "default",
  size = "md",
  isActiveFilter = false,
  className = "",
  buttonClassName = "",
  menuWidth,
  placeholder,
  leftIcon,
  iconOnly = false,
  align = "left",
  title,
  ariaLabel,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = Math.min(options.length * 40 + 16, 360);
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards = spaceBelow < menuHeight && rect.top > menuHeight;

      const top = openUpwards ? rect.top - menuHeight - 6 : rect.bottom + 6;

      let calcWidth = rect.width;
      if (typeof menuWidth === "number") {
        calcWidth = menuWidth;
      } else if (iconOnly) {
        calcWidth = 180;
      } else {
        calcWidth = Math.max(180, rect.width);
      }

      let left: number;
      if (align === "right") {
        left = Math.max(8, Math.min(rect.right - calcWidth, window.innerWidth - calcWidth - 8));
      } else {
        left = Math.max(8, Math.min(rect.left, window.innerWidth - calcWidth - 8));
      }

      setCoords({ top, left, width: calcWidth });
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Close on outside click or scroll/resize
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleScrollOrResize() {
      if (isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: T) => {
    onChange(val);
    setIsOpen(false);
  };

  // Style generators based on variant
  const getButtonStyles = () => {
    if (iconOnly) {
      return cn(
        "h-10 w-10 p-0 flex items-center justify-center rounded-xl border text-xs font-semibold whitespace-nowrap shadow-2xs transition-all",
        isActiveFilter
          ? "border-primary-400 bg-primary-50/90 text-primary-950 dark:border-primary-700 dark:bg-primary-950/70 dark:text-primary-300"
          : "border-zinc-200/80 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
      );
    }

    if (variant === "filter") {
      return `w-full flex items-center justify-between gap-2 px-3.5 h-10 rounded-xl text-xs font-semibold border whitespace-nowrap transition-all ${
        isActiveFilter
          ? "bg-primary-50/90 dark:bg-primary-950/70 border-primary-300 dark:border-primary-700 text-primary-950 dark:text-primary-300 shadow-2xs"
          : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
      }`;
    }

    if (variant === "form") {
      return "w-full h-10 flex items-center justify-between gap-2 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm bg-zinc-50/70 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all";
    }

    // Default
    return "inline-flex items-center justify-between gap-2 px-3.5 h-10 rounded-xl text-xs font-semibold border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 whitespace-nowrap shadow-2xs hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all";
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        title={title}
        aria-label={ariaLabel || title}
        className={cn(
          getButtonStyles(),
          "active:scale-98 transition-transform cursor-pointer select-none",
          buttonClassName
        )}
      >
        {iconOnly ? (
          leftIcon || selectedOption?.icon || (
            <span className="shrink-0 text-xs font-semibold">{String(value)}</span>
          )
        ) : (
          <>
            <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
              {leftIcon && <span className="shrink-0">{leftIcon}</span>}
              {selectedOption?.icon && (
                <span className="shrink-0">{selectedOption.icon}</span>
              )}
              {selectedOption?.dotColor && !selectedOption?.icon && (
                <span className={`w-2 h-2 rounded-full ${selectedOption.dotColor} shrink-0`} />
              )}
              <span className="truncate">
                {selectedOption ? selectedOption.label : placeholder || String(value)}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 opacity-60 shrink-0 transition-transform duration-200 ml-1.5 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </>
        )}
      </button>

      {/* Portal Menu Popup */}
      {isOpen && mounted && coords && createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            maxHeight: "360px",
            zIndex: 99999,
          }}
          onClick={(e) => e.stopPropagation()}
          className="overflow-y-auto rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xl shadow-zinc-950/20 dark:shadow-zinc-950/60 p-1.5 animate-in fade-in zoom-in-95 duration-150 transition-all"
        >
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value;

              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer text-left ${
                    isSelected
                      ? opt.badgeClass
                        ? `${opt.badgeClass} shadow-2xs font-bold`
                        : "bg-primary-50 dark:bg-primary-950/60 text-primary-900 dark:text-primary-200 font-bold"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    {opt.dotColor && !opt.icon && (
                      <span className={`w-2 h-2 rounded-full ${opt.dotColor} shrink-0`} />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5] text-primary-600 dark:text-primary-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
