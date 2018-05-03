import axios from 'axios';

export default axios.create({
  baseURL: (window.EXTERNAL_HOST || "") + '/api',
  responseType: 'json',
  timeout: 3000
});
