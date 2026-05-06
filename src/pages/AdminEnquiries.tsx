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
    <div className="min-h-screen px-6 py-20">
      <div className="mx-auto max-w-5xl space-y-6">

        <h1 className="text-4xl font-serif text-primary">
          Enquiries 📩
        </h1>

        <div className="rounded-xl border bg-card overflow-hidden">

          <div className="grid grid-cols-5 bg-secondary p-4 font-semibold">
            <span>Name</span>
            <span>Email</span>
            <span>Grade</span>
            <span>Message</span>
            <span>Date</span>
          </div>

          {enquiries.map((e, i) => (
            <div
              key={i}
              className="grid grid-cols-5 p-4 border-t text-sm"
            >
              <span>{e.name}</span>
              <span>{e.email}</span>
              <span>{e.grade}</span>
              <span className="truncate">{e.message}</span>
              <span>
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