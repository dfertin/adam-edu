import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";
const MEDIA_BASE = import.meta.env.VITE_MEDIA_URL || "";

export const api = axios.create({ baseURL: API_BASE });

export const mediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${MEDIA_BASE}${path}`;
};

export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
  verifyEmail: (token) => api.get("/auth/verify-email", { params: { token } }),
  resendVerification: (email) => api.post("/auth/resend-verification", null, { params: { email } }),
  updateMe: (data) => api.patch("/auth/me", data)
};

export const coursesApi = {
  categories: () => api.get("/courses/categories"),
  list: (params) => api.get("/courses", { params }),
  get: (slug) => api.get(`/courses/${slug}`),
  enroll: (slug) => api.post(`/courses/${slug}/enroll`),
  reviews: (slug) => api.get(`/courses/${slug}/reviews`),
  addReview: (slug, data) => api.post(`/courses/${slug}/reviews`, data)
};

export const lessonsApi = {
  byCourse: (slug) => api.get(`/lessons/course/${slug}`),
  get: (id) => api.get(`/lessons/${id}`),
  progress: (id, data) => api.post(`/lessons/${id}/progress`, data)
};

export const quizzesApi = {
  byLesson: (lessonId) => api.get(`/quizzes/lesson/${lessonId}`),
  submit: (quizId, answers) => api.post(`/quizzes/${quizId}/submit`, { answers })
};

export const commentsApi = {
  list: (lessonId) => api.get(`/comments/lesson/${lessonId}`),
  add: (lessonId, text) => api.post(`/comments/lesson/${lessonId}`, { text })
};

export const progressApi = {
  myCourses: () => api.get("/progress/my-courses"),
  certificates: () => api.get("/progress/certificates"),
  verifyCert: (code) => api.get(`/progress/certificates/verify/${code}`)
};

export const notificationsApi = {
  list: () => api.get("/notifications"),
  markRead: (id) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post("/notifications/read-all")
};

export const adminApi = {
  users: () => api.get("/admin/users"),
  courses: () => api.get("/admin/courses"),
  createCourse: (data) => api.post("/admin/courses", data),
  createLesson: (courseId, data) => api.post(`/admin/courses/${courseId}/lessons`, data),
  createQuiz: (lessonId) => api.post(`/admin/lessons/${lessonId}/quiz`),
  upload: (file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/uploads", form, { headers: { "Content-Type": "multipart/form-data" } });
  }
};
