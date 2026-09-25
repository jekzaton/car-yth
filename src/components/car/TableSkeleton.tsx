// src/components/car/TableSkeleton.tsx
'use client';

export default function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr
          key={index}
          className="border-b border-gray-100 dark:border-white/5"
        >
          <td className="px-5 py-4">
            <div className="dark:bg-white/8 h-4 w-6 animate-pulse rounded bg-gray-200" />
          </td>
          <td className="px-5 py-4">
            <div className="dark:bg-white/8 h-14 w-20 animate-pulse rounded-xl bg-gray-200" />
          </td>
          <td className="px-5 py-4">
            <div className="dark:bg-white/8 h-8 w-24 animate-pulse rounded-lg bg-gray-200" />
          </td>
          <td className="px-5 py-4">
            <div className="dark:bg-white/8 h-4 w-36 animate-pulse rounded bg-gray-200" />
          </td>
          <td className="px-5 py-4">
            <div className="dark:bg-white/8 h-4 w-32 animate-pulse rounded bg-gray-200" />
          </td>
          <td className="px-5 py-4">
            <div className="dark:bg-white/8 h-8 w-24 animate-pulse rounded-full bg-gray-200" />
          </td>
          <td className="px-5 py-4">
            <div className="dark:bg-white/8 h-7 w-20 animate-pulse rounded-full bg-gray-200" />
          </td>
        </tr>
      ))}
    </>
  );
}
