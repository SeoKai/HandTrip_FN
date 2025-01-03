import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./EvaluatePlaces.css"; // 스타일 파일 추가

const EvaluatePlaces = ({ userId, onSkip }) => {
  const [places, setPlaces] = useState([]);
  const [ratings, setRatings] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // 랜덤 여행지 가져오기
  useEffect(() => {
    axios
      .get("http://localhost:5050/api/ai/random-places")
      .then((response) => {
        if (response.data.places && response.data.places.length > 0) {
          setPlaces(response.data.places);
        } else {
          alert("여행지를 가져올 수 없습니다.");
        }
      })
      .catch((error) => {
        console.error("랜덤 여행지 가져오기 실패:", error);
        alert("서버와 통신에 문제가 발생했습니다.");
      });
  }, []);

  // 평점 변경
  const handleRatingChange = (placeId, value) => {
    setRatings({ ...ratings, [placeId]: value });
  };

  // 제출
  const handleSubmit = () => {
    const payload = {
      userId,
      ratings: Object.entries(ratings).map(([placeId, rating]) => ({
        placeId: parseInt(placeId, 10),
        rating,
      })),
    };

    setIsSubmitting(true);
    axios
      .post("http://localhost:5050/api/ai/save-ratings", payload)
      .then(() => {
        alert("평점이 저장되었습니다!");
        navigate("/"); // 메인 페이지로 이동
      })
      .catch((error) => {
        console.error("평점 저장 실패:", error);
        alert("평점을 저장하는 데 실패했습니다. 다시 시도해주세요.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="evaluate-places">
      <h2 className="evaluate-title">랜덤 여행지 평가</h2>
      <p className="evaluate-description">
        여행지에 대한 평점을 선택해주세요. 평가를 완료하면 저장 후 홈으로
        이동합니다.
      </p>
      {places.length > 0 ? (
        places.map((place) => (
          <div key={place.id} className="place-card">
            <h3 className="place-name">{place.name}</h3>
            <img
              src={place.image || "/default-image.jpg"} // 기본 이미지 추가
              alt={place.name}
              className="place-image"
            />
            <div className="rating-container">
              <input
                type="range"
                min="1"
                max="5"
                value={ratings[place.id] || 3}
                onChange={(e) => handleRatingChange(place.id, e.target.value)}
                className="rating-slider"
              />
              <span className="rating-value">{ratings[place.id] || 3}</span>
            </div>
          </div>
        ))
      ) : (
        <p className="loading-text">여행지를 불러오는 중입니다...</p>
      )}
      <div className="buttons-container">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? "저장 중..." : "제출"}
        </button>
        <button
          onClick={onSkip}
          disabled={isSubmitting}
          className="skip-button"
        >
          건너뛰기
        </button>
      </div>
    </div>
  );
};

export default EvaluatePlaces;
