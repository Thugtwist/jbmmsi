import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuActive(!isMenuActive);
  };

  const closeMenu = () => {
    setIsMenuActive(false);
  };

  return (
    <header className={isScrolled ? 'scrolled' : ''} id="header">
      <div className="container">
        <nav className="navbar">
          <div className="logo">
            <div className="logo-img">
            <img src={`${process.env.PUBLIC_URL}/image/jbmmsi-logo.png`} alt="JBMMSI Logo" />
            </div>
            <a href="#hero" className="logo-text"><span>JBMMSI</span></a>
          </div>
          
          <ul className={`nav-menu ${isMenuActive ? 'active' : ''}`}>
            <li className="nav-item"><a href="#hero" className="nav-link" onClick={closeMenu}>Home</a></li>
            <li className="nav-item"><a href="#programs" className="nav-link" onClick={closeMenu}>Programs</a></li>
            
            <li className="nav-item"><a href="#announcements" className="nav-link" onClick={closeMenu}>Announcements</a></li>
            <li className="nav-item"><a href="#about" className="nav-link" onClick={closeMenu}>About Us</a></li>
            <li className="nav-item"><a href="#contact" className="nav-link" onClick={closeMenu}>Contact</a></li>
          </ul>
          
          <div className={`hamburger ${isMenuActive ? 'active' : ''}`} onClick={toggleMenu}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;