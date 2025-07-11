import api from "@/utils/axiosConfig";
export async function refreshAccessToken() {
    const refresh_token = localStorage.getItem("refresh_token");
    if (!refresh_token) return null;
  
    try {
      const res = await api.post(
        "/api/auth/connect/token",
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
  
      const data = res.data || res; // Tùy interceptor trả về data hay nguyên response
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      return data.access_token;
    } catch (err) {
      localStorage.clear();
      return null;
    }
  }
  