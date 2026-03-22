import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { useAuth } from "./context/AuthContext";
import ExpenseDetailPage from "./pages/ExpenseDetailPage";
import ExpensesPage from "./pages/ExpensesPage";
import LoginPage from "./pages/LoginPage";
import ManagerDashboardPage from "./pages/ManagerDashboardPage";
import PendingApprovalsPage from "./pages/PendingApprovalsPage";
import RegisterPage from "./pages/RegisterPage";
import StaffDirectoryPage from "./pages/StaffDirectoryPage";
import SubmitExpensePage from "./pages/SubmitExpensePage";
import UserDashboardPage from "./pages/UserDashboardPage";

function HomeRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "manager" || user?.role === "admin") {
    return <Navigate to="/manager/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomeRedirect />} />
        <Route path="dashboard" element={<UserDashboardPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="expenses/new" element={<SubmitExpensePage />} />
        <Route path="expenses/:expenseId/edit" element={<SubmitExpensePage />} />
        <Route path="expenses/:expenseId" element={<ExpenseDetailPage />} />
        <Route
          path="manager/dashboard"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <ManagerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="manager/pending"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <PendingApprovalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="manager/staff-directory"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <StaffDirectoryPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
