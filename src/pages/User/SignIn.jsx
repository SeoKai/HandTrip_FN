import React, { useContext, useState, useEffect } from "react";
import Modal from "react-modal";
import { AuthContext } from "../../App";
import {
  handleSessionExpired,
  login,
  refreshToken,
} from "../../api/AuthService";
import { useNavigate } from "react-router-dom";
import kakao from "../../img/icons/kakao.png";
import naver from "../../img/icons/naver.png";
import google from "../../img/icons/google.png";
import "./SignIn.css";

Modal.setAppElement("#root"); // React Modal 설정

function SignIn() {
  const { user, setUser, isAuthenticated, setIsAuthenticated } =
    useContext(AuthContext);
  const [credentials, setCredentials] = useState({
    userEmail: "",
    userPassword: "",
  });
  const [loginError, setLoginError] = useState(""); // 로그인 에러 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // 입력 값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

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

  // React 상태와 localStorage 동기화
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedAccessTokenExpiry = localStorage.getItem("accessTokenExpiry");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const storedUserEmail = localStorage.getItem("userEmail");

    if (storedAccessToken && storedAccessTokenExpiry) {
      if (Date.now() < parseInt(storedAccessTokenExpiry, 10)) {
        setIsAuthenticated(true);
        setUser({ email: storedUserEmail });
      } else if (storedRefreshToken) {
        refreshToken()
          .then((newAccessToken) => {
            setIsAuthenticated(true);
            setUser({ email: storedUserEmail });
            console.log("AccessToken이 갱신되었습니다.");
          })
          .catch(() => {
            handleSessionExpired(); // 만료된 세션 처리
          });
      } else {
        handleSessionExpired(); // 만료된 세션 처리
      }
    }
  }, [setIsAuthenticated, setUser]);

  // OAuth 로그인 핸들러
  const handleOAuthLogin = (provider) => {
    window.location.href = `http://13.209.114.27:5050/oauth2/authorization/${provider}`;
  };

  return (
    <div className="SignIn">
      <div className="signin-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="signin-title">로그인</h2>
        <form onSubmit={handleLogin}>
          <h4 className="inputName">이메일</h4>
          <input
            type="email"
            name="userEmail"
            placeholder="이메일을 입력해주세요."
            value={credentials.userEmail}
            onChange={handleChange}
            required
          />
          <h4 className="inputName">비밀번호</h4>
          <input
            type="password"
            name="userPassword"
            placeholder="비밀번호를 입력해주세요."
            value={credentials.userPassword}
            onChange={handleChange}
            required
          />
          {loginError && <p className="login-error">{loginError}</p>}
          <button type="submit" className="submit-button">
            이메일로 로그인
          </button>
        </form>

        <div className="login-links-container">
          <span className="signup-link" onClick={() => navigate("/signup")}>
            회원가입
          </span>
          <div className="find-links">
            <span className="find-id-link" onClick={() => navigate("/find-id")}>
              아이디 찾기
            </span>
            <span className="divider">|</span>
            <span
              className="find-password-link"
              onClick={() => navigate("/find-pw")}
            >
              비밀번호 찾기
            </span>
          </div>
        </div>

        <div className="social-login">
          <div className="social-login-divider">
            <span className="divider-line"></span>
            <span className="divider-text">SNS 간편 로그인</span>
            <span className="divider-line"></span>
          </div>
          <div className="social-icons">
            <div
              className="kakao-box"
              onClick={() => handleOAuthLogin("kakao")}
            >
              <img src={kakao} alt="Kakao" />
            </div>
            <div
              className="naver-box"
              onClick={() => handleOAuthLogin("naver")}
            >
              <img src={naver} alt="Naver" />
            </div>
            <div
              className="google-box"
              onClick={() => handleOAuthLogin("google")}
            >
              <img src={google} alt="Google" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
