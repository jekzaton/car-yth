'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Save,
  Search,
  Upload,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import api from '@/lib/axios';
import Image from 'next/image';
import axios from 'axios';

type CarFormData = {
  carCode: string;
  carBrandSub: string;
  carBrandId: string;
  licensePlate: string;
  carImage?: string;
  status: 'active' | 'inactive';
};
type CarBrandItem = {
  id: number;
  carBrandName: string;
};
export default function CreateCar() {
  const router = useRouter();
  const [form, setForm] = useState<CarFormData>({
    carCode: '',
    carBrandId: '',
    carBrandSub: '',
    licensePlate: '',
    carImage: '',
    status: 'active',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);

  const [carBrands, setCarBrands] = useState<CarBrandItem[]>([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [brandOpen, setBrandOpen] = useState(false);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);

  useEffect(() => {
    const fetchCarBrands = async () => {
      try {
        setIsLoadingBrands(true);

        const response = await api.get('/api/cars/car-brand');

        const data = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        setCarBrands(data);
      } catch (error) {
        console.error('Fetch car brands error:', error);

        toast.error('ไม่สามารถโหลดข้อมูลยี่ห้อรถได้', {
          position: 'top-right',
        });
      } finally {
        setIsLoadingBrands(false);
      }
    };

    void fetchCarBrands();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.carCode.trim()) {
      toast.warning('กรุณาระบุรหัสรถ', {
        position: 'top-right',
      });
      return;
    }

    if (!form.carBrandSub.trim()) {
      toast.warning('กรุณาระบุรุ่นรถ', {
        position: 'top-right',
      });
      return;
    }

    if (!form.carBrandId) {
      toast.warning('กรุณาเลือกยี่ห้อรถยนต์', {
        position: 'top-right',
      });
      return;
    }

    if (!form.licensePlate.trim()) {
      toast.warning('กรุณาระบุทะเบียนรถ', {
        position: 'top-right',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('carCode', form.carCode.trim());
      formData.append('carBrandSub', form.carBrandSub.trim());
      formData.append('carBrandId', form.carBrandId);
      formData.append('licensePlate', form.licensePlate.trim());
      formData.append('status', form.status);
      formData.append('mainImageIndex', String(mainImageIndex));

      selectedFiles.forEach((file) => {
        formData.append('carImages', file);
      });

      const res = await api.post('/api/cars', formData);

      if (res.data.success) {
        toast.success('บันทึกข้อมูลสำเร็จ!', {
          position: 'top-right',
        });

        setForm({
          carCode: '',
          carBrandSub: '',
          carBrandId: '',
          licensePlate: '',
          carImage: '',
          status: 'active',
        });

        setBrandSearch('');
        setBrandOpen(false);
        setSelectedFiles([]);
        setImagePreviews([]);
        setMainImageIndex(0);

        router.push('/cars');

        return;
      }

      toast.error(res.data.message || 'เกิดข้อผิดพลาด', {
        position: 'top-right',
      });
    } catch (err: unknown) {
      console.error('Create car error:', err);

      if (axios.isAxiosError<{ message?: string }>(err)) {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            'ไม่สามารถบันทึกข้อมูลรถยนต์ได้',
          {
            position: 'top-right',
          },
        );

        return;
      }

      toast.error('เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ', {
        position: 'top-right',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageSrc = (src: string) => {
    if (
      src.startsWith('http://') ||
      src.startsWith('https://') ||
      src.startsWith('blob:') ||
      src.startsWith('data:')
    ) {
      return src;
    }

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

    if (basePath && src.startsWith(`${basePath}/`)) {
      return src;
    }

    return `${basePath}${src.startsWith('/') ? src : `/${src}`}`;
  };

  const filteredCarBrands = useMemo(() => {
    const keyword = brandSearch.trim().toLowerCase();

    if (!keyword) {
      return carBrands;
    }

    return carBrands.filter((brand) =>
      brand.carBrandName.toLowerCase().includes(keyword),
    );
  }, [carBrands, brandSearch]);

  return (
    <div className="dark:bg-white/3 mx-auto max-w-2xl space-y-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/5">
      {/* Header */}
      <div className="bg-linear-to-r relative overflow-hidden rounded-2xl border border-white/10 from-white via-white to-blue-50/60 px-6 py-6 shadow-sm dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20">
        {/* glow */}
        <div className="absolute -top-10 right-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-10 left-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

        {/* content */}
        <div className="relative space-y-1">
          {/* title */}
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
            เพิ่มยานพาหนะ
          </h1>

          {/* subtitle */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            กรอกข้อมูลยานพาหนะเพื่อเพิ่มเข้าสู่ระบบจัดการรถ
          </p>

          {/* micro hint (optional premium touch) */}
          <div className="pt-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
              ⚡ รองรับการอัปโหลดรูป + จัดการข้อมูลแบบ real-time
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              รหัสรถ
            </label>
            <input
              type="text"
              name="carCode"
              value={form.carCode}
              onChange={handleChange}
              placeholder="CAR-001"
              required
              className="focus:border-brand-500 focus:ring-brand-500 dark:border-white/8 dark:bg-white/3 mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:ring-1 dark:text-white/90 dark:placeholder:text-gray-500"
            />
          </div>

          <div className="relative">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              ยี่ห้อรถ
              <span className="ml-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

              <input
                type="text"
                value={brandSearch}
                onFocus={() => setBrandOpen(true)}
                onChange={(event) => {
                  setBrandSearch(event.target.value);

                  setForm((prev) => ({
                    ...prev,
                    carBrandId: '',
                  }));

                  setBrandOpen(true);
                }}
                placeholder="พิมพ์ค้นหายี่ห้อรถ..."
                autoComplete="off"
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 text-sm font-medium text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
              />

              <ChevronDown
                className={`pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-transform ${
                  brandOpen ? 'rotate-180' : ''
                }`}
              />
            </div>

            {brandOpen && (
              <div className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-gray-900">
                {isLoadingBrands ? (
                  <div className="px-3 py-5 text-center text-sm text-gray-500 dark:text-gray-400">
                    กำลังโหลดข้อมูล...
                  </div>
                ) : filteredCarBrands.length > 0 ? (
                  filteredCarBrands.map((brand) => {
                    const selected = form.carBrandId === String(brand.id);

                    return (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            carBrandId: String(brand.id),
                          }));

                          setBrandSearch(brand.carBrandName);
                          setBrandOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                          selected
                            ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5'
                        } `}
                      >
                        <span>{brand.carBrandName}</span>

                        {selected && (
                          <Check className="h-4 w-4 text-blue-500" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-5 text-center text-sm text-gray-500 dark:text-gray-400">
                    ไม่พบยี่ห้อรถ
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              รุ่นรถ / รุ่นย่อย
            </label>

            <input
              type="text"
              name="carBrandSub"
              value={form.carBrandSub}
              onChange={handleChange}
              placeholder="เช่น HR-V e:HEV E"
              required
              className="focus:border-brand-500 focus:ring-brand-500 mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm outline-none focus:ring-1 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              ทะเบียน
            </label>
            <input
              type="text"
              name="licensePlate"
              value={form.licensePlate}
              onChange={handleChange}
              placeholder="กข 1234"
              required
              className="focus:border-brand-500 focus:ring-brand-500 dark:border-white/8 dark:bg-white/3 mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:ring-1 dark:text-white/90 dark:placeholder:text-gray-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              รูปภาพรถ
            </label>

            {/* Upload button / area */}
            <label
              htmlFor="carImages"
              className="hover:border-brand-500 dark:hover:border-brand-500 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-500 shadow-sm transition hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
            >
              <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Upload className="h-5 w-5" />
                เลือกไฟล์หลายไฟล์
              </span>
            </label>

            {/* Hidden input */}
            <input
              id="carImages"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (!files) return;

                const newFiles = Array.from(files);

                const updatedFiles = [...selectedFiles, ...newFiles];

                setSelectedFiles(updatedFiles);

                const newPreviews = newFiles.map((file) =>
                  URL.createObjectURL(file),
                );

                setImagePreviews((prev) => {
                  const updated = [...prev, ...newPreviews];

                  // ถ้ายังไม่มีรูปหลัก ให้รูปแรกเป็นหลัก
                  if (prev.length === 0) {
                    setMainImageIndex(0);
                  }

                  return updated;
                });
              }}
            />

            {/* Preview Grid */}
            {imagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {imagePreviews.map((src, index) => (
                  <div
                    key={index}
                    onClick={() => setMainImageIndex(index)}
                    className={`relative cursor-pointer overflow-hidden rounded-xl border-2 bg-gray-100 shadow-sm transition hover:scale-105 ${
                      mainImageIndex === index
                        ? 'border-blue-500 ring-2 ring-blue-300'
                        : 'border-gray-200 dark:border-white/10'
                    } `}
                  >
                    <Image
                      src={getImageSrc(src)}
                      alt={`preview-${index}`}
                      width={300}
                      height={112}
                      unoptimized
                      className="h-auto w-full object-contain"
                    />
                    {/* Badge รูปหลัก */}
                    {mainImageIndex === index && (
                      <span className="absolute left-2 top-2 rounded-full bg-blue-500 px-2 py-1 text-xs font-semibold text-white shadow">
                        รูปหลัก
                      </span>
                    )}

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        setImagePreviews((prev) =>
                          prev.filter((_, i) => i !== index),
                        );

                        setSelectedFiles((prev) =>
                          prev.filter((_, i) => i !== index),
                        );

                        // ถ้าลบรูปหลัก
                        if (mainImageIndex === index) {
                          setMainImageIndex(0);
                        }

                        // ถ้าลบรูปก่อนหน้า index หลัก
                        if (index < mainImageIndex) {
                          setMainImageIndex((prev) => prev - 1);
                        }
                      }}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 sm:col-span-2">
            <input
              type="checkbox"
              id="status"
              name="status"
              checked={form.status === 'active'}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  status: e.target.checked ? 'active' : 'inactive',
                }))
              }
              className="text-brand-500 focus:ring-brand-500 dark:border-white/8 dark:bg-white/3 h-5 w-5 rounded border-gray-300 focus:ring-1"
            />
            <label
              htmlFor="status"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              ใช้งาน
            </label>
          </div>
        </div>

        {message && (
          <div className="text-center text-sm text-gray-700 dark:text-white/90">
            {message}
          </div>
        )}

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          {/* ปุ่มย้อนกลับ */}
          <button
            type="button"
            onClick={() => router.push('/cars')} // กลับไปหน้าก่อนหน้า
            className="dark:border-white/8 dark:bg-white/3 inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 sm:w-auto dark:text-white/90 dark:hover:bg-white/5"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> ย้อนกลับ
          </button>

          {/* ปุ่มบันทึกข้อมูล */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-500 hover:bg-brand-600 inline-flex w-full items-center justify-center rounded-lg px-6 py-2 text-sm font-medium text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                กำลังบันทึก...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-5 w-5" />
                <span>บันทึกข้อมูล</span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
