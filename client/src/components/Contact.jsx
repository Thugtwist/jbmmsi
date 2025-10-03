import React from 'react';

const Contact = () => {
  const contactInfo = [
    {
      icon: "fas fa-phone",
      title: "Phone",
      details: "0993 617 8050"
    },
    {
      icon: "fas fa-envelope",
      title: "Email",
      details: "jemmonte926@gmail.com"
    },
    {
      icon: "fas fa-map-marker-alt",
      title: "Address",
      details: "Phase 6 Blk 3 Lot 4 Eastwood Residences San Isidro, Rodriguez, Philippines, 1860"
    }
  ];

  return (
    <section id="contact" className="section contact">
      <div className="container">
        <h2 className="section-title">Contact <span>Info</span></h2>
        
        <div className="contact-info">
          {contactInfo.map((contact, index) => (
            <div key={index} className="contact-item">
              <div className="contact-icon">
                <i className={contact.icon}></i>
              </div>
              <div className="contact-details">
                <h3>{contact.title}</h3>
                <p>{contact.details}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="map-container">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3858.2478503573434!2d121.15413297415263!3d14.75506157327823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397a5004e2b3b39%3A0x956af69499648781!2sJem%20Brilliant%20Mind%20Montessori%20School%20Inc.%20(AC%20and%20C%20Building)!5e0!3m2!1sen!2sph!4v1758626747672!5m2!1sen!2sph" 
            width="100%" 
            height="400" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="JBMMSI Location"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default Contact;