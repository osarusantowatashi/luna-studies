import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const Login = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    const hash = window.location.hash;

    if (hash && hash.includes("access_token")) {
      alert("Email verified successfully. You can now sign in.");
    }
  }, []);

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;
    if (!user) return;

    if (!user.email_confirmed_at) {
      alert("Please verify your email before signing in.");
      await supabase.auth.signOut();
      return;
    }

    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, name, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      alert(profileError.message);
      return;
    }

    if (!profile) {
      const metadata = user.user_metadata || {};

      const profileName =
        metadata.name || user.email?.split("@")[0] || loginEmail.trim();

      const profileRole = metadata.role || "student";
      const inviteCodeId = metadata.invite_code_id;

      const { data: newProfile, error: createProfileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          name: profileName,
          email: user.email || loginEmail.trim(),
          role: profileRole,
          is_active: true,
        })
        .select("role, name, is_active")
        .single();

      if (createProfileError) {
        alert(createProfileError.message);
        return;
      }

      profile = newProfile;

      if (inviteCodeId) {
        const { error: updateCodeError } = await supabase
          .from("invite_codes")
          .update({
            used: true,
            used_by: user.id,
            used_at: new Date().toISOString(),
          })
          .eq("id", inviteCodeId)
          .eq("used", false);

        if (updateCodeError) {
          console.error(updateCodeError);
        }
      }
    }

    if (profile.is_active === false) {
      alert("Your account has been disabled. Please contact admin.");
      await supabase.auth.signOut();
      return;
    }

    const isAdmin = user.email === "admin@lunastudies.com";
    const finalRole = isAdmin ? "admin" : profile.role || "student";

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("role", finalRole);
    localStorage.setItem("userName", profile.name || loginEmail);

    if (finalRole === "admin") {
      window.location.href = "/admin/dashboard";
    } else if (finalRole === "tutor") {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/studentoverview";
    }
  };

  const handleSignup = async () => {
    if (!name || !signupEmail || !signupPassword || !inviteCode) {
      alert("Please fill in all required fields.");
      return;
    }

    const normalizedCode = inviteCode.trim().toUpperCase();

    const { data: codeData, error: codeError } = await supabase
      .from("invite_codes")
      .select("id, code, role, used, is_active, expires_at")
      .eq("code", normalizedCode)
      .eq("used", false)
      .eq("is_active", true)
      .maybeSingle();

    if (codeError) {
      alert(codeError.message);
      return;
    }

    if (!codeData) {
      alert("Invalid, expired, or already used access code.");
      return;
    }

    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      alert("This access code has expired.");
      return;
    }

    const finalRole = codeData.role as "student" | "tutor" | "admin";

    if (finalRole !== "student" && finalRole !== "tutor") {
      alert("Invalid access code role.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: signupEmail.trim(),
      password: signupPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          name: name.trim(),
          role: finalRole,
          invite_code_id: codeData.id,
          invite_code: normalizedCode,
        },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Please check your email to verify your account.");

    setName("");
    setSignupEmail("");
    setSignupPassword("");
    setInviteCode("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f6f3] via-[#f1eee7] to-[#e8e3d8]">
      <NavBar />

      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-accent">
            Luna Studies
          </p>
          <h1 className="font-serif text-4xl text-primary md:text-5xl">
            Continue your learning journey
          </h1>
          <p className="mt-4 text-muted-foreground">
            Sign in to your dashboard, or create a new account with your access code.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-[2rem] border bg-white/80 p-8 shadow-xl backdrop-blur">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-accent">
                Existing user
              </p>
              <h2 className="mt-2 font-serif text-3xl text-primary">
                Sign in
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Welcome back. Access your lessons, progress, and assignments.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </label>
                <input
                  className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Enter password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <Button className="h-12 w-full rounded-2xl" onClick={handleLogin}>
                Sign in
              </Button>
            </div>
          </div>

          <div className="rounded-[2rem] border bg-white/80 p-8 shadow-xl backdrop-blur">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-accent">
                New user
              </p>
              <h2 className="mt-2 font-serif text-3xl text-primary">
                Create account
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your access code will automatically assign your account type.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Name
                </label>
                <input
                  className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </label>
                <input
                  className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="you@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Create password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Access Code
                </label>
                <input
                  className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Enter access code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
              </div>

              <Button className="h-12 w-full rounded-2xl" onClick={handleSignup}>
                Create account
              </Button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;