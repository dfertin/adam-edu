import { Route, Routes, Navigate } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { AdminPage } from "./pages/AdminPage";
import { CertificatesPage } from "./pages/CertificatesPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { HomePage } from "./pages/HomePage";
import { LessonPage } from "./pages/LessonPage";
import { LoginPage } from "./pages/LoginPage";
import { MyCoursesPage } from "./pages/MyCoursesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { QuizPage } from "./pages/QuizPage";
import { RegisterPage } from "./pages/RegisterPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";

export default function App() {
  const { isAuthed, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header onLogout={logout} />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
          <Route path="/login" element={isAuthed ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/register" element={isAuthed ? <Navigate to="/" /> : <RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/my-courses" element={<ProtectedRoute><MyCoursesPage /></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute><CertificatesPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/learn/:slug/:lessonId" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
          <Route path="/learn/:slug/:lessonId/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
