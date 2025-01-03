import React from 'react';
import './Modal.css';

const Modal = ({ show, onClose, cityInfo }) => {
    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{cityInfo.title}</h2>
                <p>{cityInfo.description}</p>
                <img src={cityInfo.image} alt={cityInfo.title} />
                <button className="close-button" onClick={onClose}>닫기</button>
            </div>
        </div>
    );
};

export default Modal;
