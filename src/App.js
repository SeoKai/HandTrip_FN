import React, { createContext, useState } from 'react';
import './App.css';
import './styles/reset.css';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import Home from "./pages/Home/Home";
import Plan from "./pages/plan/Plan";
import Attractions from "./pages/Attractions/Attractions";
import AttractionDetail from "./pages/Attractions/AttractionDetail";
import Community from "./pages/community/Community";
import SignIn from "./pages/User/SignIn";
import SignUp from "./pages/User/SignUp";
import SelectDates from "./pages/plan/SelectDates";
import PlanTrip from "./pages/plan/PlanTrip";
import MenuBar from "./component/MenuBar";
import ViewPlan from "./pages/plan/ViewPlan";
import PlannerList from "./pages/plan/PlannerList";
import EditPlan from "./pages/plan/EditPlan";
import MyPage from "./pages/MyPage/MyPage";
import Footer from "./component/Footer";
import FindId from "./pages/User/FindId";
import FindPw from "./pages/User/FindPw";
import OAuth2Callback from "./pages/User/OAuth2Callback";
import RandomPlaces from "./component/RandomPlaces";

// AuthContext 생성
export const AuthContext = createContext({
  user: null,
  setUser: () => {}, // 기본값
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  saveUser: () => {},
  clearUser: () => {},
});

function NavigationBar() {
  return null;
}

function Register() {
  return null;
}

function App() {
  // 특정 페이지 Footer 렌더링 제외
  const location = useLocation();
  const shouldRenderFooter =
    location.pathname !== '/plan-trip' &&
    location.pathname !== '/signin' &&
    location.pathname !== '/signup' &&
    location.pathname !== '/find-id' &&
    location.pathname !== '/find-pw' &&
    location.pathname.slice(0, 13) !== '/planner/edit';

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 인증 여부 초기화 시 만료 시간 고려
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const tokenExpiry = localStorage.getItem('accessTokenExpiry');
    return !!localStorage.getItem('accessToken') && Date.now() < tokenExpiry;
  });


  const saveUser = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    setIsAuthenticated(true); // 즉시 로그인 상태로 변경
  };


  const clearUser = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessTokenExpiry'); // 만료 시간도 삭제
    localStorage.removeItem('userEmail'); // userEmail 삭제
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      <AuthContext.Provider
        value={{
          user,
          setUser,
          isAuthenticated,
          setIsAuthenticated,
          saveUser,
          clearUser,
        }}
      >
        <div className="wrapper">
          <div className="header">
            <MenuBar />
            <NavigationBar /> {/* NavigationBar 추가 */}
          </div>
          <div className="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/plan" element={<Plan />} />
              <Route path="/select-dates" element={<SelectDates />} />
              <Route path="/plan-trip" element={<PlanTrip />} />
              <Route path="/view-plan/:plannerId" element={<ViewPlan />} />
              <Route path="/attractions" element={<Attractions />} />
              <Route path="/community" element={<Community />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/mypage" element={<MyPage />} />{' '}
              {/* 마이페이지 라우트 추가 */}
              <Route
                path="/attractionDetail/:locationId"
                element={<AttractionDetail />}
              />
              <Route path="/planner-list" element={<PlannerList />} />
              <Route path="/planner/edit/:id" element={<EditPlan />} />
              <Route path="/find-id" element={<FindId />} />
              <Route path="/find-pw" element={<FindPw />} />
              <Route path="/random-places" element={<RandomPlaces />} />
              <Route path="/oauth2/callback" element={<OAuth2Callback />} /> {/* OAuth2 콜백 */}
            </Routes>
          </div>
          {/* 특정 페이지 Footer 렌더링 제외 */}
          {shouldRenderFooter && <Footer />}
        </div>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
