import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";

const AdminDashboard = () => {
  const [studentCount, setStudentCount] = useState(0);
  const [tutorCount, setTutorCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      const { count: students } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "student");

      const { count: tutors } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "tutor");

      const { count: questions } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true });

      setStudentCount(students || 0);
      setTutorCount(tutors || 0);
      setQuestionCount(questions || 0);
    };

    fetchCounts();
  }, []);

  return (
    <div className="min-h-screen bg-background px-6 py-20">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
            Admin
          </p>
          <h1 className="font-serif text-5xl text-primary">
            Admin Dashboard
          </h1>
          <p className="mt-3 text-muted-foreground">
            Manage question bank, AI generation, and student assignments.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Students</p>
            <p className="mt-2 text-4xl font-semibold">{studentCount}</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Tutors</p>
            <p className="mt-2 text-4xl font-semibold">{tutorCount}</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Saved Questions</p>
            <p className="mt-2 text-4xl font-semibold">{questionCount}</p>
          </Card>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          <Link to="/admin/questions">
            <Card className="p-6 transition hover:scale-[1.02]">
              <h3 className="text-xl font-semibold">Question Bank</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                View all saved questions by grade and section.
              </p>
              <Button className="mt-5 w-full">Open</Button>
            </Card>
          </Link>

          <Link to="/generate">
            <Card className="p-6 transition hover:scale-[1.02]">
              <h3 className="text-xl font-semibold">Generate Questions</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate new questions and save them to Supabase.
              </p>
              <Button className="mt-5 w-full">Open</Button>
            </Card>
          </Link>

          <Link to="/admin/assign">
            <Card className="p-6 transition hover:scale-[1.02]">
              <h3 className="text-xl font-semibold">Assign</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Assign questions or unlock access for students.
              </p>
              <Button className="mt-5 w-full">Open</Button>
            </Card>
          </Link>
          
          <Link to="/admin/progress">
            <Card className="p-6 transition hover:scale-[1.02]">
              <h3 className="text-xl font-semibold">Student Progress</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Track lesson progress, test improvement, and learning performance.
              </p>
              <Button className="mt-5 w-full">Open</Button>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;