// ReviewCreateModal.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./ReviewCreateModal.css";
import imageCompression from "browser-image-compression";

const ReviewCreateModal = ({
  mode,
  initialData = {},
  locationId,
  onClose,
  onSuccess,
  accessToken,
}) => {
  const currentMode = mode || "create";
  const [reviewId, setReviewId] = useState(initialData.reviewId || "");
  const [title, setTitle] = useState(initialData.title || "");
  const [rating, setRating] = useState(initialData.rating || 0);
  const [comment, setComment] = useState(initialData.comment || "");
  const [imageUrls, setImageUrls] = useState(initialData.imageUrls || []); // 실제 업로드하는 이미지 URL
  const [prevImageUrls, setPrevImageUrls] = useState(
    initialData.imageUrls || []
  );
  const [imageFiles, setImageFiles] = useState([]); // 이미지 파일 상태 추가
  const [isLoading, setIsLoading] = useState(false);

  // 이미지 파일 선택 처리
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    
    // 허용하지 않는 파일 필터링
    const filteredFiles = files.filter((file) => {
      if (!validImageTypes.includes(file.type)) {
        alert(`${file.name}은(는) 허용되지 않는 파일 형식입니다.`);
        return false;
      }
      return true;
    });

    // 첨부 이미지 갯수 제한
    if (filteredFiles.length + imageUrls.length > 3) {
      alert("최대 3개의 이미지만 첨부할 수 있습니다.");
      return;
    }

    // 압축된 이미지를 저장하기 위한 배열
    const compressedFiles = [];

    // 이미지 압축 후 저장
    for (const file of filteredFiles) {
      try {
        const options = {
          maxSizeMB: 2, // 압축된 이미지의 최대 크기 (5MB 이하로 설정)
          maxWidthOrHeight: 1024, // 이미지의 최대 가로 또는 세로 크기
          useWebWorker: true, // 웹 워커를 사용하여 비동기적으로 처리
        };

        // 이미지 압축
        const compressedBlob = await imageCompression(file, options);

        // Blob을 File 객체로 변환하면서 원래 이름 복원
        const compressedFile = new File([compressedBlob], file.name, {
          type: file.type,
          lastModified: Date.now(),
        });

        compressedFiles.push(compressedFile);
      } catch (error) {
        console.error("이미지 압축 중 오류 발생:", error);
        alert("이미지 압축에 실패했습니다.");
        return;
      }
    }

    // 이미지 미리보기 URL 생성
    const newPreviewUrls = filteredFiles.map((file) => URL.createObjectURL(file));
    setPrevImageUrls((prevUrls) => [...prevUrls, ...newPreviewUrls]);
    setImageFiles((prevFiles) => [...prevFiles, ...compressedFiles]);

  };

  // useEffect(() => {
  //   console.log('Updated imageFiles:', imageFiles);
  //   console.log('Updated imageUrls:',imageUrls)
  //   console.log('Updated prevImageUrls:',prevImageUrls)
  //   console.log('Updated comment:',comment)
  // }, [imageFiles,imageUrls,comment]);

  // 이미지 업로드 함수
  const uploadImages = async (imageFiles) => {
    if (imageFiles.length === 0) return [];

    const uploadPromises = imageFiles.map((file) => {
      const formData = new FormData();
      formData.append("files", file);
      return axios.post("http://localhost:5050/reviews/uploadReviewImage", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });
    });

    try {
      const responses = await Promise.all(uploadPromises); // 병렬로 업로드 실행
      return responses.map((res) => res.data); // 업로드된 이미지 URL 반환
    } catch (error) {
      console.error("이미지 업로드 중 오류 발생:", error);
      alert("이미지 업로드에 실패했습니다.");
      throw new Error("이미지 업로드 실패");
    }
  };
  
  // 리뷰 작성 함수
  const createReview = async (reviewDto) => {
    try {
      await axios.post("http://localhost:5050/reviews/create", reviewDto, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });
      alert("리뷰가 작성되었습니다!");
      return "success";
    } catch (error) {
      console.error("리뷰 작성 중 오류 발생:", error);
      alert("리뷰 작성에 실패했습니다.");
      throw new Error("리뷰 작성 실패");
    }
  };

  // 리뷰 수정 함수
  const editReview = async (reviewId, reviewDto) => {
    try {
      await axios.put(`http://localhost:5050/reviews/${reviewId}/edit`, reviewDto, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });
      alert("리뷰가 수정되었습니다!");
      return "success";
    } catch (error) {
      console.error("리뷰 수정 중 오류 발생:", error);
      alert("리뷰 수정에 실패했습니다.");
      throw new Error("리뷰 수정 실패");
    }
  };


  // 폼 제출 처리
  const handleSubmit = async () => {
    setIsLoading(true); // 로딩 시작

    let newImageUrls = [];
    try {
      console.log("최종 imageFiles 상태:", imageFiles); // 디버깅용
      newImageUrls = await uploadImages(imageFiles); // 이미지 업로드
    } catch (error) {
      setIsLoading(false);
      return; // 이미지 업로드 실패 시 진행 중단
    }

    const reviewDto = {
      reviewId: reviewId,
      locationId: locationId,
      title: title,
      rating: rating,
      comment: comment,
      imageUrls: [...imageUrls.flat(), ...newImageUrls.flat()],
    };

    try {
      if (currentMode === "create") {
        await createReview(reviewDto);
      } else {
        await editReview(reviewId, reviewDto);
      }
      onSuccess("success");
      onClose();
    } catch (error) {
      console.error("리뷰 처리 중 오류 발생:", error);
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  // 이미지 삭제 처리
  const removeImageUrl = (index) => {
    setPrevImageUrls((prevUrls) => {
      const updatedUrls = prevUrls.filter((_, i) => i !== index);
      setImageUrls(updatedUrls); // 삭제된 상태 반영
      return updatedUrls;
    });
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };



  return (
    <div className="reviewCreateModal">
      {/* 상단영역역 - 리뷰 작성 글씨, X버튼 */}
      <div className="modal-header">
        <p> 리뷰 작성 </p>
        <button className="close-button" onClick={onClose}>
          X
        </button>
      </div>

      {/* 메인영역 - 제목, 별점, 코멘트작성, 이미지 첨부 영역역 */}
      <div className="modal-main">
        <div className="title-container">
          <label htmlFor="title" className="title-label">
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={40}
            placeholder="총평을 간단하게 입력해주세요 (최대 40자)"
          />
        </div>

        <div className="rating-container">
          <label htmlFor="rating" className="rating-label">
            평점
          </label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= rating ? "filled" : ""}`}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="comment-container">
          <label htmlFor="comment" className="comment-label">
            댓글
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            placeholder="리뷰를 작성해주세요 (최대 500자)"
          />
        </div>

        <div className="image-container">
          <label htmlFor="image" className="image-label">
            사진 첨부 (최대 3개)
          </label>
          <div className="file-upload-container">
            {/* "클릭하여 파일 사진 추가하기" 텍스트 클릭 시 input 활성화 */}
            <div
              className="file-upload-text"
              onClick={() => document.getElementById("image").click()} // input 클릭 활성화
            >
              클릭하여 파일 사진 추가하기
            </div>

            {/* 파일 업로드 영역 */}
            <input
              id="image"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              style={{ display: "none" }} // 파일 선택 버튼 숨기기
            />
            {/* 업로드한 사진 미리보기 영역 */}
            <div className="image-preview">
              {/* 기존 이미지 URL 미리보기 */}
              {prevImageUrls.map((url, index) => (
                <div className="image-preview-item" key={index}>
                  <img
                    src={url}
                    alt={`Preview ${index}`}
                    style={{ width: "100px", height: "100px", margin: "5px" }}
                  />
                  <button
                    className="remove-image-btn"
                    onClick={() => removeImageUrl(index)} // 기존 URL 삭제
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 하단영역 - 버튼 */}
      <div className="modal-footer">
        <button onClick={onClose} className="review-create-cancel-button">
          취소
        </button>
        <button onClick={handleSubmit} className="review-create-submit-button">
          저장
        </button>
      </div>
    </div>
  );
};

export default ReviewCreateModal;
