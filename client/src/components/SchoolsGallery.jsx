import React, { useState, useEffect } from 'react';
import { useSchools } from '../hooks/useSchools.js';

const SchoolsGallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const { schools, loading, error, isConnected } = useSchools();

  const openModal = (school) => {
    setSelectedImage(school);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  if (loading) {
    return (
      <section id="gallery" className="section gallery">
        <div className="container">
          <h2 className="section-title">Schools <span>Gallery</span></h2>
          <div className="loading">Loading schools...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="gallery" className="section gallery">
        <div className="container">
          <h2 className="section-title">Schools <span>Gallery</span></h2>
          <div className="error-message">
            {error}
            <button onClick={() => window.location.reload()} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="section gallery">
      <div className="container">
        <h2 className="section-title">Schools <span>Gallery</span></h2>

        {schools.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏫</div>
            <h3>No Schools Available</h3>
            <p>There are no schools to display at the moment.</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {schools.map((school) => (
              <div 
                key={school._id} 
                className="gallery-item"
                onClick={() => openModal(school)}
              >
                <div className="image-container">
                  <img 
                    src={school.imageUrl} 
                    alt={school.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=School+Image';
                    }}
                  />
                  <div className="image-overlay">
                    <h3>{school.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedImage && (
          <div className="modal" onClick={handleBackdropClick}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <span className="close" onClick={closeModal}>&times;</span>
              <div className="modal-image-container">
                <img 
                  src={selectedImage.imageUrl} 
                  alt={selectedImage.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x400/4A90E2/FFFFFF?text=School+Image';
                  }}
                />
              </div>
              <div className="modal-info">
                <h3>{selectedImage.name}</h3>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SchoolsGallery;