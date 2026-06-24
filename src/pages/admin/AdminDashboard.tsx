import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

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
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
            Admin
          </p>
          <h1 className="font-serif text-3xl text-primary sm:text-5xl">
            Admin Dashboard
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
            Manage question bank, AI generation, and student assignments.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          <Card className="rounded-[1.8rem] p-5 sm:p-6">
            <p className="text-sm text-muted-foreground">Students</p>
            <p className="mt-2 text-3xl font-semibold sm:text-4xl">{studentCount}</p>
          </Card>

          <Card className="rounded-[1.8rem] p-5 sm:p-6">
            <p className="text-sm text-muted-foreground">Tutors</p>
            <p className="mt-2 text-3xl font-semibold sm:text-4xl">{tutorCount}</p>
          </Card>

          <Card className="rounded-[1.8rem] p-5 sm:p-6">
            <p className="text-sm text-muted-foreground">Saved Questions</p>
            <p className="mt-2 text-3xl font-semibold sm:text-4xl">{questionCount}</p>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          <Link to="/admin/questions" className="block">
            <Card className="h-full rounded-[1.8rem] p-5 transition md:hover:scale-[1.02] sm:p-6">
              <h3 className="text-lg font-semibold sm:text-xl">Question Bank</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                View all saved questions by grade and section.
              </p>
              <Button type="button" className="mt-5 min-h-11 w-full rounded-2xl">
                Open
              </Button>
            </Card>
          </Link>

          <Link to="/generate">
            <Card className="h-full rounded-[1.8rem] p-5 transition md:hover:scale-[1.02] sm:p-6">
              <h3 className="text-lg font-semibold sm:text-xl">Generate Content</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate English questions, Math practice, and learning games.
              </p>
              <Button type="button" className="mt-5 min-h-11 w-full rounded-2xl">
                Open
              </Button>
            </Card>
          </Link>

          <Link to="/admin/assign">
            <Card className="h-full rounded-[1.8rem] p-5 transition md:hover:scale-[1.02] sm:p-6">
              <h3 className="text-lg font-semibold sm:text-xl">Assign</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Assign questions or unlock access for students.
              </p>
              <Button type="button" className="mt-5 min-h-11 w-full rounded-2xl">
                Open
              </Button>
            </Card>
          </Link>

          <Link to="/admin/progress">
            <Card className="h-full rounded-[1.8rem] p-5 transition md:hover:scale-[1.02] sm:p-6">
              <h3 className="text-lg font-semibold sm:text-xl">Student Progress</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Track lesson progress, test improvement, and learning performance.
              </p>
              <Button type="button" className="mt-5 min-h-11 w-full rounded-2xl">
                Open
              </Button>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
