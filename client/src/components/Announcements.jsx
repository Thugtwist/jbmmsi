import React, { useState, useEffect } from 'react';

const Announcements = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const announcements = [
    {
      title: "School Opening 2025",
      date: "July 2025",
      description: "We are excited to announce that the new school year will begin on July 15, 2025. Registration is now open for all grade levels.",
      image: "/img/announcemet1.jpg"
    },
    {
      title: "Summer Enrichment Program",
      date: "June 2025",
      description: "Join our summer enrichment program starting June 1st. Activities include arts, sports, and academic enrichment.",
      image: "/img/announcement2.jpg"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  const showSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section id="announcements" className="section announcements">
      <div className="container">
        <h2 className="section-title">Recent <span>Announcements</span></h2>
        
        <div className="announcement-slider">
          <div className="announcement-track">
            {announcements.map((announcement, index) => (
              <div 
                key={index} 
                className="announcement-slide" 
                style={{ display: index === currentSlide ? 'flex' : 'none' }}
              >
                <div className="announcement-info">
                  <h3 className="announcement-title">{announcement.title}</h3>
                  <p className="announcement-date">{announcement.date}</p>
                  <p className="announcement-desc">{announcement.description}</p>
                </div>
                <div className="announcement-img">
                  <img src={announcement.image} alt={announcement.title} />
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