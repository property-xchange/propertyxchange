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
      setFeaturedProperties(response.data);
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      setError('Failed to load featured properties');
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === featuredProperties.length - 3 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? featuredProperties.length - 3 : prevIndex - 1
    );
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

  if (featuredProperties.length === 0) {
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

  const visibleProperties = featuredProperties.slice(
    currentIndex,
    currentIndex + 3
  );

  return (
    <div className="pt-10 pb-16">
      <div className="text-center">
        <h1 className="mx-auto sub-heading">featured</h1>
        <h1 className="heading">explore featured latest properties</h1>
      </div>

      <div className="relative mt-8">
        {/* Navigation Buttons */}
        {featuredProperties.length > 3 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={currentIndex === 0}
            >
              <ChevronLeft
                size={24}
                className="text-gray-600 dark:text-gray-400"
              />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={currentIndex >= featuredProperties.length - 3}
            >
              <ChevronRight
                size={24}
                className="text-gray-600 dark:text-gray-400"
              />
            </button>
          </>
        )}

        {/* Properties Container */}
        <div className="overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
          >
            {featuredProperties.map((property) => (
              <div key={property.id} className="flex-none w-1/3 px-2">
                <SingleProductCard
                  id={property.id}
                  slug={property.slug}
                  name={property.name}
                  street={property.street}
                  price={property.price}
                  toilets={property.toilets}
                  installments={property.installment}
                  purpose={property.purpose}
                  number_of_beds={property.number_of_beds}
                  number_of_bathrooms={property.number_of_bathrooms}
                  offer={property.offer}
                  discountPrice={property.discountPrice}
                  discountEndDate={property.discountEndDate}
                  appendTo={property.appendTo}
                  images={property.images}
                  updatedAt={property.updatedAt}
                  createdAt={property.createdAt}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        {featuredProperties.length > 3 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({
              length: Math.ceil(featuredProperties.length / 3),
            }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  Math.floor(currentIndex / 3) === index
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
