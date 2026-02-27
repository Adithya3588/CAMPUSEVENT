import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  role?: "admin" | "student";
}

const ProtectedRoute: React.FC<Props> = ({ children, role }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!currentUser || !userProfile) return <Navigate to="/" replace />;
  if (role && userProfile.role !== role) {
    return <Navigate to={userProfile.role === "admin" ? "/admin" : "/student"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
