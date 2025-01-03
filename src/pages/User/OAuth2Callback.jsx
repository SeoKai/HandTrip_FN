import {useContext, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import {AuthContext} from "../../App";

const OAuth2Callback = () => {
    const navigate = useNavigate();
    const { setUser, setIsAuthenticated } = useContext(AuthContext);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const accessToken = queryParams.get('accessToken');
        const refreshToken = queryParams.get('refreshToken');
        const accessTokenExpiry = queryParams.get('accessTokenExpiry');
        const email = queryParams.get('email');

        if (accessToken && refreshToken && accessTokenExpiry && email) {
            // 로컬 스토리지에 저장
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('accessTokenExpiry', accessTokenExpiry);
            localStorage.setItem('userEmail', email);

            // React 상태 업데이트
            setUser({ email });
            setIsAuthenticated(true);

            // 상태 업데이트 완료 후에 라우팅
            setTimeout(() => {
                alert('OAuth2 인증 완료!');
                navigate('/');
            }, 100); // 약간의 지연시간 추가
        } else {
            alert('인증 정보가 누락되었습니다.');
            navigate('/signin');
        }
    }, [navigate, setUser, setIsAuthenticated]);

    return null;
}

export default OAuth2Callback;
