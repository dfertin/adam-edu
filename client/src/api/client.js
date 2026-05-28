import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({ baseURL: API_BASE });

export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

export const coursesApi = {
  list: (params) => api.get("/courses", { params }),
  get: (id) => api.get(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  progress: (id) => api.get(`/courses/${id}/progress`),
};

export const lessonsApi = {
  byCourse: (courseId) => api.get(`/courses/${courseId}/lessons`),
  get: (id) => api.get(`/lessons/${id}`),
  complete: (id) => api.post(`/lessons/${id}/complete`),
};

export const usersApi = {
  myCourses: () => api.get("/users/me/courses"),
  updateProfile: (data) => api.put("/users/me", data),
  updatePassword: (data) => api.put("/users/me/password", data),
};
