import axios from 'axios';

export const API_SERVER_HOST_ADMIN = '/api/admin';

export const fetchAdminMain = async () => {
  const res = await axios.get(`${API_SERVER_HOST_ADMIN}/main`);
  console.log('main data', res.data);
  return res.data;
};

export const fetchPostActivity = async () => {
  const res = await axios.get(`${API_SERVER_HOST_ADMIN}/post-activity`);
  console.log('post/reply activy data', res.data);
  return res.data;
};
