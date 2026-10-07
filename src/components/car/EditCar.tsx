'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Upload, Save, ArrowLeft, Star } from 'lucide-react';
import api from '@/lib/axios';
import Image from 'next/image';

type CarStatus = 'active' | 'inactive';

type CarForm = {
  carCode: string;
  carBrandSub: string;
  carBrandId: string;
  licensePlate: string;
  status: CarStatus;
  carImage: string[];
};
type PreviewImage = {
  url: string;
  isNew: boolean;
};
type CarBrandItem = {
  id: number;
  carBrandName: string;
};

export default function EditCar() {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<CarForm>({
    carCode: '',
    carBrandSub: '',
    carBrandId: '',
    licensePlate: '',
    status: 'active',
    carImage: [],
  });

  const [carBrands, setCarBrands] = useState<CarBrandItem[]>([]);

  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  // ================= FETCH CAR =================
  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await api.get(`/api/cars/edit/${params?.id}`);
        const data = res.data.data;

        let images: string[] = [];

        if (data.carImage) {
          try {
            const parsed = JSON.parse(data.carImage);

            if (Array.isArray(parsed)) {
              images = parsed;
            } else if (Array.isArray(parsed.images)) {
              images = parsed.images;
            }
          } catch (err) {
            console.log('parse error:', err);
            images = [];
          }
        }

        setForm({
          carCode: data.carCode ?? '',
          carBrandSub: data.carBrandSub ?? '',
          carBrandId: String(data.carBrandId ?? ''),
          licensePlate: data.licensePlate ?? '',
          status: data.status ?? 'active',
          carImage: images,
        });
        setPreviews(
          images.map((img) => ({
            url: img,
            isNew: false,
          })),
        );
        setCoverImage(images[0] ?? null);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [params?.id]);

  useEffect(() => {
    const loadCarBrands = async () => {
      try {
        const res = await api.get('/api/cars/car-brand');

        const data = Array.isArray(res.data?.data) ? res.data.data : [];

        setCarBrands(data);
      } catch (error) {
        console.error('Load car brands error:', error);
      }
    };

    loadCarBrands();
  }, []);

  // ================= HANDLE CHANGE =================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= IMAGE UPLOAD PREVIEW =================
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    const newPreviews: PreviewImage[] = selectedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      isNew: true,
    }));

    setFiles((prev) => [...prev, ...selectedFiles]);

    setPreviews((prev) => {
      const updated = [...prev, ...newPreviews];

      if (!coverImage && updated.length > 0) {
        setCoverImage(updated[0].url);
      }

      return updated;
    });

    e.target.value = '';
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!form.carCode.trim()) {
      alert('กรุณาระบุรหัสรถ');
      return;
    }

    if (!form.carBrandSub.trim()) {
      alert('กรุณาระบุรุ่นรถ');
      return;
    }

    if (!form.carBrandId) {
      alert('กรุณาเลือกยี่ห้อรถ');
      return;
    }

    if (!form.licensePlate.trim()) {
      alert('กรุณาระบุทะเบียนรถ');
      return;
    }

    setSaving(true);

    try {
      let uploaded: string[] = [];

      // อัปโหลดเฉพาะรูปใหม่
      if (files.length > 0) {
        const fd = new FormData();

        files.forEach((file) => {
          fd.append('carImages', file);
        });

        const upload = await api.post('/api/cars/upload', fd);

        uploaded = Array.isArray(upload.data.uploaded)
          ? upload.data.uploaded
          : [];
      }

      let uploadedIndex = 0;
      let savedCoverImage: string | null = null;

      const allImages = previews
        .map((preview) => {
          // รูปเก่าที่มี URL จริงอยู่แล้ว
          if (!preview.isNew) {
            if (preview.url === coverImage) {
              savedCoverImage = preview.url;
            }

            return preview.url;
          }

          // รูปใหม่ เปลี่ยน blob URL เป็น URL หลังอัปโหลด
          const uploadedUrl = uploaded[uploadedIndex];
          uploadedIndex += 1;

          if (preview.url === coverImage) {
            savedCoverImage = uploadedUrl ?? null;
          }

          return uploadedUrl;
        })
        .filter((image): image is string => Boolean(image));

      // หากยังไม่มีรูปหลัก ให้ใช้รูปแรก
      if (!savedCoverImage && allImages.length > 0) {
        savedCoverImage = allImages[0];
      }

      const orderedImages = savedCoverImage
        ? [
            savedCoverImage,
            ...allImages.filter((image) => image !== savedCoverImage),
          ]
        : [];

      // เก็บรูปแบบเดียวกับหน้า CreateCar
      const carImageData = {
        main: savedCoverImage,
        images: orderedImages,
      };

      await api.put(`/api/cars/edit/${params?.id}`, {
        carCode: form.carCode.trim(),
        carBrandSub: form.carBrandSub.trim(),
        carBrandId: Number(form.carBrandId),
        licensePlate: form.licensePlate.trim(),
        status: form.status,
        carImage: JSON.stringify(carImageData),
      });

      router.replace('/cars');
      router.refresh();
    } catch (error) {
      console.error('บันทึกข้อมูลรถไม่สำเร็จ:', error);

      if (axios.isAxiosError(error)) {
        console.error('API response:', error.response?.data);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading...</div>;
  }

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

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-linear-to-r relative overflow-hidden rounded-2xl border border-white/10 from-white via-white to-blue-50/60 px-6 py-6 shadow-sm dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20">
        <div className="absolute -top-10 right-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              แก้ไขข้อมูลรถ
            </h1>
            <p className="text-sm text-gray-500">ปรับปรุงข้อมูลยานพาหนะ</p>
          </div>

          <button
            onClick={() => router.push('/cars')}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-50 dark:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
            ย้อนกลับ
          </button>
        </div>
      </div>

      {/* FORM CARD */}
      <div className="rounded-2xl border border-white/10 bg-white p-6 shadow-sm dark:bg-white/5">
        {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2"> */}
        <div className="mt-6 space-y-6">
          {/* ================= BASIC INFO ================= */}
          <div className="dark:bg-white/3 rounded-2xl border border-gray-200 bg-gray-50/60 p-5 dark:border-white/10">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                ข้อมูลรถ
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                ระบุข้อมูลหลักของยานพาหนะให้ครบถ้วน
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* CAR CODE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  รหัสรถ
                </label>

                <input
                  name="carCode"
                  value={form.carCode}
                  onChange={handleChange}
                  placeholder="เช่น CAR-001"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  รหัสสำหรับใช้อ้างอิงรถภายในระบบ
                </p>
              </div>

              {/* CAR BRAND SUB */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  รุ่นรถ / รุ่นย่อย
                </label>

                <input
                  name="carBrandSub"
                  value={form.carBrandSub}
                  onChange={handleChange}
                  placeholder="เช่น HR-V e:HEV E"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  ระบุชื่อรุ่นหรือรุ่นย่อยของรถ
                </p>
              </div>

              {/* CAR BRAND */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  ยี่ห้อรถ
                </label>

                <select
                  name="carBrandId"
                  value={form.carBrandId}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-sm outline-none transition hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">เลือกยี่ห้อรถ</option>

                  {carBrands.map((brand) => (
                    <option key={brand.id} value={String(brand.id)}>
                      {brand.carBrandName}
                    </option>
                  ))}
                </select>

                <p className="mt-1.5 text-xs text-gray-400">
                  เลือกยี่ห้อรถจากรายการ
                </p>
              </div>

              {/* LICENSE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  เลขทะเบียนรถ
                </label>

                <input
                  name="licensePlate"
                  value={form.licensePlate}
                  onChange={handleChange}
                  placeholder="เช่น กข 5482"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  ระบุเลขทะเบียนรถตามข้อมูลจริง
                </p>
              </div>
            </div>
          </div>

          {/* ================= STATUS ================= */}
          <div className="dark:bg-white/3 rounded-2xl border border-gray-200 bg-gray-50/60 p-5 dark:border-white/10">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                สถานะการใช้งาน
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                กำหนดว่ารถคันนี้สามารถนำไปใช้งานและจองได้หรือไม่
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-2xl">
              {/* ACTIVE */}
              <label
                className={`relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all ${
                  form.status === 'active'
                    ? 'border-green-500 bg-green-50 shadow-sm ring-2 ring-green-500/10 dark:bg-green-500/10'
                    : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/40 dark:border-white/10 dark:bg-gray-900'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={form.status === 'active'}
                  onChange={handleChange}
                  className="sr-only"
                />

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    form.status === 'active'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                  }`}
                >
                  {form.status === 'active' ? '✓' : '○'}
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold ${
                      form.status === 'active'
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    ใช้งาน
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    รถพร้อมสำหรับการจองและใช้งาน
                  </p>
                </div>

                {form.status === 'active' && (
                  <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-green-500" />
                )}
              </label>

              {/* INACTIVE */}
              <label
                className={`relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all ${
                  form.status === 'inactive'
                    ? 'border-red-500 bg-red-50 shadow-sm ring-2 ring-red-500/10 dark:bg-red-500/10'
                    : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/40 dark:border-white/10 dark:bg-gray-900'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={form.status === 'inactive'}
                  onChange={handleChange}
                  className="sr-only"
                />

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    form.status === 'inactive'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                  }`}
                >
                  {form.status === 'inactive' ? '✓' : '○'}
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold ${
                      form.status === 'inactive'
                        ? 'text-red-600 dark:text-red-300'
                        : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    ไม่ใช้งาน
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    รถจะไม่สามารถนำไปเลือกจองได้
                  </p>
                </div>

                {form.status === 'inactive' && (
                  <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-red-500" />
                )}
              </label>
            </div>
          </div>
        </div>

        {/* IMAGE UPLOAD */}
        <div className="mt-6">
          {/* UPLOAD BUTTON */}
          <label className="group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 px-4 py-4 transition hover:border-blue-400 hover:bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/5 dark:hover:bg-blue-500/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition group-hover:scale-105">
                <Upload className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  อัปโหลดรูปเพิ่มเติม
                </p>

                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  รองรับ JPG, JPEG, PNG และเลือกได้หลายรูป
                </p>
              </div>
            </div>

            <span className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-blue-600 shadow-sm transition group-hover:bg-blue-600 group-hover:text-white dark:bg-white/5">
              เลือกรูป
            </span>

            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleFiles}
            />
          </label>

          {/* PREVIEW */}
          <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(230px,260px))] gap-5">
            {previews.map((img, i) => {
              const isCover = coverImage === img.url;

              return (
                <div
                  key={img.url}
                  className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:bg-gray-900 ${
                    isCover
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-gray-200 dark:border-white/10'
                  }`}
                >
                  {/* IMAGE */}
                  <div className="aspect-16/10 relative overflow-hidden bg-gray-50 dark:bg-gray-800">
                    <button
                      type="button"
                      onClick={() => setCoverImage(img.url)}
                      className="relative block h-full w-full"
                      aria-label={`เลือกรูปที่ ${i + 1} เป็นรูปหลัก`}
                    >
                      <Image
                        src={getImageSrc(img.url)}
                        alt={`รูปรถยนต์ ${i + 1}`}
                        fill
                        unoptimized
                        sizes="260px"
                        className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]"
                      />

                      <div className="bg-linear-to-t pointer-events-none absolute inset-x-0 bottom-0 h-20 from-black/35 to-transparent" />
                    </button>

                    {isCover && (
                      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-md">
                        <Star
                          fill="currentColor"
                          className="h-3.5 w-3.5 text-yellow-300"
                        />
                        รูปหลัก
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();

                        const removedImage = previews[i];

                        const updatedPreviews = previews.filter(
                          (_, idx) => idx !== i,
                        );

                        if (removedImage.isNew) {
                          const newImageIndex = previews
                            .slice(0, i)
                            .filter((item) => item.isNew).length;

                          setFiles((prev) =>
                            prev.filter(
                              (_, fileIndex) => fileIndex !== newImageIndex,
                            ),
                          );

                          URL.revokeObjectURL(removedImage.url);
                        }

                        setPreviews(updatedPreviews);

                        setForm((prev) => ({
                          ...prev,
                          carImage: updatedPreviews
                            .filter((item) => !item.isNew)
                            .map((item) => item.url),
                        }));

                        if (coverImage === removedImage.url) {
                          setCoverImage(updatedPreviews[0]?.url ?? null);
                        }
                      }}
                      aria-label={`ลบรูปที่ ${i + 1}`}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/90 text-sm font-bold text-red-500 shadow-md backdrop-blur transition hover:scale-110 hover:bg-red-500 hover:text-white active:scale-95 dark:border-white/10 dark:bg-gray-900/90"
                    >
                      ×
                    </button>

                    <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
                      รูปที่ {i + 1}
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="min-h-21.5 flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        รูปรถ #{i + 1}
                      </p>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                        {isCover
                          ? 'กำลังใช้เป็นรูปหลัก'
                          : 'คลิกที่รูปหรือปุ่มเพื่อเลือกเป็นรูปหลัก'}
                      </p>
                    </div>

                    {isCover ? (
                      <div className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-2 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                        <Star fill="currentColor" className="h-3.5 w-3.5" />
                        เลือกแล้ว
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCoverImage(img.url)}
                        className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                      >
                        ตั้งเป็นรูปหลัก
                      </button>
                    )}
                  </div>

                  {isCover && (
                    <div className="bg-linear-to-r absolute inset-x-0 bottom-0 h-1 from-blue-500 via-indigo-500 to-purple-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTION */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => router.push('/cars')}
            className="rounded-xl border px-4 py-2"
          >
            ยกเลิก
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-linear-to-r inline-flex items-center gap-2 rounded-xl from-blue-600 to-indigo-600 px-5 py-2 text-white"
          >
            <Save className="h-4 w-4" />
            {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>
      </div>
    </div>
  );
}
