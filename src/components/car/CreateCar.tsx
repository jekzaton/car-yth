'use client';

import { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

type CarFormData = {
  carCode: string;
  carName: string;
  carBrand: string;
  licensePlate: string;
  carImage?: string;
  status: 'active' | 'inactive';
};

export default function CreateCar() {
  const router = useRouter();
  const [form, setForm] = useState<CarFormData>({
    carCode: '',
    carName: '',
    carBrand: '',
    licensePlate: '',
    carImage: '',
    status: 'active',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('carCode', form.carCode);
      formData.append('carName', form.carName);
      formData.append('carBrand', form.carBrand);
      formData.append('licensePlate', form.licensePlate);
      formData.append('status', form.status);
      formData.append('mainImageIndex', mainImageIndex.toString());

      selectedFiles.forEach((file) => formData.append('carImages', file));

      const res = await axios.post('/api/cars', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('บันทึกข้อมูลสำเร็จ!', { position: 'top-right' });

        // เคลียร์ form
        setForm({
          carCode: '',
          carName: '',
          carBrand: '',
          licensePlate: '',
          carImage: '',
          status: 'active',
        });
        setSelectedFiles([]);
        setImagePreviews([]);

        // redirect ไป /cars
        router.push('/cars');
      } else {
        toast.error(res.data.message || 'เกิดข้อผิดพลาด', {
          position: 'top-right',
        });
      }
    } catch (err: any) {
      toast.error(
        'เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message),
        { position: 'top-right' },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              ชื่อรถ
            </label>
            <input
              type="text"
              name="carName"
              value={form.carName}
              onChange={handleChange}
              placeholder="รถกระบะส่งของ"
              required
              className="focus:border-brand-500 focus:ring-brand-500 dark:border-white/8 dark:bg-white/3 mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:ring-1 dark:text-white/90 dark:placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              ยี่ห้อ / รุ่น
            </label>
            <input
              type="text"
              name="carBrand"
              value={form.carBrand}
              onChange={handleChange}
              placeholder="Isuzu D-Max"
              required
              className="focus:border-brand-500 focus:ring-brand-500 dark:border-white/8 dark:bg-white/3 mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:ring-1 dark:text-white/90 dark:placeholder:text-gray-500"
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
                    <img
                      src={src}
                      alt={`preview-${index}`}
                      className="h-28 w-full object-contain"
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
