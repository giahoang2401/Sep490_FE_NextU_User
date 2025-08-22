import Axios from "axios";

// Tạo axios instance riêng cho refresh token - KHÔNG đi qua interceptor
const refreshAPI = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

export async function refreshAccessToken() {
    const refresh_token = localStorage.getItem("refresh_token");
    if (!refresh_token) {
      console.log('🔍 RefreshAccessToken: No refresh token found');
      return null;
    }
  
    console.log('🔄 RefreshAccessToken: Starting token refresh...');
    try {
      const res = await refreshAPI.post(
        "/api/auth/connect/token",
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token,
        })
      );
  
      const data = res.data || res; // Tùy interceptor trả về data hay nguyên response
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      console.log('✅ RefreshAccessToken: Token refreshed successfully');
      return data.access_token;
    } catch (err) {
      console.log('❌ RefreshAccessToken: Token refresh failed', err);
      localStorage.clear();
      return null;
    }
  }
  