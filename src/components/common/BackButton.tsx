'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="border-border bg-card text-foreground hover:bg-muted inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition"
    >
      <ArrowLeft className="h-4 w-4" />
      ย้อนกลับ
    </button>
  );
}
