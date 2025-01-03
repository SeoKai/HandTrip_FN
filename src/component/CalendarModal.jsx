import React, { useState } from 'react';
import './CalendarModal.css';
import { useNavigate } from 'react-router-dom';

const CalendarModal = ({ show, onClose, cityName, regionId }) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedRange, setSelectedRange] = useState([]); // 연속된 날짜 선택
    const navigate = useNavigate();

    // 요일 배열
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // 공휴일 목록
    const holidays = [
        { month: 1, day: 1, name: "New Year's Day" },
        { month: 3, day: 1, name: 'Independence Movement Day' },
        { month: 5, day: 5, name: "Children's Day" },
        { month: 6, day: 6, name: 'Memorial Day' },
        { month: 8, day: 15, name: 'Liberation Day' },
        { month: 10, day: 3, name: 'National Foundation Day' },
        { month: 10, day: 9, name: 'Hangul Day' },
        { month: 12, day: 25, name: 'Christmas Day' },
    ];

    // 현재 월의 첫 번째 날이 무슨 요일인지 확인
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    // 현재 월의 총 일수 확인
    const getDaysInMonth = (year, month) =>
        new Date(year, month + 1, 0).getDate();

    // 달력의 날짜를 생성하는 함수 (이전 달과 다음 달 날짜 포함)
    const generateCalendarDays = () => {
        const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

        const calendarDays = [];

        // 이전 달의 날짜 채우기
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            calendarDays.push({ day: prevMonthDays - i, type: 'prev' });
        }

        // 현재 달의 날짜 채우기
        for (let day = 1; day <= daysInMonth; day++) {
            calendarDays.push({ day, type: 'current' });
        }

        // 다음 달의 날짜 채우기
        const remainingSpaces = 7 - (calendarDays.length % 7);
        if (remainingSpaces < 7) {
            for (let i = 1; i <= remainingSpaces; i++) {
                calendarDays.push({ day: i, type: 'next' });
            }
        }

        return calendarDays;
    };

    const calendarDays = generateCalendarDays();

    // 공휴일인지 확인하는 함수
    const isHoliday = (day) =>
        holidays.some(
            (holiday) => holiday.month === currentMonth + 1 && holiday.day === day
        );

    const onDateClick = (day, type) => {
        let clickedDate;

        // 클릭된 날짜 유형에 따라 clickedDate 설정
        if (type === 'prev') {
            // 이전 달의 날짜를 클릭한 경우
            clickedDate = new Date(currentYear, currentMonth - 1, day);
        } else if (type === 'next') {
            // 다음 달의 날짜를 클릭한 경우
            clickedDate = new Date(currentYear, currentMonth + 1, day);
        } else {
            // 현재 달의 날짜를 클릭한 경우
            clickedDate = new Date(currentYear, currentMonth, day);
        }

        // 선택된 날짜 범위가 비어있으면 클릭한 날짜를 첫 번째로 설정
        if (selectedRange.length === 0) {
            setSelectedRange([clickedDate]);
        }
        // 선택된 날짜 범위가 하나의 날짜만 있을 경우, 클릭한 날짜와 기존 날짜로 범위 설정
        else if (selectedRange.length === 1) {
            const newRange = [selectedRange[0], clickedDate].sort((a, b) => a - b);
            setSelectedRange(newRange);
        }
        // 선택된 범위가 이미 두 날짜로 설정되어 있으면 새로 선택 시작
        else {
            setSelectedRange([clickedDate]);
        }
    };

    const isInRange = (day, type) => {
        let dateToCheck;

        // 날짜 유형에 따라 dateToCheck 설정
        if (type === 'prev') {
            // 이전 달의 날짜를 생성
            dateToCheck = new Date(currentYear, currentMonth - 1, day);
        } else if (type === 'next') {
            // 다음 달의 날짜를 생성
            dateToCheck = new Date(currentYear, currentMonth + 1, day);
        } else {
            // 현재 달의 날짜를 생성
            dateToCheck = new Date(currentYear, currentMonth, day);
        }

        // 선택된 범위가 두 날짜 미만이면 false 반환
        if (selectedRange.length < 2) return false;

        // 날짜가 선택된 범위 안에 있는지 확인
        return dateToCheck >= selectedRange[0] && dateToCheck <= selectedRange[1];
    };

    const formatSelectedRange = () => {
        // 날짜 객체를 'YYYY-MM-DD' 형식으로 포맷하는 함수
        const formatDate = (date) => {
            const year = date.getFullYear(); // 연도 가져오기
            const month = String(date.getMonth() + 1).padStart(2, '0'); // 월 가져오고 두 자리로 포맷 (0부터 시작하므로 +1)
            const day = String(date.getDate()).padStart(2, '0'); // 일 가져오고 두 자리로 포맷
            return `${year}-${month}-${day}`; // 포맷된 문자열 반환
        };

        // 선택된 날짜가 하나일 경우, 단일 날짜 반환
        if (selectedRange.length === 1) {
            return formatDate(selectedRange[0]);
        }
        // 선택된 범위가 두 날짜일 경우, 범위로 포맷된 날짜 반환
        if (selectedRange.length === 2) {
            return `${formatDate(selectedRange[0])} ~ ${formatDate(
                selectedRange[1]
            )}`;
        }
        // 선택된 날짜가 없을 경우 빈 문자열 반환
        return '';
    };

    //   const handleNext = () => {
    //     if (selectedRange.length === 2) {
    //       const [start, end] = selectedRange;

    //       // 유효한 날짜인지 확인
    //       if (
    //         start instanceof Date &&
    //         end instanceof Date &&
    //         !isNaN(start) &&
    //         !isNaN(end)
    //       ) {
    //         const startDate = start.toISOString().split('T')[0];
    //         const endDate = end.toISOString().split('T')[0];

    //         navigate('/plan-trip', {
    //           state: { cityName, regionId, startDate, endDate },
    //         });
    //       } else {
    //         console.error('Invalid date range selected');
    //       }
    //     }
    //   };

    const handleNext = () => {
        if (selectedRange.length === 2) {
            const [start, end] = selectedRange;

            // 날짜를 로컬 시간 기준으로 포맷
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            if (regionId) {
                console.log('전달할 regionId:', regionId); // regionId 값 확인
                navigate('/plan-trip', {
                    state: {
                        cityName,
                        regionId, // 전달할 regionId
                        startDate: formatDate(start), // 로컬 시간 기준
                        endDate: formatDate(end),   // 로컬 시간 기준
                    },
                });
            } else {
                console.error('regionId가 설정되지 않았습니다.');
            }
        } else {
            alert('여행 날짜를 선택해 주세요.');
        }
    };


    // 이전 월로 이동
    const handlePrevMonth = () => {
        setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
        setCurrentYear((prev) => (currentMonth === 0 ? prev - 1 : prev));
    };

    // 다음 월로 이동
    const handleNextMonth = () => {
        setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
        setCurrentYear((prev) => (currentMonth === 11 ? prev + 1 : prev));
    };

    if (!show) return null;

    return (
        <div className="calendar-modal-overlay" onClick={onClose}>
            <div className="calendar-modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>{cityName} 여행 날짜를 선택하세요</h3>
                <div className="month-navigation">
                    <button onClick={handlePrevMonth}>◀</button>
                    <span className="month">
            {currentYear}. {String(currentMonth + 1).padStart(2, '0')}
          </span>
                    <button onClick={handleNextMonth}>▶</button>
                </div>
                <div className="calendar">
                    {/* 요일 헤더 */}
                    {weekdays.map((weekday, index) => (
                        <div key={index} className="weekday">
                            {weekday}
                        </div>
                    ))}

                    {calendarDays.map((item, index) => {
                        const { day, type } = item;
                        let dateToCheck;

                        // 날짜 유형에 따라 dateToCheck 설정
                        if (type === 'prev') {
                            // 이전 달의 날짜
                            dateToCheck = new Date(currentYear, currentMonth - 1, day);
                        } else if (type === 'next') {
                            // 다음 달의 날짜
                            dateToCheck = new Date(currentYear, currentMonth + 1, day);
                        } else {
                            // 현재 달의 날짜
                            dateToCheck = new Date(currentYear, currentMonth, day);
                        }

                        // 오늘 날짜인지 확인
                        const isToday =
                            type === 'current' &&
                            day === today.getDate() &&
                            currentMonth === today.getMonth() &&
                            currentYear === today.getFullYear();

                        // 일요일인지 확인
                        const isSunday = index % 7 === 0;

                        // 토요일인지 확인
                        const isSaturday = index % 7 === 6;

                        // 공휴일인지 확인
                        const holiday = type === 'current' && isHoliday(day);

                        // 선택된 범위 안에 있는 날짜인지 확인
                        const inRange = isInRange(day, type);

                        // 선택된 범위의 시작 날짜인지 확인
                        const isStart =
                            selectedRange.length > 0 &&
                            dateToCheck.getTime() === selectedRange[0].getTime();

                        // 선택된 범위의 끝 날짜인지 확인
                        const isEnd =
                            selectedRange.length === 2 &&
                            dateToCheck.getTime() === selectedRange[1].getTime();

                        return (
                            <div
                                key={index}
                                className={`day 
                ${type === 'prev' ? 'prev-month' : ''}
                ${type === 'next' ? 'next-month' : ''}
                ${isToday ? 'today' : ''}
                ${isSunday ? 'sunday' : ''}
                ${isSaturday ? 'saturday' : ''}
                ${holiday ? 'holiday' : ''}
                ${inRange ? 'in-range' : ''}
                ${isStart ? 'range-start' : ''}
                ${isEnd ? 'range-end' : ''}
            `}
                                onClick={() => onDateClick(day, type)}
                            >
                                {day}
                            </div>
                        );
                    })}
                </div>
                <div className="selected-dates">
                    {selectedRange.length > 0 && (
                        <p>여행 갈 날짜: {formatSelectedRange()}</p>
                    )}
                </div>
                <button onClick={handleNext} className="next-button">
                    다음
                </button>
            </div>
        </div>
    );
};

export default CalendarModal;
