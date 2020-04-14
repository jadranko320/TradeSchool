/* eslint-disable */
import '@babel/polyfill';
import { signup } from './signup';
import { login, logout } from './login';
import { updateSettings, deleteAccount } from './updateSettings';
import { updateCourse } from './course';

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

const signupForm = document.querySelector('.signup');
const loginForm = document.querySelector('.login');
const logOutBtn = document.querySelector('.logout');
const userDataForm = document.querySelector('.user-data');
const userPasswordForm = document.querySelector('.user-password');
const delAccBtn = document.querySelector('.btn-delete');
const updateCourseForm = document.querySelector('.update-course');
const selectTag = document.querySelector('.select-tag');
const limit = document.querySelector('.limit');
const page = document.querySelector('.page');

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

if (signupForm)
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const surname = document.getElementById('surname').value;
    const pin = document.getElementById('pin').value;
    const dob = document.getElementById('dob').value;
    const email = document.getElementById('email').value;
    const number = document.getElementById('number').value;
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm').value;
    signup(name, surname, pin, dob, email, number, password, confirm);
  });

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

if (logOutBtn) logOutBtn.addEventListener('click', logout);

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    updateSettings({ email }, 'data');
    document.getElementById('email').value = '';
  });

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn-update').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    document.querySelector('.btn-update').textContent = 'Update';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

if (delAccBtn) delAccBtn.addEventListener('click', deleteAccount);

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

if (updateCourseForm)
  updateCourseForm.addEventListener('submit', e => {
    e.preventDefault();
    const params = {
      name,
      description,
      subjects: []
    };
    const name = document.getElementById('name').value;
    if (name.length != 0) params.name = name;
    const description = document.getElementById('description').value;
    if (description.length != 0) params.description = description;
    const subjectFirst = document.getElementById('subject-first').value;
    if (subjectFirst.length != 0) params.subjects[0] = subjectFirst;
    const subjectSecond = document.getElementById('subject-second').value;
    if (subjectSecond.length != 0) params.subjects[1] = subjectSecond;

    // console.log(params);

    const pathname = window.location.pathname;
    const id = pathname.substring(pathname.lastIndexOf('/') + 1);

    updateCourse(params, id);
  });

// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

if (selectTag)
  selectTag.addEventListener('change', () => {
    const queryString = window.location.search;
    const usp = new URLSearchParams(queryString);

    if (selectTag.selectedIndex === 1) usp.set('sort', 'surname');
    if (selectTag.selectedIndex === 2) usp.set('sort', '-surname');
    if (selectTag.selectedIndex === 3) usp.set('sort', '-createdAt');
    if (selectTag.selectedIndex === 4) usp.set('sort', 'createdAt');

    const search = `?${usp.toString()}`;

    const url = `${window.location.origin}${window.location.pathname}${search}`;
    window.location.href = url;
  });

if (limit)
  limit.addEventListener('change', () => {
    const queryString = window.location.search;
    const usp = new URLSearchParams(queryString);

    if (limit.selectedIndex === 1) usp.set('limit', '3');
    if (limit.selectedIndex === 2) usp.set('limit', '5');
    if (limit.selectedIndex === 3) usp.set('limit', '7');
    if (limit.selectedIndex === 4) usp.set('limit', '10');

    const search = `?${usp.toString()}`;

    const url = `${window.location.origin}${window.location.pathname}${search}`;
    window.location.href = url;
  });

if (page) {
  const next = document.getElementById('next');
  const previous = document.getElementById('previous');
  const queryString = window.location.search;
  const usp = new URLSearchParams(queryString);
  let pageNum = usp.get('page') || 1;

  next.addEventListener('click', () => {
    pageNum++;
    console.log(pageNum);
    usp.set('page', `${pageNum}`);

    const search = `?${usp.toString()}`;

    const url = `${window.location.origin}${window.location.pathname}${search}`;
    window.location.href = url;
  });

  previous.addEventListener('click', () => {
    pageNum--;
    console.log(pageNum);
    usp.set('page', `${pageNum}`);

    const search = `?${usp.toString()}`;

    const url = `${window.location.origin}${window.location.pathname}${search}`;
    window.location.href = url;
  });
}
