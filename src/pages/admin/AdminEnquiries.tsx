import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState<any[]>([]);

  useEffect(() => {
    const fetchEnquiries = async () => {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      setEnquiries(data || []);
    };

    fetchEnquiries();
  }, []);

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl space-y-6">

        <h1 className="font-serif text-3xl text-primary sm:text-4xl">
          Enquiries 📩
        </h1>

        <div className="overflow-hidden rounded-[1.5rem] border bg-card sm:rounded-2xl">

          <div className="hidden grid-cols-5 bg-secondary p-4 font-semibold md:grid">
            <span>Name</span>
            <span>Email</span>
            <span>Grade</span>
            <span>Message</span>
            <span>Date</span>
          </div>

          {enquiries.map((e, i) => (
            <div
              key={i}
              className="grid gap-3 border-t p-4 text-sm md:grid-cols-5 md:gap-0"
            >
              <span className="font-bold text-primary md:font-normal">{e.name}</span>
              <span className="break-words text-primary/70 md:text-primary">{e.email}</span>
              <span>
                <span className="md:hidden text-xs font-bold uppercase tracking-widest text-muted-foreground">Grade: </span>
                {e.grade}
              </span>
              <span className="break-words leading-6 md:truncate">{e.message}</span>
              <span className="text-muted-foreground md:text-primary">
                {new Date(e.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
};

export default AdminEnquiries;
