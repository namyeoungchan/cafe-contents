import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p className="copyright">© 2025 우리 카페. 모든 권리 보유.</p>
        <div className="admin-link">
          <Link to="/admin">관리자</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
