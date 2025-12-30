import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5050/api', // Cổng Backend của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động gắn Token vào mỗi request gửi đi
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Lấy token từ bộ nhớ trình duyệt
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Xử lý lỗi chung (Ví dụ: Hết hạn token thì đá ra login)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // window.location.href = '/login'; // Tùy chọn: Tự động chuyển về login
    }
    return Promise.reject(error);
  }
);

export default axiosClient;