import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

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
  const socketRef = useRef(null);
  const pendingReviewsRef = useRef(new Set()); // Track pending review IDs
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
      
      // Create review data with current date
      const reviewToSubmit = {
        ...newReview,
        date: new Date().toISOString().split('T')[0]
      };
      
      // Create temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;
      
      // Add to pending reviews
      pendingReviewsRef.current.add(tempId);
      
      // OPTIMISTIC UPDATE: Add immediately to UI
      const optimisticReview = {
        ...reviewToSubmit,
        _id: tempId,
        createdAt: new Date(),
        isPending: true
      };
      
      setReviews(prev => [optimisticReview, ...prev]);
      
      // Submit to server
      const response = await axios.post(`${API_BASE_URL}/reviews`, reviewToSubmit);
      
      if (response.data.success) {
        // Server will handle the real-time update via WebSocket
        console.log('Review submitted successfully!');
        
        // Clear form and close modal
        setNewReview({ name: '', rating: 5, comment: '' });
        setIsModalOpen(false);
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Error submitting review. Please try again.');
      
      // Remove optimistic update on failure
      const tempId = Array.from(pendingReviewsRef.current).pop();
      if (tempId) {
        setReviews(prev => prev.filter(review => review._id !== tempId));
        pendingReviewsRef.current.delete(tempId);
      }
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

  // Set up real-time updates using Socket.IO
  useEffect(() => {
    fetchReviews();

    // Connect to Socket.IO for real-time updates
    socketRef.current = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    });
    
    socketRef.current.on('connect', () => {
      console.log('✅ Connected to WebSocket server for real-time reviews');
    });

    socketRef.current.on('review_created', (newReview) => {
      console.log('📨 New review received via WebSocket:', newReview);
      
      setReviews(prev => {
        // Check for duplicates by ID
        const isDuplicate = prev.some(review => 
          review._id === newReview._id || 
          (review._id.startsWith('temp-') && 
           review.name === newReview.name && 
           review.comment === newReview.comment &&
           Math.abs(new Date(review.createdAt) - new Date(newReview.createdAt)) < 5000)
        );
        
        if (isDuplicate) {
          console.log('🔄 Duplicate review detected, replacing optimistic update');
          // Replace optimistic review with real one
          return prev.map(review => 
            (review._id.startsWith('temp-') && 
             review.name === newReview.name && 
             review.comment === newReview.comment) ? newReview : review
          );
        }
        
        // Add new review from other users
        console.log('➕ Adding new review from other user');
        return [newReview, ...prev];
      });
      
      // Remove from pending if it was our review
      pendingReviewsRef.current.forEach(tempId => {
        if (tempId.startsWith('temp-')) {
          pendingReviewsRef.current.delete(tempId);
        }
      });
    });

    socketRef.current.on('review_updated', (updatedReview) => {
      console.log('📝 Review updated via WebSocket:', updatedReview);
      setReviews(prev => prev.map(review => 
        review._id === updatedReview._id ? updatedReview : review
      ));
    });

    socketRef.current.on('review_deleted', (data) => {
      console.log('🗑️ Review deleted via WebSocket:', data);
      setReviews(prev => prev.filter(review => review._id !== data.id));
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
    });

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  if (loading && reviews.length === 0) {
    return (
      <div className="reviews-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          Loading reviews...
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-container">
      <h2 className="section-title">School <span>Reviews</span></h2>
      
      {/* Add Review Button */}
      <div className="add-review-section">
        <button className="add-review-btn" onClick={openModal}>
          <i className="fas fa-edit"></i>
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
            <div className="error-message active">
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
        <div className="reviews-header">
          <h3>What People Are Saying ({reviews.length})</h3>
        </div>
        
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <i className="fas fa-comments"></i>
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="reviews-grid">
            {reviews.map(review => (
              <div 
                key={review._id} 
                className={`review-item ${review._id.startsWith('temp-') ? 'review-pending' : ''}`}
              >
                {review._id.startsWith('temp-') && (
                  <div className="review-pending-indicator">
                    <i className="fas fa-sync fa-spin"></i>
                    Publishing...
                  </div>
                )}
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-name">{review.name}</div>
                    <div className="review-date">
                      {review.date ? new Date(review.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Recently'}
                    </div>
                  </div>
                </div>
                <div className="review-rating">
                  <span className="stars">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </span>
                  <span className="rating-text">({review.rating}/5)</span>
                </div>
                <div className="review-comment">{review.comment}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;