import React from "react";
import { Polyline } from "@react-google-maps/api";

const PolylineRenderer = ({
  path,
  options = {
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
  },
}) => {
  console.log("Received path in PolylineRenderer:", path); // 전달된 경로 확인
  if (!path || path.length < 2) return null;

  return <Polyline path={path} options={options} />;
};

export default PolylineRenderer;
