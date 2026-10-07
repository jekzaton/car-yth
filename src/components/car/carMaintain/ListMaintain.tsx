'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import type { CarMaintainItem } from '@/types/carMaintainType';
import MaintainHeader from './MaintainHeader';
import MaintainTable from './MaintainTable';
import MaintainModal from './MaintainModal';
import { normalizeDate } from '@/utils/formatters';
import { toast } from 'react-toastify';
import MaintainDeleteModal from './MaintainDeleteModal';
import api from '@/lib/axios';

type ApiResponse = {
  success?: boolean;
  total?: number;
  data?: CarMaintainItem[];
};

export default function ListMaintain() {
  const [data, setData] = useState<CarMaintainItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<CarMaintainItem | null>(null);
  const [startDate, setStartDate] = useState('');

  const [endDate, setEndDate] = useState('');
  const [deleteItem, setDeleteItem] = useState<CarMaintainItem | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  // FETCH

  const fetchMaintain = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.get<ApiResponse>('/api/cars/car-maintain', {
        params: {
          _t: Date.now(),
        },
      });

      setData(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error('Load car maintain error:', error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMaintain();
  }, [fetchMaintain]);

  // SEARCH

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return data.filter((item) => {
      // ==============================
      // SEARCH
      // ==============================

      const searchable = [
        item.carCode,
        item.carBrandSub,
        item.carBrand,
        item.licensePlate,
        item.userCode,
        item.userName,
        item.detailMaintain,
        item.dateMaintain,
        item.priceMaintain,
      ];

      const matchesSearch =
        !keyword ||
        searchable
          .filter((value) => value !== null && value !== undefined)
          .some((value) => String(value).toLowerCase().includes(keyword));

      if (!matchesSearch) {
        return false;
      }

      // ==============================
      // DATE
      // ==============================

      const maintainDate = normalizeDate(item.dateMaintain);

      if ((startDate || endDate) && !maintainDate) {
        return false;
      }

      if (startDate && maintainDate < startDate) {
        return false;
      }

      if (endDate && maintainDate > endDate) {
        return false;
      }

      return true;
    });
  }, [data, search, startDate, endDate]);

  // KPI

  const totalPrice = useMemo(() => {
    return filtered.reduce(
      (sum, item) => sum + Number(item.priceMaintain ?? 0),
      0,
    );
  }, [filtered]);

  const totalCars = useMemo(() => {
    return new Set(filtered.map((item) => item.carCode).filter(Boolean)).size;
  }, [filtered]);

  // PAGINATION

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * rowsPerPage;

    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, safeCurrentPage, rowsPerPage]);

  // ACTION

  const handleCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: CarMaintainItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (item: CarMaintainItem) => {
    setDeleteItem(item);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await api.delete(
        `/api/cars/car-maintain/${deleteItem.id}`,
      );

      toast.success(response.data?.message || 'ลบข้อมูลซ่อมบำรุงเรียบร้อยแล้ว');

      setDeleteItem(null);

      // โหลดข้อมูลใหม่
      await fetchMaintain();
    } catch (error) {
      console.error('Delete maintain error:', error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || 'ไม่สามารถลบข้อมูลซ่อมบำรุงได้',
        );
      } else {
        toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}

      <MaintainHeader
        search={search}
        startDate={startDate}
        endDate={endDate}
        total={filtered.length}
        totalCars={totalCars}
        totalPrice={totalPrice}
        isLoading={isLoading}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        onDateChange={(newStartDate, newEndDate) => {
          setStartDate(newStartDate);
          setEndDate(newEndDate);
          setCurrentPage(1);
        }}
        onRefresh={() => {
          void fetchMaintain();
        }}
        onCreate={handleCreate}
      />

      {/* TABLE */}

      <MaintainTable
        data={paginatedData}
        isLoading={isLoading}
        currentPage={safeCurrentPage}
        rowsPerPage={rowsPerPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setCurrentPage(1);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <MaintainModal
        isOpen={modalOpen}
        editingItem={editingItem}
        onClose={handleCloseModal}
        onSuccess={() => {
          void fetchMaintain();
        }}
      />
      <MaintainDeleteModal
        isOpen={deleteItem !== null}
        item={deleteItem}
        isDeleting={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setDeleteItem(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
