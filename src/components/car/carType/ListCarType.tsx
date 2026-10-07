'use client';

import axios from 'axios';
import {
  CarFront,
  Check,
  CirclePlus,
  Pencil,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import TableCarType, { CarType } from './TableCarType';
import { toast } from 'react-toastify';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/axios';

type CarTypeForm = {
  typeName: string;
};

const initialForm: CarTypeForm = {
  typeName: '',
};

export default function ListCarType() {
  const [items, setItems] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteItem, setDeleteItem] = useState<CarType | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [form, setForm] = useState<CarTypeForm>(initialForm);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get('/api/cars/type', {
        params: {
          _t: Date.now(),
        },
      });

      setItems(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error('โหลดประเภทรถไม่สำเร็จ:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return items;

    return items.filter((item) =>
      item.typeName.toLowerCase().includes(keyword),
    );
  }, [items, search]);

  const handleCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setOpenModal(true);
  };

  const handleEdit = (item: CarType) => {
    setEditingId(item.typeCarId);

    setForm({
      typeName: item.typeName,
    });

    setOpenModal(true);
  };

  const handleSave = async () => {
    const typeName = form.typeName.trim();

    if (!typeName) {
      alert('กรุณากรอกชื่อประเภทรถ');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        typeName,
      };

      if (editingId !== null) {
        await api.put(`/api/cars/type/${editingId}`, payload);
        toast.success('อัพเดทประเภทรถสำเร็จ');
      } else {
        await api.post('/api/cars/type', payload);
        toast.success('เพิ่มประเภทรถสำเร็จ');
      }

      setOpenModal(false);
      setEditingId(null);
      setForm(initialForm);

      await fetchData();
    } catch (error) {
      console.error('บันทึกข้อมูลไม่สำเร็จ:', error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้',
        );
      } else {
        toast.error('ไม่สามารถบันทึกข้อมูลได้');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: CarType) => {
    setDeleteItem(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    try {
      setDeletingId(deleteItem.typeCarId);

      await api.delete(`/api/cars/type/${deleteItem.typeCarId}`);

      toast.success(`ลบ "${deleteItem.typeName}" เรียบร้อยแล้ว`);

      setDeleteModalOpen(false);
      setDeleteItem(null);

      await fetchData();
    } catch (error) {
      console.error('ลบประเภทรถไม่สำเร็จ:', error);

      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'ไม่สามารถลบประเภทรถได้');
      } else {
        toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } finally {
      setDeletingId(null);
    }
  };
  return (
    <>
      <div className="space-y-6">
        {/* ================= HEADER ================= */}
        <div className="bg-linear-to-r relative overflow-hidden rounded-3xl border border-gray-100 from-white via-white to-blue-50/70 p-6 shadow-sm dark:border-white/10 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20">
          {/* Glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="bg-linear-to-r relative overflow-hidden rounded-3xl border border-gray-100 from-white via-white to-blue-50/70 p-6 shadow-sm dark:border-white/10 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20">
            {/* Glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-24 h-52 w-52 rounded-full bg-indigo-500/5 blur-3xl" />

            <div className="relative space-y-6">
              {/* HEADER */}
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-lg" />

                    <div className="bg-linear-to-br relative flex h-14 w-14 items-center justify-center rounded-2xl from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                      <CarFront className="h-7 w-7" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        ประเภทรถ
                      </h1>

                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        Cars Type
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                      จัดการและกำหนดประเภทของยานพาหนะภายในระบบ
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreate}
                  className="bg-linear-to-r group inline-flex items-center justify-center gap-2 rounded-2xl from-blue-500 via-blue-600 to-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25 active:translate-y-0"
                >
                  <CirclePlus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                  เพิ่มประเภทรถ
                </button>
              </div>

              {/* KPI */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* TOTAL */}
                <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-500/10 blur-2xl" />

                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        ประเภทรถทั้งหมด
                      </p>

                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                          {items.length}
                        </span>

                        <span className="pb-1 text-xs text-gray-400">
                          รายการ
                        </span>
                      </div>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:scale-105 dark:bg-blue-500/10 dark:text-blue-400">
                      <CarFront className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* SEARCH RESULT */}
                <div className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-indigo-500/10 dark:bg-indigo-500/10">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-indigo-500/10 blur-2xl" />

                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        รายการที่แสดง
                      </p>

                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-3xl font-semibold tracking-tight text-indigo-700 dark:text-indigo-300">
                          {filteredItems.length}
                        </span>

                        <span className="pb-1 text-xs text-indigo-400">
                          รายการ
                        </span>
                      </div>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-indigo-600 shadow-sm transition group-hover:scale-105 dark:bg-white/5 dark:text-indigo-400">
                      <Search className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                รายการประเภทรถ
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                พบ {filteredItems.length} รายการ
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80">
              {/* Search Icon */}
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อประเภทรถ..."
                className={`w-full rounded-xl border border-gray-200 bg-gray-50/70 py-2.5 pl-10 text-sm text-gray-700 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 ${
                  search ? 'pr-11' : 'pr-4'
                }`}
              />

              {/* Clear Button */}
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  title="ล้างการค้นหา"
                  aria-label="ล้างการค้นหา"
                  className="group absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500 active:scale-90 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                >
                  <X className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                </button>
              )}
            </div>
          </div>

          <TableCarType
            items={filteredItems}
            loading={loading}
            deletingId={deletingId}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {openModal && (
        <div className="z-99999 fixed inset-0 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => !saving && setOpenModal(false)}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900">
            {/* Modal Header */}
            <div className="relative border-b border-gray-100 px-6 py-5 dark:border-white/10">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />

              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                    {editingId ? (
                      <Pencil className="h-5 w-5" />
                    ) : (
                      <CirclePlus className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {editingId ? 'แก้ไขประเภทรถ' : 'เพิ่มประเภทรถ'}
                    </h3>

                    <p className="mt-0.5 text-xs text-gray-500">
                      กรุณากรอกข้อมูลให้ครบถ้วน
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setOpenModal(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-5 p-6">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  ชื่อประเภทรถ
                </label>

                <input
                  value={form.typeName}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      typeName: e.target.value,
                    }))
                  }
                  placeholder="เช่น รถยนต์นั่งส่วนบุคคล"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-4 dark:border-white/10 dark:bg-white/5">
              <button
                type="button"
                disabled={saving}
                onClick={() => setOpenModal(false)}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="bg-linear-to-r inline-flex min-w-28 items-center justify-center gap-2 rounded-xl from-blue-500 via-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    กำลังบันทึก
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    บันทึก
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (deletingId !== null) return;

          setDeleteModalOpen(false);
          setDeleteItem(null);
        }}
        className="max-w-120 p-0"
      >
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-gray-900">
          {/* HEADER */}
          <div className="border-b border-gray-100 px-6 py-5 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <Trash2 className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  ยืนยันการลบ
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  กรุณาตรวจสอบข้อมูลก่อนดำเนินการ
                </p>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="px-6 py-6">
            <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
              คุณต้องการลบประเภทรถ
            </p>

            <div className="mt-3 rounded-2xl border border-red-100 bg-red-50/70 px-4 py-4 dark:border-red-500/10 dark:bg-red-500/10">
              <p className="text-center font-semibold text-red-700 dark:text-red-400">
                {deleteItem?.typeName}
              </p>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              เมื่อลบแล้ว ข้อมูลนี้จะไม่แสดงในรายการประเภทรถอีก
            </p>
          </div>

          {/* ACTION */}
          <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-4 dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              disabled={deletingId !== null}
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteItem(null);
              }}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              disabled={deletingId !== null}
              onClick={confirmDelete}
              className="min-w-27.5 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deletingId !== null ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  กำลังลบ
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  ยืนยันลบ
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
