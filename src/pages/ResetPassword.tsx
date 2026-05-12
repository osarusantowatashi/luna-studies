import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      alert("Please fill in both fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password updated successfully. Please sign in again.");
    await supabase.auth.signOut();
    window.location.href = "/en/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f6f3] via-[#f1eee7] to-[#e8e3d8]">
      <NavBar />

      <div className="mx-auto max-w-xl px-6 py-24">
        <div className="rounded-[2rem] border bg-white/80 p-8 shadow-xl backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            New Password
          </p>

          <h1 className="mt-2 font-serif text-4xl text-primary">
            Reset your password
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            Enter your new password below.
          </p>

          <div className="mt-8 space-y-5">
            <input
              type="password"
              className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button
              className="h-12 w-full rounded-2xl"
              onClick={handleUpdatePassword}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update password"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;