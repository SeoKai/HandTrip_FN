import axios from "axios";

export const register = async (userAndProfileDto) => {
  const response = await axios.post(
    `${process.env.REACT_APP_BASE_URL}/user/register`,
    userAndProfileDto
  );
  return response.data; // { accessToken, refreshToken }
};

export const findPassword = async (userEmail, userPhone) => {
  const response = await axios.post(
    `${process.env.REACT_APP_BASE_URL}/user/find-password`,
    {
      userEmail,
      userPhone,
    }
  );
  return response.data; // "임시 비밀번호가 이메일로 발송되었습니다."
};
