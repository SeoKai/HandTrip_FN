import React from "react";
import { useNavigate } from "react-router-dom";

const PlanButton = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/"); // "/" 경로로 이동
  };

  return <button onClick={handleGoHome}>홈으로 돌아가기</button>;
};

export default PlanButton;
