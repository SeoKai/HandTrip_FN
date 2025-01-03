import React, { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import "./MenuBar.css";
import { AuthContext } from "../App"; // AuthContext 가져오기
import person from "../img/icons/person.png";
import Logo from "../img/MainLogo.png";

const MenuBar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, setIsAuthenticated, setUser, clearUser } =
    useContext(AuthContext);
  const [isDropdownOpen, setDropdownOpen] = useState(false); // 드롭다운 상태 관리

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    clearUser();
    alert("로그아웃되었습니다.");
    navigate("/"); // 로그아웃 후 홈으로 이동
    window.location.reload(); // 페이지 새로고침
  };

  return (
    <div className="MenuBar">
      <div
        className="MainLogo"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        <img src={Logo} alt="Logo" />
      </div>
      <div className="navigation">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          홈
        </NavLink>
        <NavLink
          to="/plan"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          여행 계획
        </NavLink>
        <NavLink
          to="/attractions"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          관광지
        </NavLink>
        {/* <NavLink
          to="/community"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        > */}
        {/* 커뮤니티
        </NavLink> */}

        {isAuthenticated ? (
          <div className="profile">
            <img
              src={person}
              alt="person"
              className="profile-icon"
              onClick={toggleDropdown} // 클릭하면 드롭다운 열림/닫힘
            />
            {isDropdownOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-item"
                         onClick={() => {
                             navigate("/mypage");
                             setDropdownOpen(false); // 드롭다운 닫기
                         }}
                    >
                        마이페이지
                    </div>
                    <div
                        className="dropdown-item"
                        onClick={handleLogout}
                        style={{cursor: "pointer"}}
                    >
                        로그아웃
                    </div>
                </div>
            )}
          </div>
        ) : (
            <div
                className="login-link"
                onClick={() => navigate("/signin")}
                style={{ cursor: "pointer" }}
          >
            로그인
          </div>
        )}
      </div>
    </div>
  );
  // =======
  //     const handleLogout = () => {
  //         clearUser();
  //         alert("로그아웃되었습니다.");
  //         navigate("/"); // 로그아웃 후 홈으로 이동
  //     };

  //     return (
  //         <div className="MenuBar">
  //             <div className="MainLogo">
  //                 <img src={Logo} alt="Logo" />
  //             </div>
  //             <div className="navigation">
  //                 <NavLink
  //                     to="/"
  //                     className={({ isActive }) => (isActive ? "active-link" : "")}
  //                 >
  //                     홈
  //                 </NavLink>
  //                 <NavLink
  //                     to="/plan"
  //                     className={({ isActive }) => (isActive ? "active-link" : "")}
  //                 >
  //                     여행 계획
  //                 </NavLink>
  //                 <NavLink
  //                     to="/attractions"
  //                     className={({ isActive }) => (isActive ? "active-link" : "")}
  //                 >
  //                     관광지
  //                 </NavLink>
  //                 <NavLink
  //                     to="/community"
  //                     className={({ isActive }) => (isActive ? "active-link" : "")}
  //                 >
  //                     커뮤니티
  //                 </NavLink>

  //                 {isAuthenticated ? (
  //                     <div className="profile">
  //                         <img
  //                             src={person}
  //                             alt="person"
  //                             className="profile-icon"
  //                             onClick={toggleDropdown} // 클릭하면 드롭다운 열림/닫힘
  //                         />
  //                         {isDropdownOpen && (
  //                             <div className="dropdown-menu">
  //                                 <div
  //                                     className="dropdown-item"
  //                                     onClick={() => navigate("/mypage")}
  //                                 >
  //                                     마이페이지
  //                                 </div>
  //                                 <div
  //                                     className="dropdown-item"
  //                                     onClick={handleLogout}
  //                                     style={{ cursor: "pointer" }}
  //                                 >
  //                                     로그아웃
  //                                 </div>
  //                             </div>
  //                         )}
  //                     </div>
  //                 ) : (
  //                     <div
  //                         className="login-link"
  //                         onClick={() => navigate("/signin")}
  //                         style={{ cursor: "pointer" }}
  //                     >
  //                         로그인
  //                     </div>
  //                 )}
  //             </div>
  //         </div>
  //     );
  // >>>>>>> fn2/gani
};

export default MenuBar;
