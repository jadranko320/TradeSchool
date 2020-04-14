/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (
  name,
  surname,
  pin,
  dob,
  email,
  number,
  password,
  confirm
) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/users/signup',
      data: {
        name,
        surname,
        pin,
        dob,
        email,
        number,
        password,
        passwordConfirm: confirm
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
