import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles, Menu, X, Globe2, ChevronDown } from "lucide-react";

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
  const [langOpen, setLangOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const langRef = useRef<HTMLDivElement | null>(null);

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
    "/student/lessons",
    "/admin/dashboard",
    "/admin/assign",
    "/admin/questions",
    "/admin/lessons",
    "/admin",
    "/studentoverview",
    "/admin/games",
    "/admin/games/memory-flip",
  ];

  const pathWithoutLang =
    location.pathname.replace(/^\/(en|zh|ja)/, "") || "/";

  const isDashboardUser =
    role === "admin" || role === "tutor" || role === "student";

  const isApp =
    isDashboardUser ||
    appRoutes.some((route) => pathWithoutLang.startsWith(route));

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
    : location.pathname.startsWith("/ja")
      ? "ja"
      : "en";

  const languageOptions = [
    { value: "en", label: "English", short: "EN" },
    { value: "zh", label: "中文", short: "中" },
    { value: "ja", label: "日本語", short: "日" },
  ] as const;

  const activeLanguage =
    languageOptions.find((item) => item.value === currentLang) ||
    languageOptions[0];


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langRef.current &&
        !langRef.current.contains(event.target as Node)
      ) {
        setLangOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isApp) {
      i18n.changeLanguage("en");
      return;
    }

    const detectBrowserLang = () => {
      const lang = navigator.language.toLowerCase();

      if (lang.startsWith("ja")) return "ja";
      if (lang.startsWith("zh")) return "zh";

      return "en";
    };

    const hasLangPrefix = /^\/(en|zh|ja)(\/|$)/.test(location.pathname);

    if (!hasLangPrefix) {
      i18n.changeLanguage("en");
      return;
    }

    const i18nLang = currentLang === currentLang;
    i18n.changeLanguage(currentLang);
  }, [location.pathname, currentLang, i18n, isApp]);

  const changeLanguage = (nextLang: "en" | "zh" | "ja") => {
    if (isApp) return;

    setMobileOpen(false);

    localStorage.setItem("luna_language", nextLang);
    i18n.changeLanguage(nextLang);

    const pathWithoutLang =
      location.pathname.replace(/^\/(en|zh|ja)/, "") || "/";

    window.location.href =
      pathWithoutLang === "/" ? `/${nextLang}` : `/${nextLang}${pathWithoutLang}`;
  };

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
          ["Mistakes", "/mistakes"],
          ["Lessons", "/tutor/lessons"],
        ]
        : role === "student"
          ? [
            ["Overview", "/studentoverview"],
            ["Lessons", "/student/lessons"],
            ["Practice", "/practice"],
            ["Games", "/games"],
            ["Mistakes", "/mistakes"],
          ]
          : [
            [t("nav.subjects"), withLang("/subjects")],
            [t("nav.tutors"), withLang("/tutors")],
            [t("nav.arcade"), withLang("/arcade")],
            [t("nav.enquire"), withLang("/enquiry")],
          ];

  const aboutLinks = [
    [t("nav.whyLuna"), withLang("/whyluna")],
    [t("nav.careers"), withLang("/careers")],
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
          {links.map(([label, path], index) => {
            const active = isActive(path);

            const link = (
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

            if (!isApp && index === 3) {
              return (
                <div key="public-about-nav" className="flex">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAboutOpen((prev) => !prev)}
                      className="flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-medium uppercase tracking-wider text-muted-foreground transition-all duration-200 hover:scale-105 hover:bg-secondary hover:text-primary"
                    >
                      {t("nav.aboutUs")}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${aboutOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>

                    <AnimatePresence>
                      {aboutOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.18 }}
                          className="absolute left-0 top-[48px] z-50 w-48 overflow-hidden rounded-3xl border border-[#E8D8B5] bg-white/95 p-2 shadow-[0_20px_60px_rgba(8,42,85,0.18)] backdrop-blur-xl"
                        >
                          {aboutLinks.map(([aboutLabel, aboutPath]) => (
                            <Link
                              key={aboutPath}
                              to={aboutPath}
                              onClick={() => setAboutOpen(false)}
                              className="block rounded-2xl px-4 py-3 text-sm font-bold text-[#082A55] transition hover:bg-[#FFF8E7]"
                            >
                              {aboutLabel}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {link}
                </div>
              );
            }

            return link;
          })}
        </nav>

        {/* DESKTOP RIGHT */}
        <div className="hidden items-center gap-3 md:flex">
          {!isApp && (
            <div ref={langRef} className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((prev) => !prev)}
                className="flex h-11 items-center gap-2 rounded-full border border-[#E8D8B5] bg-white/90 px-4 text-sm font-semibold text-[#082A55] shadow-[0_10px_30px_rgba(8,42,85,0.08)] transition hover:-translate-y-0.5 hover:border-[#F6C65B] hover:bg-[#FFF8E7]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFF2C7] text-[#082A55]">
                  <Globe2 className="h-4 w-4" />
                </span>

                <span>{activeLanguage.label}</span>

                <ChevronDown
                  className={`h-4 w-4 transition-transform ${langOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-[52px] z-50 w-44 overflow-hidden rounded-3xl border border-[#E8D8B5] bg-white/95 p-2 shadow-[0_20px_60px_rgba(8,42,85,0.18)] backdrop-blur-xl"
                  >
                    {languageOptions.map((item) => {
                      const active = item.value === currentLang;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            setLangOpen(false);
                            changeLanguage(item.value);
                          }}
                          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition ${active
                            ? "bg-[#082A55] text-white"
                            : "text-[#082A55] hover:bg-[#FFF8E7]"
                            }`}
                        >
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${active
                              ? "bg-[#F6C65B] text-[#082A55]"
                              : "bg-[#F7F1E5] text-[#082A55]"
                              }`}
                          >
                            {item.short}
                          </span>

                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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

              <Link to={withLang("/enquiry")}>
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
            {links.map(([label, path], index) => {
              const active = isActive(path);

              const link = (
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

              if (!isApp && index === 3) {
                return (
                  <div key="mobile-public-about">
                    <div className="mb-2 rounded-2xl bg-card p-2">
                      <p className="px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary/45">
                        {t("nav.aboutUs")}
                      </p>

                      {aboutLinks.map(([aboutLabel, aboutPath]) => (
                        <Link
                          key={aboutPath}
                          to={aboutPath}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-xl px-3 py-3 text-sm font-semibold text-primary hover:bg-secondary"
                        >
                          {aboutLabel}
                        </Link>
                      ))}
                    </div>
                    {link}
                  </div>
                );
              }

              return link;
            })}
          </div>

          <div className="mt-4 grid gap-3">
            {!isApp && (
              <select
                value={currentLang}
                onChange={(e) =>
                  changeLanguage(e.target.value as "en" | "zh" | "ja")
                }
                className="w-full rounded-2xl border bg-card px-4 py-3 text-sm font-semibold text-primary"
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
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

                <Link to={withLang("/enquiry")} onClick={() => setMobileOpen(false)}>
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
