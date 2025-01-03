import React from 'react';

const DailyPlanList = ({
  dailyPlans,
  handleShowPlaceList,
  handleRemovePlace,
}) => {
  return (
    <div className="selectedList">
      {Object.entries(dailyPlans).map(([date, places], index) => (
        <div key={date} className="dailyPlanContainer">
          <div className="dayHeader">
            <h4>Day {index + 1}</h4>
            <span className="dateLabel">{date}</span>
          </div>

          <button
            className="addPlaceButton"
            onClick={() => handleShowPlaceList(date)}
          >
            여행지 추가 +
          </button>

          {places.length > 0 && (
            <ul className="addedPlacesList">
              {places.map((place) => (
                <li key={place.locationId} className="selectedPlaceCard">
                  <img
                    src={place.placeImgUrl || '/images/placeholder.jpg'}
                    alt={place.locationName}
                    className="placeImage"
                  />
                  <div className="placeText">
                    <span>{place.locationName}</span>
                  </div>
                  <button
                    onClick={() => handleRemovePlace(date, place.locationId)}
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default DailyPlanList;
