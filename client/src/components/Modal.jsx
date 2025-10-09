import React, { useState, useEffect } from 'react';

const Modal = ({ isOpen, onClose, selectedProgram }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    grade: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Check if current program has grade choices
  const hasGradeChoices = selectedProgram === "Elementary" || selectedProgram === "Junior Highschool";

  // Grade options for Elementary and Junior Highschool
  const gradeOptions = {
    "Elementary": [
      { value: "Grade 1", label: "Grade 1" },
      { value: "Grade 2", label: "Grade 2" },
      { value: "Grade 3", label: "Grade 3" },
      { value: "Grade 4", label: "Grade 4" },
      { value: "Grade 5", label: "Grade 5" },
      { value: "Grade 6", label: "Grade 6" }
    ],
    "Junior Highschool": [
      { value: "Grade 7", label: "Grade 7" },
      { value: "Grade 8", label: "Grade 8" },
      { value: "Grade 9", label: "Grade 9" },
      { value: "Grade 10", label: "Grade 10" }
    ]
  };

  // Get the appropriate grade options based on selected program
  const getGradeOptions = () => {
    return gradeOptions[selectedProgram] || [];
  };

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        grade: ''
      });
      setShowSuccess(false);
      setShowError(false);
    }
  }, [isOpen, selectedProgram]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate grade selection for programs that require it
    if (hasGradeChoices && !formData.grade) {
      alert(`Please select a grade level for ${selectedProgram}.`);
      return;
    }

    // Prepare the data to send
    const submissionData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      program: selectedProgram,
      grade: hasGradeChoices ? formData.grade : 'N/A',
      programDisplay: hasGradeChoices && formData.grade 
        ? `${selectedProgram} - ${formData.grade}`
        : selectedProgram,
      timestamp: new Date()
    };

    try {
      const response = await fetch('http://localhost:3001/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        setShowSuccess(true);
        setShowError(false);
        setFormData({ 
          name: '', 
          email: '', 
          phone: '', 
          message: '',
          grade: ''
        });
        
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
    setFormData({ 
      name: '', 
      email: '', 
      phone: '', 
      message: '',
      grade: ''
    });
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
         
        <h2 className="modal-title">Inquiry Form - {selectedProgram}</h2>
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
          
          {/* Fixed Program Display */}
          <div className="form-group">
            <label htmlFor="program">Program of Interest:</label>
            <div className="input-with-icon">
              <div className="input-icon"><i className="fas fa-graduation-cap"></i></div>
              <input 
                type="text" 
                id="program" 
                name="program" 
                value={selectedProgram}
                readOnly 
                className="read-only-input"
              />
            </div>
          </div>
          
          {/* Grade Selection - for Elementary and Junior Highschool */}
          {hasGradeChoices && (
            <div className="form-group grade-selection">
              <label htmlFor="grade">Grade Level: *</label>
              <div className="input-with-icon">
                <div className="input-icon">
                  <i className={selectedProgram === "Elementary" ? "fas fa-star" : "fas fa-chalkboard"}></i>
                </div>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a grade level...</option>
                  {getGradeOptions().map(grade => (
                    <option key={grade.value} value={grade.value}>
                      {grade.label}
                    </option>
                  ))}
                </select>
              </div>
              <small className="grade-help">
                {selectedProgram === "Elementary" 
                  ? "Please select the specific grade level (1-6)"
                  : "Please select the specific grade level (7-10)"
                }
              </small>
            </div>
          )}
          
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
          
          <button type="submit" className="submit-btn">
            Submit Inquiry
          </button>
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