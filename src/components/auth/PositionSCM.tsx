'use client';

import { Position } from '@/types/position';
import { Combobox } from '@headlessui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

type PositionSelectProps = {
  value: Position | null;
  setValue: (value: Position | null) => void;
};

export function PositionSelect({ value, setValue }: PositionSelectProps) {
  const [query, setQuery] = useState('');
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ fetch from API
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/positions`,
        );
        setPositions(res.data.data); // <- from Drizzle API
      } catch (err) {
        console.error('Failed to load positions', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, []);

  const filtered =
    query.trim() === ''
      ? positions
      : positions.filter((p) =>
          p.ps_name.toLowerCase().includes(query.toLowerCase()),
        );

  return (
    <Combobox
      value={value}
      onChange={(selected: Position | null) => {
        if (!selected) return;
        setValue(selected);
        setQuery('');
      }}
    >
      <div className="relative">
        <Combobox.Input
          className="w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-sky-400"
          displayValue={(p: Position | null) => p?.ps_name ?? ''}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="เลือกตำแหน่ง"
        />

        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
          ▼
        </Combobox.Button>

        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">ไม่พบตำแหน่ง</div>
          ) : (
            filtered.map((p) => (
              <Combobox.Option
                key={p.ps_id}
                value={p}
                className={({ active }) =>
                  `cursor-pointer px-3 py-2 text-sm ${
                    active ? 'bg-sky-100' : ''
                  }`
                }
              >
                {p.ps_name}
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </div>
    </Combobox>
  );
}
