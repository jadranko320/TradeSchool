/* eslint-disable */
import axios from 'axios';

export const getCourses = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/courses'
    });
    document.getElementById('name').textContent = res.data.data.data[0].name;
    console.log(res);
  } catch (err) {
    console.log('Error');
  }
};
