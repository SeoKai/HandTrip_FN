import React, { useEffect, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./PlanTrip.css";
import MapRenderer from "../../component/PlanTrip/MapRenderer";
import usePlanData from "../../component/PlanTrip/usePlanData";

function PlanTrip() {
  // Google Maps API 로드
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyAYc6jUgnI_Az0LTuoHvfS_Y-iTG4FX8dg", // API 키
  });

  // 네비게이션과 위치 상태
  const navigate = useNavigate();
  const location = useLocation();
  const { cityName, regionId, startDate, endDate } = location.state || {};

  // 상태 변수
  const [plannerTitle, setPlannerTitle] = useState(""); // 사용자 입력 상태
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false); // 플랜 저장 모달 상태
  const [center, setCenter] = useState({ lat: 35.6895, lng: 139.6917 }); // 지도 중심
  const [dailyPlans, setDailyPlans] = useState({}); // 날짜별 장소 상태
  const [selectedPlace, setSelectedPlace] = useState(null); // InfoWindow에서 표시할 선택된 장소
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태
  const [selectedDay, setSelectedDay] = useState(null); // 선택된 Day
  const [showPlaceList, setShowPlaceList] = useState(false); // 장소 목록 표시 여부
  const [categoryFilter, setCategoryFilter] = useState("전체"); // 필터링된 카테고리
  const [expandedPlaceId, setExpandedPlaceId] = useState(null); // 확장된 장소 ID 상태
  const [selectedCategory, setSelectedCategory] = useState("전체"); // 선택된 카테고리 저장
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [routePath, setRoutePath] = useState([]); // 폴리라인 경로 상태 변수

  // 장소 데이터 가져오기
  const { locations, totalPages } = usePlanData(
    regionId,
    currentPage,
    searchTerm,
    categoryFilter
  );

  // dailyPlans 상태 변경 감지 및 Marker 렌더링
  useEffect(() => {
    const allPlaces = Object.values(dailyPlans).flat();
    console.log("All places:", allPlaces); // 모든 장소 확인

    const validPath = allPlaces
      .filter(
        (place) =>
          place.latitude &&
          place.longitude &&
          !isNaN(parseFloat(place.latitude)) &&
          !isNaN(parseFloat(place.longitude)) &&
          parseFloat(place.latitude) >= -90 &&
          parseFloat(place.latitude) <= 90 &&
          parseFloat(place.longitude) >= -180 &&
          parseFloat(place.longitude) <= 180
      )
      .map((place) => ({
        lat: parseFloat(place.latitude),
        lng: parseFloat(place.longitude),
      }));

    console.log("Valid path for polyline:", validPath); // 유효한 경로 디버깅
    setRoutePath(validPath);
  }, [dailyPlans]);

  useEffect(() => {
    if (startDate && endDate) {
      const dates = generateDatesBetween(startDate, endDate);
      const initialDailyPlans = {};
      dates.forEach((date) => (initialDailyPlans[date] = []));
      setDailyPlans(initialDailyPlans);
    }
  }, [startDate, endDate]);

  // 시작일과 종료일 사이의 날짜 생성 함수
  const generateDatesBetween = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(`${startDate}T00:00:00`); // UTC 시간으로 고정
    const endDateObj = new Date(`${endDate}T00:00:00`); // UTC 시간으로 고정

    while (currentDate <= endDateObj) {
      // 시간 정보를 제거하고 날짜만 저장
      const dateStr = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
      dates.push(dateStr);
      currentDate.setDate(currentDate.getDate() + 1); // 하루씩 증가
    }
    return dates;
  };

  const formatToLocalDate = (utcDateStr) => {
    const utcDate = new Date(`${utcDateStr}T00:00:00Z`);
    const localYear = utcDate.getFullYear();
    const localMonth = String(utcDate.getMonth() + 1).padStart(2, "0");
    const localDay = String(utcDate.getDate()).padStart(2, "0");
    return `${localYear}-${localMonth}-${localDay}`;
  };

  // 장소의 세부 정보를 확장하거나 접는 함수
  const toggleExpand = (placeId) => {
    setExpandedPlaceId((prevId) => (prevId === placeId ? null : placeId));
  };

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (category) => {
    setSelectedCategory(category); // 선택된 카테고리 상태 업데이트
    setCategoryFilter(category); // 필터 상태 업데이트
    setCurrentPage(1); // 페이지 초기화
  };

  // 여행지 추가 버튼 클릭 시 장소 목록 표시
  const handleShowPlaceList = (day) => {
    setSelectedDay(day); // 선택된 Day 설정
    setShowPlaceList(true); // 장소 목록 표시
  };

  // 날짜별 장소 추가 핸들러
  const handleAddPlace = (place) => {
    if (!selectedDay) return; // 선택된 Day가 없으면 리턴

    setDailyPlans((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), place],
    }));
    setCenter({ lat: place.latitude, lng: place.longitude });
    // setShowPlaceList(false); // 장소를 추가한 후 목록 닫기
  };

  // 날짜별 장소 삭제 핸들러
  const handleRemovePlace = (date, locationId) => {
    // 알람 추가
    const isConfirmed = window.confirm("정말로 이 장소를 삭제하시겠습니까?");

    if (isConfirmed) {
      setDailyPlans((prev) => ({
        ...prev,
        [date]: prev[date].filter((p) => p.locationId !== locationId),
      }));
      alert("장소가 삭제되었습니다.");
    }
  };

  // 마커 클릭 (InfoWindow 열기)
  const handleMarkerClick = (place) => {
    setSelectedPlace(place);
  };

  const colors = [
    // 빨강 (Red)
    "#D63131",
    "#E17055",
    "#FF7676",
    // 주황 (Orange)
    "#FDBC6E",
    // 노랑 (Yellow)
    "#FFEAA7",
    // 초록 (Green)
    "#00B894",
    "#00CEC9",
    // 파랑 (Blue)
    "#0984E3",
    "#55EFC4",
    "#81ECEC",
    // 남색 (Indigo)
    "#74B9FF",
    // 보라 (Violet)
    "#6C5CE7",
    "#A29BFE",
    "#EB4493",
    "#FD79A8",
  ];

  // InfoWindow 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlace(null);
  };

  // 플랜 저장 핸들러
  const handleSavePlan = async () => {
    if (!plannerTitle.trim()) {
      alert("플래너 제목을 입력해주세요.");
      return;
    }

    const plannerData = {
      plannerTitle: plannerTitle || `${cityName} 여행 계획`,
      plannerStartDate: startDate,
      plannerEndDate: endDate,
      regionName: cityName,
      dailyPlans: Object.entries(dailyPlans).map(([date, places]) => ({
        planDate: date,
        toDos: places.map((place) => ({
          locationId: place.locationId,
          locationName: place.locationName,
          formattedAddress: place.formattedAddress,
          latitude: place.latitude,
          longitude: place.longitude,
          placeImgUrl: place.placeImgUrl || "/images/placeholder.jpg", // 기본 이미지 포함
        })),
      })),
    };

    console.log("전송할 Planner Data:", plannerData); // 전송 데이터 확인

    try {
      const token = localStorage.getItem("accessToken"); // 토큰 가져오기

      if (!token) {
        alert("로그인이 필요한 서비스입니다.");
        return;
      }
      const response = await axios.post(
        "http://13.209.114.27:5050/api/planner/save",
        plannerData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // 토큰 헤더에 추가
          },
        }
      );
      console.log("서버 응답 데이터:", response.data); // 서버 응답 확인
      const savedPlannerId = response.data;
      console.log("플랜 저장 성공:", plannerData);
      alert("플랜이 성공적으로 저장되었습니다!");

      // ViewPlan 페이지로 이동하면서 데이터 전달
      navigate(`/view-plan/${savedPlannerId}`);
    } catch (error) {
      console.error("플랜 저장 실패:", error);
      alert("플랜 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaveModalOpen(false); // 모달 닫기
    }
  };

  // 데이터 로딩 상태
  if (!isLoaded) return <p>Loading...</p>;

  return (
    <div className="planTripContainer">
      <div className="mainContent">
        <div className="selectedList">
          <div className="scheduleHeader">
            <h3>{cityName} 일정 계획하기</h3>
          </div>
          {Object.entries(dailyPlans).map(([date, places], index) => (
            <div key={date} className="dailyPlanContainer">
              <div className="dayHeader">
                <h4 style={{ display: "flex", alignItems: "center" }}>
                  Day {index + 1} {/* Day 텍스트 뒤에 마커 추가 */}
                  <span
                    dangerouslySetInnerHTML={{
                      __html: `
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                width="30" 
                height="30" 
                style="
                  margin-left: 4px; /* Day 텍스트와 마커 간격 */
                  position: relative; /* 마커 위치 조정 */
                  top: 3px; /* 마커 전체를 아래로 살짝 이동 */
                ">
                <path 
                <path
         fill="${colors[index % colors.length]}"
         d="M12 2C8.13 2 5 5.13 5 9c0 4.67 7 13 7 13s7-8.33 7-13c0-3.87-3.13-7-7-7z"
            />
                <text 
                  x="12" 
                  y="11" /* 숫자를 마커의 중심에 배치 */
                  fill="white" 
                  font-size="8" 
                  font-weight="bold" 
                  text-anchor="middle" 
                  alignment-baseline="middle">${index + 1}</text>
              </svg>
            `,
                    }}
                  ></span>
                </h4>
                <span className="dateLabel">{formatToLocalDate(date)}</span>
              </div>

              <button
                className={`addPlaceButton ${
                  selectedDay === date ? "active" : ""
                }`}
                onClick={() => handleShowPlaceList(date)}
              >
                여행지 추가 +
              </button>

              {places.length > 0 && (
                <ul className="addedPlacesList">
                  {places.map((place) => (
                    <li key={place.locationId} className="selectedPlaceCard">
                      <img
                        src={place.placeImgUrl || "/images/placeholder.jpg"}
                        alt={place.locationName}
                        className="placeImage"
                      />
                      <div className="placeText">
                        <span>{place.locationName}</span>
                      </div>
                      <button
                        onClick={() =>
                          handleRemovePlace(date, place.locationId)
                        }
                      >
                        삭제
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <button
            className="plan-button"
            onClick={() => setIsSaveModalOpen(true)}
          >
            플랜 저장
          </button>
        </div>
        {/* 플랜 저장 모달 */}
        {isSaveModalOpen && (
          <div
            className="modalOverlay"
            onClick={() => setIsSaveModalOpen(false)}
          >
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
              <h3>플래너 제목을 입력해주세요.</h3>
              <input
                type="text"
                value={plannerTitle}
                onChange={(e) => setPlannerTitle(e.target.value)}
                placeholder={`${cityName} 여행 계획`}
                className="plannerTitleInput"
              />
              <div className="modalButtons">
                <button className="SaveTitleButton" onClick={handleSavePlan}>
                  저장
                </button>
                <button
                  className="CancellationButton"
                  onClick={() => setIsSaveModalOpen(false)}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {showPlaceList && (
          <div className="placeList">
            <h3>장소 목록</h3>
            <input
              type="text"
              placeholder="여행지를 검색하세요."
              className="searchBar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="categoryTags">
              {["전체", "관광명소", "음식", "쇼핑", "문화", "랜드마크"].map(
                (category) => (
                  <button
                    key={category}
                    className={`categoryTag ${
                      selectedCategory === category ? "selected" : ""
                    }`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {selectedCategory === category ? category : `#${category}`}
                  </button>
                )
              )}
            </div>
            <ul>
              {locations
                .filter(
                  (place) =>
                    !(dailyPlans[selectedDay] || []).some(
                      (addedPlace) => addedPlace.locationId === place.locationId
                    )
                )
                .map((place) => (
                  <li key={place.locationId} className="placeItem">
                    <img
                      src={place.placeImgUrl || "/images/placeholder.jpg"}
                      alt={place.locationName}
                      className="placeImage"
                    />
                    <div className="placeInfo">
                      <div className="placeDetails">
                        <span className="placeName">{place.locationName}</span>
                        <p className="placeRating">
                          평점: ⭐ {place.googleRating || "정보 없음"}
                        </p>
                        <p className="placeAddress">{place.formattedAddress}</p>
                        {expandedPlaceId === place.locationId && (
                          <p className="placeDescription">
                            {place.description || "상세 설명이 없습니다."}
                          </p>
                        )}
                        <span
                          className="toggleText"
                          onClick={() => toggleExpand(place.locationId)}
                        >
                          {expandedPlaceId === place.locationId
                            ? "접기"
                            : "더보기"}
                        </span>
                      </div>
                      <button
                        className="addButton"
                        onClick={() => handleAddPlace(place)}
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
            </ul>

            <div className="planLoadMoreContainer">
              {currentPage < totalPages && (
                <button
                  className="planLoadMoreButton"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  더보기
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mapContainer">
          <MapRenderer
            center={center}
            markers={Object.values(dailyPlans).flatMap((places, dayIndex) =>
              places.map((place, index) => ({
                ...place,
                color: colors[dayIndex % colors.length], // Day별 색상 적용
                glyph: `${index + 1}`, // 각 Day 내에서 1부터 시작하는 숫자
              }))
            )}
            routes={Object.values(dailyPlans).map((places, dayIndex) => ({
              color: colors[dayIndex % colors.length], // Day별 경로 색상
              path: places.map((place) => ({
                lat: place.latitude,
                lng: place.longitude,
              })),
            }))}
            selectedPlace={selectedPlace}
            onMarkerClick={handleMarkerClick}
            onCloseInfoWindow={handleCloseModal}
          />

          <div className="categoryTags">
            {["전체", "관광명소", "음식", "쇼핑", "문화", "랜드마크"].map(
              (category) => (
                <button
                  key={category}
                  className={`categoryTag ${
                    selectedCategory === category ? "selected" : ""
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {selectedCategory === category ? category : `#${category}`}
                </button>
              )
            )}
          </div>
          <ul>
            {locations
              .filter(
                (place) =>
                  !(dailyPlans[selectedDay] || []).some(
                    (addedPlace) => addedPlace.locationId === place.locationId
                  )
              )
              .map((place) => (
                <li key={place.locationId} className="placeItem">
                  <img
                    src={place.placeImgUrl || "/images/placeholder.jpg"}
                    alt={place.locationName}
                    className="placeImage"
                  />
                  <div className="placeInfo">
                    <div className="placeDetails">
                      <span className="placeName">{place.locationName}</span>
                      <p className="placeRating">
                        평점: ⭐ {place.googleRating || "정보 없음"}
                      </p>
                      <p className="placeAddress">{place.formattedAddress}</p>
                      {expandedPlaceId === place.locationId && (
                        <p className="placeDescription">
                          {place.description || "상세 설명이 없습니다."}
                        </p>
                      )}
                      <span
                        className="toggleText"
                        onClick={() => toggleExpand(place.locationId)}
                      >
                        {expandedPlaceId === place.locationId
                          ? "접기"
                          : "더보기"}
                      </span>
                    </div>
                    <button
                      className="addButton"
                      onClick={() => handleAddPlace(place)}
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
          </ul>

          <div className="plantripLoadMoreContainer">
            {currentPage < totalPages && (
              <button
                className="plantripLoadMoreButton"
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                더보기
              </button>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && selectedPlace && (
        <div className="modalOverlay" onClick={handleCloseModal}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedPlace.locationName}</h2>
            <p>주소: {selectedPlace.formattedAddress}</p>
            <button onClick={handleCloseModal}>닫기</button>
          </div>
        </div>
      )}
      <div className="mapContainer">
        <MapRenderer
          center={center}
          markers={Object.values(dailyPlans).flat()}
          selectedPlace={selectedPlace}
          onMarkerClick={handleMarkerClick}
          onCloseInfoWindow={handleCloseModal}
          polylinePath={routePath}
        />
      </div>
    </div>
  );
}

export default PlanTrip;
