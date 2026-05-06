import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/DashboardShell";
import StudentDashboard from "./StudentDashboard";
import TutorDashboard from "./TutorDashboard";
import AdminDashboard from "./AdminDashboard";

const Dashboard = () => {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <DashboardShell title="Loading…">
        <div className="text-muted-foreground">One moment…</div>
      </DashboardShell>
    );
  }

  if (role === "head_tutor") return <AdminDashboard />;
  if (role === "tutor") return <TutorDashboard />;
  return <StudentDashboard />;
};

export default Dashboard;
