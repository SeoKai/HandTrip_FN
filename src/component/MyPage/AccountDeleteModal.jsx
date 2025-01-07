import React, { useState } from "react";
import "./AccountDeleteModal.css";

const AccountDeleteModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [sentCode, setSentCode] = useState("");
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isCodeVerified, setIsCodeVerified] = useState(false);

    if (!isOpen) return null;

    const handleEmailVerificationRequest = () => {
        if (!email) {
            alert("이메일을 입력해주세요.");
            return;
        }

        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        setSentCode(generatedCode);
        setIsCodeSent(true);
        alert(`인증번호가 발송되었습니다.`);
    };

    const handleVerificationCodeCheck = () => {
        if (verificationCode === sentCode) {
            alert("인증번호가 확인되었습니다.");
            setIsCodeVerified(true);
        } else {
            alert("인증번호가 올바르지 않습니다.");
        }
    };

    const handleAccountDeletion = () => {
        if (!isCodeSent) {
            alert("이메일 인증을 먼저 완료해주세요.");
            return;
        }

        if (verificationCode !== sentCode) {
            alert("인증번호가 올바르지 않습니다.");
            return;
        }

        alert("회원탈퇴가 완료되었습니다.");
        onClose(); // 모달 닫기
        window.location.href = "/";
    };

    return (
        <div className="account-delete-modal-overlay">
            <div className="account-delete-modal-content">
                <h2 className="account-delete-title">회원탈퇴</h2>
                <h4 className="lssues">❗안내 사항</h4>
                <p className="lssues-text">회원 정보 및 여행 데이터 등 개인 서비스 이용 기록은 탈퇴 하시면
                모두 삭제되며, 삭제된 데이터는 복구되지 않습니다.</p>
                <div className="account-delete-modal-input-group">
                    <label htmlFor="email">이메일</label>
                    <div className="account-delete-modal-input-row">
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
                            onClick={handleEmailVerificationRequest}
                        >
                            인증 요청
                        </button>
                    </div>
                </div>

                {/* 인증번호 입력 */}
                {isCodeSent && (
                    <div className="account-delete-modal-input-group">
                        <label htmlFor="verificationCode">인증번호</label>
                        <div className="account-delete-modal-input-row">
                            <input
                                id="verificationCode"
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="인증번호를 입력하세요"
                                className="modal-input"
                            />
                            <button
                                className="account-delete-verification-check-button"
                                onClick={handleVerificationCodeCheck}
                            >
                                인증 확인
                            </button>
                        </div>
                    </div>
                )}

                <div className="account-delete-modal-buttons">
                    <button className="account-delete-confirm-button" onClick={handleAccountDeletion}>
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
