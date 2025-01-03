import axios from "axios";
import { refreshToken } from "./AuthService";
import { handleSessionExpired } from "./AuthService"; // 통합된 세션 만료 처리 함수 가져오기

const ApiClient = axios.create({
  baseURL: "http://13.209.114.27:5050/api/auth", // 백엔드 기본 URL
  headers: {
    "Content-Type": "application/json",
  },
});

ApiClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("accessToken");
  const expiry = localStorage.getItem("accessTokenExpiry");

  if (expiry && Date.now() > expiry) {
    try {
      console.log("AccessToken 만료, RefreshToken으로 갱신 시도");
      const newAccessToken = await refreshToken();
      console.log("갱신된 AccessToken:", newAccessToken);
      config.headers.Authorization = `Bearer ${newAccessToken}`;
    } catch (error) {
      console.error("토큰 갱신 실패:", error.message);
      handleSessionExpired(); // 통합된 함수 호출
      return Promise.reject(new Error("AccessToken expired"));
    }
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

ApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      handleSessionExpired(); // 통합된 함수 호출
    }
    return Promise.reject(error);
  }
);

export default ApiClient;
