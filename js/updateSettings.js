/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/users/updateMyPassword'
        : 'http://127.0.0.1:3000/api/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

export const deleteAccount = async () => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: 'http://127.0.0.1:3000/api/users/deleteMe'
    });
    location.assign('/');
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
