import React, { useState } from "react";
import "./ChangePasswordModal.css"; // 스타일링 추가

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    // 새 비밀번호와 확인 비밀번호가 일치하는지 확인
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    // 비밀번호 강도 확인
    const passwordStrengthRegex =
      /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordStrengthRegex.test(newPassword)) {
      alert(
        "비밀번호는 영문, 숫자, 특수문자를 포함하여 8자리 이상이어야 합니다."
      );
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5050/user/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      if (response.ok) {
        alert("비밀번호가 성공적으로 변경되었습니다.");
        handleClose(); // 상태 초기화와 함께 모달 닫기
      } else {
        const errorMessage = await response.text(); // 서버에서 반환한 에러 메시지
        alert(`비밀번호 변경 실패: ${errorMessage}`);
      }
    } catch (error) {
      console.error("비밀번호 변경 실패:", error);
      alert("비밀번호 변경에 실패했습니다.");
    }
  };
  // onClose에서 상태 초기화
  const handleClose = () => {
    setCurrentPassword(""); // 현재 비밀번호 초기화
    setNewPassword(""); // 새 비밀번호 초기화
    setConfirmPassword(""); // 새 비밀번호 확인 초기화
    onClose(); // 모달 닫기
  };

  if (!isOpen) return null; // 모달이 닫혀 있으면 렌더링하지 않음

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>비밀번호 변경</h2>
        <label>
          현재 비밀번호:
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </label>
        <label>
          새 비밀번호:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <label>
          새 비밀번호 확인:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
        <div className="modal-buttons">
          <button onClick={handleChangePassword}>변경하기</button>
          <button onClick={handleClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
