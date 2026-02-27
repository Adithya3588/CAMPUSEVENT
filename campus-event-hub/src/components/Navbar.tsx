import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Calendar, Shield } from "lucide-react";

const Navbar: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!userProfile) return null;

  return (
    <nav className="border-b border-border bg-card shadow-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate(userProfile.role === "admin" ? "/admin" : "/student")}
          className="flex items-center gap-2 text-lg font-bold text-foreground transition-colors hover:text-accent"
        >
          <Calendar className="h-6 w-6 text-accent" />
          CampusEvents
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-sm">
            {userProfile.role === "admin" && <Shield className="h-4 w-4 text-accent" />}
            <span className="font-medium text-foreground">{userProfile.name}</span>
            <span className="text-muted-foreground">({userProfile.role})</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
