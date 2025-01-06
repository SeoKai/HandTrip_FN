import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import cross from "../../img/icons/cross.png"; // 닫기 버튼 아이콘
import back from "../../img/icons/back.png"; // 뒤로가기 아이콘
import "./FindId.css";
import axios from "axios";

Modal.setAppElement("#root"); // React Modal 설정

function FindId() {
  const navigate = useNavigate();

  const handleBackToSignIn = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  const [phoneNumber, setPhoneNumber] = useState(""); // 전화번호 상태
  const [code, setCode] = useState(""); // 인증번호 상태
  const [isVerificationSent, setIsVerificationSent] = useState(false); // 인증번호 발송 여부 상태
  const [canResend, setCanResend] = useState(true); // 재발급 버튼 활성화 상태
  const [timer, setTimer] = useState(0); // 타이머 상태 (초 단위)
  const [isVerified, setIsVerified] = useState(false); // 인증 여부 상태
  const [emails, setEmails] = useState([]); // 이메일 저장 상태
  const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지 상태

  const handleSendVerificationCode = async () => {
    // 실제 인증번호 보내는 API 호출 로직을 여기에 추가
    try {
      if (!canResend) return; // 재발급 제한 시간 중일 때는 버튼 클릭 방지

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/phone/send-one`,
        {
          phoneNumber: phoneNumber,
        }
      );
      console.log(response);
      console.log("전화번호로 인증번호 전송:", phoneNumber);

      setIsVerificationSent(true); // 인증번호 발송 후 상태 업데이트
      setCanResend(false); // 버튼 비활성화
      alert(
        isVerificationSent
          ? "인증번호가 재발급되었습니다."
          : "인증번호가 발송되었습니다."
      );

      setIsVerificationSent(true); // 인증번호 발송 상태 업데이트
      setCanResend(false); // 버튼 비활성화
      setTimer(60); // 타이머 초기화 (60초 설정)
    } catch (error) {
      setErrorMessage("인증 문자 발송 실패. 다시 시도해주세요.");
      console.error(error.response?.data || error.message);
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/phone/verify`,
        {
          phoneNumber: phoneNumber.trim(),
          code: code.trim(),
        }
      );
      console.log(response);
      if (response.data === "인증에 성공했습니다.") {
        setIsVerified(true);
        setErrorMessage("");
        await handleFindEmail(); // 인증 성공 후 이메일 찾기
      } else {
        setErrorMessage("인증에 실패했습니다.");
      }
    } catch (error) {
      setErrorMessage("인증 처리 중 오류가 발생했습니다.");
      console.error(error.response?.data || error.message);
    }
  };

  // 전화번호 포메팅
  const formatPhoneNumber = (number) => {
    return number
      .replace(/[^0-9]/g, "") // 숫자 이외의 문자를 제거
      .replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3"); // 010-1234-5678 형식으로 변환
  };

  const handleFindEmail = async () => {
    try {
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber); // 전화번호 포맷팅
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/user/find-Email`,
        {
          isVerified: "true",
          phoneNumber: formattedPhoneNumber,
        }
      );
      console.log(response);
      setEmails(response.data); // 성공적으로 이메일을 가져오면 상태 업데이트
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("아이디 조회 실패. 다시 시도해주세요.");
      console.error(error.response?.data || error.message);
    }
  };

  // 타이머 관리
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval); // 컴포넌트 언마운트 시 타이머 정리
    } else if (timer === 0) {
      setCanResend(true); // 타이머가 0이 되면 버튼 활성화
    }
  }, [timer]);

  return (
    <div className="FindId">
      <div className="findId-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="findId-title">아이디 찾기</h2>

        {/* 조건부 렌더링 */}
        {!isVerified ? (
          <>
            {/* 전화번호 입력 필드 */}
            <div className="findid-number-container">
              <input
                type="text"
                placeholder="전화번호 입력"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="findid-phone-input"
              />
              <button
                className="send-verification-button"
                onClick={handleSendVerificationCode}
                disabled={!canResend} // 재발급 제한 상태에 따라 버튼 비활성화
              >
                {isVerificationSent ? "인증번호 재발급" : "인증번호 받기"}
              </button>
            </div>
            {!canResend && <p className="timer-message">유효시간: {timer}초</p>}

            {/* 인증번호 입력 필드 (인증번호 받기 버튼 클릭 후 표시) */}
            {isVerificationSent && (
              <div className="findId-verification-container">
                <input
                  type="text"
                  placeholder="인증번호 입력"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="verification-input"
                />
                <button
                  className="verify-button"
                  onClick={() => {
                    handleVerifyCode();
                    setIsVerified(true); // 인증 성공 후 이메일 리스트로 전환
                  }}
                >
                  확인
                </button>
              </div>
            )}
          </>
        ) : (
          // 이메일 리스트
          <div className="findId-email-list">
            <h3 className="findId-email-list-title">
              휴대전화번호 정보와 일치하는 아이디입니다.
            </h3>
            {emails.length > 0 ? (
              <ul>
                {emails.map((email, index) => (
                  <li className="findId-email-list-email" key={index}>
                    {email}
                  </li>
                ))}
              </ul>
            ) : (
              <p>아이디를 찾을 수 없습니다.</p>
            )}
          </div>
        )}

        {/* 로그인 버튼 */}
        <button
          className={`join-back-button ${
            isVerified ? "join-back-button-verified" : ""
          }`}
          onClick={handleBackToSignIn}
        >
          로그인 하기
        </button>
      </div>
    </div>
  );
}

export default FindId;
