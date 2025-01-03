import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ViewPlan.css";
import axios from "axios";

function ViewPlan() {
  const { plannerId } = useParams(); // URL에서 plannerId 가져오기
  const navigate = useNavigate();
  const [planner, setPlanner] = useState(null); // 서버에서 불러온 플래너 데이터
  const [loading, setLoading] = useState(true); // 로딩 상태

  useEffect(() => {
    const fetchPlannerData = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          alert("로그인이 필요합니다.");
        }
        const response = await axios.get(
          `http://localhost:5050/api/planner/${plannerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("서버 응답 데이터:", response.data); // 서버 응답 데이터 확인
        setPlanner(response.data); // 서버 응답 데이터 저장
      } catch (error) {
        console.error("플래너 데이터 불러오기 실패:", error);
      } finally {
        setLoading(false); // 로딩 상태 해제
      }
    };

    fetchPlannerData();
  }, [plannerId]);

  // 로딩 중 또는 데이터가 없을 경우 처리
  if (loading) return <p>Loading...</p>;
  if (!planner) return <p>플래너를 찾을 수 없습니다.</p>;

  // 서버에서 불러온 데이터에서 필요한 값 추출
  const { dailyPlans, regionName: cityName, plannerTitle } = planner;

  if (!dailyPlans || !cityName) {
    return (
      <div className="planviewNoPlanContainer">
        <p>여행 계획이 없습니다.</p>
        <button className="planviewBackButton" onClick={() => navigate(-1)}>
          돌아가기
        </button>
      </div>
    );
  }

  // 날짜별 그룹화 로직 (한 줄에 3개의 Day씩 나누기)
  const groupedPlans = [];
  for (let i = 0; i < dailyPlans.length; i += 3) {
    groupedPlans.push(dailyPlans.slice(i, i + 3));
  }

  return (
    <div className="planviewContainer">
      <header className="planviewHeader">
        <h2>{plannerTitle || "나만의 여행계획"}</h2>
      </header>

      <div className="planviewDateRange">
        <p>
          {planner.plannerStartDate} ~ {planner.plannerEndDate}
        </p>
      </div>

      {/* 그룹화된 Day들 출력 */}
      {groupedPlans.map((group, groupIndex) => (
        <div key={groupIndex} className="planviewDaysRow">
          {group.map((dailyPlan, index) => (
            <div key={dailyPlan.planDate} className="planviewDailyPlan">
              <div className="planviewDayHeader">
                <h3>{`DAY ${groupIndex * 3 + index + 1}`}</h3>
                <span>{dailyPlan.planDate}</span>
              </div>
              <div className="planviewPlacesContainer">
                {/* dailyPlan.toDos가 배열인지 확인 후 렌더링 */}
                {(Array.isArray(dailyPlan.toDos) ? dailyPlan.toDos : []).map(
                  (todo) => (
                    <div key={todo.locationId} className="planviewPlaceCard">
                      <img
                        src={todo.placeImgUrl || "/images/placeholder.jpg"}
                        alt={todo.locationName}
                        className="planviewPlaceImage"
                      />
                      <div className="planviewPlaceInfo">
                        <h4>{todo.locationName}</h4>
                        <p>{todo.formattedAddress}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="planviewActionButtons">
        <button
          className="planviewEditButton"
          onClick={() =>
            navigate(`/planner/edit/${plannerId}`, {
              state: {
                regionId: planner.regionId,
                startDate: planner.plannerStartDate,
                endDate: planner.plannerEndDate,
                cityName: planner.regionName,
              }, // 수정 페이지로 데이터 전달
            })
          }
        >
          계획 수정하기
        </button>
        <button
          className="planviewEditButton"
          onClick={() => navigate(`/planner-list`, {})}
        >
          전체 계획 보기
        </button>
      </div>
    </div>
  );
}

export default ViewPlan;
