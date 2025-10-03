import React, { useState } from 'react';

const Modal = ({ isOpen, onClose, selectedProgram }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3001/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          program: selectedProgram,
          timestamp: new Date()
        })
      });

      if (response.ok) {
        setShowSuccess(true);
        setShowError(false);
        setFormData({ name: '', email: '', phone: '', message: '' });
        
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 2000);
      } else {
        throw new Error('Failed to save inquiry');
      }
    } catch (error) {
      setShowError(true);
      setShowSuccess(false);
      console.error('Error:', error);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', phone: '', message: '' });
    setShowSuccess(false);
    setShowError(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal active" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={handleClose}>&times;</span>
        <div className="modal-icon">
          <i className="fas fa-envelope"></i>
        </div>
         
        <h2 className="modal-title">Inquiry Form</h2>
        <p className="modal-subtitle">We'll get back to you within 24 hours</p>
        
        <form id="inquiryForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <div className="input-with-icon">
              <div className="input-icon"><i className="fas fa-user"></i></div>
              <input 
                type="text" 
                id="name" 
                name="name" 
                placeholder="Your full name" 
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <div className="input-with-icon">
              <div className="input-icon"><i className="fas fa-envelope"></i></div>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Your email address" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone:</label>
            <div className="input-with-icon">
              <div className="input-icon"><i className="fas fa-phone"></i></div>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                placeholder="Your phone number" 
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="program">Program of Interest:</label>
            <div className="input-with-icon">
              <div className="input-icon"><i className="fas fa-graduation-cap"></i></div>
              <input 
                type="text" 
                id="program" 
                name="program" 
                placeholder="Program you're interested in" 
                value={selectedProgram}
                readOnly 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Message:</label>
            <div className="input-with-icon">
              <div className="input-icon" style={{alignItems: 'flex-start', paddingTop: '16px'}}>
                <i className="fas fa-comment"></i>
              </div>
              <textarea 
                id="message" 
                name="message" 
                rows="4" 
                placeholder="Tell us about your inquiry" 
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
          </div>
          
          <button type="submit">Submit Inquiry</button>
        </form>
        
        <div className={`success-message ${showSuccess ? 'active' : ''}`}>
          <i className="fas fa-check-circle"></i> Thank you for your inquiry! We'll get back to you soon.
        </div>
        
        <div className={`error-message ${showError ? 'active' : ''}`}>
          <i className="fas fa-exclamation-circle"></i> There was an error submitting your inquiry. Please try again.
        </div>
        
        <div className="modal-footer">
          <p>We value your privacy. Your information will not be shared with third parties.</p>
        </div>
      </div>
    </div>
  );
};

export default Modal;