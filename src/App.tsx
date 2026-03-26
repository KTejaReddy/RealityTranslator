import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

import Landing from "./pages/Landing.tsx";
import LoginUser from "./pages/login-user.tsx";
import LoginGovernment from "./pages/login-government.tsx";
import DashboardUser from "./pages/dashboard-user.tsx";
import DashboardGovernment from "./pages/dashboard-government.tsx";
import { AuthProvider } from "./modules/auth/AuthContext";
import { ProtectedRoute } from "./modules/auth/ProtectedRoute";
import SimulatePage from "./pages/SimulatePage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/simulate" element={
              <ProtectedRoute allowedRoles={['user', 'government']}>
                <SimulatePage />
              </ProtectedRoute>
            } />
            <Route path="/login-user" element={<LoginUser />} />
            <Route path="/login-government" element={<LoginGovernment />} />
            <Route path="/dashboard-user" element={<DashboardUser />} />
            <Route path="/dashboard-government" element={<DashboardGovernment />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
