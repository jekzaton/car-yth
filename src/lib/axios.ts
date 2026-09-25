// src/lib/axios.ts

import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,

  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      // SESSION / JWT หมดอายุ

      if (
        status === 401 &&
        typeof window !== 'undefined' &&
        window.location.pathname !== '/signin'
      ) {
        /*
         * ใช้ replace แทน href
         *
         * เพื่อไม่ให้กด Back
         * กลับไปหน้าที่ session หมดอายุ
         */
        window.location.replace('/signin');
      }

      /*
       * 403 ไม่ redirect
       *
       * เพราะผู้ใช้ยัง Login อยู่
       * แต่ไม่มีสิทธิ์ทำรายการ
       */
    }

    return Promise.reject(error);
  },
);

export default api;
