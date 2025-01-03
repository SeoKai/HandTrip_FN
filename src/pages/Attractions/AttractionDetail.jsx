import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import axios from "axios";
import "./AttractionDetail.css";
import ReviewCreateModal from "../../component/ReviewCreateModal";
import arrowSmallLeft from "../../img/icons/arrowSmallLeft.png";
import starColor from "../../img/icons/starColor.png";
import star from "../../img/icons/star.png";
import angleSmallLeft from "../../img/icons/angleSmallLeft.png";
import angleSmallRight from "../../img/icons/angleSmallRight.png";

const AttractionDetail = () => {
  // 여행지 상세 정보 불러오기
  const { locationId } = useParams(); // URL에서 locationId 파라미터를 받아옵니다.
  const [location, setLocation] = useState(null); // 장소의 상세 정보 상태
  const [locationLoading, setLocationLoading] = useState(true); // 로딩 상태

  // 근처 여행지를 불러 오는대 필요한 값
  const [latitude, setLatitude] = useState(null); // 위도
  const [longitude, setLongitude] = useState(null); // 경도
  const [distance, setDistance] = useState(5); // 근처 장소를 찾을 최대 거리 (기본값: 5km)

  // 불러온 주위 여행지 정보
  const [targetTagName, setTargetTagName] = useState("음식"); // 예시로 "음식" 태그 필터링
  const [nearbyLocationsExcludeTag, setNearbyLocationsExcludeTag] =
    useState(null);
  const [nearbyLocationsIncludeTag, setNearbyLocationsIncludeTag] =
    useState(null);

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // 불러온 리뷰 정보
  const [reviews, setReviews] = useState([]);
  const [userProfiles, setUserProfiles] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [totalReviews, setTotalReviews] = useState(null);

  // 리뷰 정렬 옵션
  const [sortCriteria, setSortCriteria] = useState("reviewCreatedAt"); // 기본 정렬 기준
  const [sortDirection, setSortDirection] = useState("desc"); // 기본 정렬 방향

  // 페이지 관련
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수

  // 뒤로가기
  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate("/attractions"); // 이전 페이지로 이동
  };

  // 장소 상세 정보 요청
  useEffect(() => {
    const fetchLocationDetail = async () => {
      try {
        const response = await axios.get(
          `http://13.209.114.27:5050/api/locations/${locationId}`
        );
        setLocation(response.data); // 받아온 장소 상세 정보를 상태에 저장
        setLatitude(response.data.latitude); // 위도 설정
        setLongitude(response.data.longitude); // 경도 설정
      } catch (error) {
        console.error("Error fetching location details:", error);
      } finally {
        setLocationLoading(false); // 로딩 완료
      }
    };

    fetchLocationDetail(); // 상세 정보 요청
  }, [locationId]); // locationId가 변경될 때마다 다시 요청

  // 근처 장소 정보 요청
  useEffect(() => {
    if (latitude && longitude) {
      const fetchNearbyLocations = async () => {
        try {
          const response = await axios.get(
            `http://13.209.114.27:5050/api/locations/getNearby`,
            {
              params: {
                latitude,
                longitude,
                distance,
                sortValue: "googleRating", // 구글 평점 기준으로 정렬
                sortDirection: "desc", // 내림차순
                targetTagName: targetTagName,
              },
            }
          );

          // console.log(response.data)

          // locationResponseDtoExcludeTag와 locationResponseDtoIncludeTag 배열 모두에 대해 km를 m 변환
          const excludeTagLocationsWithDistance =
            response.data.locationResponseDtoExcludeTag
              .map((location) => ({
                ...location,
                distanceInMeters: Math.round(location.distance * 1000),
              }))
              .filter((location) => location.distanceInMeters > 0);

          const includeTagLocationsWithDistance =
            response.data.locationResponseDtoIncludeTag
              .map((location) => ({
                ...location,
                distanceInMeters: Math.round(location.distance * 1000),
              }))
              .filter((location) => location.distanceInMeters > 0);

          // 두 배열을 각각 상태에 저장
          setNearbyLocationsExcludeTag(excludeTagLocationsWithDistance);
          setNearbyLocationsIncludeTag(includeTagLocationsWithDistance);
        } catch (error) {
          console.error("Error fetching nearby locations:", error);
        }
      };

      fetchNearbyLocations(); // 근처 장소 요청
    }
  }, [latitude, longitude, distance]); // 위도, 경도, 거리 변경 시마다 요청

  // 리뷰 요청 함수
  const fetchReviews = async (pageNumber = 0) => {
    try {
      const accessToken = localStorage.getItem("accessToken"); // 액세스 토큰 가져오기
      const response = await axios.get(
        "http://13.209.114.27:5050/reviews/getReviewsWithUser",
        {
          // headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            locationId,
            page: pageNumber,
            pageSize: 5, // 페이지 크기
            sortValue: sortCriteria, // 정렬 기준
            sortDirection, // 정렬 방향
          },
        }
      );

      if (response && response.data) {
        const reviewWithUserProfileDtoList =
          response.data._embedded?.reviewWithUserProfileDtoList || []; // 데이터가 없으면 빈 배열

        // 리뷰와 사용자 프로필 데이터를 분리하여 저장
        const reviewList = reviewWithUserProfileDtoList.map(
          (item) => item.reviewDto
        );
        const userProfileList = reviewWithUserProfileDtoList.map(
          (item) => item.userProfileDto
        );

        setReviews(reviewList);
        setUserProfiles(userProfileList);
        setTotalPages(response.data.page.totalPages); // 전체 페이지 수 저장
        setTotalReviews(response.data.page.totalElements); // 전체 리뷰 수 저장
        setCurrentPage(pageNumber); // 현재 페이지 업데이트
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]); // 에러 발생 시 빈 배열로 설정
      setUserProfiles([]);
    } finally {
      setReviewLoading(false); // 로딩 상태 해제
    }
  };

  // 리뷰 요청 호출
  useEffect(() => {
    fetchReviews(0); // 첫 페이지 데이터 요청
  }, [locationId, sortCriteria, sortDirection]); // 정렬 옵션이 변경될 때마다 호출

  // 정렬 버튼 클릭 핸들러
  const handleSort = (criteria) => {
    if (sortCriteria === criteria) {
      // 기준이 같으면 방향을 토글
      setSortDirection((prevDirection) =>
        prevDirection === "asc" ? "desc" : "asc"
      );
    } else {
      // 기준이 다르면 새 기준으로 설정하고 방향은 내림차순으로 초기화
      setSortCriteria(criteria);
      setSortDirection("desc");
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setReviewLoading(true); // 로딩 상태로 전환
      fetchReviews(pageNumber); // 해당 페이지 데이터 요청
    }
  };

  const handleReviewSuccess = (status) => {
    if (status === "success") {
      fetchReviews(); // 리뷰 목록 갱신
    }
  };

  // 리뷰 작성 버튼 클릭 핸들러
  const handleReviewClick = () => {
    const accessToken = localStorage.getItem("accessToken"); // 인증 정보 확인
    if (!accessToken) {
      alert("로그인이 필요한 서비스입니다."); // 경고창 표시
      return;
    }
    // 인증된 사용자만 리뷰 작성 로직 실행
    openModal(); // 모달 열기
  };

  // Google Maps API를 로드하는 훅
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyAYc6jUgnI_Az0LTuoHvfS_Y-iTG4FX8dg", // 발급받은 API 키 입력
  });

  // 로딩 중일 경우
  if (locationLoading) {
    return <div>Loading...</div>;
  }
  // 장소 상세 정보가 없을 경우
  if (!location) {
    return <div>No details available for this location.</div>;
  }

  return (
    <div className="AttractionDetail">
      <div className="title-container">
        {/* 장소 상세 정보 표시 */}
        <img
          src={arrowSmallLeft}
          alt="뒤로가기"
          className="back"
          onClick={handleBackClick} // 클릭 이벤트 추가
        />
        <div className="title">
          <h2>{location.locationName}</h2>
          <h3>{location.regionName}</h3>
        </div>
      </div>
      <div className="overview-container">
        <div className="inner-wrap">
          <img src={location.placeImgUrl} alt={location.locationName} />
          <div className="overview-info">
            <h2>{location.locationName}</h2>
            <p>{"#" + location.tags.join(" #")}</p>
            <div className="overview-info-item">
              <h4>소개</h4>
              <p>{location.description}</p>
            </div>
            <div className="overview-info-item">
              <h4>별점 및 리뷰</h4>
              <p>
                <img
                  src={starColor}
                  alt="별 아이콘"
                  className="star-icon"
                  style={{ width: "14px" }}
                />
                <span>{location.googleRating}</span>
                <span>({location.userRatingsTotal} 건의 리뷰)</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="content-container">
        <h4>정보</h4>
        {/* 지도 로딩 여부 확인 */}
        {isLoaded ? (
          <GoogleMap
            className="map"
            center={{ lat: latitude, lng: longitude }} // 지도 중심을 메인 장소로 설정
            zoom={15} // 지도 확대 비율
            mapContainerStyle={{ width: "100%", height: "400px" }} // 지도 스타일
            options={{
              disableDefaultUI: true, // 기본 UI 요소 숨기기 (지도 컨트롤, 확대/축소 등)
              scrollwheel: false, // 마우스 휠로 지도 이동 방지
              draggable: false, // 지도 드래그 이동 방지
              gestureHandling: "none", // 제스처로 지도 이동 방지
              // disableDefaultUI: true,  // 기본 UI 요소 비활성화
              clickableIcons: false, // 기본 아이콘 클릭 방지
            }}
          >
            {/* 고정된 마커 추가 */}
            <Marker
              position={{ lat: latitude, lng: longitude }}
              draggable={false} // 마커 이동 비활성화
            />
          </GoogleMap>
        ) : (
          <div>Loading map...</div>
        )}
        <div className="info">
          <div className="info-item">
            <h4>전화번호</h4>
            <span>{location.phoneNumber}</span>
          </div>
          <div className="info-item">
            <h4>운영 시간</h4>
            <span>{location.openingHours}</span>
          </div>
          <div className="info-item">
            <h4>주소</h4>
            <span>{location.formattedAddress}</span>
          </div>
          <div className="info-item">
            <h4>웹사이트 주소</h4>
            <a
              href={location.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {location.website}
            </a>
          </div>
        </div>

        {/* 주변장소 컨테이너 */}
        <div className="nearby-locations-container">
          {/* 태그가 포함되지 않은 근처 장소 */}
          <h4>주위의 여행지</h4>
          {nearbyLocationsExcludeTag?.length > 0 ? (
            <ul className="nearby-locations-list">
              {nearbyLocationsExcludeTag.slice(0, 4).map((nearbyLocation) => (
                <li
                  key={nearbyLocation.locationId}
                  className="nearby-location-item"
                >
                  {/*<Link to={`/attractionDetail/${nearbyLocation.locationId}`} className="nearby-link">*/}
                  <a
                    href={`/attractionDetail/${nearbyLocation.locationId}`}
                    rel="noopener noreferrer"
                    className="nearby-link"
                  >
                    <img
                      src={nearbyLocation.placeImgUrl}
                      alt={nearbyLocation.locationName}
                    />
                    <h4>{nearbyLocation.locationName}</h4>
                    <p>{nearbyLocation.regionName}</p>
                    <p>
                      <img
                        src={starColor}
                        alt="별 아이콘"
                        className="star-icon"
                      />
                      <span>{nearbyLocation.googleRating}</span>(
                      {nearbyLocation.userRatingsTotal})
                    </p>
                    <p>거리 {nearbyLocation.distanceInMeters} m</p>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-nearby-locations-message">
              주위에 여행지가 없습니다.
            </p>
          )}

          {/* 태그가 포함된 근처 장소 */}
          <h4>주위의 음식점</h4>
          {nearbyLocationsIncludeTag?.length > 0 ? (
            <ul className="nearby-locations-list">
              {nearbyLocationsIncludeTag.slice(0, 4).map((nearbyLocation) => (
                <li
                  key={nearbyLocation.locationId}
                  className="nearby-location-item"
                >
                  <Link
                    to={`/attractionDetail/${nearbyLocation.locationId}`}
                    className="nearby-link"
                  >
                    <img
                      src={nearbyLocation.placeImgUrl}
                      alt={nearbyLocation.locationName}
                    />
                    <h4>{nearbyLocation.locationName}</h4>
                    <p>{nearbyLocation.regionName}</p>
                    <p>
                      <img
                        src={starColor}
                        alt="별 아이콘"
                        className="star-icon"
                      />
                      <span>{nearbyLocation.googleRating}</span>(
                      {nearbyLocation.userRatingsTotal})
                    </p>
                    <p>거리 {nearbyLocation.distanceInMeters} m</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-nearby-locations-message">
              주위에 음식점이 없습니다.
            </p>
          )}
        </div>

        {isModalOpen && (
          <div className="modal-backdrop">
            <ReviewCreateModal
              locationId={locationId}
              onClose={closeModal}
              onSuccess={handleReviewSuccess} // onSuccess 전달
            />
          </div>
        )}

        {/* 리뷰 영역 */}
        <div className="review-container">
          <div className="review-section">
            {/* 상단 헤더 영역 */}
            <div className="review-header">
              {/*  총 리뷰수 */}
              <h3 className="review-header-title">
                리뷰 (총 <span>{totalReviews}</span>건 )
              </h3>
              <div className="review-header-actions">
                {/* 좌측: 정렬 옵션 */}
                <div className="review-header-sort">
                  <button
                    className={
                      sortCriteria === "reviewCreatedAt"
                        ? "sort-button active"
                        : "sort-button"
                    }
                    onClick={() => handleSort("reviewCreatedAt")}
                  >
                    {`최신순 ${
                      sortCriteria === "reviewCreatedAt"
                        ? sortDirection === "asc"
                          ? "△"
                          : "▽"
                        : ""
                    }`}
                  </button>
                  <button
                    className={
                      sortCriteria === "rating"
                        ? "sort-button active"
                        : "sort-button"
                    }
                    onClick={() => handleSort("rating")}
                  >
                    {`별점순 ${
                      sortCriteria === "rating"
                        ? sortDirection === "asc"
                          ? "△"
                          : "▽"
                        : ""
                    }`}
                  </button>
                  <div className="sort-divider" />
                </div>
                {/* 우측: 리뷰 작성 버튼 */}
                <button
                  className="review-header-button"
                  onClick={handleReviewClick}
                >
                  리뷰 작성하기
                </button>
              </div>
            </div>

            {/* 2. 중간 메인 영역 */}
            <div className="review-main">
              {reviewLoading ? (
                <p>리뷰를 불러오는 중입니다...</p>
              ) : reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={review.reviewId} className="review-item">
                    {/* 사용자 정보 */}
                    <div className="review-user-info">
                      <div className="user-profile-img">
                        <img
                          src={userProfiles[index]?.profileImageUrl || ""}
                          // alt={`${userProfiles[index]?.userNickname || "익명"}의 프로필 이미지`}
                        />
                      </div>
                      <p className="user-nickname">
                        {userProfiles[index].userNickname}
                      </p>
                    </div>

                    {/* 리뷰 내용 */}
                    <div className="review-content">
                      <div className="review-rating">
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <img
                              key={i}
                              src={i < review.rating ? starColor : star}
                              alt={i < review.rating ? "채워진 별" : "빈 별"}
                              className="star-icon"
                              style={{ width: "14px" }}
                            />
                          ))}
                      </div>
                      <h4 className="review-title">{review.title}</h4>
                      <p className="review-text">{review.comment}</p>
                      {/* 리뷰 이미지 */}
                      <div className="review-images">
                        {review.imageUrls.map((url, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={url || ""}
                            alt={`리뷰 이미지 ${imgIndex + 1}`}
                          />
                        ))}
                      </div>
                      <p className="review-date">
                        {new Date(review.reviewCreatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-nearby-locations-message">
                  작성된 리뷰가 없습니다.
                </p>
              )}
            </div>

            {/* 3. 하단 푸터 영역 */}
            <div className="review-footer">
              <button
                className="pagination-button"
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <img src={angleSmallLeft} alt="이전" />
              </button>

              {/* 앞쪽 '...' 표시 */}
              {currentPage > 2 && (
                <span className="pagination-ellipsis">...</span>
              )}

              {/* 페이지 버튼 표시 */}
              {(() => {
                const startPage = Math.max(
                  0,
                  Math.min(currentPage - 2, totalPages - 5)
                );
                const endPage = Math.min(startPage + 5, totalPages);
                return Array.from(
                  { length: endPage - startPage },
                  (_, i) => startPage + i
                ).map((page) => (
                  <button
                    key={page}
                    className={`pagination-button ${
                      page === currentPage ? "active" : ""
                    }`}
                    onClick={() => handlePageChange(page)}

                    // disabled={page === currentPage} // 현재 페이지 비활성화
                  >
                    {page + 1}
                  </button>
                ));
              })()}

              {/* 뒤쪽 '...' 표시 */}
              {currentPage < totalPages - 3 && (
                <span className="pagination-ellipsis">...</span>
              )}

              <button
                className="pagination-button"
                disabled={currentPage === totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <img src={angleSmallRight} alt="다음" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttractionDetail;
