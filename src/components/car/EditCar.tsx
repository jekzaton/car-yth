'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Upload, Save, ArrowLeft, Star } from 'lucide-react';

type CarStatus = 'active' | 'inactive';

type CarForm = {
  carCode: string;
  carName: string;
  carBrand: string;
  licensePlate: string;
  status: CarStatus;
  carImage: string[];
};
type PreviewImage = {
  url: string;
  isNew: boolean;
};

export default function EditCar() {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<CarForm>({
    carCode: '',
    carName: '',
    carBrand: '',
    licensePlate: '',
    status: 'active',
    carImage: [],
  });

  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  // ================= FETCH CAR =================
  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await axios.get(`/api/cars/edit/${params?.id}`);
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
          carCode: data.carCode,
          carName: data.carName,
          carBrand: data.carBrand,
          licensePlate: data.licensePlate,
          status: data.status,
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
    setSaving(true);

    try {
      let uploaded: string[] = [];

      // อัปโหลดเฉพาะรูปใหม่
      if (files.length > 0) {
        const fd = new FormData();

        files.forEach((file) => {
          fd.append('carImages', file);
        });

        const upload = await axios.post('/api/cars/upload', fd);

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

      await axios.put(`/api/cars/edit/${params?.id}`, {
        carCode: form.carCode,
        carName: form.carName,
        carBrand: form.carBrand,
        licensePlate: form.licensePlate,
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
        <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
          <input
            name="carCode"
            value={form.carCode}
            onChange={handleChange}
            placeholder="รหัสรถ"
            className="rounded-xl border px-4 py-2"
          />

          <input
            name="carName"
            value={form.carName}
            onChange={handleChange}
            placeholder="ชื่อรถ"
            className="rounded-xl border px-4 py-2"
          />

          <input
            name="carBrand"
            value={form.carBrand}
            onChange={handleChange}
            placeholder="ยี่ห้อ"
            className="rounded-xl border px-4 py-2"
          />

          <input
            name="licensePlate"
            value={form.licensePlate}
            onChange={handleChange}
            placeholder="ทะเบียน"
            className="rounded-xl border px-4 py-2"
          />

          {/* STATUS */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              สถานะการใช้งาน
            </label>

            <div className="mt-2 flex gap-4">
              {/* Active */}
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                  form.status === 'active'
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200 dark:bg-green-500/10'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={form.status === 'active'}
                  onChange={handleChange}
                  className="hidden"
                />

                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    form.status === 'active'
                      ? 'border-green-600 bg-green-600'
                      : 'border-gray-300'
                  }`}
                >
                  {form.status === 'active' && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>

                <div>
                  <p className="font-medium text-green-700 dark:text-green-300">
                    ใช้งาน
                  </p>
                  <p className="text-xs text-gray-500">รถพร้อมใช้งาน</p>
                </div>
              </label>

              {/* Inactive */}
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                  form.status === 'inactive'
                    ? 'border-red-500 bg-red-50 ring-2 ring-red-200 dark:bg-red-500/10'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={form.status === 'inactive'}
                  onChange={handleChange}
                  className="hidden"
                />

                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    form.status === 'inactive'
                      ? 'border-red-600 bg-red-600'
                      : 'border-gray-300'
                  }`}
                >
                  {form.status === 'inactive' && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>

                <div>
                  <p className="font-medium text-red-700 dark:text-red-300">
                    ไม่ใช้งาน
                  </p>
                  <p className="text-xs text-gray-500">รถถูกปิดการใช้งาน</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* IMAGE UPLOAD */}
        <div className="mt-6">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed p-4 hover:bg-gray-50 dark:hover:bg-white/5">
            <Upload className="h-4 w-4" />
            อัปโหลดรูปเพิ่มเติม
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFiles}
            />
          </label>

          {/* PREVIEW */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {previews.map((img, i) => (
              <div
                key={img.url}
                className={`h-320px group relative flex flex-col overflow-hidden rounded-3xl border bg-white transition-all duration-300 ${
                  coverImage === img.url
                    ? 'border-blue-500 shadow-2xl ring-2 ring-blue-100'
                    : 'border-gray-200 shadow hover:-translate-y-1 hover:shadow-xl'
                }`}
              >
                {/* Image */}
                <div className="aspect-4/3 relative overflow-hidden bg-gray-100">
                  <img
                    src={img.url}
                    alt={`Car ${i + 1}`}
                    onClick={() => setCoverImage(img.url)}
                    className="h-full w-full cursor-pointer object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Overlay */}
                  <div className="bg-linear-to-t absolute inset-0 from-black/30 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

                  {/* Cover Badge */}
                  {coverImage === img.url && (
                    <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                      <Star
                        fill="currentColor"
                        className="h-3 w-3 text-yellow-500"
                      />
                      รูปหลัก
                    </div>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => {
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
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-red-500 shadow transition-all hover:scale-110 hover:bg-red-500 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Footer */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <p className="text-base font-semibold">รูปที่ {i + 1}</p>

                    <p className="mt-1 text-sm text-gray-500">
                      {coverImage === img.url
                        ? 'กำลังใช้งานเป็นรูปหลัก'
                        : 'คลิกเพื่อเลือกเป็นรูปหลัก'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCoverImage(img.url)}
                    className={`mt-5 w-full rounded-xl py-3 text-sm font-semibold transition ${
                      coverImage === img.url
                        ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'border border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    {coverImage === img.url
                      ? '✓ เลือกแล้ว'
                      : 'เลือกเป็นรูปหลัก'}
                  </button>
                </div>
              </div>
            ))}
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
