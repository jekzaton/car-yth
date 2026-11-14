'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';

import {
  ArrowLeft,
  CarFront,
  Check,
  CheckCircle2,
  ChevronDown,
  CloudUpload,
  ImagePlus,
  Loader2,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import axios from 'axios';
import Image from 'next/image';
import api from '@/lib/axios';

// ============================================================
// TYPES
// ============================================================

type CarFormData = {
  carCode: string;
  carBrandSub: string;
  carBrandId: string;
  licensePlate: string;
  status: 'active' | 'inactive';
};

type CarBrandItem = {
  id: number;
  carBrandName: string;
};

type CarBrandApiResponse = {
  success?: boolean;
  data?: CarBrandItem[];
};

type CreateCarApiResponse = {
  success: boolean;
  message?: string;
};

type SelectedImage = {
  id: string;
  file: File;
  preview: string;
};

const initialForm: CarFormData = {
  carCode: '',
  carBrandSub: '',
  carBrandId: '',
  licensePlate: '',
  status: 'active',
};

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

// ============================================================
// COMPONENT
// ============================================================

export default function CreateCar() {
  const router = useRouter();

  const [form, setForm] = useState<CarFormData>(initialForm);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [carBrands, setCarBrands] = useState<CarBrandItem[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);

  const [brandSearch, setBrandSearch] = useState('');
  const [brandOpen, setBrandOpen] = useState(false);

  const [images, setImages] = useState<SelectedImage[]>([]);
  const [mainImageId, setMainImageId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const brandContainerRef = useRef<HTMLDivElement>(null);

  // ใช้ ref เพื่อ cleanup object URLs เมื่อ component unmount
  const objectUrlsRef = useRef<Set<string>>(new Set());

  // ============================================================
  // LOAD CAR BRANDS
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const fetchCarBrands = async () => {
      try {
        const response = await api.get<CarBrandApiResponse>(
          '/api/cars/car-brand',
        );

        if (!mounted) return;

        const data = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        setCarBrands(data);
      } catch (error) {
        console.error('Fetch car brands error:', error);

        if (mounted) {
          toast.error('ไม่สามารถโหลดข้อมูลยี่ห้อรถได้');
        }
      } finally {
        if (mounted) {
          setIsLoadingBrands(false);
        }
      }
    };

    void fetchCarBrands();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // CLEANUP OBJECT URLS
  // ============================================================

  useEffect(() => {
    const urls = objectUrlsRef.current;

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  // ============================================================
  // CLOSE BRAND DROPDOWN
  // ============================================================

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        brandContainerRef.current &&
        !brandContainerRef.current.contains(event.target as Node)
      ) {
        setBrandOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // FILTER BRANDS
  // ============================================================

  const filteredCarBrands = useMemo(() => {
    const keyword = brandSearch.trim().toLowerCase();

    if (!keyword) return carBrands;

    return carBrands.filter((brand) =>
      brand.carBrandName.toLowerCase().includes(keyword),
    );
  }, [carBrands, brandSearch]);

  // ============================================================
  // SELECT BRAND
  // ============================================================

  const handleSelectBrand = (brand: CarBrandItem) => {
    setForm((previous) => ({
      ...previous,
      carBrandId: String(brand.id),
    }));

    setBrandSearch(brand.carBrandName);
    setBrandOpen(false);
  };

  // ============================================================
  // IMAGE UPLOAD
  // ============================================================

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files ?? []);

    event.target.value = '';

    if (newFiles.length === 0) return;

    if (images.length + newFiles.length > MAX_IMAGES) {
      toast.warning(`อัปโหลดรูปภาพได้สูงสุด ${MAX_IMAGES} รูป`);
      return;
    }

    for (const file of newFiles) {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        toast.warning('รองรับเฉพาะ JPG, PNG, WebP และ AVIF');
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        toast.warning('รูปภาพแต่ละไฟล์ต้องไม่เกิน 10 MB');
        return;
      }
    }

    const newImages: SelectedImage[] = newFiles.map((file) => {
      const preview = URL.createObjectURL(file);

      objectUrlsRef.current.add(preview);

      return {
        id: crypto.randomUUID(),
        file,
        preview,
      };
    });

    setImages((previous) => [...previous, ...newImages]);

    if (!mainImageId && newImages.length > 0) {
      setMainImageId(newImages[0].id);
    }
  };

  // ============================================================
  // DELETE IMAGE
  // ============================================================

  const handleRemoveImage = (id: string) => {
    const removed = images.find((image) => image.id === id);

    if (removed) {
      URL.revokeObjectURL(removed.preview);
      objectUrlsRef.current.delete(removed.preview);
    }

    const remaining = images.filter((image) => image.id !== id);

    setImages(remaining);

    if (mainImageId === id) {
      setMainImageId(remaining[0]?.id ?? null);
    }
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    const carCode = form.carCode.trim();
    const carBrandSub = form.carBrandSub.trim();
    const licensePlate = form.licensePlate.trim();

    if (!carCode) {
      toast.warning('กรุณาระบุรหัสรถ');
      return;
    }

    if (!form.carBrandId) {
      toast.warning('กรุณาเลือกยี่ห้อรถยนต์');
      return;
    }

    if (!carBrandSub) {
      toast.warning('กรุณาระบุรุ่นรถ / รุ่นย่อย');
      return;
    }

    if (!licensePlate) {
      toast.warning('กรุณาระบุทะเบียนรถ');
      return;
    }

    if (
      carCode.length > 255 ||
      carBrandSub.length > 255 ||
      licensePlate.length > 100
    ) {
      toast.warning('ข้อมูลรถยนต์มีความยาวเกินที่กำหนด');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('carCode', carCode);
      formData.append('carBrandSub', carBrandSub);
      formData.append('carBrandId', form.carBrandId);
      formData.append('licensePlate', licensePlate);
      formData.append('status', form.status);

      const mainImageIndex = images.findIndex(
        (image) => image.id === mainImageId,
      );

      formData.append('mainImageIndex', String(Math.max(0, mainImageIndex)));

      images.forEach((image) => {
        formData.append('carImages', image.file);
      });

      const response = await api.post<CreateCarApiResponse>(
        '/api/cars',
        formData,
      );

      if (!response.data.success) {
        toast.error(response.data.message ?? 'ไม่สามารถบันทึกข้อมูลรถยนต์ได้');
        return;
      }

      toast.success('เพิ่มข้อมูลยานพาหนะสำเร็จ');

      router.push('/cars');
      router.refresh();
    } catch (error: unknown) {
      console.error('Create car error:', error);

      if (axios.isAxiosError<{ message?: string }>(error)) {
        toast.error(
          error.response?.data?.message ?? 'ไม่สามารถบันทึกข้อมูลรถยนต์ได้',
        );
      } else {
        toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearBrand = () => {
    setBrandSearch('');
    setBrandOpen(false);

    setForm((prev) => ({
      ...prev,
      carBrandId: '',
    }));
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 pb-8">
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/70 to-indigo-50 px-5 py-6 shadow-sm sm:px-7 dark:border-blue-900/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/40">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <CarFront className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl dark:text-white">
              เพิ่มยานพาหนะ
            </h1>

            <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              กรอกข้อมูลยานพาหนะและรูปภาพเพื่อเพิ่มเข้าสู่ระบบ CAR-YTH
            </p>

            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-xs font-medium text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              ระบบจัดการยานพาหนะ
            </div>
          </div>
        </div>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900"
      >
        {/* VEHICLE INFORMATION */}
        <div className="border-b border-gray-100 px-5 py-5 sm:px-7 dark:border-white/10">
          <div className="mb-5 flex items-center gap-2">
            <CarFront className="h-5 w-5 text-blue-600 dark:text-blue-400" />

            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              ข้อมูลยานพาหนะ
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
            {/* CAR CODE */}
            <div>
              <label
                htmlFor="carCode"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                รหัสรถ <span className="text-red-500">*</span>
              </label>

              <input
                id="carCode"
                name="carCode"
                type="text"
                value={form.carCode}
                onChange={handleChange}
                maxLength={255}
                placeholder="เช่น CAR-001"
                required
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            {/* CAR BRAND */}
            <div ref={brandContainerRef} className="relative">
              <label
                htmlFor="carBrandSearch"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                ยี่ห้อรถ <span className="text-red-500">*</span>
              </label>

              {/* Search Input */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  id="carBrandSearch"
                  type="text"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={brandOpen}
                  aria-controls="car-brand-listbox"
                  aria-haspopup="listbox"
                  value={brandSearch}
                  onFocus={() => setBrandOpen(true)}
                  onChange={(e) => {
                    setBrandSearch(e.target.value);
                    setBrandOpen(true);
                    setForm((prev) => ({
                      ...prev,
                      carBrandId: '',
                    }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setBrandOpen(false);
                    }
                  }}
                  placeholder="ค้นหายี่ห้อรถ..."
                  autoComplete="off"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-20 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />

                {/* Clear + Dropdown */}
                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                  {brandSearch && (
                    <button
                      type="button"
                      onClick={handleClearBrand}
                      aria-label="ล้างยี่ห้อรถ"
                      title="ล้างยี่ห้อรถ"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setBrandOpen((prev) => !prev)}
                    aria-label="แสดงรายการยี่ห้อรถ"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        brandOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Dropdown */}
              {brandOpen && (
                <div
                  id="car-brand-listbox"
                  role="listbox"
                  aria-label="เลือกยี่ห้อรถ"
                  className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-gray-900"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        เลือกยี่ห้อรถยนต์
                      </span>
                    </div>

                    {!isLoadingBrands && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                        {filteredCarBrands.length} รายการ
                      </span>
                    )}
                  </div>

                  {/* Brand List */}
                  <div className="max-h-60 overflow-y-auto p-2">
                    {isLoadingBrands ? (
                      <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        กำลังโหลดข้อมูล...
                      </div>
                    ) : filteredCarBrands.length > 0 ? (
                      filteredCarBrands.map((brand) => {
                        const selected = form.carBrandId === String(brand.id);

                        return (
                          <div
                            key={brand.id}
                            role="option"
                            aria-selected={selected}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelectBrand(brand)}
                            className={`group mb-1 flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition last:mb-0 ${
                              selected
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                                : 'text-gray-700 hover:bg-blue-50/70 dark:text-gray-300 dark:hover:bg-white/5'
                            }`}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                  selected
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-white/10'
                                }`}
                              >
                                <CarFront className="h-4 w-4" />
                              </div>

                              <span className="truncate text-sm font-medium">
                                {brand.carBrandName}
                              </span>
                            </div>

                            {selected && (
                              <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Search className="mb-2 h-6 w-6 text-gray-300" />

                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          ไม่พบยี่ห้อรถ
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          ลองค้นหาด้วยคำอื่น
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {!isLoadingBrands && filteredCarBrands.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-2.5 text-center text-[11px] text-gray-400 dark:border-white/10 dark:bg-white/5">
                      คลิกที่รายการเพื่อเลือกยี่ห้อรถยนต์
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* MODEL */}
            <div>
              <label
                htmlFor="carBrandSub"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                รุ่นรถ / รุ่นย่อย <span className="text-red-500">*</span>
              </label>

              <input
                id="carBrandSub"
                name="carBrandSub"
                type="text"
                value={form.carBrandSub}
                onChange={handleChange}
                maxLength={255}
                placeholder="เช่น HR-V e:HEV E"
                required
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            {/* LICENSE PLATE */}
            <div>
              <label
                htmlFor="licensePlate"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                ทะเบียนรถ <span className="text-red-500">*</span>
              </label>

              <input
                id="licensePlate"
                name="licensePlate"
                type="text"
                value={form.licensePlate}
                onChange={handleChange}
                maxLength={100}
                placeholder="เช่น กข 1234"
                required
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* IMAGE SECTION */}
        <div className="border-b border-gray-100 px-5 py-5 sm:px-7 dark:border-white/10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <ImagePlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                รูปภาพรถยนต์
              </h2>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                เลือกรูปหลักโดยคลิกที่รูปภาพ
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300">
              {images.length}/{MAX_IMAGES} รูป
            </span>
          </div>

          {/* UPLOAD AREA */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= MAX_IMAGES || isSubmitting}
            className="group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/70 px-5 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50/50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/5"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:scale-105 dark:bg-blue-500/10 dark:text-blue-400">
              <CloudUpload className="h-6 w-6" />
            </div>

            <span className="text-sm font-semibold text-gray-800 dark:text-white">
              คลิกเพื่อเลือกรูปภาพรถ
            </span>

            <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              JPG, PNG, WebP, AVIF • ไม่เกิน 10 MB ต่อรูป
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            hidden
            onChange={handleImageChange}
          />

          {/* IMAGE PREVIEWS */}
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((image) => {
                const isMain = mainImageId === image.id;

                return (
                  <div
                    key={image.id}
                    className={`group relative overflow-hidden rounded-xl border-2 bg-gray-50 transition ${
                      isMain
                        ? 'border-blue-500 ring-2 ring-blue-500/15'
                        : 'border-gray-200 dark:border-white/10'
                    } dark:bg-gray-800`}
                  >
                    <button
                      type="button"
                      onClick={() => setMainImageId(image.id)}
                      aria-label={`เลือกรูป ${image.file.name} เป็นรูปหลัก`}
                      aria-pressed={isMain}
                      className="block w-full"
                    >
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={image.preview}
                          alt={image.file.name}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 50vw, 220px"
                          className="object-cover"
                        />
                      </div>
                    </button>

                    {isMain && (
                      <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold text-white shadow">
                        <Check className="h-3 w-3" />
                        รูปหลัก
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image.id)}
                      aria-label={`ลบรูป ${image.file.name}`}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                      <span className="min-w-0 flex-1 truncate text-xs text-gray-600 dark:text-gray-300">
                        {image.file.name}
                      </span>

                      {isMain && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* STATUS */}
        <div className="border-b border-gray-100 px-5 py-5 sm:px-7 dark:border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                สถานะยานพาหนะ
              </h2>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                กำหนดสถานะการใช้งานของรถ
              </p>
            </div>

            <label className="inline-flex cursor-pointer items-center gap-3">
              <span
                className={`text-xs font-semibold ${
                  form.status === 'active'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-500'
                }`}
              >
                {form.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
              </span>

              <input
                type="checkbox"
                className="peer sr-only"
                checked={form.status === 'active'}
                onChange={(event) => {
                  setForm((previous) => ({
                    ...previous,
                    status: event.target.checked ? 'active' : 'inactive',
                  }));
                }}
              />

              <span className="relative h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-blue-600 peer-focus-visible:ring-4 peer-focus-visible:ring-blue-500/20 dark:bg-gray-700">
                <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </span>
            </label>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col-reverse gap-3 bg-gray-50/60 px-5 py-5 sm:flex-row sm:justify-end sm:px-7 dark:bg-white/[0.02]">
          <button
            type="button"
            onClick={() => router.push('/cars')}
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            ย้อนกลับ
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isLoadingBrands}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                บันทึกข้อมูล
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
