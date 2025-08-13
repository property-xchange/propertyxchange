import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SingleProductCard from './SingleProductCard';
import apiRequest from '../../../helper/apiRequest';

const Featured = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      setLoading(true);
      const response = await apiRequest.get('/listing/featured');
      setFeaturedProperties(response.data || []);
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      setError('Failed to load featured properties');
    } finally {
      setLoading(false);
    }
  };

  // Get items per slide based on screen size
  const getItemsPerSlide = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 768) return 1; // Mobile
    if (window.innerWidth < 1024) return 2; // Tablet
    return 3; // Desktop
  };

  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());

  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(getItemsPerSlide());
      setCurrentIndex(0); // Reset to first slide on resize
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, featuredProperties.length - itemsPerSlide);
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, featuredProperties.length - itemsPerSlide);
      return prevIndex === 0 ? maxIndex : prevIndex - 1;
    });
  };

  if (loading) {
    return (
      <div className="pt-10 pb-16">
        <div className="text-center">
          <h1 className="mx-auto sub-heading">featured</h1>
          <h1 className="heading">explore featured latest properties</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-10 pb-16">
        <div className="text-center">
          <h1 className="mx-auto sub-heading">featured</h1>
          <h1 className="heading">explore featured latest properties</h1>
        </div>
        <div className="text-center text-red-500 mt-8">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!featuredProperties || featuredProperties.length === 0) {
    return (
      <div className="pt-10 pb-16">
        <div className="text-center">
          <h1 className="mx-auto sub-heading">featured</h1>
          <h1 className="heading">explore featured latest properties</h1>
        </div>
        <div className="text-center text-gray-500 mt-8">
          <p>No featured properties available at the moment.</p>
        </div>
      </div>
    );
  }

  const maxIndex = Math.max(0, featuredProperties.length - itemsPerSlide);
  const totalSlides = Math.ceil(featuredProperties.length / itemsPerSlide);

  return (
    <div className="pt-10 pb-16">
      <div className="text-center">
        <h1 className="mx-auto sub-heading">featured</h1>
        <h1 className="heading">explore featured latest properties</h1>
      </div>

      <div className="relative mt-8">
        {/* Navigation Buttons */}
        {featuredProperties.length > itemsPerSlide && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={currentIndex === 0}
            >
              <ChevronLeft
                size={24}
                className="text-gray-600 dark:text-gray-400"
              />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={currentIndex >= maxIndex}
            >
              <ChevronRight
                size={24}
                className="text-gray-600 dark:text-gray-400"
              />
            </button>
          </>
        )}

        {/* Properties Container */}
        <div className="overflow-hidden mx-8 md:mx-12">
          <div
            className="flex gap-4 transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${
                currentIndex * (100 / itemsPerSlide)
              }%)`,
              width: `${(featuredProperties.length / itemsPerSlide) * 100}%`,
            }}
          >
            {featuredProperties.map((property) => (
              <div
                key={property.id}
                className={`flex-none ${
                  itemsPerSlide === 1
                    ? 'w-full'
                    : itemsPerSlide === 2
                    ? 'w-1/2'
                    : 'w-1/3'
                } px-2`}
              >
                <SingleProductCard
                  id={property?.id}
                  slug={property?.slug || ''}
                  name={property?.name || 'Unnamed Property'}
                  street={property?.street || 'Unknown location'}
                  price={property?.price || 0}
                  toilets={property?.toilets || 0}
                  installments={property?.installment || false}
                  purpose={property?.purpose || ''}
                  number_of_beds={property?.number_of_beds || 0}
                  number_of_bathrooms={property?.number_of_bathrooms || 0}
                  offer={property?.offer || false}
                  discountPrice={property?.discountPrice || 0}
                  discountEndDate={property?.discountEndDate || ''}
                  appendTo={property?.appendTo || ''}
                  images={property?.images || []}
                  updatedAt={property?.updatedAt || ''}
                  createdAt={property?.createdAt || ''}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        {featuredProperties.length > itemsPerSlide && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * itemsPerSlide)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  Math.floor(currentIndex / itemsPerSlide) === index
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Featured;
