'use client';

import { Combobox } from '@headlessui/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Department } from '@/types/department';

type DepartmentSelectProps = {
  value: Department | null;
  setValue: (value: Department | null) => void;
};

// NEXT_PUBLIC_API_URL
export function DepartmentSelect({ value, setValue }: DepartmentSelectProps) {
  const [query, setQuery] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ fetch from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/departments`,
        );
        setDepartments(res.data.data); // <- from Drizzle API
      } catch (err) {
        console.error('Failed to load departments', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const filtered =
    query.trim() === ''
      ? departments
      : departments.filter((d) =>
          d.dep_name.toLowerCase().includes(query.toLowerCase()),
        );

  return (
    <Combobox
      immediate
      value={value}
      onChange={(selected: Department | null) => {
        if (!selected) return;
        setValue(selected);
        setQuery('');
      }}
    >
      <div className="relative">
        <Combobox.Input
          className="w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-emerald-400"
          displayValue={(d: Department | null) => d?.dep_name ?? ''}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="เลือกแผนก"
        />

        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
          ▼
        </Combobox.Button>

        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg">
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">กำลังโหลด...</div>
          ) : filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">ไม่พบแผนก</div>
          ) : (
            filtered.map((d) => (
              <Combobox.Option
                key={d.dep_id}
                value={d}
                className={({ active }) =>
                  `cursor-pointer px-3 py-2 text-sm ${
                    active ? 'bg-emerald-100' : ''
                  }`
                }
              >
                {d.dep_name}
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </div>
    </Combobox>
  );
}
