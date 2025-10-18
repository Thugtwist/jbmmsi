import React from 'react';

const About = () => {
  const values = [
    {
      icon: "fas fa-graduation-cap",
      title: "Excellence",
      description: "Commit to the highest standards of academic and behavior, attendance and punctuality."
    },
    {
      icon: "fas fa-heart",
      title: "Responsibility",
      description: "Demonstrate compassion, generosity and empathy when confronted with difference or need."
    },
    {
      icon: "fas fa-lightbulb",
      title: "Visionary",
      description: "Offer curiosity and thoughtfulness; seeking out new knowledge and weaving it into our understanding."
    }
  ];

  return (
    <section id="about" className="section about">
      <div className="container">
        <div className="about-content">
          <div className="about-img">
            <img src={`${process.env.PUBLIC_URL}/image/jbmmsi-logo.png`} alt="About JBMMSI" />
          </div>
          
          <div className="about-text">
            <h2 className="section-title">About <span>Us</span></h2>
            <p>Jem Brilliant Mind Montissori School Inc. is committed to providing quality education that nurtures the holistic development of every child.</p>
            <p>Our mission is to create a learning environment that fosters curiosity, creativity, and critical thinking while instilling strong moral values.</p>
            
            <div className="values-list">
              {values.map((value, index) => (
                <div key={index} className="value-item">
                  <div className="value-icon">
                    <i className={value.icon}></i>
                  </div>
                  <div className="value-text">
                    <h3>{value.title}</h3>
                    <p>{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;