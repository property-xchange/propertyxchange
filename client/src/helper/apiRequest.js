import axios from 'axios';

const apiRequest = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_SERVER_DOMAINAPI,
  withCredentials: true,
});

export default apiRequest;
