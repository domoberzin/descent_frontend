import Cookies from 'js-cookie';
import { API_URL } from './config';

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
}

const onTokenRefreshed = (token) => {
  refreshSubscribers.map(callback => callback(token));
  refreshSubscribers = [];
}

const refreshTokenAndReattemptRequest = async (error, endpoint, options) => {
  try {
    const refresh_token = Cookies.get('refresh_token');
    if (!refresh_token) {
      throw new Error('No refresh token available');
    }

    if (!isRefreshing) {
      isRefreshing = true;
      const refreshResponse = await fetch(`${API_URL}/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await refreshResponse.json();
      Cookies.set('access_token', data.access_token);
      isRefreshing = false;
      onTokenRefreshed(data.access_token);
    }

    return new Promise(resolve => {
      subscribeTokenRefresh((token) => {
        options.headers['Authorization'] = `Bearer ${token}`;
        resolve(apiFetch(endpoint, options));
      });
    });
  } catch (refreshError) {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    throw refreshError;
  }
};

const apiFetch = async (endpoint, options = {}) => {
  const token = Cookies.get('access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;

  const fetchOptions = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      if (response.status === 401) {
        return refreshTokenAndReattemptRequest(response, endpoint, options);
      }

      const errorCode = response.status;
      const errorBody = await response.json();
      throw new Error(`HTTP error! status: ${errorCode} message: ${errorBody.message}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default apiFetch;