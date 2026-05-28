import { Route, Routes, Navigate } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { CatalogPage } from "./pages/CatalogPage";
import { CoursePage } from "./pages/CoursePage";
import { HomePage } from "./pages/HomePage";
import { LessonPage } from "./pages/LessonPage";
import { LoginPage } from "./pages/LoginPage";
import { MyCoursesPage } from "./pages/MyCoursesPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  const { isAuthed, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header onLogout={logout} />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/courses/:id" element={<CoursePage />} />
          <Route
            path="/courses/:courseId/lessons/:lessonId"
            element={
              <ProtectedRoute>
                <LessonPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={isAuthed ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/register" element={isAuthed ? <Navigate to="/" /> : <RegisterPage />} />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute>
                <MyCoursesPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
