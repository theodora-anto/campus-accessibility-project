import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthProvider"

// Auth pages
import LoginPage from "./pages/auth/LoginPage"
import SignupPage from "./pages/auth/SignupPage"

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard"
import SearchIssuesPage from "./pages/student/SearchIssuesPage"
import MyReportsPage from "./pages/student/MyReportsPage"
import ReportFormPage from "./pages/student/ReportFormPage"
import StudentReportDetailPage from "./pages/student/StudentReportDetailPage"

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminReportsPage from "./pages/admin/AdminReportsPage"
import AdminReportDetailPage from "./pages/admin/AdminReportDetailPage"

//Protected route guards
// Χρησιμοποιούν useAuth()
// Mετά από επιτυχές login ο χρήστης να επιστρέφει εκεί που ήθελε αρχικά να πάει.

// Μόνο για Student
function StudentRoute() {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  if (role !== "Student") return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}

// Μόνο για Admin
function AdminRoute() {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  if (role !== "Admin") return <Navigate to="/login" state={{ from: location }} replace />
  // state = {{ from: location }} για ναθυμάται που ζητήσαμε να πάμε
  return <Outlet />
}

export default function App() {
  return (
      <BrowserRouter>
        <Routes>

          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />

          {/* Student routes */}
          <Route element={<StudentRoute />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/search" element={<SearchIssuesPage />} />
            <Route path="/student/my-complaints" element={<MyReportsPage />} />
            <Route path="/student/report" element={<ReportFormPage />} />
            <Route path="/student/complaints/:id" element={<StudentReportDetailPage />} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/reports/:id" element={<AdminReportDetailPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
  )
}
