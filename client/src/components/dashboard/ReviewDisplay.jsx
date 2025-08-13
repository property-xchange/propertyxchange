import React, { useState, useEffect } from 'react';
import { FaStar, FaUser } from 'react-icons/fa';
import { MdRateReview } from 'react-icons/md';
import { GoVerified, GoUnverified } from 'react-icons/go';
import apiRequest from '../../helper/apiRequest';
import ReviewForm from '../forms/ReviewForm';
import Avatar from '../../assets/avatar.webp';

// Star Rating Component
const StarRating = ({ rating, size = 'text-sm' }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`${size} ${
            star <= rating
              ? 'text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
        ({rating}/5)
      </span>
    </div>
  );
};

// Rating Summary Component
const RatingSummary = ({ averageRating, totalReviews, ratingDistribution }) => {
  const getPercentage = (count) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center mb-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white mr-2">
              {averageRating.toFixed(1)}
            </span>
            <StarRating rating={Math.round(averageRating)} size="text-lg" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center text-sm">
              <span className="w-3 text-gray-600 dark:text-gray-400">
                {rating}
              </span>
              <FaStar className="w-3 h-3 text-yellow-400 mx-1" />
              <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mx-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{
                    width: `${getPercentage(ratingDistribution[rating] || 0)}%`,
                  }}
                ></div>
              </div>
              <span className="w-8 text-xs text-gray-600 dark:text-gray-400">
                {ratingDistribution[rating] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Individual Review Component
const ReviewItem = ({ review }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <img
            src={review.author.profilePhoto || Avatar}
            alt={review.author.username}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
            onError={(e) => {
              e.target.src = Avatar;
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {review.author.firstName || review.author.username}
              </h4>
              {review.author.verified ? (
                <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                  <GoVerified className="w-3 h-3 mr-1" />
                  Verified
                </span>
              ) : (
                <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <GoUnverified className="w-3 h-3 mr-1" />
                  Unverified
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(review.createdAt)}
            </span>
          </div>

          <div className="mb-3">
            <StarRating rating={review.rating} />
          </div>

          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            {review.comment}
          </p>
        </div>
      </div>
    </div>
  );
};

const ReviewsDisplay = ({ listingId, className = '' }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchReviews();
  }, [listingId, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await apiRequest.get(
        `/listing/${listingId}/reviews?page=${currentPage}&limit=10`
      );

      setReviews(response.data.reviews);
      setAverageRating(response.data.averageRating);
      setTotalReviews(response.data.totalReviews);
      setRatingDistribution(response.data.ratingDistribution);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    // Refresh reviews after a new review is submitted
    fetchReviews();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="space-y-6">
        {/* Rating Summary */}
        {totalReviews > 0 && (
          <RatingSummary
            averageRating={averageRating}
            totalReviews={totalReviews}
            ratingDistribution={ratingDistribution}
          />
        )}

        {/* Review Form */}
        <ReviewForm
          listingId={listingId}
          onReviewSubmitted={handleReviewSubmitted}
        />

        {/* Reviews List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Reviews ({totalReviews})
          </h3>

          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <FaUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No reviews yet. Be the first to review this property!
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {(pagination.current - 1) * 10 + 1} to{' '}
                    {Math.min(pagination.current * 10, pagination.total)} of{' '}
                    {pagination.total} reviews
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.current - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                      Page {pagination.current} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.current + 1)}
                      disabled={!pagination.hasNext}
                      className="px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsDisplay;
