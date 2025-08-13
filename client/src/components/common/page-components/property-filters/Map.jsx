import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Pin from './Pin';

const Map = ({ listings = [] }) => {
  // Default position (Nigeria center)
  const defaultPosition = [9.0579, 7.4951];

  // Filter listings that have valid coordinates
  const validListings = listings.filter(
    (listing) =>
      listing &&
      listing.latitude &&
      listing.longitude &&
      !isNaN(listing.latitude) &&
      !isNaN(listing.longitude)
  );

  // Get center position
  const getCenterPosition = () => {
    if (validListings.length === 0) {
      return defaultPosition;
    }

    // If single listing, center on it
    if (validListings.length === 1) {
      return [validListings[0].latitude, validListings[0].longitude];
    }

    // If multiple listings, calculate center
    const avgLat =
      validListings.reduce((sum, listing) => sum + listing.latitude, 0) /
      validListings.length;
    const avgLng =
      validListings.reduce((sum, listing) => sum + listing.longitude, 0) /
      validListings.length;

    return [avgLat, avgLng];
  };

  // Get zoom level based on number of listings
  const getZoomLevel = () => {
    if (validListings.length === 0) return 6;
    if (validListings.length === 1) return 15;
    return 10;
  };

  const centerPosition = getCenterPosition();
  const zoomLevel = getZoomLevel();

  return (
    <div className="border dark:border-dark h-[300px] w-full">
      {validListings.length > 0 ? (
        <MapContainer
          center={centerPosition}
          zoom={zoomLevel}
          scrollWheelZoom={false}
          className="w-full h-full rounded-lg"
          key={`map-${validListings.length}-${centerPosition.join('-')}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {validListings.map((listing) => (
            <Pin key={listing.id} listing={listing} />
          ))}
        </MapContainer>
      ) : (
        <div className="flex justify-center items-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            Map location not available for this property
          </p>
        </div>
      )}
    </div>
  );
};

export default Map;
