// src/lib/axios.ts

import axios from 'axios';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

const api = axios.create({
  baseURL: BASE_PATH,
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

      if (status === 401 && typeof window !== 'undefined') {
        const signInPath = `${BASE_PATH}/signin`;

        if (window.location.pathname !== signInPath) {
          window.location.replace(signInPath);
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
