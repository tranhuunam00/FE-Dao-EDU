import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token and active student ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const activeStudentId = localStorage.getItem('activeStudentId');
    if (activeStudentId && config.headers) {
      config.headers['x-student-id'] = activeStudentId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function cleanUrlsRecursively(data: any): any {
  if (!data) return data;
  if (typeof data === 'string') {
    // Match any IP (e.g. 103.90.227.173), excluding loopback 127.0.0.1
    const ipRegex = /^https?:\/\/(?!(127\.0\.0\.1))(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?/i;
    const newDomain = 'https://imgeducare.home-care.vn';
    let cleanUrl = data;
    let isReplaced = false;

    if (ipRegex.test(cleanUrl)) {
      cleanUrl = cleanUrl.replace(ipRegex, newDomain);
      isReplaced = true;
    }

    if (isReplaced || cleanUrl.startsWith(newDomain) || cleanUrl.startsWith('http://imgeducare.home-care.vn')) {
      if (cleanUrl.includes('?')) {
        cleanUrl = cleanUrl.split('?')[0];
      }
    }
    return cleanUrl;
  }
  if (Array.isArray(data)) {
    return data.map(item => cleanUrlsRecursively(item));
  }
  if (typeof data === 'object') {
    const cleaned: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        cleaned[key] = cleanUrlsRecursively(data[key]);
      }
    }
    return cleaned;
  }
  return data;
}

// Response interceptor to handle token refresh on 401 Unauthorized
api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = cleanUrlsRecursively(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Tránh lặp vô hạn và không chạy refresh khi đang ở trang login/refresh
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = res.data;

          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          // Gửi lại request cũ với access token mới
          return api(originalRequest);
        } catch (refreshErr) {
          console.error('Không thể làm mới token, đang tự động đăng xuất:', refreshErr);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          
          // Chuyển hướng người dùng về trang đăng nhập
          window.location.href = '/login';
          return Promise.reject(refreshErr);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
