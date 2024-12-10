import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Pin from './Pin';

const Map = ({ listings }) => {
  // const position = [9.0579, 7.4951];
  // console.log(listings);
  // return (
  //   <div className="border dark:border-dark h-[300px]">
  //     <MapContainer
  //       position={position}
  //       center={position}
  //       zoom={5}
  //       scrollWheelZoom={false}
  //       className="w-full h-full rounded-lg"
  //     >
  //       <TileLayer
  //         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  //         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  //       />
  //       {listings.map((listing) => (
  //         <Pin key={listing.id} listing={listing} />
  //       ))}
  //     </MapContainer>
  //   </div>
  // );
};

export default Map;
