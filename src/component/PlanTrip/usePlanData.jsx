import { useState, useEffect } from "react";
import axios from "axios";

const usePlanData = (regionId, currentPage, searchTerm, categoryFilter) => {
  const [locations, setLocations] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); // 디바운스된 검색어

  useEffect(() => {
    // 디바운싱 로직 (500ms 대기 후 검색어 업데이트)
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler); // 이전 타이머 제거
    };
  }, [searchTerm]);

  const fetchLocations = (reset = false) => {
    if (!regionId) return; // regionId가 없으면 요청하지 않음

    axios
      .get("http://localhost:5050/api/locations/searchLocation", {
        params: {
          regionId,
          page: reset ? 0 : currentPage - 1, // 초기화 시 첫 페이지로
          pageSize: 10,
          keyword: debouncedSearchTerm, // 디바운스된 검색어
          tagNames: categoryFilter === "전체" ? "" : categoryFilter, // 선택된 필터
        },
      })
      .then((response) => {
        const fetchedLocations = response.data.content;
        if (reset) {
          setLocations(fetchedLocations); // 데이터 초기화
        } else {
          setLocations((prev) => [...prev, ...fetchedLocations]); // 데이터 병합
        }
        setTotalPages(response.data.totalPages); // 총 페이지 수 업데이트

        // **검색 결과가 없으면 locations 상태 초기화**
        if (fetchedLocations.length === 0) {
          setLocations([]);
        }
      })
      .catch((error) => {
        // console.error("데이터 로드 실패:", error);

        // **에러가 발생하면 locations 상태 초기화**
        setLocations([]);
      });
  };

  // 검색어와 필터가 변경될 때만 요청
  useEffect(() => {
    fetchLocations(true); // 항상 데이터를 초기화
  }, [debouncedSearchTerm, categoryFilter]);

  // 페이지가 변경될 때 추가 요청
  useEffect(() => {
    if (currentPage > 1) fetchLocations(); // 추가 데이터를 가져옴
  }, [currentPage]);

  return { locations, totalPages, fetchLocations };
};

export default usePlanData;
