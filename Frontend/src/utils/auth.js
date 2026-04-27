// Auth utility - apna JWT token localStorage mein store hoga
// Firebase bilkul nahi hai yahan

export const getToken = () => localStorage.getItem('cl_token');

export const getUser = () => {
  const user = localStorage.getItem('cl_user');
  return user ? JSON.parse(user) : null;
};

export const setAuth = (token, user) => {
  localStorage.setItem('cl_token', token);
  localStorage.setItem('cl_user', JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem('cl_token');
  localStorage.removeItem('cl_user');
};

export const isLoggedIn = () => !!getToken();

export const isProfileComplete = () => {
  const user = getUser();
  return user?.profileCompleted === true;
};
