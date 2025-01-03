import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../App";
import "./MyPage.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import ReviewCreateModal from "../../component/ReviewCreateModal";
import starColor from "../../img/icons/starColor.png";
import heart from "../../img/icons/heart.png";
import heartFilled from "../../img/icons/heartFilled.png";
import Compressor from "compressorjs";
import ChangePasswordModal from "./ChangePasswordModal";
import angleSmallLeft from "../../img/icons/angleSmallLeft.png";
import angleSmallRight from "../../img/icons/angleSmallRight.png";
import star from "../../img/icons/star.png";

const MyPage = () => {
  const { user } = useContext(AuthContext);
  const [activeOptions, setActiveOptions] = useState(null); // 활성화된 카드의 ID 저장
  const [activeTab, setActiveTab] = useState("plans"); // 기본적으로 '나의 여행 계획' 탭 활성화
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false); // 모달 상태 관리
  const [compressedImage, setCompressedImage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [initialProfileImageUrl, setInitialProfileImageUrl] = useState(""); // 초기 프로필 이미지 URL 저장
  const [showPasswordChangeButton, setShowPasswordChangeButton] =
    useState(false); // 비밀번호 변경 버튼 표시 여부

  // 사용자가 업로드한 이미지를 압축함
  const handleImageUpload = (file) => {
    if (!file) {
      console.log("업로드할 파일이 없습니다.");
      return;
    }

    // 미리보기 이미지 URL 설정
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result); // 미리보기 이미지 업데이트
    };
    reader.readAsDataURL(file);

    new Compressor(file, {
      quality: 0.6,
      maxWidth: 800,
      maxHeight: 800,
      success: (compressedFile) => {
        // 파일을 상태에 저장
        setCompressedImage(compressedFile);
      },
      error: (err) => {
        console.error("이미지 압축 실패: ", err);
      },
    });
  };

  // 유저 프로필 데이터
  const [userProfile, setUserProfile] = useState({
    userNickname: "",
    profileImageUrl: "",
    userBio: "",
  });

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5050/api/userProfile/get",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response && response.data) {
        setUserProfile(response.data); // 프로필 데이터 저장
        setInitialProfileImageUrl(response.data.profileImageUrl); // 초기 이미지 URL 저장
      }
    } catch (error) {
      console.error("프로필 정보를 가져오는 데 실패했습니다:", error);
    }
  };

  // 컴포넌트 마운트 시 프로필 정보 가져오기
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const [isEditing, setIsEditing] = useState(false); // 수정 모드 여부
  const [originalProfile, setOriginalProfile] = useState(null); // 초기 프로필 데이터 저장

  // 프로필 수정
  const updateUserProfile = async () => {
    const formData = new FormData();
    formData.append("profileImage", compressedImage); // FormData에 파일 추가

    try {
      const response = await axios.post(
        "http://localhost:5050/api/userProfile/uploadProfileImage",
        formData,
        {
          headers: {
            "Content-Type": "multiple/form-data",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      console.log("프로필 이미지 저장 후 응답:", response.data);

      // 프로필 이미지 URL을 상태에 업데이트하지 않고 바로 업데이트할 프로필 객체에 반영
      const updatedProfile = { ...userProfile, profileImageUrl: response.data };

      // 프로필 이미지 URL 업데이트된 객체로 서버에 프로필 업데이트 요청
      const updateResponse = await axios.put(
        "http://localhost:5050/api/userProfile",
        updatedProfile,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (updateResponse && updateResponse.data) {
        console.log("업데이트된 프로필 응답:", updateResponse.data);
        setUserProfile(updateResponse.data); // 최종적으로 업데이트된 프로필 상태 저장
        alert("프로필이 성공적으로 업데이트되었습니다.");
        setIsEditing(false); // 수정 모드 종료
      }
    } catch (error) {
      alert("프로필 업데이트에 실패했습니다.");
      console.error(
        "프로필 이미지 저장 또는 프로필 업데이트에 실패했습니다.",
        error
      );
    }
  };

  // 수정 모드 진입 시 초기 데이터 저장
  const enterEditMode = () => {
    setOriginalProfile({ ...userProfile }); // 원래 데이터를 저장
    setPreviewImage(userProfile.profileImageUrl); // 수정 전 이미지를 미리보기로 설정
    setInitialProfileImageUrl(userProfile.profileImageUrl); // 초기 이미지 URL 저장
    setIsEditing(true); // 수정 모드 활성화
    setShowPasswordChangeButton(true); // 비밀번호 변경 버튼 표시s
  };

  // 취소 시 원래 데이터 복원
  const cancelEdit = () => {
    if (originalProfile) {
      setUserProfile(originalProfile); // 초기 데이터로 복원
    }
    setPreviewImage(initialProfileImageUrl); // 취소 시 원래 프로필 이미지로 복원
    setIsEditing(false); // 수정 모드 비활성화
    setShowPasswordChangeButton(false); // 비밀번호 변경 버튼 숨기기
  };

  const toggleOptions = (id) => {
    setActiveOptions((prev) => (prev === id ? null : id)); // 같은 ID 클릭 시 닫기
  };

  // ⋮ 버튼 누르고 뜨는 메뉴 바깥을 눌렀을때 메뉴 사라지게
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 메뉴와 버튼 영역을 제외한 바깥 클릭인지 확인
      if (
        !event.target.closest(".myPage-review-options") &&
        !event.target.closest(".options-button")
      ) {
        setActiveOptions(null); // 메뉴 닫기
      }
    };

    // 전역 클릭 이벤트 등록
    document.addEventListener("click", handleClickOutside);

    // 컴포넌트 언마운트 시 이벤트 제거
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // 리뷰조회입니다....
  const [reviews, setReviews] = useState([]); // 리뷰 상태
  const [reviewLocation, setReviewLocation] = useState([]); // 리뷰가 쓰인 장소 상태
  const [totalReviews, setTotalReviews] = useState(); // 총 리뷰 갯수수
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const [loading, setLoading] = useState(false); // 로딩 상태

  // 리뷰 데이터 API 호출
  const fetchReviews = async (pageNumber = 0) => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5050/reviews/getReviewsWithLocation",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          params: {
            page: pageNumber, // 첫 번째 페이지
            pageSize: 5, // 한 페이지당 5개 리뷰
            sortValue: "reviewCreatedAt", // 리뷰 생성일 기준 정렬
            sortDirection: "desc", // 내림차순
          },
        }
      );

      if (response && response.data) {
        const reviewWithLocationDtoList =
          response.data._embedded?.reviewWithLocationDtoList || []; // 데이터가 없으면 빈 배열

        // 리뷰저장
        const reviewList = reviewWithLocationDtoList.map(
          (item) => item.reviewDto
        );
        const reviewLocationList = reviewWithLocationDtoList.map(
          (item) => item.locationDto
        );

        setReviews(reviewList);
        setReviewLocation(reviewLocationList);
        setTotalPages(response.data.page.totalPages); // 전체 페이지 수 저장
        setTotalReviews(response.data.page.totalElements); // 전체 리뷰 수 저장
        setCurrentPage(pageNumber); // 현재 페이지 업데이트
      }
    } catch (error) {
      console.error("리뷰 데이터를 가져오는 데 실패했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트가 처음 마운트될 때 리뷰 데이터를 가져옴
  useEffect(() => {
    fetchReviews(currentPage);
  }, [currentPage]);

  // 페이지 변경
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage); // 새 페이지로 업데이트
    }
  };

  // 탭 변경 시 데이터 fetch
  useEffect(() => {
    if (activeTab === "reviews") {
      fetchReviews(); // "나의 리뷰" 탭이 활성화되면 API 호출
    }
    if (activeTab === "favorites") {
      fetchFavoriteLocation(); // favoriteTab이 활성화되었을 때만 호출
    }
  }, [activeTab]);

  /*날짜 포맷팅 함수*/
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // 여행 계획 데이터 가져오기
    const fetchPlans = async () => {
      setLoading(true); // 로딩 시작
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          setError("로그인이 필요합니다.");
          return;
        }

        const response = await axios.get(
          "http://localhost:5050/api/planner/user/plans",
          {
            headers: {
              Authorization: `Bearer ${token}`, // 토큰 포함
            },
          }
        );

        if (response.data) {
          const updatedPlans = response.data.map((plan) => {
            const startDate = new Date(plan.plannerStartDate);
            const endDate = new Date(plan.plannerEndDate);
            const days = Math.ceil(
              (endDate - startDate) / (1000 * 60 * 60 * 24)
            );

            // 첫 번째 이미지 가져오기
            const firstImage =
              plan.dailyPlans[0]?.toDos[0]?.placeImgUrl ||
              "https://via.placeholder.com/100";

            return {
              ...plan,
              duration: `${days}박 ${days + 1}일`,
              imageUrl: firstImage, // 첫 번째 이미지 설정
              city: plan.regionName || "알 수 없음",
            };
          });
          setPlans(updatedPlans); // 플래너 데이터 설정
        }
      } catch (err) {
        console.error("여행 계획 데이터를 가져오는 데 실패했습니다:", err);
        setError("여행 계획 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchPlans();
  }, []);

  // 리뷰 모달 상태 관리
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewMode, setReviewMode] = useState("view"); // 리뷰 작성 모달창의 mode 데이터
  const [initialData, setInitialData] = useState(null); // 리뷰 수정시 기존 리뷰 데이터

  // 리뷰 수정 모달 관련 상태
  const openReviewModal = (reviewData) => {
    setReviewMode("edit"); // 수정 모드로 설정
    setInitialData(reviewData); // 수정할 리뷰 데이터 설정
    setIsReviewModalOpen(true); // 모달 열기
  };

  const handleEditReviewSuccess = (status) => {
    if ((status = "success")) {
      // 수정된 리뷰 데이터 다시 불러오기 (새로고침 효과)
      fetchReviews(currentPage);
    }
  };

  // 리뷰 삭제 요청
  const handleDeleteReview = async (reviewId) => {
    const confirmDelete = window.confirm("정말로 이 리뷰를 삭제하시겠습니까?");
    if (confirmDelete) {
      try {
        await axios.delete(
          `http://localhost:5050/reviews/delete/${reviewId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        alert("리뷰가 삭제되었습니다.");
        // 삭제된 후 리뷰 목록을 다시 불러옴.
        fetchReviews(currentPage);
      } catch (error) {
        console.error("리뷰 삭제에 실패했습니다.", error);
        alert("리뷰 삭제에 실패했습니다.");
      }
    }
  };
  const handleDeletePlan = async (plannerId) => {
    if (!window.confirm("정말로 삭제하시겠습니까?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      await axios.delete(`http://localhost:5050/api/planner/${plannerId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // 토큰 포함
        },
      });

      setPlans((prevPlans) =>
        prevPlans.filter((plan) => plan.plannerId !== plannerId)
      );
      alert("플래너가 삭제되었습니다.");
    } catch (error) {
      console.error("플래너 삭제 실패:", error);
      alert("플래너 삭제 중 오류가 발생했습니다.");
    }
  };

  const [favoriteLocations, setFavoriteLocations] = useState([]);
  const [totalFavorite, setTotalFavorite] = useState(0);
  const [currentFavoritePage, setCurrentFavoritePage] = useState(0);
  const [totalFavoritePages, setTotalFavoritePages] = useState(0);

  // 찜한 여행지 정보 가져오기
  const fetchFavoriteLocation = async (pageNumber = 0) => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5050/api/locationFavorite/userFavorites",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          params: {
            page: pageNumber,
            pageSize: 8,
            sortValue: "createdAt",
            sortDirection: "ASC",
          },
        }
      );

      // 데이터에 isFavorite 필드 추가
      const updatedLocations = response.data.content.map((location) => ({
        ...location,
        isFavorite: true, // 초기값은 모두 찜 상태로 설정
      }));

      setFavoriteLocations(updatedLocations); // 받아온 데이터로 상태 업데이트
      setTotalFavorite(response.data.totalElements);
      setCurrentFavoritePage(pageNumber); // 현재 페이지 업데이트
      setTotalFavoritePages(response.data.totalPages);
    } catch (error) {
      console.error("즐겨찾기 목록 조회 실패", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (locationId) => {
    const targetLocation = favoriteLocations.find(
      (loc) => loc.locationId === locationId
    );

    try {
      if (targetLocation.isFavorite) {
        // 찜 취소 요청
        await axios.delete(
          "http://localhost:5050/api/locationFavorite/delete",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            data: { locationId },
          }
        );
        alert("찜이 취소되었습니다.");
      } else {
        // 찜 추가 요청
        await axios.post(
          "http://localhost:5050/api/locationFavorite/add",
          {
            locationId,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        alert("찜이 추가되었습니다.");
      }

      // 클라이언트 상태 업데이트
      setFavoriteLocations((prev) =>
        prev.map((loc) =>
          loc.locationId === locationId
            ? { ...loc, isFavorite: !loc.isFavorite }
            : loc
        )
      );
    } catch (error) {
      console.error("찜 상태 변경 실패:", error);
      alert("찜 상태를 변경하는 데 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 페이지 로드 시 찜한 여행지 데이터를 가져옴
  useEffect(() => {
    fetchFavoriteLocation(); // 첫 로드 시 호출
  }, []); // 빈 배열을 전달해 컴포넌트 마운트 시 실행

  return (
    <div className="mypage-container">
      <header className="mypage-header">
        <img
          src={
            previewImage ||
            userProfile.profileImageUrl ||
            "https://via.placeholder.com/100"
          }
          alt="Profile"
          className="profile-img"
        />
        <div className="profile-info">
          <div className="Profile">
            {isEditing ? (
              <div className="profile-edit-form">
                <div className="profile-edit-input-container">
                  <label className="profile-edit-label">
                    닉네임
                    <input
                      type="text"
                      value={userProfile.userNickname}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          userNickname: e.target.value,
                        })
                      }
                      className="profile-edit-input"
                      placeholder="닉네임을 입력하세요"
                    />
                  </label>

                  <label className="profile-edit-image-label">
                    프로필 이미지
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files ? e.target.files[0] : null; // 파일 존재 확인
                        if (file) {
                          handleImageUpload(file);
                        } else {
                          console.log("파일이 선택되지 않았습니다."); // 취소했을 때 메시지
                        }
                      }} // 이미지 업로드 처리
                      className="profile-edit-input-file"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="profile-viewer">
                <h2>반가워요! {userProfile.userNickname || "OOO"}님</h2>
                <button className="profile-button" onClick={enterEditMode}>
                  프로필 설정⚙️
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="profile-edit-buttons">
              <button className="save-button" onClick={updateUserProfile}>
                저장
              </button>
              <button className="cancel-button" onClick={cancelEdit}>
                취소
              </button>
            </div>
          ) : (
            <>
              <div className="navigation">
                <span className="active">나의 여행 계획 {plans.length}</span>
                <span>나의 리뷰 {totalReviews}</span>
                <span>찜한 여행지 {totalFavorite}</span>
              </div>
            </>
          )}
        </div>
        {showPasswordChangeButton && (
          <button
            onClick={() => setModalOpen(true)}
            className="password-change-button"
          >
            비밀번호 변경
          </button>
        )}
      </header>
      {/* 비밀번호 변경 모달 */}
      <ChangePasswordModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)} // 닫기 핸들러
      />

      <nav className="mypage-tabs">
        <button
          className={activeTab === "plans" ? "active" : ""}
          onClick={() => setActiveTab("plans")}
        >
          나의 여행 계획 {plans.length}
        </button>

        <button
          className={activeTab === "reviews" ? "active" : ""}
          onClick={() => setActiveTab("reviews")}
        >
          나의 리뷰 {totalReviews}
        </button>

        <button
          className={activeTab === "favorites" ? "active" : ""}
          onClick={() => setActiveTab("favorites")}
        >
          찜한 여행지 {totalFavorite}
        </button>
      </nav>

      <div className="mypage-content">
        {activeTab === "plans" && (
          <>
            <button className="add-plan" onClick={() => navigate(`/plan`, {})}>
              + 여행 일정 추가하기
            </button>
            {plans.length === 0 && <p>등록된 여행 계획이 없습니다.</p>}
            <div className="travel-plans">
              {plans.map((plan) => (
                <div key={plan.plannerId} className="travel-plan-card">
                  <img
                    src={plan.imageUrl || "https://via.placeholder.com/100"}
                    alt={plan.plannerTitle}
                    className="travel-image"
                  />
                  <div className="travel-details">
                    <h3>{plan.plannerTitle}</h3>
                    <p>{plan.city || "알 수 없음"}</p>
                    <p>{plan.duration}</p>
                    <p>
                      여행 일정 | {plan.plannerStartDate} ~{" "}
                      {plan.plannerEndDate}
                    </p>
                  </div>
                  {/* 옵션 버튼 */}
                  <div className="options">
                    <button
                      className="options-button"
                      onClick={() => toggleOptions(plan.plannerId)}
                    >
                      ⋮
                    </button>
                    {activeOptions === plan.plannerId && ( // 해당 카드의 옵션만 표시
                      <div className="options-menu">
                        <button>내용편집</button>

                        <button
                          onClick={() => handleDeletePlan(plan.plannerId)}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "reviews" && (
          <>
            {loading && <p>로딩 중...</p>}
            {!loading && reviews.length === 0 && <p>작성한 리뷰가 없습니다.</p>}

            <div className="myPage-reviews">
              {reviews.map((review, index) => (
                <div key={review.reviewId} className="review-card">
                  <div className="myPage-review-header">
                    <div className="myPage-review-header-left">
                      <div className="myPage-review-location-info">
                        {/* 위치 이미지가 있을 경우 표시 */}
                        {reviewLocation[index]?.placeImgUrl && (
                          <Link
                            to={`/attractionDetail/${reviewLocation[index].locationId}`}
                          >
                            <img
                              src={reviewLocation[index].placeImgUrl}
                              alt={reviewLocation[index].locationName}
                              className="myPage-review-location-image"
                            />
                          </Link>
                        )}
                        <div className="myPage-review-location-name">
                          <Link
                            to={`/attractionDetail/${reviewLocation[index]?.locationId}`}
                          >
                            <span>
                              {reviewLocation[index]?.locationName ||
                                "알 수 없음"}
                            </span>
                          </Link>
                          <p>
                            {reviewLocation[index]?.regionName || "알 수 없음"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* 우측에 ⋮ 버튼 옵션 */}
                    <div className="myPage-review-options">
                      <button
                        className="myPage-review-options-button"
                        onClick={() => toggleOptions(review.reviewId)}
                      >
                        ⋮
                      </button>
                      {/* 옵션 메뉴가 열리면 수정 및 삭제 버튼 표시 */}
                      {activeOptions === review.reviewId && (
                        <div className="myPage-review-options-menu">
                          <button onClick={() => openReviewModal(review)}>
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.reviewId)}
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="myPage-review-content">
                    <div className="myPage-review-rating">
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
                    <h3>{review.title}</h3>
                    <p>{review.comment}</p>

                    {/* 리뷰 이미지 */}
                    <div className="myPage-review-images">
                      {review.imageUrls &&
                        review.imageUrls.length > 0 &&
                        review.imageUrls.map((imageUrl, idx) => (
                          <img
                            key={idx}
                            src={imageUrl}
                            alt={`review-image-${idx}`}
                            className="myPage-review-image"
                          />
                        ))}
                    </div>
                    <p className="myPage-review-create-date">
                      {new Date(review.reviewCreatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {/* 리뷰 수정 모달 */}
                  {isReviewModalOpen && (
                    <ReviewCreateModal
                      mode={reviewMode} // 'edit' 모드로 설정
                      initialData={initialData} // 수정할 기존 리뷰 데이터 전달
                      locationId={reviewLocation[index].locationId}
                      onClose={() => setIsReviewModalOpen(false)} // 모달 닫기
                      onSuccess={handleEditReviewSuccess} // 수정 성공 시 호출
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mypage-pagination">
              <button
                disabled={currentPage <= 0}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <img src={angleSmallLeft} alt="이전" />
              </button>
              <span>
                {currentPage + 1} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <img src={angleSmallRight} alt="다음" />
              </button>
            </div>
          </>
        )}

        {/* 찜한 여행지 목록 */}
        {activeTab === "favorites" && (
          <div className="mypage-favorite-destination">
            <h3>찜한 여행지 목록</h3>
            {loading ? (
              <p>로딩 중...</p>
            ) : (
              <div className="mypage-favorite-destination-container">
                {favoriteLocations.map((destination) => (
                  <div
                    key={destination.locationId}
                    className="mypage-favorite-destination-card"
                  >
                    <Link to={`/attractionDetail/${destination.locationId}`}>
                      <img
                        src={destination.placeImgUrl}
                        alt={destination.locationName}
                      />
                    </Link>

                    <Link to={`/attractionDetail/${destination.locationId}`}>
                      <h4>{destination.locationName}</h4>
                    </Link>
                    <div className="mypage-favorite-destination-info">
                      <p>{destination.regionName}</p>
                      <div className="mypage-favorite-destination-star-rating">
                        <img
                          src={starColor}
                          alt="별 아이콘"
                          className="mypage-favorite-destination-star-icon"
                        />
                        <span>구글리뷰 {destination.googleRating}</span>(
                        {destination.userRatingsTotal})
                      </div>
                      <p>{"#" + destination.tags.join(" #")}</p>
                    </div>

                    {/* 하트 아이콘 */}
                    <button
                      className="mypage-favorite-destination-heart-button"
                      onClick={() => toggleFavorite(destination.locationId)}
                    >
                      <img
                        src={
                          destination.isFavorite ? heartFilled : heart
                        } /* isFavorite 값에 따라 변경 */
                        alt="하트 아이콘"
                        className="mypage-favorite-destination-heart-icon"
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mypage-pagination">
              <button
                disabled={currentFavoritePage <= 0}
                onClick={() => fetchFavoriteLocation(currentFavoritePage - 1)}
              >
                <img src={angleSmallLeft} alt="이전" />
              </button>
              <span>
                {currentFavoritePage + 1} / {totalFavoritePages}
              </span>
              <button
                disabled={currentFavoritePage >= totalFavoritePages - 1}
                onClick={() => fetchFavoriteLocation(currentFavoritePage + 1)}
              >
                <img src={angleSmallRight} alt="다음" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;
