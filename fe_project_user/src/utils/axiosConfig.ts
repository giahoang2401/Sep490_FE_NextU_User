import { getAccessToken } from '@/utils/auth'
import Axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import { Notify, Report } from 'notiflix'
import { refreshAccessToken } from '@/utils/refreshAccessToken'
import { triggerSessionExpired } from '@/context/SessionExpiredContext'

export function setupAxios(axios: AxiosInstance) {
  axios.defaults.headers.Accept = 'application/json'

  axios.interceptors.request.use(
    (config) => {
      const auth = getAccessToken()
      if (auth) {
        config.headers.Authorization = `Bearer ${auth.access_token}`
      }
      return config
    },
    (err) => Promise.reject(err)
  )

  axios.interceptors.response.use(
    function (response: AxiosResponse) {
      if (response && response.data) {
        return Promise.resolve(response)
      }
      return Promise.resolve(response)
    },
    async function (error: AxiosError<any>) {
      const originalRequest: any = error.config;

      // THÊM MỚI: Auto refresh logic  
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Tránh vòng lặp: không refresh nếu đây là request refresh token
        if (originalRequest.url?.includes('/api/auth/connect/token')) {
          console.log('🚫 Refresh token API failed, not retrying to avoid infinite loop');
          return Promise.reject(error);
        }
        
        originalRequest._retry = true;
        
        const currentToken = localStorage.getItem('access_token');
        if (!currentToken) {
          console.log('💥 No access token found, showing session expired modal...');
          triggerSessionExpired();
          return Promise.reject(error);
        }
        
        // Thử refresh token
        console.log('🔄 401 detected, trying to refresh token...');
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          console.log('✅ Token refreshed, retrying request...');
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        } else {
          console.log('💥 Refresh failed, showing session expired modal...');
          triggerSessionExpired();
          return Promise.reject(error);
        }
      }

      // GIỮ NGUYÊN LOGIC CŨ
      if (error.response && error.response.data) {
        const resData = error.response.data

        if (resData.message) {
          if (error.response.status === 403) {
            Report.failure('Error', resData.message, 'Ok', () => {
              window.location.href = '/'
            })
            return Promise.reject(resData)
          }

          if (typeof resData.message === 'string' && error.response.status !== 401) {
            Notify.failure(resData.message)
          }

          if (Array.isArray(resData.message)) {
            Notify.failure(resData.message[0].message)
          }
        }

        if (resData.errors && resData.errors.length > 0) {
          return Promise.reject({
            message: resData.errors[0].msg,
            errors: resData.errors,
          })
        }

        return Promise.reject(resData)
      }

      return Promise.reject(error.response)
    }
  )
}

const api = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ,
  headers: {
    'Content-Type': 'application/json',
  },
})

setupAxios(api)

export default api
