import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles, Menu, X } from "lucide-react";

const NavBar = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [role, setRole] = useState<string | null>(
    localStorage.getItem("role")
  );

  const [name, setName] = useState(
    localStorage.getItem("userName") || ""
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const appRoutes = [
    "/dashboard",
    "/practice",
    "/mistakes",
    "/redo-mistakes",
    "/generate",
    "/generate-games",
    "/games",
    "/memory-flip",
    "/tutor/lessons",
    "/admin/lessons",
    "/admin",
    "/studentoverview",
    "/admin/games",
    "/admin/games/memory-flip",
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
      localStorage.setItem("userId", user.id);
    };

    syncUser();
  }, [location.pathname]);
  const currentLang = location.pathname.startsWith("/zh")
    ? "zh"
    : location.pathname.startsWith("/jp")
      ? "jp"
      : "en";

  useEffect(() => {
    if (isApp) {
      i18n.changeLanguage("en");
      return;
    }

    const detectBrowserLang = () => {
      const lang = navigator.language.toLowerCase();

      if (lang.startsWith("ja")) return "jp";
      if (lang.startsWith("zh")) return "zh";

      return "en";
    };

    const hasLangPrefix = /^\/(en|zh|jp)(\/|$)/.test(location.pathname);

    if (!hasLangPrefix) {
      i18n.changeLanguage("en");
      return;
    }

    const i18nLang = currentLang === "jp" ? "ja" : currentLang;
    i18n.changeLanguage(i18nLang);
  }, [location.pathname, currentLang, i18n, isApp]);

  const changeLanguage = (nextLang: "en" | "zh" | "jp") => {
    if (isApp) return;

    setMobileOpen(false);

    localStorage.setItem("luna_language", nextLang);
    i18n.changeLanguage(nextLang === "jp" ? "ja" : nextLang);

    const pathWithoutLang =
      location.pathname.replace(/^\/(en|zh|jp)/, "") || "/";

    window.location.href = `/${nextLang}${pathWithoutLang}`;
  };

  const withLang = (path: string) =>
    `/${currentLang}${path === "/" ? "" : path}`;
  const links =
    role === "admin"
      ? [
        ["Dashboard", "/admin/dashboard"],
        ["Generate", "/generate"],
        ["Game Gen", "/admin/games"],
        ["Assign", "/admin/assign"],
        ["Lessons", "/admin/lessons"],
        ["Questions", "/admin/questions"],
      ]
      : role === "tutor"
        ? [
          ["Dashboard", "/dashboard"],
          ["Mistakes", "/mistakes"],
          ["Lessons", "/tutor/lessons"],
        ]
        : role === "student"
          ? [
            ["Overview", "/studentoverview"],
            ["Practice", "/practice"],
            ["Games", "/games"],
            ["Mistakes", "/mistakes"],
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

    localStorage.removeItem("role");
    localStorage.removeItem("userName");

    window.location.href = "/en";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          to={
            isApp
              ? role === "admin"
                ? "/admin/dashboard"
                : role === "tutor"
                  ? "/dashboard"
                  : "/studentoverview"
              : withLang("/")
          }
          className="flex min-w-0 items-center gap-2 sm:gap-3"
          onClick={() => setMobileOpen(false)}
        >
          <img
            src="/lunalogo.png"
            className="h-10 w-10 shrink-0 object-contain"
          />

          <h1 className="truncate font-serif text-lg tracking-wide text-primary sm:text-xl">
            {brandName}
          </h1>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden rounded-full border bg-card/80 p-1 shadow-soft md:flex">
          {links.map(([label, path]) => {
            const active = isActive(path);

            return (
              <Link
                key={path}
                to={path}
                className={`rounded-full px-5 py-2 text-[13px] font-medium uppercase tracking-wider transition-all duration-200 ${active
                  ? "scale-105 bg-yellow-400 text-black shadow-md"
                  : "text-muted-foreground hover:scale-105 hover:bg-secondary hover:text-primary"
                  }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* DESKTOP RIGHT */}
        <div className="hidden items-center gap-3 md:flex">
          {!isApp && (
            <select
              value={currentLang}
              onChange={(e) =>
                changeLanguage(e.target.value as "en" | "zh" | "jp")
              }
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-primary shadow-soft transition hover:bg-secondary"
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="jp">日本語</option>
            </select>
          )}


          {role ? (
            <>
              <div className="flex items-center gap-3 rounded-full border bg-card px-4 py-2 shadow-soft">
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

        {/* MOBILE BUTTON */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border bg-card shadow-soft md:hidden"
        >
          {mobileOpen ? (
            <X className="h-5 w-5 text-primary" />
          ) : (
            <Menu className="h-5 w-5 text-primary" />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="border-t border-border/50 bg-background/95 px-4 py-4 shadow-lg backdrop-blur-xl md:hidden">
          <div className="space-y-2">
            {links.map(([label, path]) => {
              const active = isActive(path);

              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-2xl px-4 py-3 text-sm font-semibold ${active
                    ? "bg-yellow-400 text-black"
                    : "bg-card text-primary"
                    }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3">
            {!isApp && (
              <select
                value={currentLang}
                onChange={(e) =>
                  changeLanguage(e.target.value as "en" | "zh" | "jp")
                }
                className="w-full rounded-2xl border bg-card px-4 py-3 text-sm font-semibold text-primary"
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="jp">日本語</option>
              </select>
            )}

            {role ? (
              <>
                <div className="rounded-2xl border bg-card px-4 py-3">
                  <p className="text-sm font-semibold text-primary">
                    {name}
                  </p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {role}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="h-12 w-full rounded-2xl"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to={withLang("/login")} onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="h-12 w-full rounded-2xl">
                    {t("nav.login")}
                  </Button>
                </Link>

                <Link to={withLang("/login")} onClick={() => setMobileOpen(false)}>
                  <Button className="h-12 w-full rounded-2xl shadow-elegant">
                    {t("nav.getStarted")}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;