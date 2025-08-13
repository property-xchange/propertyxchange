import React, { useState, useContext } from 'react';
import { FaStar } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from '../../helper/apiRequest';
import toast from 'react-hot-toast';

const ReviewForm = ({ listingId, onReviewSubmitted, className = '' }) => {
  const { currentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('Please login to submit a review');
      return;
    }

    if (formData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!formData.comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setLoading(true);

    try {
      await apiRequest.post('/listing/reviews', {
        listingId,
        rating: formData.rating,
        comment: formData.comment.trim(),
      });

      toast.success(
        'Review submitted successfully! It will be visible after approval.'
      );

      // Reset form
      setFormData({ rating: 0, comment: '' });
      setHoveredRating(0);

      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleRatingHover = (rating) => {
    setHoveredRating(rating);
  };

  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  if (!currentUser) {
    return (
      <div
        className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center ${className}`}
      >
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please login to write a review
        </p>
        <a
          href="/sign-in"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Login
        </a>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Write a Review
      </h3>

      <div className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rating *
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => handleRatingHover(star)}
                onMouseLeave={handleRatingLeave}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <FaStar
                  className={`w-6 h-6 transition-colors ${
                    star <= (hoveredRating || formData.rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </button>
            ))}
            {formData.rating > 0 && (
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {formData.rating} out of 5 stars
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Comment *
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, comment: e.target.value }))
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Share your experience with this property..."
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formData.comment.length}/500 characters
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={
              loading || formData.rating === 0 || !formData.comment.trim()
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </div>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
