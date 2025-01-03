import './Footer.css';
import youtube from '../img/icons/youtube.png';
import instagram from '../img/icons/Instagram.png';
import Logo from "../img/MainLogo.png";

const Footer = () => {
	return (
		<div className="Footer">
			<div className="inner-wrap">
				<div className="footer-content">
					<img src={Logo} alt="Logo" className="footer-logo"/>
					<p className="footer-contact">Contact to : ssw123c@gmail.com<br/>
						위 웹페이지는 비상업적 포트폴리오 목적으로 제작된 사이트입니다.
					</p>

					<div className="footer-links">
						<a href="#terms">이용약관</a> |
						<a href="#privacy"> 개인정보처리방침</a> |
						<a href="#copyright"> 저작권정책</a> |
						<a href="#reject"> 이메일주소무단수집거부</a> |
						<a href="#sitemap"> 사이트맵</a>
					</div>
				</div>
				<div className="footer-icons">
					<img src={youtube} alt="youtube"/>
					<img src={instagram} alt="instagram"/>
				</div>
			</div>
		</div>
	);
};

export default Footer;