import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseURL = 'https://godaregroup.com/api';
const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const generateToken = async () => {
  const username = 'apigodare@godaregroup.com';
  const password = 'godare_api_A7d8c5v4b5e@@7ss4d1';
  try {
    const response = await axios.post(`${baseURL}/login_check`, {
      username,
      password,
    });
    const token = response.data.token;
    await AsyncStorage.setItem('jwt_token', token);
    console.log('Nouveau token généré:', token);
    return token;
  } catch (error) {
    console.error(
      'Erreur lors de la génération du token:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

axiosInstance.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const token = await generateToken();
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        processQueue(null, token);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await AsyncStorage.removeItem('jwt_token');
        // Ici, vous pourriez vouloir rediriger l'utilisateur vers la page de connexion
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
