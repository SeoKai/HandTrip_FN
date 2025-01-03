import axios from "axios";

// **AccessToken으로 보호된 리소스 요청**
export const fetchProtectedResource = async (url) => {
  try {
    const tokenExpiry = localStorage.getItem("accessTokenExpiry");
    if (tokenExpiry && Date.now() > tokenExpiry) {
      await refreshToken(); // AccessToken 갱신
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      handleSessionExpired();
    } else {
      console.error("요청 실패:", error);
      throw error;
    }
  }
};

// **로그인 요청**
export const login = async (credentials) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BASE_URL}/api/auth/login`,
      {
        userEmail: credentials.userEmail,
        userPassword: credentials.userPassword,
      }
    );

    const { accessToken, refreshToken, accessTokenExpiry } = response.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("accessTokenExpiry", Date.now() + accessTokenExpiry);

    return response.data;
  } catch (error) {
    console.error("로그인 요청 실패:", error);
    throw error;
  }
};

// **토큰 갱신 요청**
export const refreshToken = async () => {
  try {
    const token = localStorage.getItem("refreshToken");
    if (!token) throw new Error("RefreshToken이 없습니다.");

    const response = await axios.post("/refresh", { refreshToken: token });
    const {
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenExpiry,
    } = response.data;

    // UTC 시간으로 저장
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    localStorage.setItem("accessTokenExpiry", accessTokenExpiry);

    return accessToken;
  } catch (error) {
    console.error(
      "토큰 갱신 실패:",
      error.response?.data?.message || error.message
    );
    handleSessionExpired();
    throw error;
  }
};

let isSessionExpired = false; // 중복 실행 방지 플래그

// **세션 만료 처리**
export const handleSessionExpired = () => {
  if (!isSessionExpired) {
    isSessionExpired = true;
    alert("세션이 만료되었습니다. 다시 로그인하세요.");
    localStorage.clear();
    isSessionExpired = false; // 리디렉션 전에 플래그 초기화
    window.location.href = "/signin"; // 모든 리디렉션을 /signin으로 통일
  }
};
