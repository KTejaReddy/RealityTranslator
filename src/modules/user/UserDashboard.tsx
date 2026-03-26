import { DashboardNav } from "@/modules/auth/DashboardNav";
import { ExampleSimulations } from "@/modules/user/ExampleSimulations";

export function UserDashboard() {
  return (
    <div className="min-h-screen bg-background overflow-hidden flex flex-col font-body selection:bg-primary/30">
      <DashboardNav active="user" />
      <ExampleSimulations />
    </div>
  );
}

