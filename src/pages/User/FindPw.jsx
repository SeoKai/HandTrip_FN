import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../App";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./FindPw.css";
import back from "../../img/icons/back.png";
import cross from "../../img/icons/cross.png";
import Modal from "react-modal";
import {
  handleSessionExpired,
  login,
  refreshToken,
} from "../../api/AuthService";

Modal.setAppElement("#root"); // React Modal 설정

function FindPw() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userEmail: "",
  });

  // 닫기 버튼 클릭 시 동작
  const handleClose = () => {
    navigate("/"); // 홈으로 이동
  };

  const handleBackToSignIn = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  // 메일요청 및 요청완료 상태 체크
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 이메일 요청여부
  const [verificationRequested, setVerificationRequested] = useState(false); // 이메일일 요청 여부
  const [isRequesting, setIsRequesting] = useState(false); // 인증 요청 상태 (인증번호요청 후 응답까지의 딜레이가 있기에 해당 상태 체크)
  const [requestTime, setRequestTime] = useState(null); // 이메일 요청 시간
  const [verificationStatus, setVerificationStatus] = useState(""); // 상태 메시지
  const [isFirstRequest, setIsFirstRequest] = useState(true); // 요청이 처음인지 여부
  const [isgetPassword, setIsgetPassword] = useState(false);

  // 인증이메일 재요청 딜레이
  useEffect(() => {
    if (requestTime) {
      const interval = setInterval(() => {
        const elapsedTime = Date.now() - requestTime;
        if (elapsedTime >= 5000) {
          // 5초가 경과하면 재요청 가능
          clearInterval(interval);
          setVerificationRequested(false);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [requestTime]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setCredentials({ ...credentials, [name]: value });

    if (name === "userEmail") {
      setVerificationRequested(false); // 인증 요청 여부 초기화
      setIsEmailVerified(false); // 인증 상태 초기화
      setIsFirstRequest(true); // 인증코드 처음인지 여부
      setVerificationStatus(""); // 인증메일 발송여부 메시지
    }
  };

  const handleSendVerificationEmail = async () => {
    const emailRegex = new RegExp(
      "^(?!\\.)[a-zA-Z0-9._%+-]{1,64}(?<!\\.)@[a-zA-Z0-9-]{1,63}(\\.[a-zA-Z]{2,})+$"
    );

    if (!emailRegex.test(formData.userEmail)) {
      alert("이메일 형식이 아닙니다.");
      return;
    }
    setIsRequesting(true);
    setVerificationStatus("임시 비밀번호를 발송 중입니다...");
    setIsFirstRequest(false);

    try {
      await axios.post("http://13.209.114.27:5050/api/email/send", {
        userEmail: formData.userEmail,
        userPhone: formData.userPhone,
        mode: "findPassword",
      });

      setVerificationStatus("임시 비밀번호가 발송되었습니다.");
      setVerificationRequested(true);
      setRequestTime(Date.now()); // 요청 시간을 현재 시간으로 설정
      setIsRequesting(false); // 인증메일 전송 완료
      setIsgetPassword(true);
    } catch (error) {
      console.error(
        "임시 비밀번호 요청 실패:",
        error.response?.data || error.message
      );
      alert("임시 비밀번호 요청에 실패했습니다. 다시 시도해주세요.");
      setVerificationStatus(
        "임시 비밀번호 발송에 실패하였습니다.\n이메일 또는 전화번호를 다시 확인해주세요."
      );
      setIsRequesting(false); // 오류 발생 시 요청 상태 종료
    }
  };

  const [loginError, setLoginError] = useState(""); // 로그인 에러 상태
  const [credentials, setCredentials] = useState({
    userEmail: "",
    userPassword: "",
  });
  const { user, setUser, isAuthenticated, setIsAuthenticated } =
    useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!credentials.userEmail || !credentials.userPassword) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await login(credentials);
      const { accessToken, refreshToken, accessTokenExpiry } = response;

      // 로컬 스토리지에 토큰 및 만료 시간 저장
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("accessTokenExpiry", accessTokenExpiry);

      // React 상태 업데이트
      setUser({ email: credentials.userEmail }); // 사용자 정보 저장
      setIsAuthenticated(true);

      alert("로그인 성공!");
      window.location.href = "/";
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인 실패");
    }
  };

  return (
    <div className="FindPw">
      <div className="findpw-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="findpw-title">비밀번호 찾기</h2>
        <form onSubmit={handleLogin}>
          <h4 className="findpw-input-name">이메일</h4>
          <input
            className="signUp-email-input"
            type="email"
            name="userEmail"
            placeholder="이메일을 입력해주세요."
            value={formData.userEmail}
            onChange={handleChange}
          />
          <h4 className="findpw-input-name">전화번호</h4>
          <input
            type="text"
            name="userPhone"
            placeholder="전화번호를 입력해주세요. 예: 010-1234-5678"
            value={formData.userPhone}
            onChange={handleChange}
          />
          {!isEmailVerified && (
            <>
              <div className="findpw-request-check">
                <button
                  type="button"
                  className="verification-request-button"
                  onClick={handleSendVerificationEmail}
                  disabled={verificationRequested || isRequesting}
                >
                  {!isFirstRequest ? "다시 발급받기" : "임시 비밀번호 발급"}
                </button>

                {verificationStatus && (
                  <p className="findpw-status-message">{verificationStatus}</p>
                )}
              </div>
            </>
          )}
          {isgetPassword && (
            <>
              <h4 className="findpw-input-name">임시 비밀번호</h4>
              <input
                type="password"
                name="userPassword"
                placeholder="임시 비밀번호를 입력해주세요."
                value={credentials.userPassword}
                onChange={handleChange}
              />
              {loginError && <p className="login-error">{loginError}</p>}
              <button type="submit" className="submit-button">
                지금 바로 로그인
              </button>
            </>
          )}
        </form>
        <button className="join-back-button" onClick={handleBackToSignIn}>
          로그인 하기
        </button>
      </div>
    </div>
  );
}

export default FindPw;
