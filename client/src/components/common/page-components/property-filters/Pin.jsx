import { Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';

function Pin({ listing }) {
  return (
    <>
      <Marker key={listing.id} position={[listing.latitude, listing.longitude]}>
        <Popup>
          <div
            className="
          flex gap-3 w-[200px]"
          >
            <img
              src={listing.image}
              alt=""
              className="w-20 h-15 object-cover rounded-lg"
            />
            <div className="flex justify-between flex-col">
              <Link to={`/property/${listing.id}`}>{listing.name}</Link>
              <span>{listing.number_of_beds} bedroom</span>
              <span>{listing.number_of_bathrooms} bathroom</span>
              <b>₦ {listing.price}</b>
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
}

export default Pin;
