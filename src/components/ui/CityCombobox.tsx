"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { MapPin, ChevronDown, X, Loader2, Check } from "lucide-react";
import { City } from "@/types";

const HEADER_HEIGHT = 72;
const DROPDOWN_H = 224; // max-h-56 = 14rem = 224px

interface CityComboboxProps {
  cities: City[];
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  allowAll?: boolean;
  required?: boolean;
  className?: string;
}

export default function CityCombobox({
  cities,
  value,
  onChange,
  placeholder = "Select a city...",
  disabled = false,
  loading = false,
  error,
  allowAll = false,
  required = false,
  className = "",
}: CityComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => { setMounted(true); }, []);

  type Option = { name: string; value: string };

  const filteredCities: Option[] = cities
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .map((c) => ({ name: c.name, value: c.name }));

  const options: Option[] = allowAll
    ? [{ name: "All Cities", value: "" }, ...filteredCities]
    : filteredCities;

  const selectedLabel = allowAll && value === "" ? "All Cities" : value;

  const calculatePosition = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top - HEADER_HEIGHT;
    const openUpward = spaceBelow < DROPDOWN_H && spaceAbove > spaceBelow;

    const scrollY = window.scrollY;
    let top = openUpward
      ? rect.top + scrollY - DROPDOWN_H - 4
      : rect.bottom + scrollY + 4;
    const minTop = HEADER_HEIGHT + scrollY;
    if (top < minTop) top = minTop;

    let left = rect.left + window.scrollX;
    if (left + rect.width > window.innerWidth - 8) left = window.innerWidth - rect.width - 8;
    if (left < 8) left = 8;

    setDropdownStyle({ position: "absolute", top, left, width: rect.width, zIndex: 9999 });
  }, []);

  const openDropdown = useCallback(() => {
    if (disabled || loading) return;
    calculatePosition();
    setQuery("");
    setHighlightedIndex(-1);
    setIsOpen(true);
  }, [disabled, loading, calculatePosition]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setHighlightedIndex(-1);
  }, []);

  const selectOption = useCallback((optValue: string) => {
    onChange(optValue);
    closeDropdown();
    inputRef.current?.blur();
  }, [onChange, closeDropdown]);

  // Scroll highlighted item into view inside the portaled list
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  // Outside-click, scroll-reposition, resize-reposition while open
  useEffect(() => {
    if (!isOpen) return;
    const onOutside = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (!wrapperRef.current?.contains(t) && !listRef.current?.contains(t)) {
        closeDropdown();
      }
    };
    const onScroll = () => calculatePosition();
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [isOpen, calculatePosition, closeDropdown]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openDropdown();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          selectOption(options[highlightedIndex].value);
        }
        break;
      case "Escape":
        e.preventDefault();
        closeDropdown();
        break;
      case "Tab":
        closeDropdown();
        break;
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
    inputRef.current?.focus();
  };

  const displayValue = isOpen ? query : selectedLabel;
  const isActive = !disabled && !loading;

  const dropdown = isOpen && mounted ? createPortal(
    <ul
      ref={listRef}
      role="listbox"
      style={dropdownStyle}
      data-lenis-prevent="true"
      className="bg-surface-raised border border-subtle rounded-xl shadow-2xl shadow-[var(--shadow-elevation)] overflow-y-auto max-h-56 py-1"
    >
      {options.length === 0 ? (
        <li className="px-4 py-3 text-sm text-muted text-center">
          No cities found.
        </li>
      ) : (
        options.map((opt, idx) => {
          const isSelected = opt.value === value;
          const isHighlighted = idx === highlightedIndex;
          return (
            <li
              key={opt.value === "" ? "__all__" : opt.value}
              role="option"
              aria-selected={isSelected}
              onMouseEnter={() => setHighlightedIndex(idx)}
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(opt.value);
              }}
              className={`
                flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors
                ${isHighlighted
                  ? "bg-surface-overlay text-primary"
                  : "text-secondary hover:bg-surface-overlay/60 hover:text-primary"
                }
                ${isSelected ? "text-emerald-400 font-medium" : ""}
              `}
            >
              <span className="truncate">{opt.name}</span>
              {isSelected && (
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 ml-2" />
              )}
            </li>
          );
        })
      )}
    </ul>,
    document.body
  ) : null;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Input wrapper */}
      <div
        onClick={() => {
          if (isActive && !isOpen) openDropdown();
          inputRef.current?.focus();
        }}
        className={`
          relative flex items-center gap-2
          border rounded-xl px-4 py-3 cursor-text transition-all duration-200
          bg-surface-inset
          ${!isActive ? "opacity-50 cursor-not-allowed" : ""}
          ${error
            ? "border-red-500/60 focus-within:border-red-500"
            : isOpen
            ? "border-emerald-500 ring-1 ring-emerald-500/20"
            : "border-subtle hover:border-emerald-500/40 focus-within:border-emerald-500"
          }
        `}
      >
        <MapPin
          className={`w-4 h-4 flex-shrink-0 transition-colors ${
            isOpen || value ? "text-emerald-500" : "text-muted"
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightedIndex(0);
            if (!isOpen) {
              calculatePosition();
              setIsOpen(true);
            }
          }}
          onFocus={openDropdown}
          onKeyDown={handleKeyDown}
          disabled={!isActive}
          placeholder={loading ? "Loading cities..." : placeholder}
          className="flex-1 bg-transparent text-primary text-sm outline-none placeholder:text-muted min-w-0"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />

        <div className="flex items-center gap-1 flex-shrink-0">
          {loading ? (
            <Loader2 className="w-4 h-4 text-muted animate-spin" />
          ) : (
            <>
              {isActive && value && !(allowAll && value === "") && (
                <button
                  type="button"
                  onClick={handleClear}
                  tabIndex={-1}
                  aria-label="Clear selection"
                  className="w-5 h-5 flex items-center justify-center rounded-full text-muted hover:text-primary hover:bg-surface-overlay transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <ChevronDown
                className={`w-4 h-4 text-secondary transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </>
          )}
        </div>
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {dropdown}
    </div>
  );
}
