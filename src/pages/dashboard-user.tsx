import { ProtectedRoute } from "@/modules/auth/ProtectedRoute";
import { UserDashboard } from "@/modules/user/UserDashboard";

export default function DashboardUser() {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <UserDashboard />
    </ProtectedRoute>
  );
}

