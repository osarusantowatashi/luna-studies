import { Navigate } from "react-router-dom";
import React from "react";

type Props = {
  children: React.ReactNode;
  allowedRoles: string[];
};

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role");

  // Not logged in
  if (!isLoggedIn) {
    return <Navigate to="/en/login" replace />;
  }

  // Role not allowed
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/en" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;