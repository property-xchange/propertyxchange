import { defer } from 'react-router-dom';
import apiRequest from './apiRequest.js';

export const singlePropertyLoader = async ({ params }) => {
  const res = await apiRequest('/listing/' + params.id);
  return res.data;
};

export const propertyLoader = async ({ request }) => {
  const query = request.url.split('?')[1];
  const listingPromise = apiRequest('/listing?' + query);
  return defer({
    propertyResponse: listingPromise.then((response) => response.data),
  });
};

export const profilePageLoader = async () => {
  const postPromise = await apiRequest('/user/profileListings');
  //const chatPromise = apiRequest('/chats');

  return defer({
    postResponse: postPromise,
    //chatResponse: chatPromise.then((response) => response.data),
  });
};
