// import React from "react";

// const PlaceList = ({
//   locations,
//   dailyPlans,
//   selectedDay,
//   onAddPlace,
//   expandedPlaceId,
//   toggleExpand,
//   searchTerm,
//   setSearchTerm,
//   categoryFilter,
//   handleCategoryClick,
// }) => {
//   return (
//     <div className="placeList">
//       <h3>장소 목록</h3>
//       <input
//         type="text"
//         placeholder="여행지를 검색하세요."
//         className="searchBar"
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//       />

//       <div className="categoryTags">
//         {["전체", "관광명소", "음식", "쇼핑", "문화", "랜드마크"].map(
//           (category) => (
//             <button
//               key={category}
//               className={`categoryTag ${
//                 categoryFilter === category ? "selected" : ""
//               }`}
//               onClick={() => handleCategoryClick(category)}
//             >
//               {categoryFilter === category ? category : `#${category}`}
//             </button>
//           )
//         )}
//       </div>
//       <ul>
//         {locations
//           .filter(
//             (place) =>
//               !(dailyPlans[selectedDay] || []).some(
//                 (addedPlace) => addedPlace.locationId === place.locationId
//               )
//           )
//           .map((place) => (
//             <li key={place.locationId} className="placeItem">
//               <img
//                 src={place.placeImgUrl || "/images/placeholder.jpg"}
//                 alt={place.locationName}
//                 className="placeImage"
//               />
//               <div className="placeInfo">
//                 <div className="placeDetails">
//                   <span className="placeName">{place.locationName}</span>
//                   <p className="placeRating">
//                     평점: ⭐ {place.googleRating || "정보 없음"}
//                   </p>
//                   <p className="placeAddress">{place.formattedAddress}</p>
//                   {expandedPlaceId === place.locationId && (
//                     <p className="placeDescription">
//                       {place.description || "상세 설명이 없습니다."}
//                     </p>
//                   )}
//                   <span
//                     className="toggleText"
//                     onClick={() => toggleExpand(place.locationId)}
//                   >
//                     {expandedPlaceId === place.locationId ? "접기" : "더보기"}
//                   </span>
//                 </div>
//                 <button className="addButton" onClick={() => onAddPlace(place)}>
//                   +
//                 </button>
//               </div>
//             </li>
//           ))}
//       </ul>
//     </div>
//   );
// };

// export default PlaceList;

