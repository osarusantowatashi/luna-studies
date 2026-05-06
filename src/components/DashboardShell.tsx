import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardShell({ children, title, subtitle }: Props) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const roleLabel = role === "head_tutor" ? "Head Tutor" : role === "tutor" ? "Tutor" : "Student";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary-gradient flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-semibold">Luna Studies</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">{user?.email}</div>
              <div className="text-xs text-muted-foreground">{roleLabel}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-widest text-accent font-medium mb-2">{roleLabel} dashboard</p>
          <h1 className="font-serif text-4xl md:text-5xl">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2 text-lg">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}
