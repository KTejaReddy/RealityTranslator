import { ProtectedRoute } from "@/modules/auth/ProtectedRoute";
import { GovernmentDashboard } from "@/modules/government/GovernmentDashboard";

export default function DashboardGovernment() {
  return (
    <ProtectedRoute allowedRoles={["government"]}>
      <GovernmentDashboard />
    </ProtectedRoute>
  );
}

