// client/src/helper/loader.js
import { defer } from 'react-router-dom';
import apiRequest from './apiRequest.js';

export const singlePropertyLoader = async ({ params }) => {
  try {
    const res = await apiRequest('/listing/' + params.id);
    return res.data;
  } catch (error) {
    console.error('Property loader error:', error);
    throw new Response('Failed to load property', {
      status: error.response?.status || 500,
      statusText: error.response?.statusText || 'Failed to load property',
    });
  }
};

export const propertyLoader = async ({ request }) => {
  try {
    const query = request.url.split('?')[1];
    const listingPromise = apiRequest('/listing?' + query);
    return defer({
      propertyResponse: listingPromise.then((response) => response.data),
    });
  } catch (error) {
    console.error('Properties loader error:', error);
    throw new Response('Failed to load properties', {
      status: error.response?.status || 500,
      statusText: error.response?.statusText || 'Failed to load properties',
    });
  }
};

export const profilePageLoader = async () => {
  try {
    const postPromise = await apiRequest('/user/profileListings');
    return defer({
      postResponse: postPromise,
    });
  } catch (error) {
    console.error('Profile loader error:', error);
    throw new Response('Failed to load profile data', {
      status: error.response?.status || 500,
      statusText: error.response?.statusText || 'Failed to load profile data',
    });
  }
};

export const agentLoader = async ({ params }) => {
  try {
    const { slugOrId } = params;

    if (!slugOrId) {
      throw new Response('Agent ID or slug is required', {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    const response = await apiRequest.get(`/agent/${slugOrId}`);

    if (!response.data) {
      throw new Response('Agent not found', {
        status: 404,
        statusText: 'Agent Not Found',
      });
    }

    return response.data;
  } catch (error) {
    console.error('Agent loader error:', error);

    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;

      if (status === 404) {
        throw new Response('Agent not found', {
          status: 404,
          statusText: 'Agent Not Found',
        });
      }

      if (status === 403) {
        throw new Response('Access denied', {
          status: 403,
          statusText: 'Access Denied',
        });
      }

      throw new Response(message || 'Failed to load agent', {
        status,
        statusText: error.response.statusText || 'Server Error',
      });
    } else if (error.request) {
      // Network error
      throw new Response('Network error - please check your connection', {
        status: 0,
        statusText: 'Network Error',
      });
    } else if (error instanceof Response) {
      // Already a proper response, re-throw
      throw error;
    } else {
      // Unknown error
      throw new Response(error.message || 'Failed to load agent', {
        status: 500,
        statusText: 'Internal Error',
      });
    }
  }
};
