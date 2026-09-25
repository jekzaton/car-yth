'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

import CarBrandHeader from './CarBrandHeader';
import CarBrandTable from './CarBrandTable';

import { Modal } from '@/components/ui/modal';

import { CarFront, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import api from '@/lib/axios';

type CarBrandItem = {
  id: number;
  carBrandName: string;
};

export default function CarBrandList() {
  const [data, setData] = useState<CarBrandItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // CREATE / EDIT MODAL
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CarBrandItem | null>(null);

  const [carBrandName, setCarBrandName] = useState('');
  const [saving, setSaving] = useState(false);

  // DELETE MODAL
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<CarBrandItem | null>(null);

  const [deleting, setDeleting] = useState(false);

  // FETCH
  const fetchCarBrands = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.get('/api/cars/car-brand', {
        params: {
          _t: Date.now(),
        },
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      const items: CarBrandItem[] = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setData(items);
    } catch (error) {
      console.error('โหลดข้อมูลยี่ห้อรถยนต์ไม่สำเร็จ:', error);

      setData([]);

      toast.error('ไม่สามารถโหลดข้อมูลยี่ห้อรถยนต์ได้');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCarBrands();
  }, [fetchCarBrands]);

  // SEARCH
  const filtered = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('th-TH');

    if (!keyword) {
      return data;
    }

    return data.filter((item) =>
      String(item.carBrandName ?? '')
        .toLocaleLowerCase('th-TH')
        .includes(keyword),
    );
  }, [data, search]);

  // ==========================
  // PAGINATION
  // ==========================
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;

    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // ==========================
  // CREATE
  // ==========================
  const handleCreate = () => {
    setEditingItem(null);
    setCarBrandName('');
    setModalOpen(true);
  };

  // ==========================
  // EDIT
  // ==========================
  const handleEdit = (item: CarBrandItem) => {
    setEditingItem(item);
    setCarBrandName(item.carBrandName);
    setModalOpen(true);
  };

  // ==========================
  // CLOSE CREATE / EDIT
  // ==========================
  const handleCloseModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingItem(null);
    setCarBrandName('');
  };

  // ==========================
  // SAVE CREATE / EDIT
  // ==========================
  const handleSave = async () => {
    const name = carBrandName.trim();

    if (!name) {
      toast.error('กรุณาระบุชื่อยี่ห้อรถยนต์');
      return;
    }

    if (name.length > 255) {
      toast.error('ชื่อยี่ห้อรถยนต์ต้องไม่เกิน 255 ตัวอักษร');
      return;
    }

    // ตรวจชื่อซ้ำในข้อมูลที่โหลดมา
    // ถ้าเป็นการแก้ไข ให้ไม่นับรายการตัวเอง
    const duplicate = data.some(
      (item) =>
        item.id !== editingItem?.id &&
        item.carBrandName.trim().toLocaleLowerCase('th-TH') ===
          name.toLocaleLowerCase('th-TH'),
    );

    if (duplicate) {
      toast.warning(`มียี่ห้อรถยนต์ "${name}" อยู่แล้ว`);
      return;
    }

    try {
      setSaving(true);

      if (editingItem) {
        // ==========================
        // UPDATE
        // ==========================
        await api.patch('/api/cars/car-brand', {
          id: editingItem.id,
          carBrandName: name,
        });

        toast.success('แก้ไขยี่ห้อรถยนต์เรียบร้อยแล้ว');
      } else {
        // ==========================
        // CREATE
        // ==========================
        await api.post('/api/cars/car-brand', {
          carBrandName: name,
        });

        toast.success('เพิ่มยี่ห้อรถยนต์เรียบร้อยแล้ว');
      }

      setModalOpen(false);
      setEditingItem(null);
      setCarBrandName('');

      await fetchCarBrands();
    } catch (error) {
      console.error('Save car brand error:', error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            (editingItem
              ? 'ไม่สามารถแก้ไขยี่ห้อรถยนต์ได้'
              : 'ไม่สามารถเพิ่มยี่ห้อรถยนต์ได้'),
        );
      } else {
        toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================
  // DELETE
  // ==========================
  const handleDelete = (item: CarBrandItem) => {
    setDeletingItem(item);
    setDeleteModalOpen(true);
  };

  const handleCloseDelete = () => {
    if (deleting) return;

    setDeleteModalOpen(false);
    setDeletingItem(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      setDeleting(true);

      await api.delete('/api/cars/car-brand', {
        params: {
          id: deletingItem.id,
        },
      });

      toast.success(
        `ลบยี่ห้อรถยนต์ "${deletingItem.carBrandName}" เรียบร้อยแล้ว`,
      );

      setDeleteModalOpen(false);
      setDeletingItem(null);

      await fetchCarBrands();
    } catch (error) {
      console.error('Delete car brand error:', error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || 'ไม่สามารถลบยี่ห้อรถยนต์ได้',
        );
      } else {
        toast.error('ไม่สามารถลบยี่ห้อรถยนต์ได้');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* ================= HEADER ================= */}
      <CarBrandHeader
        search={search}
        total={filtered.length}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        onCreate={handleCreate}
      />

      {/* ================= TABLE ================= */}
      <CarBrandTable
        data={paginatedData}
        isLoading={isLoading}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setCurrentPage(1);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        className="max-w-lg p-0"
      >
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-gray-900">
          {/* HEADER */}
          <div
            className="relative overflow-hidden px-6 pb-5 pt-6"
            style={{
              background:
                'linear-gradient(135deg, rgba(239,246,255,1), rgba(238,242,255,1), rgba(245,243,255,0.9))',
            }}
          >
            <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-blue-400/10 blur-3xl" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{
                    background:
                      'linear-gradient(135deg, rgb(59 130 246), rgb(79 70 229), rgb(124 58 237))',
                  }}
                >
                  <CarFront size={24} strokeWidth={2.2} stroke="#ffffff" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editingItem ? 'แก้ไขยี่ห้อรถยนต์' : 'เพิ่มยี่ห้อรถยนต์'}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {editingItem
                      ? 'แก้ไขชื่อยี่ห้อรถยนต์ที่เลือก'
                      : 'เพิ่มยี่ห้อรถยนต์สำหรับใช้ในระบบรถ'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-gray-400 shadow-sm transition hover:bg-white hover:text-gray-700 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* FORM */}
          <div className="px-6 py-6">
            <label
              htmlFor="carBrandName"
              className="text-sm font-semibold text-gray-700 dark:text-gray-200"
            >
              ชื่อยี่ห้อรถยนต์
              <span className="ml-1 text-rose-500">*</span>
            </label>

            <p className="mt-1 text-xs text-gray-400">
              เช่น Honda, Toyota, Isuzu, Ford หรือ Mitsubishi
            </p>

            <div className="mt-3">
              <input
                id="carBrandName"
                type="text"
                value={carBrandName}
                onChange={(event) => setCarBrandName(event.target.value)}
                disabled={saving}
                autoFocus
                maxLength={255}
                placeholder="กรอกชื่อยี่ห้อรถยนต์"
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !saving) {
                    event.preventDefault();
                    void handleSave();
                  }
                }}
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm outline-none transition-all placeholder:text-gray-400 hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            {/* PREVIEW */}
            {carBrandName.trim() && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 dark:border-blue-500/20 dark:bg-blue-500/10">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20">
                  <CarFront size={18} strokeWidth={2.2} stroke="#2563eb" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-gray-400">
                    ยี่ห้อรถยนต์
                  </p>

                  <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {carBrandName.trim()}
                  </p>
                </div>
              </div>
            )}

            {/* ACTION */}
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                className="h-11 rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving || !carBrandName.trim()}
                className="inline-flex h-11 min-w-40 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background:
                    'linear-gradient(90deg, rgb(59 130 246), rgb(79 70 229), rgb(124 58 237))',
                  color: '#ffffff',
                  boxShadow: '0 8px 20px rgba(79,70,229,0.20)',
                }}
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      strokeWidth={2.5}
                      stroke="#ffffff"
                      className="shrink-0 animate-spin"
                    />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : editingItem ? (
                  <>
                    <Pencil
                      size={16}
                      strokeWidth={2.5}
                      stroke="#ffffff"
                      className="shrink-0"
                    />
                    <span>บันทึกการแก้ไข</span>
                  </>
                ) : (
                  <>
                    <Plus
                      size={18}
                      strokeWidth={2.5}
                      stroke="#ffffff"
                      className="shrink-0"
                    />
                    <span>เพิ่มข้อมูล</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleCloseDelete}
        className="max-w-md p-0"
      >
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-gray-900">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10">
                <Trash2 size={22} strokeWidth={2.2} stroke="#ef4444" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  ยืนยันการลบ
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  คุณต้องการลบยี่ห้อรถยนต์นี้ใช่หรือไม่?
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseDelete}
                disabled={deleting}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {deletingItem && (
              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/60 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                <p className="text-xs font-medium text-gray-400">
                  ยี่ห้อรถยนต์ที่จะลบ
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <CarFront size={18} strokeWidth={2.2} stroke="#ef4444" />

                  <p className="font-bold text-gray-900 dark:text-white">
                    {deletingItem.carBrandName}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseDelete}
                disabled={deleting}
                className="h-11 rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={deleting || !deletingItem}
                className="inline-flex h-11 min-w-32 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background:
                    'linear-gradient(90deg, rgb(239 68 68), rgb(225 29 72))',
                  color: '#ffffff',
                  boxShadow: '0 8px 20px rgba(239,68,68,0.20)',
                }}
              >
                {deleting ? (
                  <>
                    <Loader2
                      size={17}
                      strokeWidth={2.5}
                      stroke="#ffffff"
                      className="shrink-0 animate-spin"
                    />
                    <span>กำลังลบ...</span>
                  </>
                ) : (
                  <>
                    <Trash2
                      size={16}
                      strokeWidth={2.5}
                      stroke="#ffffff"
                      className="shrink-0"
                    />
                    <span>ยืนยันลบ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
