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
        <div className="container mx-auto flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:h-16 sm:px-6 sm:py-0">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-gradient">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="truncate font-serif text-lg font-semibold sm:text-xl">Luna Studies</span>
          </Link>
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">{user?.email}</div>
              <div className="text-xs text-muted-foreground">{roleLabel}</div>
            </div>
            <Button variant="ghost" size="sm" className="min-h-11 px-3 sm:min-h-9" onClick={handleSignOut}>
              <LogOut className="mr-0 h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign out</span>
              <span className="sr-only sm:hidden">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-7 sm:mb-8">
          <p className="text-sm uppercase tracking-widest text-accent font-medium mb-2">{roleLabel} dashboard</p>
          <h1 className="font-serif text-3xl leading-tight md:text-5xl">{title}</h1>
          {subtitle && <p className="mt-2 text-base leading-7 text-muted-foreground sm:text-lg">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}
