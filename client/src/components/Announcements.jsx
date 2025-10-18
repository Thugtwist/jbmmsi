import React, { useState, useEffect } from 'react';
import { useAnnouncements } from '../hooks/useAnnouncements.js';

const Announcements = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const { announcements, loading, error, isConnected } = useAnnouncements();

  // Auto-slide effect
  useEffect(() => {
    if (announcements.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % announcements.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [announcements.length]);

  // Preload images for better performance
  useEffect(() => {
    announcements.forEach((announcement) => {
      if (announcement.image && !loadedImages.has(announcement._id)) {
        const img = new Image();
        img.src = getImageUrl(announcement.image);
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(announcement._id));
        };
      }
    });
  }, [announcements, loadedImages]);

  const getImageUrl = (imagePath) => {
    // Handle different image URL formats
    if (imagePath.startsWith('http')) {
      return imagePath;
    } else if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:3001${imagePath}`;
    } else {
      return `http://localhost:3001/uploads/${imagePath}`;
    }
  };

  const getPlaceholderUrl = () => {
    return `${process.env.PUBLIC_URL}/image/placeholder.jpg`;
  };

  const handleImageError = (e) => {
    e.target.src = getPlaceholderUrl();
  };

  const handleImageLoad = (announcementId) => {
    setLoadedImages(prev => new Set(prev).add(announcementId));
  };

  const showSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <section id="announcements" className="section announcements">
        <div className="container">
          <h2 className="section-title">Recent <span>Announcements</span></h2>
          <div className="loading">Loading announcements...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="announcements" className="section announcements">
        <div className="container">
          <h2 className="section-title">Recent <span>Announcements</span></h2>
          <div className="error-message">
            Error: {error}
            <button 
              onClick={() => window.location.reload()} 
              className="retry-button"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (announcements.length === 0) {
    return (
      <section id="announcements" className="section announcements">
        <div className="container">
          <h2 className="section-title">Recent <span>Announcements</span></h2>
          <div className="no-announcements">
            No announcements available.
            {!isConnected && <div className="connection-note">(Real-time updates offline)</div>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="announcements" className="section announcements">
      <div className="container">
        <h2 className="section-title">Recent <span>Announcements</span></h2>
        
        <div className="announcement-slider">
          <div className="announcement-track">
            {announcements.map((announcement, index) => (
              <div 
                key={announcement._id} 
                className="announcement-slide" 
                style={{ display: index === currentSlide ? 'flex' : 'none' }}
              >
                <div className="announcement-info">
                  <h3 className="announcement-title">{announcement.title}</h3>
                  <p className="announcement-date">{announcement.date}</p>
                  <p className="announcement-desc">{announcement.description}</p>
                </div>
                <div className="announcement-img">
                  <img 
                    src={getImageUrl(announcement.image)}
                    alt={announcement.title}
                    onLoad={() => handleImageLoad(announcement._id)}
                    onError={handleImageError}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="slider-nav">
            {announcements.map((_, index) => (
              <div 
                key={index}
                className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => showSlide(index)}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Announcements;