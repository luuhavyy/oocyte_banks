import { Routes, Route } from "react-router-dom";
import ClientLayout from "../components/layout/ClientLayout";
import ProtectedRoute from "../components/ui/ProtectedRoute";
import LandingPage from "../pages/Landing/LandingPage";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import MedicalHistoryPage from "../pages/MedicalHistory/MedicalHistoryPage";
import HelpPage from "../pages/Help/HelpPage";
import ProfilePage from "../pages/Profile/ProfilePage";

// Import pages
import AppointmentsPage from "../pages/Appointments/AppointmentsPage";
import EvaluationHistoryPage from "../pages/History/EvaluationHistoryPage";
import JourneyPage from "../pages/Journey/JourneyPage";

export default function ClientRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<ClientLayout><LandingPage /></ClientLayout>} />
      <Route path="/login" element={<ClientLayout><LoginPage /></ClientLayout>} />
      <Route path="/register" element={<ClientLayout><RegisterPage /></ClientLayout>} />
      
      {/* Protected routes */}
      <Route
        path="/home"
        element={
          <ClientLayout>
            <ProtectedRoute>
              <JourneyPage />
            </ProtectedRoute>
          </ClientLayout>
        }
      />
      <Route
        path="/medical-history"
        element={
          <ClientLayout>
            <ProtectedRoute>
              <MedicalHistoryPage />
            </ProtectedRoute>
          </ClientLayout>
        }
      />
      <Route
        path="/appointments"
        element={
          <ClientLayout>
            <ProtectedRoute>
              <AppointmentsPage />
            </ProtectedRoute>
          </ClientLayout>
        }
      />
      <Route
        path="/history"
        element={
          <ClientLayout>
            <ProtectedRoute>
              <EvaluationHistoryPage />
            </ProtectedRoute>
          </ClientLayout>
        }
      />
      <Route
        path="/help"
        element={
          <ClientLayout>
            <ProtectedRoute>
              <HelpPage />
            </ProtectedRoute>
          </ClientLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <ClientLayout>
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </ClientLayout>
        }
      />
    </Routes>
  );
}
