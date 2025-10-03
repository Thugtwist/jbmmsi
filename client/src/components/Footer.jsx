import React from 'react';

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-about">
            <div className="footer-logo">
              <h2 className="logo-text"><span>JBMMSI</span></h2>
            </div>
            <p>Jem Brilliant Mind Montissori School Inc. provides quality education that nurtures young minds and prepares them for a bright future.</p>
            <div className="social-links">
              <a href="https://www.facebook.com/profile.php?id=61556758118331" target="_blank" rel="noopener noreferrer" className="social-link">
                <i className="fab fa-facebook-f"></i>
              </a>
            </div>
          </div>
          
          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#hero">Home</a></li>
              <li><a href="#programs">Programs</a></li>
              <li><a href="#announcements">Announcements</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          
          <div className="footer-contact">
            <h3>Contact Us</h3>
            <p><i className="fas fa-phone"></i> 0993 617 8050</p>
            <p><i className="fas fa-envelope"></i> jemmonte926@gmail.com</p>
            <p><i className="fas fa-map-marker-alt"></i> Phase 6 Blk 3 Lot 4 Eastwood Residences San Isidro, Rodriguez, Philippines</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>Copyright © 2025 JBMMSI. All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;