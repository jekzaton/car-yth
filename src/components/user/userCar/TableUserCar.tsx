'use client';

import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';

import UserCarHeader from './UserCarHeader';
import UserCarTable from './UserCarTable';
import { UserCarItem, UserStatus } from '@/types/userCarType';
import api from '@/lib/axios';

const API_URL = '/api/users/user-car';

export default function TableUserCar() {
  const router = useRouter();

  const { isOpen, openModal, closeModal } = useModal();

  const [users, setUsers] = useState<UserCarItem[]>([]);

  const [selectedUser, setSelectedUser] = useState<UserCarItem | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');

  const [currentPage, setCurrentPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.get(API_URL, {
        params: {
          status: 'all',
          _t: Date.now(),
        },

        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      const userData: UserCarItem[] = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      const system2Users = userData.filter(
        (user) => Number(user.systemId) === 2,
      );

      setUsers(system2Users);
    } catch (error) {
      console.error('โหลดข้อมูลผู้ใช้ไม่สำเร็จ:', error);

      setUsers([]);

      toast.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, rowsPerPage]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const searchableValues = [
        user.cid,
        user.prefix,
        user.firstName,
        user.lastName,
        user.fullName,
        user.phone,
        user.departmentName,
        user.positionName,
        user.systemName,
      ];

      const matchSearch =
        !keyword ||
        searchableValues.some((value) =>
          String(value ?? '')
            .toLowerCase()
            .includes(keyword),
        );

      const matchStatus =
        statusFilter === 'all' || user.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [users, search, statusFilter]);

  // จำนวนทั้งหมดของข้อมูลจริง
  const totalUsers = users.length;

  const countActive = users.filter((user) => user.status === 'active').length;

  const countInactive = users.filter(
    (user) => user.status === 'inactive',
  ).length;

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;

    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, currentPage, rowsPerPage]);

  const handleOpenDeleteModal = (user: UserCarItem) => {
    setSelectedUser(user);
    openModal();
  };

  const handleCloseDeleteModal = () => {
    if (deleting) return;

    closeModal();
    setSelectedUser(null);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setDeleting(true);

      await api.delete('/api/users/del', {
        params: {
          id: selectedUser.id,
        },

        withCredentials: true,
      });

      setUsers((previous) =>
        previous.filter((user) => user.id !== selectedUser.id),
      );

      toast.success('ลบข้อมูลผู้ใช้เรียบร้อยแล้ว');

      closeModal();

      setSelectedUser(null);
    } catch (error) {
      console.error('Delete user error:', error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || 'ไม่สามารถลบข้อมูลผู้ใช้ได้',
        );
      } else {
        toast.error('เกิดข้อผิดพลาดระหว่างลบข้อมูล');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (selectedUser: UserCarItem) => {
    if (updatingStatusId !== null) return;

    const previousStatus = selectedUser.status;

    const nextStatus: UserStatus =
      previousStatus === 'active' ? 'inactive' : 'active';

    // Optimistic update
    setUsers((previousUsers) =>
      previousUsers.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : user,
      ),
    );

    try {
      setUpdatingStatusId(selectedUser.id);

      const response = await api.patch(
        '/api/users/status',
        {
          id: selectedUser.id,
          status: nextStatus,
        },
        {
          withCredentials: true,
        },
      );

      const updatedUser = response.data?.data;

      setUsers((previousUsers) =>
        previousUsers.map((user) => {
          if (user.id !== selectedUser.id) {
            return user;
          }

          const apiStatus: UserStatus =
            updatedUser?.status === 'inactive'
              ? 'inactive'
              : updatedUser?.status === 'active'
                ? 'active'
                : nextStatus;

          return {
            ...user,
            status: apiStatus,
            updatedAt:
              updatedUser?.updatedAt ??
              updatedUser?.updated_at ??
              user.updatedAt,
          };
        }),
      );

      toast.success(
        nextStatus === 'active'
          ? 'เปิดใช้งานบัญชีเรียบร้อยแล้ว'
          : 'ปิดใช้งานบัญชีเรียบร้อยแล้ว',
      );
    } catch (error) {
      console.error('Update user status error:', error);

      // rollback
      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                status: previousStatus,
                updatedAt: selectedUser.updatedAt,
              }
            : user,
        ),
      );

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || 'ไม่สามารถอัปเดตสถานะผู้ใช้งานได้',
        );
      } else {
        toast.error('เกิดข้อผิดพลาดระหว่างอัปเดตสถานะ');
      }
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <>
      <div className="space-y-5">
        {/* ================= HEADER ================= */}

        <UserCarHeader
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
          total={totalUsers}
          activeCount={countActive}
          inactiveCount={countInactive}
          onCreate={() => router.push('/users/user-car/create')}
        />

        {/* ================= TABLE CARD ================= */}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
          <UserCarTable
            data={paginatedUsers}
            isLoading={isLoading}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            updatingStatusId={updatingStatusId}
            onToggleStatus={handleToggleStatus}
            onDelete={handleOpenDeleteModal}
          />

          {/* ================= PAGINATION ================= */}

          <div className="dark:bg-white/2 flex flex-col gap-4 border-t border-gray-100 bg-gray-50/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
            {/* LEFT */}

            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-gray-500 sm:inline dark:text-gray-400">
                แสดง
              </span>

              <select
                value={rowsPerPage}
                onChange={(event) => setRowsPerPage(Number(event.target.value))}
                className="focus:ring-3 h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-blue-500/10 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200"
              >
                {[5, 10, 20, 50].map((rowCount) => (
                  <option key={rowCount} value={rowCount}>
                    {rowCount} รายการ
                  </option>
                ))}
              </select>

              <span className="text-xs text-gray-400">
                พบ{' '}
                <strong className="text-gray-700 dark:text-gray-200">
                  {filteredUsers.length}
                </strong>{' '}
                รายการ
              </span>
            </div>

            {/* RIGHT */}

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
              >
                <ArrowLeft className="h-4 w-4" />
                ก่อนหน้า
              </button>

              <div className="inline-flex h-9 items-center rounded-lg border border-gray-100 bg-white px-3 text-xs dark:border-white/10 dark:bg-white/5">
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {currentPage}
                </span>

                <span className="mx-1.5 text-gray-300">/</span>

                <span className="text-gray-600 dark:text-gray-300">
                  {totalPages}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage >= totalPages}
                className="bg-linear-to-r inline-flex h-9 items-center gap-1 rounded-lg from-blue-500 to-indigo-600 px-3 text-xs font-medium text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
              >
                ถัดไป
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      <Modal
        isOpen={isOpen}
        onClose={handleCloseDeleteModal}
        className="max-w-md p-6 lg:p-8"
      >
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <h4 className="mt-5 text-xl font-semibold text-gray-800 dark:text-white/90">
            ยืนยันการลบผู้ใช้งาน
          </h4>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            คุณต้องการลบผู้ใช้งานรายนี้ใช่หรือไม่?
          </p>

          {selectedUser && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-white/5">
              <p className="font-semibold text-gray-800 dark:text-white">
                {selectedUser.prefix}
                {selectedUser.firstName} {selectedUser.lastName}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                CID: {selectedUser.cid}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                ระบบ: {selectedUser.systemName || '-'}
              </p>
            </div>
          )}

          <p className="mt-4 text-xs text-red-500">
            เมื่อลบแล้วจะไม่สามารถกู้คืนข้อมูลได้
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleCloseDeleteModal}
              disabled={deleting}
              className="inline-flex min-w-28 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleDeleteUser}
              disabled={deleting}
              className="inline-flex min-w-32 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังลบ...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  ยืนยันการลบ
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
