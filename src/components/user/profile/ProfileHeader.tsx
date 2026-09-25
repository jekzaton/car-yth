'use client';

import Image from 'next/image';
import type { ChangeEvent, RefObject } from 'react';
import {
  Building2,
  Camera,
  Loader2,
  Save,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';

export type ProfileHeaderUser = {
  prefix: string;
  firstName: string;
  lastName: string;

  statusLevel: 'user' | 'member' | 'admin';

  positionName?: string | null;
  departmentName?: string | null;
  systemName?: string | null;
};

type ProfileHeaderProps = {
  user: ProfileHeaderUser;

  previewImage: string | null;
  profileFile: File | null;

  isSaving: boolean;

  fileInputRef: RefObject<HTMLInputElement | null>;

  onReset: () => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveSelectedImage: () => void;
};

export default function ProfileHeader({
  user,
  previewImage,
  profileFile,
  isSaving,
  fileInputRef,
  onReset,
  onImageChange,
  onRemoveSelectedImage,
}: ProfileHeaderProps) {
  const fullName =
    `${user.prefix ?? ''}${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

  const handleSelectImage = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border-border bg-card overflow-hidden rounded-3xl border shadow-sm">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="border-border bg-linear-to-r relative overflow-hidden border-b from-blue-600/10 via-indigo-500/5 to-transparent px-6 py-7 sm:px-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-4 w-4" />
              บัญชีผู้ใช้งาน
            </div>

            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              ข้อมูลส่วนตัว
            </h1>

            <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-6">
              จัดการข้อมูลส่วนตัว ข้อมูลหน่วยงาน รหัสผ่าน และรูปโปรไฟล์ของคุณ
            </p>
          </div>

          {/* ACTIONS */}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onReset}
              disabled={isSaving}
              className="border-border bg-background text-foreground hover:bg-muted inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="bg-linear-to-r inline-flex h-11 items-center justify-center gap-2 rounded-xl from-blue-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================
          PROFILE SUMMARY
      ====================================================== */}

      <div className="px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* AVATAR */}

          <div className="relative shrink-0">
            <div className="border-background bg-muted relative h-28 w-28 overflow-hidden rounded-3xl border-4 shadow-lg">
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt={fullName || 'Profile'}
                  fill
                  unoptimized
                  sizes="112px"
                  className="object-cover"
                />
              ) : (
                <div className="bg-linear-to-br flex h-full w-full items-center justify-center from-blue-500/15 to-indigo-500/15">
                  <UserRound className="h-12 w-12 text-blue-600/60 dark:text-blue-400" />
                </div>
              )}
            </div>

            {/* CAMERA BUTTON */}

            <button
              type="button"
              onClick={handleSelectImage}
              disabled={isSaving}
              className="border-card absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl border-4 bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              title="เปลี่ยนรูปโปรไฟล์"
              aria-label="เปลี่ยนรูปโปรไฟล์"
            >
              <Camera className="h-4 w-4" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onImageChange}
              disabled={isSaving}
              className="hidden"
            />
          </div>

          {/* PROFILE INFORMATION */}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-foreground truncate text-xl font-bold">
                {fullName || 'ผู้ใช้งาน'}
              </h2>

              <RoleBadge role={user.statusLevel} />
            </div>

            <p className="text-muted-foreground mt-1 text-sm font-medium">
              {user.positionName ?? 'ไม่ระบุตำแหน่ง'}
            </p>

            {/* ORGANIZATION */}

            <div className="mt-4 flex flex-wrap gap-2">
              {user.departmentName && (
                <InfoBadge
                  icon={<Building2 className="h-3.5 w-3.5" />}
                  text={user.departmentName}
                />
              )}

              {user.systemName && (
                <InfoBadge
                  icon={<UsersRound className="h-3.5 w-3.5" />}
                  text={user.systemName}
                />
              )}
            </div>

            {/* IMAGE ACTION */}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSelectImage}
                disabled={isSaving}
                className="border-border bg-background text-foreground inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition hover:border-blue-500/30 hover:bg-blue-500/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Camera className="h-3.5 w-3.5" />
                เปลี่ยนรูปโปรไฟล์
              </button>

              {profileFile && (
                <button
                  type="button"
                  onClick={onRemoveSelectedImage}
                  disabled={isSaving}
                  className="text-xs font-semibold text-rose-600 transition hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-400"
                >
                  ยกเลิกรูปที่เลือก
                </button>
              )}

              <span className="text-muted-foreground text-xs">
                JPG, PNG, WEBP ไม่เกิน 5 MB
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INFO BADGE
// ============================================================

function InfoBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="border-border bg-muted/50 text-muted-foreground inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium">
      {icon}

      <span>{text}</span>
    </span>
  );
}

// ============================================================
// ROLE BADGE
// ============================================================

function RoleBadge({ role }: { role: ProfileHeaderUser['statusLevel'] }) {
  const label =
    role === 'admin'
      ? 'ผู้ดูแลระบบ'
      : role === 'member'
        ? 'สมาชิก'
        : 'ผู้ใช้งาน';

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
      <ShieldCheck className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
