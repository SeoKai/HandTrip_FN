import React, { useState } from "react";
import axios from "axios";
import "./AccountDeleteModal.css";

const AccountDeleteModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState(""); // 사용자 이메일
    const [verificationCode, setVerificationCode] = useState(""); // 인증 코드
    const [verificationRequested, setVerificationRequested] = useState(false); // 인증 요청 여부
    const [isCodeVerified, setIsCodeVerified] = useState(false); // 인증 코드 검증 여부
    const [verificationStatus, setVerificationStatus] = useState(""); // 인증 상태 메시지
    const [isRequesting, setIsRequesting] = useState(false); // 인증 요청 중 상태

    if (!isOpen) return null;

    // 인증 코드 요청
    const handleSendVerificationEmail = async () => {
        if (!email) {
            alert("이메일을 입력해주세요.");
            return;
        }

        setIsRequesting(true);
        setVerificationStatus("인증 메일을 보내는 중입니다...");

        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/api/email/send`, {
                userEmail: email,
                mode: "verify",
            });
            setVerificationStatus("인증 메일이 발송되었습니다.");
            setVerificationRequested(true);
            setIsRequesting(false);
        } catch (error) {
            console.error("인증 메일 전송 실패:", error.response?.data || error.message);
            alert("인증 메일 요청 중 문제가 발생했습니다. 다시 시도해주세요.");
            setIsRequesting(false);
        }
    };

    // 인증 코드 검증
    const handleVerifyCode = async () => {
        if (!verificationCode) {
            alert("인증 코드를 입력해주세요.");
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/email/verify`, {
                userEmail: email,
                code: verificationCode,
            });

            if (response.data === "인증에 성공했습니다.") {
                alert("인증에 성공했습니다.");
                setIsCodeVerified(true);
            } else {
                alert("인증 코드가 올바르지 않습니다.");
            }
        } catch (error) {
            console.error("인증 코드 검증 실패:", error.response?.data || error.message);
            alert("인증 코드 검증 중 문제가 발생했습니다. 다시 시도해주세요.");
        }
    };

    // 회원 탈퇴
    const handleAccountDeletion = async () => {
        if (!isCodeVerified) {
            alert("이메일 인증을 먼저 완료해주세요.");
            return;
        }

        try {
            const token = localStorage.getItem("accessToken");
            await axios.delete(`${process.env.REACT_APP_BASE_URL}/user/delete`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("회원 탈퇴가 완료되었습니다.");
            localStorage.clear(); // 로컬 스토리지 초기화
            window.location.href = "/"; // 메인 페이지로 리다이렉션
        } catch (error) {
            console.error("회원 탈퇴 실패:", error.response?.data || error.message);
            alert("회원 탈퇴 중 문제가 발생했습니다.");
        }
    };

    return (
        <div className="account-delete-modal-overlay">
            <div className="account-delete-modal-content">
                <h2 className="account-delete-title">회원 탈퇴</h2>
                <p className="issues-text">
                    회원 탈퇴 시 모든 개인 데이터가 삭제되며 복구할 수 없습니다.
                </p>
                <div className="account-delete-modal-input-group">
                    <label htmlFor="email">이메일</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일을 입력하세요"
                        className="modal-input"
                    />
                    <button
                        className="account-delete-email-verification-button"
                        onClick={handleSendVerificationEmail}
                        disabled={isRequesting || verificationRequested}
                    >
                        인증 요청
                    </button>
                </div>

                {verificationRequested && (
                    <div className="account-delete-modal-input-group">
                        <label htmlFor="verificationCode">인증 코드</label>
                        <input
                            id="verificationCode"
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="인증 코드를 입력하세요"
                            className="modal-input"
                        />
                        <button
                            className="account-delete-verification-check-button"
                            onClick={handleVerifyCode}
                            disabled={isCodeVerified}
                        >
                            인증 확인
                        </button>
                    </div>
                )}

                <div className="account-delete-modal-buttons">
                    <button
                        className="account-delete-confirm-button"
                        onClick={handleAccountDeletion}
                        disabled={!isCodeVerified}
                    >
                        탈퇴하기
                    </button>
                    <button className="account-delete-cancel-button" onClick={onClose}>
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountDeleteModal;
