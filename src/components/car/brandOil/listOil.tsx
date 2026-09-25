'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { toast } from 'react-toastify';
import OilBrandHeader from './OilBrandHeader';
import OilBrandTable from './OilBrandTable';
import { Modal } from '@/components/ui/modal';
import { Fuel, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import api from '@/lib/axios';

type OilBrandItem = {
  id: number;
  oilName: string;
};

export default function ListOil() {
  const [data, setData] = useState<OilBrandItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OilBrandItem | null>(null);
  const [oilName, setOilName] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<OilBrandItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOilBrands = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.get('/api/cars/oil-brand', {
        params: {
          _t: Date.now(),
        },
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      const items: OilBrandItem[] = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setData(items);
    } catch (error) {
      console.error('โหลดข้อมูลยี่ห้อน้ำมันไม่สำเร็จ:', error);

      setData([]);

      toast.error('ไม่สามารถโหลดข้อมูลยี่ห้อน้ำมันได้');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOilBrands();
  }, [fetchOilBrands]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return data;
    }

    return data.filter((item) =>
      String(item.oilName ?? '')
        .toLowerCase()
        .includes(keyword),
    );
  }, [data, search]);

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

  const handleCreate = () => {
    setEditingItem(null);
    setOilName('');
    setModalOpen(true);
  };

  const handleEdit = (item: OilBrandItem) => {
    setEditingItem(item);
    setOilName(item.oilName);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingItem(null);
    setOilName('');
  };

  const handleDelete = (item: OilBrandItem) => {
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

      await api.delete(`/api/cars/oil-brand/${deletingItem.id}`);

      toast.success(`ลบ "${deletingItem.oilName}" เรียบร้อยแล้ว`);

      setDeleteModalOpen(false);
      setDeletingItem(null);

      await fetchOilBrands();
    } catch (error) {
      console.error('Delete oil brand error:', error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || 'ไม่สามารถลบประเภทน้ำมันได้',
        );
      } else {
        toast.error('ไม่สามารถลบประเภทน้ำมันได้');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    const name = oilName.trim();

    if (!name) {
      toast.error('กรุณาระบุชื่อประเภทน้ำมัน');
      return;
    }

    const duplicate = data.some(
      (item) =>
        item.id !== editingItem?.id &&
        item.oilName.trim().toLocaleLowerCase('th-TH') ===
          name.toLocaleLowerCase('th-TH'),
    );

    if (duplicate) {
      toast.warning(`มีประเภทน้ำมัน "${name}" อยู่แล้ว`);
      return;
    }

    try {
      setSaving(true);

      if (editingItem) {
        // UPDATE

        await api.put(`/api/cars/oil-brand/${editingItem.id}`, {
          oilName: name,
        });

        toast.success('แก้ไขประเภทน้ำมันเรียบร้อยแล้ว');
      } else {
        // CREATE

        await api.post('/api/cars/oil-brand', {
          oilName: name,
        });

        toast.success('เพิ่มประเภทน้ำมันเรียบร้อยแล้ว');
      }

      // ปิด modal โดยตรง
      setModalOpen(false);
      setEditingItem(null);
      setOilName('');

      await fetchOilBrands();
    } catch (error) {
      console.error('Save oil brand error:', error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            (editingItem
              ? 'ไม่สามารถแก้ไขประเภทน้ำมันได้'
              : 'ไม่สามารถเพิ่มประเภทน้ำมันได้'),
        );
      } else {
        toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <OilBrandHeader
        search={search}
        total={filtered.length}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        onCreate={handleCreate}
      />

      {/* TABLE */}

      <OilBrandTable
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

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        className="max-w-lg p-0"
      >
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-gray-900">
          {/* ================= HEADER ================= */}
          <div
            className="relative overflow-hidden px-6 pb-5 pt-6"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,251,235,1), rgba(255,247,237,1), rgba(255,241,242,0.8))',
            }}
          >
            <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-orange-400/10 blur-3xl" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{
                    background:
                      'linear-gradient(135deg, rgb(245 158 11), rgb(249 115 22), rgb(244 63 94))',
                  }}
                >
                  <Fuel size={23} strokeWidth={2.1} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editingItem ? 'แก้ไขประเภทน้ำมัน' : 'เพิ่มประเภทน้ำมัน'}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {editingItem
                      ? 'แก้ไขชื่อประเภทน้ำมันที่เลือก'
                      : 'เพิ่มประเภทน้ำมันสำหรับบันทึกการเติมน้ำมันรถ'}
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

          {/* ================= FORM ================= */}
          <div className="px-6 py-6">
            <label
              htmlFor="oilName"
              className="text-sm font-semibold text-gray-700 dark:text-gray-200"
            >
              ชื่อประเภทน้ำมัน
              <span className="ml-1 text-rose-500">*</span>
            </label>

            <p className="mt-1 text-xs text-gray-400">
              เช่น E20, Gasohol 95, Gasohol 91 หรือ Diesel
            </p>

            <div className="mt-3">
              <input
                type="text"
                value={oilName}
                onChange={(event) => setOilName(event.target.value)}
                disabled={saving}
                autoFocus
                maxLength={255}
                placeholder="กรอกชื่อประเภทน้ำมัน"
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !saving) {
                    event.preventDefault();
                    void handleSave();
                  }
                }}
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm outline-none transition-all placeholder:text-gray-400 hover:border-amber-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            {/* PREVIEW */}
            {oilName.trim() && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                <Fuel size={18} className="shrink-0 text-orange-500" />

                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-gray-400">
                    ประเภทน้ำมัน
                  </p>

                  <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {oilName.trim()}
                  </p>
                </div>
              </div>
            )}

            {/* ================= ACTION ================= */}
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
                disabled={saving || !oilName.trim()}
                className="inline-flex h-11 min-w-40 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background:
                    'linear-gradient(90deg, rgb(245 158 11), rgb(249 115 22), rgb(244 63 94))',
                  color: '#ffffff',
                  boxShadow: '0 8px 20px rgba(249,115,22,0.20)',
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

                    <span className="text-white">กำลังบันทึก...</span>
                  </>
                ) : editingItem ? (
                  <>
                    <Pencil
                      size={16}
                      strokeWidth={2.5}
                      stroke="#ffffff"
                      className="shrink-0"
                    />

                    <span className="text-white">บันทึกการแก้ไข</span>
                  </>
                ) : (
                  <>
                    <Plus
                      size={18}
                      strokeWidth={2.5}
                      stroke="#ffffff"
                      className="shrink-0"
                    />

                    <span className="text-white">เพิ่มข้อมูล</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>

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
                  คุณต้องการลบประเภทน้ำมันนี้ใช่หรือไม่?
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
                  ประเภทน้ำมันที่จะลบ
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <Fuel size={18} strokeWidth={2.2} stroke="#f97316" />

                  <p className="font-bold text-gray-900 dark:text-white">
                    {deletingItem.oilName}
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
