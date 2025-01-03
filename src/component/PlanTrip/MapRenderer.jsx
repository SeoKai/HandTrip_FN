
import React from 'react';
import { GoogleMap, Marker, Polyline, InfoWindow } from '@react-google-maps/api'; // InfoWindow 추가

const createCustomIcon = (color, glyph) => ({
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
      <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 4.67 7 13 7 13s7-8.33 7-13c0-3.87-3.13-7-7-7z"/>
      <text x="12" y="11" fill="white" font-size="8" font-weight="bold" text-anchor="middle" alignment-baseline="middle">${glyph}</text>
    </svg>
  `)}`,
    scaledSize: new window.google.maps.Size(48, 48),
});

const MapRenderer = ({
                         center,
                         markers = [], // 기본값 설정
                         routes = [],  // 기본값 설정
                         selectedPlace, // 추가: 선택된 장소
                         onMarkerClick, // 추가: 마커 클릭 핸들러
                         onCloseInfoWindow, // 추가: InfoWindow 닫기 핸들러
                     }) => {
    return (
        <GoogleMap
            mapContainerClassName="mapContainer"
            center={center}
            zoom={12}
            options={{ mapTypeControl: false }}
        >
            {/* 마커 표시 */}
            {markers.map((marker, idx) => (
                <Marker
                    key={idx}
                    position={{ lat: marker.latitude, lng: marker.longitude }}
                    onClick={() => onMarkerClick(marker)} // 마커 클릭 시 핸들러 호출
                    icon={createCustomIcon(marker.color, marker.glyph)} // 커스텀 아이콘
                />
            ))}

            {/* 경로 표시 */}
            {routes.map((route, idx) => (
                <Polyline
                    key={idx}
                    path={route.path} // 경로 좌표 리스트
                    options={{
                        strokeColor: route.color, // Day별 경로 색상
                        strokeOpacity: 0.8,
                        strokeWeight: 3,
                    }}
                />
            ))}

            {/* 선택된 장소에 InfoWindow 표시 */}
            {selectedPlace && (
                <InfoWindow
                    position={{
                        lat: selectedPlace.latitude,
                        lng: selectedPlace.longitude,
                    }}
                    onCloseClick={onCloseInfoWindow} // InfoWindow 닫기 핸들러 호출
                >
                    <div className="infoWindowContent">
                        <img
                            src={selectedPlace.placeImgUrl || '/images/placeholder.jpg'}
                            alt={selectedPlace.locationName}
                            className="infoWindowImage"
                        />
                        <h3>{selectedPlace.locationName}</h3>
                        <p>주소: {selectedPlace.formattedAddress}</p>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
};

export default MapRenderer;
