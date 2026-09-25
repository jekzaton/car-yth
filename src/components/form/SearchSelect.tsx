'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export interface SearchOption {
  value: string | number;
  label: string;
}

interface SearchSelectProps {
  options: SearchOption[];
  value: string | number;
  placeholder?: string;
  onChange: (value: string) => void;
}

export default function SearchSelect({
  options,
  value,
  placeholder = 'เลือกข้อมูล',
  onChange,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');

  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((x) => String(x.value) === String(value));

  const filtered = options.filter((item) =>
    item.label.toLowerCase().includes(keyword.toLowerCase()),
  );

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', clickOutside);

    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
      >
        <span>{selected?.label || placeholder}</span>

        <ChevronDown size={18} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <div className="relative p-2">
            <Search
              size={16}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              autoFocus
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="ค้นหา..."
              className="h-10 w-full rounded-lg border pl-10 pr-3 text-sm outline-none"
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filtered.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  onChange(String(item.value));
                  setKeyword('');
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-blue-50 dark:hover:bg-white/10"
              >
                {item.label}

                {String(value) === String(item.value) && (
                  <Check size={16} className="text-blue-600" />
                )}
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="py-4 text-center text-sm text-gray-400">
                ไม่พบข้อมูล
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
