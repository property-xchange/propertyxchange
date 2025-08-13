import { Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';

// Fix for default markers not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Pin({ listing }) {
  // Ensure listing data exists with fallbacks
  const listingData = {
    id: listing?.id || '',
    slug: listing?.slug || listing?.id || '',
    name: listing?.name || 'Unnamed Property',
    latitude: listing?.latitude || 0,
    longitude: listing?.longitude || 0,
    number_of_beds: listing?.number_of_beds || 0,
    number_of_bathrooms: listing?.number_of_bathrooms || 0,
    price: listing?.price || 0,
    images: listing?.images || [],
  };

  // Format price safely
  const formatPrice = (priceValue) => {
    if (!priceValue || priceValue === 0) return '0';
    return new Intl.NumberFormat('en-NG').format(priceValue);
  };

  // Get first image safely
  const getImageSrc = () => {
    if (listingData.images && listingData.images.length > 0) {
      return listingData.images[0];
    }
    return '/fallback.jpg'; // Fallback image
  };

  // Don't render if no valid coordinates
  if (!listingData.latitude || !listingData.longitude) {
    return null;
  }

  return (
    <Marker
      key={listingData.id}
      position={[listingData.latitude, listingData.longitude]}
    >
      <Popup>
        <div className="flex gap-3 w-[200px]">
          <img
            src={getImageSrc()}
            alt={listingData.name}
            className="w-20 h-15 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = '/fallback.jpg';
            }}
          />
          <div className="flex justify-between flex-col">
            <Link
              to={`/property/${listingData.slug}`}
              className="font-medium text-blue-600 hover:text-blue-800"
            >
              {listingData.name}
            </Link>
            <span className="text-sm text-gray-600">
              {listingData.number_of_beds} bedroom
              {listingData.number_of_beds !== 1 ? 's' : ''}
            </span>
            <span className="text-sm text-gray-600">
              {listingData.number_of_bathrooms} bathroom
              {listingData.number_of_bathrooms !== 1 ? 's' : ''}
            </span>
            <b className="text-green-600">₦ {formatPrice(listingData.price)}</b>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default Pin;
