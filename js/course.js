/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const updateCourse = async (data, id) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:3000/api/courses/${id}`,
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Pomyślnie zaktualizowano kurs');
      window.setTimeout(() => {
        location.assign(`/courses/${id}`);
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
