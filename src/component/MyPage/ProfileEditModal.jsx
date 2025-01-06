import React, {useState} from "react";
import Compressor from "compressorjs";
import './ProfileEditModal.css';

const ProfileEditModal = ({
							isOpen,
							setProfileEditModalOpen,
							setChangePasswordModalOpen, // 추가된 Props
							onClose,
							userProfile,
							setUserProfile,
							handleImageUpload,
							updateUserProfile,
							previewImage,
							cancelEdit,
                          }) => {

	if (!isOpen) return null;

	return (
		<div className="ProfileEditModal">
			<div className="profile-edit-modal-overlay">
				<div className="profile-edit-modal-content">
					<div className="profile-edit-header">
						<h2>프로필 수정</h2>
						<button className="modal-close-button"   
						onClick={() => {
							setProfileEditModalOpen(false); // 모달 닫기
							if (onClose) onClose(); // 추가적으로 필요한 동작 실행
						}}>
							X
						</button>
					</div>
					<div className="profile-edit-form">
						<div className="profile-edit-image-container">
							<h3>프로필 이미지</h3>
							<div className="profile-edit-image-content">
								<p className="profile-edit-img">
									<img
										src={
											previewImage ||
											userProfile.profileImageUrl ||
											"https://via.placeholder.com/100"
										}
										alt="Profile"
										className="profile-img"
									/>
								</p>
								<label className="profile-edit-image-label">
									<input
										type="file"
										onChange={(e) => {
											const file = e.target.files ? e.target.files[0] : null;
											if (file) handleImageUpload(file);
										}}
										className="profile-edit-input-file"
									/>
								</label>
							</div>
						</div>
						<div className="profile-edit-nickname-container">
							<h3>닉네임</h3>
							<label className="profile-edit-label">
								<input
									type="text"
									value={userProfile.userNickname}
									onChange={(e) =>
										setUserProfile({
											...userProfile,
											userNickname: e.target.value,
										})
									}
									placeholder="닉네임을 입력하세요"
									className="profile-edit-input"
								/>
							</label>
						</div>
					</div>
					<div className="profile-edit-buttons">
						<button
						onClick={() => {
							setProfileEditModalOpen(false); // 프로필 수정 모달 닫기
							setChangePasswordModalOpen(true); // 비밀번호 변경 모달 열기
							console.log("비밀번호 변경 모달 열기");
						}}
						className="password-change-button"
						>
						비밀번호 변경
						</button>
						<button 
							className="profile-edit-cancel-button"   
							onClick={async () => {
								const success = await updateUserProfile();
								if (success) {
								  alert("프로필이 성공적으로 업데이트되었습니다.");
								  setProfileEditModalOpen(false); // 모달 닫기
								}
							  }}
						>
							취소
						</button>
						<button className="profile-edit-save-button" onClick={updateUserProfile}>
							저장
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfileEditModal;
