import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";


const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setMessage("");

    if (!email || !password) {
      setMessage("Please enter email and password.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        setMessage("Account created. Please check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        navigate("/dashboard");
      }
    } catch (err: any) {
      setMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-2xl font-semibold">Luna Studies</span>
        </Link>

        <h1 className="mb-2 text-3xl font-semibold">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>

        <p className="mb-6 text-sm text-gray-500">
          {mode === "signin"
            ? "Sign in to continue your studies."
            : "Begin your learning journey."}
        </p>

        {mode === "signup" && (
          <input
            className="mb-3 w-full rounded-lg border px-4 py-3"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        )}

        <input
          className="mb-3 w-full rounded-lg border px-4 py-3"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="mb-4 w-full rounded-lg border px-4 py-3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-lg bg-black py-3 text-white disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : mode === "signin"
            ? "Sign in"
            : "Create account"}
        </button>

        {message && <p className="mt-4 text-sm text-red-500">{message}</p>}

        <p className="mt-6 text-center text-sm text-gray-500">
          {mode === "signin"
            ? "New to Luna Studies?"
            : "Already have an account?"}{" "}
          <button
            className="font-medium text-black underline"
            onClick={() => {
              setMessage("");
              setMode(mode === "signin" ? "signup" : "signin");
            }}
          >
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;