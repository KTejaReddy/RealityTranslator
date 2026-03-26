import React from "react";
import { Navigate } from "react-router-dom";
import type { AuthRole } from "./authTypes";
import { useAuth } from "./AuthContext";

export function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: AuthRole[];
  children: React.ReactNode;
}) {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(session.role)) {
    return <Navigate to="/simulate" replace />;
  }

  return <>{children}</>;
}

