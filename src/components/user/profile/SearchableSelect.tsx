'use client';

import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export type SearchableOption = {
  id: number;
  name: string;
};

type SearchableSelectProps = {
  value: string;
  options: SearchableOption[];

  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;

  disabled?: boolean;

  onChange: (value: string) => void;
};

export default function SearchableSelect({
  value,
  options,
  placeholder = 'เลือกรายการ',
  searchPlaceholder = 'พิมพ์เพื่อค้นหา...',
  emptyText = 'ไม่พบข้อมูล',
  disabled = false,
  onChange,
}: SearchableSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // ============================================================
  // SELECTED
  // ============================================================

  const selectedOption = useMemo(() => {
    if (!value) return null;

    return options.find((item) => String(item.id) === String(value)) ?? null;
  }, [options, value]);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredOptions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return options;
    }

    return options.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [options, search]);

  // ============================================================
  // CLICK OUTSIDE
  // ============================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ============================================================
  // AUTO FOCUS SEARCH
  // ============================================================

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isOpen]);

  // ============================================================
  // OPEN / CLOSE
  // ============================================================

  const handleToggle = () => {
    if (disabled) return;

    setIsOpen((previous) => {
      if (previous) {
        setSearch('');
      }

      return !previous;
    });
  };

  // ============================================================
  // SELECT
  // ============================================================

  const handleSelect = (option: SearchableOption) => {
    onChange(String(option.id));

    setIsOpen(false);
    setSearch('');
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div ref={containerRef} className="relative">
      {/* SELECT BUTTON */}

      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isOpen}
        className={`border-border bg-background shadow-xs focus:ring-3 flex h-11 w-full items-center justify-between gap-3 rounded-xl border px-4 text-left text-sm outline-none transition hover:border-blue-500/50 focus:border-blue-500 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
          isOpen ? 'ring-3 border-blue-500 ring-blue-500/10' : ''
        } `}
      >
        <span
          className={`min-w-0 flex-1 truncate ${
            selectedOption
              ? 'text-foreground font-medium'
              : 'text-muted-foreground'
          }`}
        >
          {selectedOption?.name ?? placeholder}
        </span>

        <ChevronDown
          className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* DROPDOWN */}

      {isOpen && (
        <div className="border-border bg-popover absolute left-0 top-[calc(100%+6px)] z-50 w-full overflow-hidden rounded-xl border shadow-xl">
          {/* SEARCH */}

          <div className="border-border border-b p-2">
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />

              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-3 h-10 w-full rounded-lg border pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {/* OPTIONS */}

          <div className="max-h-64 overflow-y-auto p-1.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item) => {
                const selected = String(item.id) === String(value);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      selected
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'text-foreground hover:bg-muted'
                    } `}
                  >
                    <span className="min-w-0 flex-1 truncate">{item.name}</span>

                    {selected && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center">
                <Search className="text-muted-foreground/50 mx-auto mb-2 h-6 w-6" />

                <p className="text-muted-foreground text-sm">{emptyText}</p>
              </div>
            )}
          </div>

          {/* COUNT */}

          {filteredOptions.length > 0 && (
            <div className="border-border bg-muted/30 text-muted-foreground border-t px-3 py-2 text-xs">
              พบ {filteredOptions.length} รายการ
            </div>
          )}
        </div>
      )}
    </div>
  );
}
