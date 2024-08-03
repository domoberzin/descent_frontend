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
        body: JSON.stringify({ 
          refreshToken: refresh_token
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await refreshResponse.json();
      Cookies.set('access_token', data.access.token);
      Cookies.set('refresh_token', data.refresh.token);
      isRefreshing = false;
      onTokenRefreshed(data.access.token);
    }

    return Cookies.get('access_token');
  } catch (refreshError) {
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
        const newToken = await refreshTokenAndReattemptRequest(response, endpoint, options);
        headers['Authorization'] = `Bearer ${newToken}`;
        fetchOptions.headers = headers;
        const retry = await fetch(url, fetchOptions);
        if (retry.ok) {
          return await retry.json();
        }
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