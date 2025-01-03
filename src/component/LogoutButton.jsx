import React, { useContext } from 'react';
import { AuthContext } from '../App';
import { logout } from '../api/AuthService';

function LogoutButton() {
    const { setUser, setIsAuthenticated } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            await logout(refreshToken);
            setUser(null);
            setIsAuthenticated(false);
            alert('로그아웃 성공!');
        } catch (error) {
            alert('로그아웃 실패!');
        }
    };

    return <button onClick={handleLogout}>로그아웃</button>;
}

export default LogoutButton;
