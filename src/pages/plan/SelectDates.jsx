import React from 'react';
import { useLocation } from 'react-router-dom';
import Calendar from 'react-calendar'; // react-calendar 라이브러리 사용 (설치 필요)
import 'react-calendar/dist/Calendar.css'; // 기본 스타일 적용

function SelectDates() {
    const location = useLocation();
    const { cityName } = location.state || { cityName: '도시' };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>{cityName} 여행 날짜를 선택하세요</h2>
            <Calendar />
        </div>
    );
}

export default SelectDates;
