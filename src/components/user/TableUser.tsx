'use client';

import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Database,
  Loader2,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react';
import { Modal } from '../ui/modal';
import { useModal } from '@/hooks/useModal';
import { toast } from 'react-toastify';

import TimeAgo from '../common/TimeAgo';
import UserHeader from './UserHeader';
import api from '@/lib/axios';

type UserStatus = 'active' | 'inactive';
type UserLevel = 'user' | 'member' | 'admin';

type User = {
  id: number;
  cid: string;
  prefix: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;

  status: UserStatus;
  statusLevel: UserLevel;

  depId: number;
  departmentName: string | null;

  psId: number;
  positionName: string | null;

  systemId: number;
  systemName: string | null;

  createdAt?: string;
  updatedAt?: string;
};

const API_URL = '/api/users';

export default function TableUser() {
  const router = useRouter();
  const { isOpen, openModal, closeModal } = useModal();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.get(API_URL, {
        params: {
          _t: Date.now(),
        },
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      const userData = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setUsers(userData);
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
      const matchSearch =
        !keyword ||
        user.cid?.toLowerCase().includes(keyword) ||
        user.prefix?.toLowerCase().includes(keyword) ||
        user.firstName?.toLowerCase().includes(keyword) ||
        user.lastName?.toLowerCase().includes(keyword) ||
        user.fullName?.toLowerCase().includes(keyword) ||
        user.phone?.toLowerCase().includes(keyword) ||
        user.departmentName?.toLowerCase().includes(keyword) ||
        user.positionName?.toLowerCase().includes(keyword) ||
        user.systemName?.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === 'all' || user.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [users, search, statusFilter]);

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

  const countActive = filteredUsers.filter(
    (user) => user.status === 'active',
  ).length;

  const countInactive = filteredUsers.filter(
    (user) => user.status === 'inactive',
  ).length;

  const handleOpenDeleteModal = (user: User) => {
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

  const handleToggleStatus = async (selectedUser: User) => {
    if (updatingStatusId !== null) return;

    const previousStatus = selectedUser.status;
    const nextStatus: UserStatus =
      previousStatus === 'active' ? 'inactive' : 'active';

    // อัปเดตหน้าจอทันที ไม่ต้องรอ API
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

      // ใช้ค่าจริงที่ API ส่งกลับมา
      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                status:
                  updatedUser?.status === 'inactive'
                    ? 'inactive'
                    : updatedUser?.status === 'active'
                      ? 'active'
                      : nextStatus,
                updatedAt:
                  updatedUser?.updatedAt ??
                  updatedUser?.updated_at ??
                  user.updatedAt,
              }
            : user,
        ),
      );

      toast.success(
        nextStatus === 'active'
          ? 'เปิดใช้งานบัญชีเรียบร้อยแล้ว'
          : 'ปิดใช้งานบัญชีเรียบร้อยแล้ว',
      );
    } catch (error) {
      console.error('Update user status error:', error);

      // API ผิดพลาด ให้ย้อนสถานะเดิม
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

  const handleImportExcel = async (file: File) => {
    if (isImporting) return;

    try {
      setIsImporting(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/api/users/import', formData);

      const { imported = 0, skipped = 0 } = response.data;

      if (imported > 0) {
        toast.success(
          `นำเข้าสำเร็จ ${imported.toLocaleString('th-TH')} รายการ` +
            (skipped > 0
              ? ` • ข้าม ${skipped.toLocaleString('th-TH')} รายการ`
              : ''),
        );
      } else {
        toast.info(
          `ไม่มีข้อมูลใหม่ • ข้าม ${skipped.toLocaleString('th-TH')} รายการ`,
        );
      }

      await fetchUsers();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || 'ไม่สามารถนำเข้าข้อมูลได้',
        );

        return;
      }

      toast.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <div className="space-y-5">
        <div className="bg-linear-to-r relative overflow-hidden rounded-2xl border border-white/10 from-white via-white to-blue-50/60 px-6 py-6 shadow-sm dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20">
          <div className="absolute -top-10 right-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />

          <UserHeader
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            totalUsers={filteredUsers.length}
            countActive={countActive}
            countInactive={countInactive}
            onImportExcel={handleImportExcel}
            isImporting={isImporting}
          />
        </div>

        <div className="relative w-full overflow-x-auto rounded-2xl border border-gray-100 bg-white dark:border-white/10 dark:bg-gray-900">
          <table className="min-w-300 w-full">
            <thead>
              <tr className="border-b bg-gray-50/80 dark:border-white/10 dark:bg-white/5">
                <th className="px-5 py-4 text-left text-xs">#</th>
                <th className="px-5 py-4 text-left text-xs">ผู้ใช้งาน</th>
                <th className="px-5 py-4 text-left text-xs">หน่วยงาน</th>
                <th className="px-5 py-4 text-left text-xs">ระบบ</th>
                <th className="px-5 py-4 text-left text-xs">สถานะ</th>
                <th className="px-5 py-4 text-left text-xs">สิทธิ์</th>
                <th className="px-5 py-4 text-left text-xs">อัปเดท</th>
                <th className="px-5 py-4 text-left text-xs">จัดการ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
                    <p className="mt-2 text-sm text-gray-500">
                      กำลังโหลดข้อมูล...
                    </p>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    ไม่พบข้อมูลผู้ใช้งาน
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="transition hover:bg-blue-50/40 dark:hover:bg-white/5"
                  >
                    <td className="px-5 py-4 text-sm">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                          <UserRound className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.prefix} {user.firstName} {user.lastName}
                          </p>

                          <p className="text-xs text-gray-500">
                            <span>ตำแหน่ง :</span> {user.positionName || '-'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {user.departmentName || '-'}
                    </td>

                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                        <Database className="h-4 w-4" />
                        <span>{user.systemName || 'ไม่กำหนด'}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(user)}
                        disabled={updatingStatusId === user.id}
                        className="inline-flex items-center gap-2 disabled:cursor-wait disabled:opacity-70"
                        role="switch"
                        aria-checked={user.status === 'active'}
                        aria-label={
                          user.status === 'active'
                            ? 'ปิดการใช้งานบัญชี'
                            : 'เปิดการใช้งานบัญชี'
                        }
                      >
                        <span
                          className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${
                            user.status === 'active'
                              ? 'bg-green-500'
                              : 'bg-gray-300 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                              user.status === 'active'
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </span>

                        {updatingStatusId === user.id && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        )}
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                        {user.statusLevel}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <TimeAgo
                        value={user.updatedAt}
                        className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-500/10 dark:text-purple-300"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/users/edit/${user.id}`)}
                          className="group/btn inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"
                        >
                          <Pencil className="h-3.5 w-3.5 transition group-hover/btn:rotate-12" />
                          แก้ไข
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(user)}
                          className="group/btn inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 active:scale-95 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5 transition group-hover/btn:scale-110" />
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/60 px-4 py-3 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:bg-white/5">
          <select
            value={rowsPerPage}
            onChange={(event) => setRowsPerPage(Number(event.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-gray-900"
          >
            {[5, 10, 20, 50].map((rowCount) => (
              <option key={rowCount} value={rowCount}>
                {rowCount} รายการ
              </option>
            ))}
          </select>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5"
            >
              <ArrowLeft size={16} />
              ก่อนหน้า
            </button>

            <div className="rounded-lg bg-white/60 px-3 py-1.5 text-sm dark:bg-white/5">
              <span className="text-blue-600">{currentPage}</span>
              <span className="mx-1 text-gray-400">/</span>
              <span>{totalPages}</span>
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage >= totalPages}
              className="bg-linear-to-r inline-flex items-center gap-1 rounded-lg from-blue-500 to-indigo-600 px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              ถัดไป
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

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
              className="inline-flex min-w-32 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
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
