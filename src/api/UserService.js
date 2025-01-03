import axios from "axios";

const API_URL = "http://13.209.114.27:5050/user";

export const register = async (userAndProfileDto) => {
  const response = await axios.post(`${API_URL}/register`, userAndProfileDto);
  return response.data; // { accessToken, refreshToken }
};

export const findPassword = async (userEmail, userPhone) => {
  const response = await axios.post(`${API_URL}/find-password`, {
    userEmail,
    userPhone,
  });
  return response.data; // "임시 비밀번호가 이메일로 발송되었습니다."
};
