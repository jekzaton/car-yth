'use client';

import Image from 'next/image';
import {
  Building2,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  IdCard,
  Loader2,
  LockKeyhole,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { toast } from 'react-toastify';

import api from '@/lib/axios';
import ProfileHeader from './ProfileHeader';
import axios from 'axios';
import SearchableSelect from './SearchableSelect';

// ============================================================
// TYPES
// ============================================================

type ProfileUser = {
  id: number;
  cid: string;
  prefix: string;
  firstName: string;
  lastName: string;
  phone: string;

  depId: number | null;
  departmentName: string | null;

  systemId: number | null;
  systemName: string | null;

  psId: number | null;
  positionName: string | null;

  profileImage: string | null;

  statusLevel: 'user' | 'member' | 'admin';
};

type SelectOption = {
  id: number;
  name: string;
};

type ProfileForm = {
  prefix: string;
  firstName: string;
  lastName: string;
  phone: string;

  depId: string;
  systemId: string;
  psId: string;

  password: string;
  confirmPassword: string;
};

const EMPTY_FORM: ProfileForm = {
  prefix: '',
  firstName: '',
  lastName: '',
  phone: '',

  depId: '',
  systemId: '',
  psId: '',

  password: '',
  confirmPassword: '',
};

// ============================================================
// COMPONENT
// ============================================================

export default function Profile() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<ProfileUser | null>(null);

  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);

  const [departments, setDepartments] = useState<SelectOption[]>([]);

  const [systems, setSystems] = useState<SelectOption[]>([]);

  const [positions, setPositions] = useState<SelectOption[]>([]);

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ============================================================
  // FETCH PROFILE
  // ============================================================

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.get('/api/auth/profile');

      const profile: ProfileUser = response.data.user;

      setUser(profile);

      setForm({
        prefix: profile.prefix ?? '',
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phone: profile.phone ?? '',

        depId: profile.depId ? String(profile.depId) : '',
        systemId: profile.systemId ? String(profile.systemId) : '',
        psId: profile.psId ? String(profile.psId) : '',

        password: '',
        confirmPassword: '',
      });

      setPreviewImage(profile.profileImage ?? null);
    } catch (error) {
      console.error('Fetch profile error:', error);

      toast.error('ไม่สามารถโหลดข้อมูลส่วนตัวได้');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================
  // FETCH OPTIONS
  // ============================================================

  const fetchOptions = useCallback(async () => {
    try {
      const [departmentResponse, systemResponse, positionResponse] =
        await Promise.all([
          api.get('/api/departments'),
          api.get('/api/systems'),
          api.get('/api/positions'),
        ]);

      const departmentData = Array.isArray(departmentResponse.data?.data)
        ? departmentResponse.data.data
        : [];

      const systemData = Array.isArray(systemResponse.data?.data)
        ? systemResponse.data.data
        : [];

      const positionData = Array.isArray(positionResponse.data?.data)
        ? positionResponse.data.data
        : [];

      setDepartments(
        departmentData.map((item: Record<string, unknown>) => ({
          id: Number(item.id ?? item.depId ?? item.dep_id),

          name: String(item.name ?? item.departmentName ?? item.dep_name ?? ''),
        })),
      );

      setSystems(
        systemData.map((item: Record<string, unknown>) => ({
          id: Number(item.id ?? item.systemId ?? item.system_id),

          name: String(item.name ?? item.systemName ?? item.system_name ?? ''),
        })),
      );

      setPositions(
        positionData.map((item: Record<string, unknown>) => ({
          id: Number(item.id ?? item.psId ?? item.ps_id),

          name: String(item.name ?? item.positionName ?? item.ps_name ?? ''),
        })),
      );
    } catch (error) {
      console.error('Fetch profile options error:', error);

      toast.error('ไม่สามารถโหลดข้อมูลหน่วยงานได้');
    }
  }, []);

  useEffect(() => {
    void Promise.all([fetchProfile(), fetchOptions()]);
  }, [fetchProfile, fetchOptions]);

  // ============================================================
  // CLEAN PREVIEW OBJECT URL
  // ============================================================

  useEffect(() => {
    return () => {
      if (previewImage?.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  // ============================================================
  // FORM
  // ============================================================

  const updateField = <K extends keyof ProfileForm>(
    key: K,
    value: ProfileForm[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  // ============================================================
  // IMAGE
  // ============================================================

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      toast.error('รองรับเฉพาะไฟล์ JPG, PNG และ WEBP');
      event.target.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error('รูปโปรไฟล์ต้องมีขนาดไม่เกิน 5 MB');
      event.target.value = '';
      return;
    }

    if (previewImage?.startsWith('blob:')) {
      URL.revokeObjectURL(previewImage);
    }

    const objectUrl = URL.createObjectURL(file);

    setProfileFile(file);
    setPreviewImage(objectUrl);
  };

  const handleRemoveSelectedImage = () => {
    if (previewImage?.startsWith('blob:')) {
      URL.revokeObjectURL(previewImage);
    }

    setProfileFile(null);
    setPreviewImage(user?.profileImage ?? null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ============================================================
  // RESET
  // ============================================================

  const handleReset = () => {
    if (!user) return;

    if (previewImage?.startsWith('blob:')) {
      URL.revokeObjectURL(previewImage);
    }

    setForm({
      prefix: user.prefix ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phone: user.phone ?? '',

      depId: user.depId ? String(user.depId) : '',
      systemId: user.systemId ? String(user.systemId) : '',
      psId: user.psId ? String(user.psId) : '',

      password: '',
      confirmPassword: '',
    });

    setProfileFile(null);
    setPreviewImage(user.profileImage ?? null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ============================================================
  // VALIDATE
  // ============================================================

  const validateForm = () => {
    if (!form.prefix) {
      toast.error('กรุณาเลือกคำนำหน้า');
      return false;
    }

    if (!form.firstName.trim()) {
      toast.error('กรุณาระบุชื่อ');
      return false;
    }

    if (!form.lastName.trim()) {
      toast.error('กรุณาระบุนามสกุล');
      return false;
    }

    if (!form.phone.trim()) {
      toast.error('กรุณาระบุเบอร์โทรศัพท์');
      return false;
    }

    const phone = form.phone.replace(/\D/g, '');

    if (phone.length !== 10) {
      toast.error('กรุณาระบุเบอร์โทรศัพท์ 10 หลัก');
      return false;
    }

    if (!form.depId) {
      toast.error('กรุณาเลือกแผนก');
      return false;
    }

    if (!form.systemId) {
      toast.error('กรุณาเลือกฝ่าย');
      return false;
    }

    if (!form.psId) {
      toast.error('กรุณาเลือกตำแหน่ง');
      return false;
    }

    if (form.password) {
      if (form.password.length < 6) {
        toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        return false;
      }

      if (form.password !== form.confirmPassword) {
        toast.error('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
        return false;
      }
    }

    if (!form.password && form.confirmPassword) {
      toast.error('กรุณาระบุรหัสผ่านใหม่');
      return false;
    }

    return true;
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) return;

    if (form.password !== form.confirmPassword) {
      toast.error('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      setIsSaving(true);

      // ======================================================
      // หาเฉพาะข้อมูลที่มีการเปลี่ยนแปลง
      // ======================================================

      const updates: Record<string, string | number> = {};

      if (form.prefix !== user.prefix) {
        updates.prefix = form.prefix;
      }

      if (form.firstName.trim() !== user.firstName) {
        updates.firstName = form.firstName.trim();
      }

      if (form.lastName.trim() !== user.lastName) {
        updates.lastName = form.lastName.trim();
      }

      const phone = form.phone.replace(/\D/g, '');

      if (phone !== (user.phone ?? '')) {
        updates.phone = phone;
      }

      if (Number(form.depId) !== user.depId) {
        updates.depId = Number(form.depId);
      }

      if (Number(form.systemId) !== user.systemId) {
        updates.systemId = Number(form.systemId);
      }

      if (Number(form.psId) !== user.psId) {
        updates.psId = Number(form.psId);
      }

      // Password ส่งเฉพาะตอนผู้ใช้กรอกใหม่
      if (form.password.trim()) {
        updates.password = form.password;
        updates.confirmPassword = form.confirmPassword;
      }

      // ======================================================
      // UPDATE PROFILE เฉพาะเมื่อมีข้อมูลเปลี่ยน
      // ======================================================

      if (Object.keys(updates).length > 0) {
        await api.patch('/api/auth/profile', updates);
      }

      // ======================================================
      // PROFILE IMAGE แยก API
      // ======================================================

      if (profileFile) {
        const imageFormData = new FormData();

        imageFormData.append('image', profileFile);

        await api.post('/api/auth/profile/image', imageFormData);
      }

      if (Object.keys(updates).length === 0 && !profileFile) {
        toast.info('ไม่มีข้อมูลที่เปลี่ยนแปลง');
        return;
      }

      toast.success('บันทึกข้อมูลเรียบร้อยแล้ว');

      setProfileFile(null);

      await fetchProfile();
    } catch (error) {
      console.error('Update profile error:', error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ?? 'ไม่สามารถบันทึกข้อมูลได้',
        );
      } else {
        toast.error('ไม่สามารถบันทึกข้อมูลได้');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // LOADING

  if (isLoading) {
    return (
      <div className="border-border bg-card min-h-125 flex items-center justify-center rounded-3xl border">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600 dark:text-blue-400" />
          </div>

          <div className="text-center">
            <p className="text-foreground font-semibold">
              กำลังโหลดข้อมูลส่วนตัว
            </p>

            <p className="text-muted-foreground mt-1 text-sm">
              กรุณารอสักครู่...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="border-border bg-card rounded-3xl border p-10 text-center">
        <UserRound className="text-muted-foreground mx-auto h-10 w-10" />

        <p className="text-foreground mt-4 font-semibold">
          ไม่พบข้อมูลผู้ใช้งาน
        </p>
      </div>
    );
  }

  const fullName =
    `${user.prefix ?? ''}${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

  // ============================================================
  // UI
  // ============================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* HEADER */}

      <ProfileHeader
        user={user}
        previewImage={previewImage}
        profileFile={profileFile}
        isSaving={isSaving}
        fileInputRef={fileInputRef}
        onReset={handleReset}
        onImageChange={handleImageChange}
        onRemoveSelectedImage={handleRemoveSelectedImage}
      />

      {/* ======================================================
          ACCOUNT
      ====================================================== */}

      <SectionCard
        icon={<LockKeyhole className="h-5 w-5" />}
        title="ข้อมูลบัญชี"
        description="ชื่อผู้ใช้งานไม่สามารถเปลี่ยนแปลงได้ หากไม่ต้องการเปลี่ยนรหัสผ่านให้เว้นช่องรหัสผ่านว่างไว้"
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <FieldLabel
              label="ชื่อผู้ใช้งาน (CID)"
              icon={<IdCard className="h-4 w-4" />}
            />

            <div className="relative">
              <input
                type="text"
                value={user.cid}
                readOnly
                disabled
                className="border-border bg-muted/60 text-muted-foreground h-12 w-full cursor-not-allowed rounded-xl border px-4 pr-36 font-mono text-sm font-semibold tracking-wider outline-none"
              />

              <div className="bg-background text-muted-foreground absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold shadow-sm">
                <LockKeyhole className="h-3 w-3" />
                แก้ไขไม่ได้
              </div>
            </div>
          </div>

          <div>
            <FieldLabel
              label="รหัสผ่านใหม่"
              icon={<LockKeyhole className="h-4 w-4" />}
            />

            <PasswordInput
              value={form.password}
              show={showPassword}
              placeholder="กรอกรหัสผ่านใหม่"
              disabled={isSaving}
              onChange={(value) => updateField('password', value)}
              onToggle={() => setShowPassword((previous) => !previous)}
            />

            <p className="text-muted-foreground mt-2 text-xs">
              เว้นว่างไว้ หากไม่ต้องการเปลี่ยนรหัสผ่าน
            </p>
          </div>

          <div>
            <FieldLabel
              label="ยืนยันรหัสผ่าน"
              icon={<ShieldCheck className="h-4 w-4" />}
            />

            <PasswordInput
              value={form.confirmPassword}
              show={showConfirmPassword}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              disabled={isSaving}
              onChange={(value) => updateField('confirmPassword', value)}
              onToggle={() => setShowConfirmPassword((previous) => !previous)}
            />

            {form.confirmPassword && form.password === form.confirmPassword && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                รหัสผ่านตรงกัน
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ======================================================
          PERSONAL
      ====================================================== */}

      <SectionCard
        icon={<UserRound className="h-5 w-5" />}
        title="ข้อมูลส่วนตัว"
        description="ตรวจสอบชื่อ นามสกุล และข้อมูลติดต่อให้ถูกต้อง"
      >
        <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)]">
          {/* คำนำหน้า */}
          <div>
            <FieldLabel label="คำนำหน้า" required />

            <select
              value={form.prefix}
              onChange={(event) => updateField('prefix', event.target.value)}
              disabled={isSaving}
              className={inputClass}
            >
              <option value="">เลือก</option>
              <option value="นาย">นาย</option>
              <option value="นาง">นาง</option>
              <option value="น.ส.">น.ส.</option>
            </select>
          </div>

          {/* ชื่อ */}
          <div>
            <FieldLabel label="ชื่อ" required />

            <input
              type="text"
              value={form.firstName}
              onChange={(event) => updateField('firstName', event.target.value)}
              disabled={isSaving}
              placeholder="กรอกชื่อ"
              autoComplete="given-name"
              className={inputClass}
            />
          </div>

          {/* นามสกุล */}
          <div>
            <FieldLabel label="นามสกุล" required />

            <input
              type="text"
              value={form.lastName}
              onChange={(event) => updateField('lastName', event.target.value)}
              disabled={isSaving}
              placeholder="กรอกนามสกุล"
              autoComplete="family-name"
              className={inputClass}
            />
          </div>

          {/* เบอร์โทรศัพท์ */}
          <div className="md:col-span-3 md:max-w-md">
            <FieldLabel
              label="เบอร์โทรศัพท์"
              icon={<Phone className="h-4 w-4" />}
              required
            />

            <div className="relative">
              <Phone className="text-muted-foreground pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />

              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) => {
                  const value = event.target.value
                    .replace(/\D/g, '')
                    .slice(0, 10);

                  updateField('phone', value);
                }}
                disabled={isSaving}
                placeholder="08xxxxxxxx"
                maxLength={10}
                className={`${inputClass} pl-11`}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ======================================================
          ORGANIZATION
      ====================================================== */}

      <SectionCard
        icon={<Building2 className="h-5 w-5" />}
        title="ข้อมูลหน่วยงาน"
        description="เลือกแผนก ฝ่าย และตำแหน่งปัจจุบันของคุณ"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <FieldLabel label="แผนก" required />

            <SearchableSelect
              value={form.depId}
              options={departments}
              onChange={(value) => updateField('depId', value)}
              disabled={isSaving}
              placeholder="เลือกแผนก"
              searchPlaceholder="ค้นหาแผนก..."
              emptyText="ไม่พบแผนก"
            />
          </div>

          <div>
            <FieldLabel label="ตำแหน่ง" required />

            <SearchableSelect
              value={form.psId}
              options={positions}
              onChange={(value) => updateField('psId', value)}
              disabled={isSaving}
              placeholder="เลือกตำแหน่ง"
              searchPlaceholder="ค้นหาตำแหน่ง..."
              emptyText="ไม่พบตำแหน่ง"
            />
          </div>
          <div>
            <FieldLabel label="ระบบ" required />

            <select
              value={form.systemId}
              onChange={(event) => updateField('systemId', event.target.value)}
              disabled={isSaving}
              className={inputClass}
            >
              <option value="">เลือกฝ่าย</option>

              {systems.map((item) => (
                <option key={`system-${item.id}`} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      {/* ======================================================
          BOTTOM ACTION
      ====================================================== */}

      <div className="sticky bottom-4 z-20 flex justify-end">
        <div className="border-border bg-card/95 flex items-center gap-3 rounded-2xl border p-2 shadow-xl backdrop-blur">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            ยกเลิก
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="bg-linear-to-r inline-flex h-11 min-w-36 items-center justify-center gap-2 rounded-xl from-blue-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
    </form>
  );
}

// ============================================================
// STYLES
// ============================================================

const inputClass =
  'h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm outline-none transition-all hover:border-blue-500/30 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60';

// ============================================================
// SECTION
// ============================================================

type SectionCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
};

function SectionCard({ icon, title, description, children }: SectionCardProps) {
  return (
    <section className="border-border bg-card overflow-hidden rounded-3xl border shadow-sm">
      <div className="border-border flex items-start gap-4 border-b px-6 py-5 sm:px-8">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          {icon}
        </div>

        <div>
          <h3 className="text-foreground font-bold">{title}</h3>

          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {description}
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8">{children}</div>
    </section>
  );
}

// ============================================================
// LABEL
// ============================================================

function FieldLabel({
  label,
  icon,
  required = false,
}: {
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-foreground mb-2 flex items-center gap-2 text-sm font-semibold">
      {icon && <span className="text-muted-foreground">{icon}</span>}

      {label}

      {required && <span className="text-rose-500">*</span>}
    </label>
  );
}

// ============================================================
// PASSWORD
// ============================================================

function PasswordInput({
  value,
  show,
  placeholder,
  disabled,
  onChange,
  onToggle,
}: {
  value: string;
  show: boolean;
  placeholder: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        autoComplete="new-password"
        placeholder={placeholder}
        className={`${inputClass} pr-12`}
      />

      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className="text-muted-foreground hover:bg-muted hover:text-foreground absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg transition"
        title={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
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
      {text}
    </span>
  );
}

// ============================================================
// ROLE
// ============================================================

function RoleBadge({ role }: { role: ProfileUser['statusLevel'] }) {
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
