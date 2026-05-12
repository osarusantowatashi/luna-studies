import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";

const NavBar = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [role, setRole] = useState<string | null>(
    localStorage.getItem("role")
  );

  const [name, setName] = useState(
    localStorage.getItem("userName") || ""
  );

  const appRoutes = [
    "/dashboard",
    "/practice",
    "/mistakes",
    "/redo-mistakes",
    "/generate",
    "/tutor/lessons",
    "/admin/lessons",
    "/admin",
    "/studentoverview",
  ];

  const isApp = appRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  const brandName = isApp ? "Luna Studies" : "Luna Education";

  useEffect(() => {
    const syncUser = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, name")
        .eq("id", user.id)
        .maybeSingle();

      const isAdmin = user.email === "admin@lunastudies.com";
      const finalRole = isAdmin ? "admin" : profile?.role || "student";

      setRole(finalRole);
      setName(profile?.name || user.email || "User");

      localStorage.setItem("role", finalRole);
      localStorage.setItem(
        "userName",
        profile?.name || user.email || "User"
      );
    };

    syncUser();
  }, [location.pathname]);

  const changeLanguage = () => {
    if (isApp) return;
  
    const currentLang = location.pathname.startsWith("/zh") ? "zh" : "en";
    const nextLang = currentLang === "zh" ? "en" : "zh";
  
    localStorage.setItem("luna_language", nextLang);
  
    const pathWithoutLang =
      location.pathname.replace(/^\/(en|zh)/, "") || "/";
  
    window.location.href = `/${nextLang}${pathWithoutLang}`;
  };
  
  const currentLang = location.pathname.startsWith("/zh") ? "zh" : "en";

  const withLang = (path: string) =>
    `/${currentLang}${path === "/" ? "" : path}`;


  const links =
    role === "admin"
      ? [
          ["Dashboard", "/admin/dashboard"],
          ["Generate", "/generate"],
          ["Assign", "/admin/assign"],
          ["Lessons", "/admin/lessons"],
          ["Questions", "/admin/questions"],
        ]
      : role === "tutor"
      ? [
          ["Dashboard", "/dashboard"],
          ["Mistakes", "/tutor/mistakes"],
          ["Lessons", "/tutor/lessons"],
        ]
      : role === "student"
      ? [
          ["Overview", "/studentoverview"],
          ["Practice", "/practice"],
          ["Mistakes", "/mistakes"],
          ["Redo", "/redo-mistakes"],
        ]
      : [
        [t("nav.home"), withLang("/")],
        [t("nav.whyLuna"), withLang("/whyluna")],
        [t("nav.subjects"), withLang("/subjects")],
        [t("nav.tutors"), withLang("/tutors")],
        [t("nav.enquire"), withLang("/enquiry")],
        ];

  const isActive = (path: string) => location.pathname === path;

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = "/en";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to={withLang("/")} className="flex items-center gap-3">
          <img
            src="/lunalogo.png"
            className="h-10 w-10 object-contain"
          />

          <h1 className="font-serif text-xl tracking-wide text-primary">
            {brandName}
          </h1>
        </Link>

        <nav className="hidden rounded-full border bg-card/80 p-1 shadow-soft md:flex">
          {links.map(([label, path]) => {
            const active = isActive(path);

            return (
              <Link
                key={path}
                to={path}
                className={`rounded-full px-5 py-2 text-[13px] font-medium uppercase tracking-wider transition-all duration-200 ${
                  active
                    ? "scale-105 bg-yellow-400 text-black shadow-md"
                    : "text-muted-foreground hover:scale-105 hover:bg-secondary hover:text-primary"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
        {!isApp && (
          <button
            onClick={changeLanguage}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-primary shadow-soft transition hover:bg-secondary"
          >
            {t("nav.language")}
          </button>
        )}

          {role ? (
            <>
              <div className="hidden items-center gap-3 rounded-full border bg-card px-4 py-2 shadow-soft md:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                  <Sparkles className="h-4 w-4 text-accent" />
                </div>

                <div className="leading-tight">
                  <p className="text-sm font-medium text-primary">
                    {name}
                  </p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {role}
                  </p>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to={withLang("/login")}>
                <Button variant="ghost">{t("nav.login")}</Button>
              </Link>

              <Link to={withLang("/login")}>
                <Button className="shadow-elegant">
                  {t("nav.getStarted")}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;