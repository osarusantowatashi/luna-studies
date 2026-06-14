import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const protectedRoutePrefixes = [
  "/admin",
  "/dashboard",
  "/student",
  "/tutor",
  "/games",
  "/memory-flip",
  "/word-search",
  "/generate",
  "/practice",
  "/mistakes",
  "/studentoverview",
  "/generate-games",
];

const publicRoutePrefixes = [
  "/en",
  "/zh",
  "/ja",
  "/login",
  "/signup",
  "/careers",
  "/subjects",
  "/whyluna",
  "/tutors",
  "/enquiry",
  "/auth",
  "/forgot-password",
  "/reset-password",
  "/terms",
  "/privacy",
];

const clearLoginStorage = () => {
  ["isLoggedIn", "role", "userName", "userId", "current_student"].forEach((key) => {
    localStorage.removeItem(key);
  });

  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("sb-") || key.includes("supabase.auth.token")) {
      localStorage.removeItem(key);
    }
  });
};

export default function AuthSessionGuard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [checkingSession, setCheckingSession] = useState(false);

  const isProtectedPage = useMemo(() => {
    const path = location.pathname;

    if (path === "/") return false;

    const isPublic = publicRoutePrefixes.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`)
    );

    if (isPublic) return false;

    return protectedRoutePrefixes.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`)
    );
  }, [location.pathname]);

  const hasLocalLogin = () =>
    localStorage.getItem("isLoggedIn") === "true" ||
    !!localStorage.getItem("role") ||
    !!localStorage.getItem("userName");

  const markExpired = useCallback(() => {
    if (isProtectedPage && hasLocalLogin()) {
      setShowExpiredModal(true);
    }
  }, [isProtectedPage]);

  const checkSession = useCallback(async () => {
    if (!isProtectedPage || showExpiredModal || checkingSession) return;

    setCheckingSession(true);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        markExpired();
        return;
      }

      const session = sessionData.session;
      const expiresAt = session?.expires_at ? session.expires_at * 1000 : null;
      const expired = !!expiresAt && expiresAt <= Date.now();

      if (!session || expired) {
        markExpired();
        return;
      }

      const { error: userError } = await supabase.auth.getUser();

      if (userError) {
        markExpired();
      }
    } catch {
      markExpired();
    } finally {
      setCheckingSession(false);
    }
  }, [checkingSession, isProtectedPage, markExpired, showExpiredModal]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setShowExpiredModal(false);
        return;
      }

      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
        setShowExpiredModal(false);
        return;
      }

      if (!session) {
        markExpired();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [markExpired]);

  useEffect(() => {
    void checkSession();
  }, [checkSession, location.pathname]);

  useEffect(() => {
    const checkWhenVisible = () => {
      if (document.visibilityState === "visible") {
        void checkSession();
      }
    };
    const checkOnFocus = () => void checkSession();
    const checkOnOnline = () => void checkSession();

    document.addEventListener("visibilitychange", checkWhenVisible);
    window.addEventListener("focus", checkOnFocus);
    window.addEventListener("online", checkOnOnline);

    return () => {
      document.removeEventListener("visibilitychange", checkWhenVisible);
      window.removeEventListener("focus", checkOnFocus);
      window.removeEventListener("online", checkOnOnline);
    };
  }, [checkSession]);

  useEffect(() => {
    if (!showExpiredModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showExpiredModal]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      clearLoginStorage();
      setShowExpiredModal(false);
      navigate("/login", { replace: true });
    }
  };

  if (!showExpiredModal) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0D1B2E] p-6 text-center shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FACC15]/30 bg-[#FACC15]/10">
          <AlertCircle className="h-7 w-7 text-[#FACC15]" />
        </div>

        <h2 className="mt-5 text-3xl font-black text-white">Session expired</h2>

        <p className="mt-3 text-sm font-bold leading-6 text-slate-300">
          Your login session has expired or disconnected. Please log in again to continue.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 h-12 w-full rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] px-5 font-black text-white shadow-[0_16px_40px_rgba(99,102,241,0.35)] transition hover:scale-[1.01]"
        >
          Log out and log in again
        </button>
      </div>
    </div>
  );
}
