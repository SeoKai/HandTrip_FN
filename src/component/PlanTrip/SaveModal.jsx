import React from 'react';

const SaveModal = ({
  isOpen,
  onClose,
  plannerTitle,
  setPlannerTitle,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <h2>플래너 제목 입력</h2>
        <input
          type="text"
          value={plannerTitle}
          onChange={(e) => setPlannerTitle(e.target.value)}
          placeholder="플래너 제목을 입력하세요"
          className="plannerTitleInput"
        />
        <div className="modalButtons">
          <button onClick={onSave}>저장</button>
          <button onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default SaveModal;
