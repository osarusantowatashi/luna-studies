import { Navigate } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";

interface Props {
  children: React.ReactNode;
  allow?: AppRole[];
}

export function ProtectedRoute({ children, allow }: Props) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground font-serif text-xl">Loading…</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (allow && role && !allow.includes(role)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
