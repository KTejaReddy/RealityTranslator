import { ProtectedRoute } from "@/modules/auth/ProtectedRoute";
import { AdminDashboard } from "@/modules/admin/AdminDashboard";

export default function DashboardAdmin() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
