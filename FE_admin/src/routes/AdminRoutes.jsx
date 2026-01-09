import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "../components/ui/ProtectedRoute";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import StaffList from "../pages/Staffs/StaffList";
import PatientList from "../pages/Patients/PatientList";
import PatientDetail from "../pages/Patients/PatientDetail";
import AdminLoginPage from "../pages/Auth/LoginPage";
import ChangePasswordPage from "../pages/Auth/ChangePasswordPage";
import ManageAppointmentsPage from "../pages/Appointments/ManageAppointmentsPage";
import BatchDetailsPage from "../pages/Batches/BatchDetailsPage";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminLayout>
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          </AdminLayout>
        }
      />
      <Route
        path="/admin/patients"
        element={
          <AdminLayout>
            <ProtectedRoute>
              <PatientList />
            </ProtectedRoute>
          </AdminLayout>
        }
      />
      <Route
        path="/admin/patients/:id"
        element={
          <AdminLayout>
            <ProtectedRoute>
              <PatientDetail />
            </ProtectedRoute>
          </AdminLayout>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <AdminLayout>
            <ProtectedRoute>
              <ManageAppointmentsPage />
            </ProtectedRoute>
          </AdminLayout>
        }
      />
      <Route
        path="/admin/staffs"
        element={
          <AdminLayout>
            <ProtectedRoute role="admin">
              <StaffList />
            </ProtectedRoute>
          </AdminLayout>
        }
      />
      <Route
        path="/admin/change-password"
        element={
          <AdminLayout>
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          </AdminLayout>
        }
      />
      <Route
        path="/admin/batches/:batchId"
        element={
          <AdminLayout>
            <ProtectedRoute>
              <BatchDetailsPage />
            </ProtectedRoute>
          </AdminLayout>
        }
      />
    </Routes>
  );
}
