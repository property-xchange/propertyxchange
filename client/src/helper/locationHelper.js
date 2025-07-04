// helper/locationHelper.js

/**
 * Get the user's current location using the Geolocation API
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    // Options for geolocation
    const options = {
      enableHighAccuracy: true, // Use GPS if available
      timeout: 15000, // 15 seconds timeout
      maximumAge: 300000, // Accept cached position up to 5 minutes old
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({
          latitude: parseFloat(latitude.toFixed(6)),
          longitude: parseFloat(longitude.toFixed(6)),
        });
      },
      (error) => {
        let errorMessage = 'Failed to get location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              'Location access denied by user. Please enable location services and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              'Location information is unavailable. Please check your connection and try again.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage =
              'An unknown error occurred while retrieving location.';
            break;
        }

        reject(new Error(errorMessage));
      },
      options
    );
  });
};

/**
 * Validate coordinate format
 * @param {string|number} latitude
 * @param {string|number} longitude
 * @returns {boolean}
 */
export const validateCoordinates = (latitude, longitude) => {
  const latitudeRegex = /^-?([1-8]?[0-9](\.[0-9]+)?|90(\.0+)?)$/;
  const longitudeRegex = /^-?((1[0-7]|[1-9])?[0-9](\.[0-9]+)?|180(\.0+)?)$/;

  return (
    latitudeRegex.test(latitude.toString()) &&
    longitudeRegex.test(longitude.toString())
  );
};

/**
 * Format coordinates to a specified number of decimal places
 * @param {number} coordinate
 * @param {number} decimalPlaces
 * @returns {string}
 */
export const formatCoordinate = (coordinate, decimalPlaces = 6) => {
  return parseFloat(coordinate).toFixed(decimalPlaces);
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number}
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Get location information from coordinates using reverse geocoding
 * Note: This would require a geocoding service API (like Google Maps, OpenStreetMap, etc.)
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Object>}
 */
export const reverseGeocode = async (latitude, longitude) => {
  // This is a placeholder - you'd need to implement with your preferred geocoding service
  // Example with OpenStreetMap Nominatim (free service)
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }

    const data = await response.json();

    return {
      address: data.display_name,
      city: data.address?.city || data.address?.town || data.address?.village,
      state: data.address?.state,
      country: data.address?.country,
      postcode: data.address?.postcode,
    };
  } catch (error) {
    throw new Error('Failed to get address from coordinates');
  }
};

/**
 * Check if the browser supports geolocation
 * @returns {boolean}
 */
export const isGeolocationSupported = () => {
  return 'geolocation' in navigator;
};

/**
 * Request location permission and check current permission status
 * @returns {Promise<string>} Permission status: 'granted', 'denied', or 'prompt'
 */
export const checkLocationPermission = async () => {
  if (!navigator.permissions) {
    return 'unknown';
  }

  try {
    const permission = await navigator.permissions.query({
      name: 'geolocation',
    });
    return permission.state;
  } catch (error) {
    return 'unknown';
  }
};
