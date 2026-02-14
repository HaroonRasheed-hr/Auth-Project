import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
   baseURL: API_BASE_URL,
   headers: {
      'Content-Type': 'application/json',
   },
});

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
   const token = localStorage.getItem('access_token');
   if (token) {
      config.headers.Authorization = `Bearer ${token}`;
   }
   return config;
});

export const authAPI = {
   signup: (username, email, password) =>
      apiClient.post('/signup', { username, email, password }),

   login: (email, password) =>
      apiClient.post('/login', { email, password }),

   getUser: (userId) =>
      apiClient.get(`/user/${userId}`),
   updateProfile: (formData) =>
      apiClient.put('/user/me', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
   deleteProfilePhoto: () =>
      apiClient.delete('/user/me/photo'),
};

export default apiClient;
