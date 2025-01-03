import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../App";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SignUp.css";
import back from "../../img/icons/back.png";

const SignUp = () => {
  const [formData, setFormData] = useState({
    userEmail: "",
    userPassword: "",
    userPhone: "",
    userNickname: "",
    userNickname: "",
    userPasswordConfirm: "",
  });
  const { setUser, setIsAuthenticated } = useContext(AuthContext); // React 상태 업데이트 함수
  const navigate = useNavigate();

  const [isEmailValid, setIsEmailValid] = useState(false); // 이메일 유효성 상태
  const [emailChecked, setEmailChecked] = useState(false); // 중복 체크 여부

  // 인증요청 및 인증완료 상태 체크
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 이메일 인증여부
  const [verificationCode, setVerificationCode] = useState(""); // 인증번호
  const [verificationRequested, setVerificationRequested] = useState(false); // 인증 요청 여부
  const [isRequesting, setIsRequesting] = useState(false); // 인증 요청 상태 (인증번호요청 후 응답까지의 딜레이가 있기에 해당 상태 체크)
  const [requestTime, setRequestTime] = useState(null); // 인증 이메일 요청 시간
  const [verificationStatus, setVerificationStatus] = useState(""); // 인증 상태 메시지
  const [verificationCodeInput, setVerificationCodeInput] = useState(false); //인증코드 입력란 활성화 여부
  const [isFirstRequest, setIsFirstRequest] = useState(true); // 인증요청이 처음인지 여부

  // 인증이메일 재재요청 딜레이
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
    console.log(e.target);
    console.log(name);

    if (name === "userEmail") {
      setEmailChecked(false); // 이메일 변경 시 중복 체크 초기화
      setIsEmailValid(false); // 이메일 정규식 체크 여부 초기화
      setVerificationCode(""); // 인증 코드 초기화
      setVerificationRequested(false); // 인증 요청 여부 초기화
      setVerificationCodeInput(false); // 인증코드 입력란 비활성화
      setIsEmailVerified(false); // 인증 상태 초기화
      setIsFirstRequest(true); // 인증코드 처음인지 여부
      setVerificationStatus(""); // 인증메일 발송여부 메시지
    }
  };

  const handleDuplicateCheck = async () => {
    // email 정규표현식
    const emailRegex = new RegExp(
      "^(?!\\.)[a-zA-Z0-9._%+-]{1,64}(?<!\\.)@[a-zA-Z0-9-]{1,63}(\\.[a-zA-Z]{2,})+$"
    );

    if (!emailRegex.test(formData.userEmail)) {
      alert("이메일 형식이 아닙니다.");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/user/duplicate-email`,
        { userEmail: formData.userEmail }
      );
      const isDuplicate = response.data;
      setIsEmailValid(isDuplicate);
      setEmailChecked(true);
    } catch (error) {
      console.error("중복 체크 실패:", error.response?.data || error.message);
      alert("중복 체크에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!isEmailValid) {
      alert("이메일 중복 확인을 먼저 완료해주세요.");
      return;
    }

    setIsRequesting(true);
    setVerificationCodeInput(true);
    setVerificationStatus("인증 메일을 보내는 중입니다...");
    setIsFirstRequest(false);

    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/email/send`, {
        userEmail: formData.userEmail,
        mode: "verify",
      });

      setVerificationStatus("인증 메일이 발송되었습니다.");
      setVerificationRequested(true);
      setRequestTime(Date.now()); // 요청 시간을 현재 시간으로 설정
      setIsRequesting(false); // 인증메일 전송 완료
    } catch (error) {
      console.error(
        "이메일 인증 요청 실패:",
        error.response?.data || error.message
      );
      alert("인증 요청에 실패했습니다. 다시 시도해주세요.");
      setIsRequesting(false); // 오류 발생 시 요청 상태 종료
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/email/verify`,
        {
          userEmail: formData.userEmail,
          code: verificationCode,
        }
      );
      if (response.data === "인증에 성공했습니다.") {
        alert("이메일 인증에 성공했습니다.");
        setIsEmailVerified(true);
      } else {
        alert("인증 코드가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error(
        "인증 코드 검증 실패:",
        error.response?.data || error.message
      );
      alert("인증 코드 검증에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleResetVerified = () => {
    setIsEmailVerified(false);
    setFormData({
      ...formData,
      userEmail: "", // 이메일을 초기화하여 사용자가 다시 입력할 수 있도록 함
    });
  };

  const handleClose = () => {
    navigate("/"); // 홈페이지로 이동
  };

  const handleBackToSignIn = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // // 이메일 중복 체크여부 확인
    // if (!emailChecked || !isEmailValid) {
    //     alert("이메일 중복 확인을 완료해주세요.");
    //     return;
    // }
    //
    // if (!isEmailVerified) {
    //     alert("이메일 인증을 완료해주세요.");
    //     return;
    // }

    // 비밀번호 확인
    if (formData.userPassword !== formData.userPasswordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 비밀번호 강도 확인
    if (
      !/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(
        formData.userPassword
      )
    ) {
      alert(
        "비밀번호는 영문, 숫자, 특수문자를 포함하여 8자리 이상이어야 합니다."
      );
      return;
    }

    try {
      const payload = {
        userDto: {
          userEmail: formData.userEmail,
          userPassword: formData.userPassword,
          userPhone: formData.userPhone,
        },
        userProfileDto: {
          userNickname: formData.userNickname,
        },
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/user/register`,
        payload
      );
      const { accessToken, refreshToken, accessTokenExpiry } = response.data;

      // 로컬 스토리지에 JWT 토큰 및 만료 시간 저장
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("accessTokenExpiry", accessTokenExpiry);
      localStorage.setItem("userEmail", formData.userEmail);

      // React 상태 업데이트
      setUser({ email: formData.userEmail });
      setIsAuthenticated(true);

      alert("회원가입 및 로그인 성공!");
      console.log("Navigating to Home with state:", { isFromSignUp: true });

      // 상태 전달과 함께 홈으로 이동
      console.log("Navigating to Home with showModal=true");
      navigate("/?showModal=true"); // 쿼리 파라미터 추가
    } catch (error) {
      console.error("회원가입 실패:", error.response?.data || error.message);
      alert("회원가입에 실패했습니다. 데이터를 확인하세요.");
    }
  };

  const isFormValid =
    formData.userEmail &&
    formData.userPassword &&
    formData.userNickname &&
    formData.userPhone;

  return (
    <div className="SignUp">
      <div className="signup-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="signup-title">회원가입</h2>
        <form onSubmit={handleSubmit}>
          <h4 className="signup-input-name">이메일</h4>

          {!isEmailVerified && (
            <>
              <div className="signup-email-container">
                <input
                  className="signup-email-input"
                  type="email"
                  name="userEmail"
                  placeholder="이메일을 입력해주세요."
                  value={formData.userEmail}
                  onChange={handleChange}
                  disabled={isEmailVerified}
                />
                <div className="duplicate-check">
                  {(!emailChecked || !isEmailValid) && (
                    <button
                      type="button"
                      className="duplicate-check-button"
                      onClick={handleDuplicateCheck}
                    >
                      확인
                    </button>
                  )}
                  {emailChecked && isEmailValid && (
                    <button
                      type="button"
                      className="verification-request-button"
                      onClick={handleSendVerificationEmail}
                      disabled={
                        !isEmailValid || verificationRequested || isRequesting
                      }
                    >
                      {!isFirstRequest ? "재발송" : "인증번호 요청"}
                    </button>
                  )}
                </div>
              </div>
              {emailChecked && (
                <p
                  className={`email-check-message ${
                    isEmailValid ? "valid" : "invalid"
                  }`}
                >
                  {isEmailValid
                    ? "사용 가능한 이메일입니다."
                    : "이미 사용 중인 이메일입니다."}
                </p>
              )}
              <div className="request-check">
                {verificationStatus && (
                  <p className="verification-status-message">
                    {verificationStatus}
                  </p>
                )}
              </div>

              <div className="verification-check">
                {verificationCodeInput && (
                  <>
                    <input
                      type="text"
                      className="verificationCode-input"
                      name="verificationCode"
                      placeholder="인증 코드를 입력해주세요."
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                    <button
                      type="button"
                      className="verify-code-button"
                      onClick={handleVerifyCode}
                      disabled={isEmailVerified}
                    >
                      인증 확인
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {isEmailVerified && (
            <>
              <div className="signup-email-container">
                <input
                  className="signup-email-input"
                  type="email"
                  name="userEmail"
                  placeholder="이메일을 입력해주세요."
                  value={formData.userEmail}
                  onChange={handleChange}
                  disabled={isEmailVerified}
                />
                <div className="duplicate-check">
                  {(!emailChecked || !isEmailValid) && (
                    <button
                      type="button"
                      className="duplicate-check-button"
                      onClick={handleDuplicateCheck}
                    >
                      확인
                    </button>
                  )}
                </div>
              </div>
              <p className="email-verified-message">
                이메일 인증이 완료되었습니다.
              </p>
            </>
          )}

          <h4 className="signup-input-name">닉네임</h4>
          <input
            className="signup-nickname-input"
            type="text"
            name="userNickname"
            placeholder="닉네임을 입력해주세요."
            value={formData.userNickname}
            onChange={handleChange}
          />
          <h4 className="signup-input-name">전화번호</h4>
          <input
            className="signup-userphone-input"
            type="text"
            name="userPhone"
            placeholder="전화번호를 입력해주세요. 예: 010-1234-5678"
            value={formData.userPhone}
            onChange={handleChange}
          />
          <h4 className="signup-input-name">비밀번호</h4>
          <input
            className="signup-pwd-input"
            type="password"
            name="userPassword"
            placeholder="영문, 숫자, 특수문자 포함 8자리 이상"
            value={formData.userPassword}
            onChange={handleChange}
          />
          {!/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(
            formData.userPassword
          ) && formData.userPassword !== "" ? (
            <p className="pwd-message">
              영문, 숫자, 특수문자 포함 8자리 이상 입력
            </p>
          ) : null}
          <h4 className="signup-input-name">비밀번호 확인</h4>
          <input
            className="signup-pwd-confirm-input"
            type="password"
            name="userPasswordConfirm"
            placeholder="비밀번호 확인"
            value={formData.userPasswordConfirm}
            onChange={handleChange}
          />
          {formData.userPassword !== formData.userPasswordConfirm &&
          formData.userPasswordConfirm !== "" ? (
            <p className="pwd-cofirm-message">비밀번호가 일치하지 않습니다</p>
          ) : null}
          <button
            type="submit"
            className={`submit-button ${isFormValid ? "" : "disabled"}`}
            disabled={!isFormValid}
          >
            회원가입하고 로그인하기
          </button>
        </form>
        <button className="join-back-button" onClick={handleBackToSignIn}>
          로그인 하기
        </button>
      </div>
    </div>
  );
};

export default SignUp;
