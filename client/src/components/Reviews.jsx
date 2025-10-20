import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    comment: ''
  });

  const modalRef = useRef(null);
  const API_BASE_URL = 'http://localhost:3001/api';

  // Fetch reviews from server
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/reviews`);
      if (response.data.success) {
        setReviews(response.data.data);
      } else {
        setError('Failed to fetch reviews');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Error loading reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Submit new review to server
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const response = await axios.post(`${API_BASE_URL}/reviews`, newReview);
      
      if (response.data.success) {
        setNewReview({ name: '', rating: 5, comment: '' });
        setIsModalOpen(false);
        // You can replace alert with your success message style
      } else {
        setError('Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Error submitting review. Please try again.');
    }
  };

  const handleChange = (e) => {
    setNewReview({
      ...newReview,
      [e.target.name]: e.target.value
    });
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewReview({ name: '', rating: 5, comment: '' });
    setError('');
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.keyCode === 27) closeModal();
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // Set up real-time updates using your existing WebSocket setup
  useEffect(() => {
    fetchReviews();

    // Connect to WebSocket for real-time updates
    const socket = new WebSocket('ws://localhost:3001');
    
    socket.onopen = () => {
      console.log('WebSocket connected for reviews');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle real-time review updates from your server
        if (data.type === 'review_created') {
          setReviews(prev => [data.payload, ...prev]);
        } else if (data.type === 'review_updated') {
          setReviews(prev => prev.map(review => 
            review._id === data.payload._id ? data.payload : review
          ));
        } else if (data.type === 'review_deleted') {
          setReviews(prev => prev.filter(review => review._id !== data.payload.id));
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, []);

  if (loading && reviews.length === 0) {
    return <div className="reviews-container">Loading reviews...</div>;
  }

  return (
    <div className="reviews-container">
      <h2 className="section-title">School<span>Reviews</span></h2>
      
      {/* Add Review Button */}
      <div className="add-review-section">
        <button className="add-review-btn" onClick={openModal}>
          Write a Review
        </button>
      </div>

      {/* Modal */}
      <div className={`modal ${isModalOpen ? 'active' : ''}`} onClick={closeModal}>
        <div 
          className="modal-content" 
          onClick={(e) => e.stopPropagation()}
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
        >
          <span className="close" onClick={closeModal}>×</span>
          
          <div className="modal-icon">
            <i className="fas fa-star"></i>
          </div>
          
          <h2 className="modal-title" id="review-modal-title">Add Your Review</h2>
          <p className="modal-subtitle">Share your experience with the school</p>
          
          {error && (
            <div className={`error-message ${error ? 'active' : ''}`}>
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="review-form">
            <div className="form-group">
              <label htmlFor="review-name">Your Name</label>
              <div className="input-with-icon">
                <i className="fas fa-user input-icon"></i>
                <input
                  id="review-name"
                  type="text"
                  name="name"
                  value={newReview.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="review-rating">Rating</label>
              <div className="input-with-icon">
                <i className="fas fa-star input-icon"></i>
                <select
                  id="review-rating"
                  name="rating"
                  value={newReview.rating}
                  onChange={handleChange}
                >
                  <option value={5}>5 Stars - Excellent</option>
                  <option value={4}>4 Stars - Very Good</option>
                  <option value={3}>3 Stars - Good</option>
                  <option value={2}>2 Stars - Fair</option>
                  <option value={1}>1 Star - Poor</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="review-comment">Your Review</label>
              <div className="input-with-icon">
                <i className="fas fa-comment input-icon"></i>
                <textarea
                  id="review-comment"
                  name="comment"
                  value={newReview.comment}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Share your thoughts about the school..."
                />
              </div>
            </div>
            
            <button type="submit" className="submit-btn">
              <i className="fas fa-paper-plane"></i>
              Submit Review
            </button>
          </form>
        </div>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        <h3>What People Are Saying ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p>No reviews yet. Be the first to share your experience!</p>
        ) : (
          reviews.map(review => (
            <div key={review._id} className="review-item">
              <div className="review-header">
                <div className="reviewer-name">{review.name}</div>
                <div className="review-date">
                  {review.date ? new Date(review.date).toLocaleDateString() : 'Recently'}
                </div>
              </div>
              <div className="review-rating">
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                <span className="rating-text">({review.rating}/5)</span>
              </div>
              <div className="review-comment">{review.comment}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;