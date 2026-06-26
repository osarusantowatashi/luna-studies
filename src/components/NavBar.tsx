import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles, Menu, X, Globe2, ChevronDown } from "lucide-react";

type NavLinkItem = [string, string];
type LanguageOption = {
  value: "en" | "zh" | "ja";
  label: string;
  short: string;
};
type ServiceItem = {
  label: string;
  path: string;
};

const mobileLinkClass = (active: boolean) =>
  `block min-h-11 rounded-xl border px-4 py-3 text-sm font-semibold leading-5 transition-colors ${
    active
      ? "border-[#D4A12A]/35 bg-white text-[#082A55] shadow-sm"
      : "border-transparent bg-white/70 text-primary/70 hover:bg-white hover:text-[#082A55]"
  }`;

const MobileNavOverlay = ({
  isApp,
  brandName,
  homePath,
  links,
  serviceItems,
  publicLinks,
  aboutLinks,
  languageOptions,
  currentLang,
  currentPath,
  currentPathWithHash,
  role,
  name,
  close,
  changeLanguage,
  logout,
  loginPath,
  enquiryPath,
  getStartedLabel,
  loginLabel,
  servicesLabel,
  aboutLabel,
}: {
  isApp: boolean;
  brandName: string;
  homePath: string;
  links: NavLinkItem[];
  serviceItems: ServiceItem[];
  publicLinks: NavLinkItem[];
  aboutLinks: NavLinkItem[];
  languageOptions: readonly LanguageOption[];
  currentLang: "en" | "zh" | "ja";
  currentPath: string;
  currentPathWithHash: string;
  role: string | null;
  name: string;
  close: () => void;
  changeLanguage: (nextLang: "en" | "zh" | "ja") => void;
  logout: () => void;
  loginPath: string;
  enquiryPath: string;
  getStartedLabel: string;
  loginLabel: string;
  servicesLabel: string;
  aboutLabel: string;
}) => {
  const [openSection, setOpenSection] = useState<"services" | "about" | null>(null);

  const isActive = (path: string) => currentPath === path;
  const isItemActive = (path: string) =>
    path.includes("#") ? currentPathWithHash === path : currentPath === path;
  const servicesOpen = openSection === "services";
  const aboutOpen = openSection === "about";
  const servicesActive = serviceItems.some((item) => isItemActive(item.path));
  const aboutActive = aboutLinks.some(([, path]) => isItemActive(path));
  const toggleSection = (section: "services" | "about") => {
    setOpenSection((current) => (current === section ? null : section));
  };
  const accordionButtonClass = (open: boolean, active: boolean) =>
    `flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-base font-black leading-5 transition ${
      open || active
        ? "border-[#D4A12A]/35 bg-white text-[#082A55] shadow-[0_12px_34px_rgba(8,42,85,0.08)]"
        : "border-primary/10 bg-white/82 text-primary/76 shadow-[0_10px_28px_rgba(8,42,85,0.04)] hover:bg-white hover:text-[#082A55]"
    }`;
  const childLinkClass = (active: boolean) =>
    `flex min-h-11 items-center rounded-xl px-3.5 py-2.5 text-sm font-semibold leading-5 transition ${
      active
        ? "bg-[#fff8e7] text-[#082A55]"
        : "bg-white/72 text-[#082A55]/70 hover:bg-white hover:text-[#082A55]"
    }`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      className="fixed inset-0 z-[99999] isolate h-[100dvh] overflow-hidden bg-[#fbfaff] md:hidden"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,#f0eaff_0%,transparent_34%),radial-gradient(circle_at_88%_28%,#fff1bd_0%,transparent_30%),linear-gradient(180deg,#ffffff_0%,#fbfaff_100%)]" />

      <div className="relative flex h-[100dvh] flex-col overflow-hidden">
        <div className="shrink-0 border-b border-primary/10 bg-white px-4 pb-3 pt-[max(0.85rem,env(safe-area-inset-top))] shadow-[0_8px_30px_rgba(8,42,85,0.05)]">
          <div className="flex min-h-14 items-center justify-between gap-3">
            <Link
              to={homePath}
              onClick={close}
              className="flex min-w-0 items-center gap-2.5"
            >
              <img
                src="/lunalogo.png"
                className="h-9 w-9 shrink-0 object-contain"
                alt=""
              />
              <span className="truncate font-serif text-[1.35rem] text-primary">
                {brandName}
              </span>
            </Link>

            <button
              type="button"
              onClick={close}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/10 bg-white text-primary shadow-[0_10px_28px_rgba(8,42,85,0.10)]"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 [-webkit-overflow-scrolling:touch]">
          {isApp ? (
            <div className="grid gap-2">
              {links.map(([label, path]) => (
                <Link
                  key={path}
                  to={path}
                  onClick={close}
                  className={mobileLinkClass(isActive(path))}
                >
                  {label}
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              <section className="overflow-hidden rounded-[1.35rem]">
                <button
                  type="button"
                  onClick={() => toggleSection("services")}
                  className={accordionButtonClass(servicesOpen, servicesActive)}
                  aria-expanded={servicesOpen}
                  aria-controls="mobile-services-menu"
                >
                  <span>{servicesLabel}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-primary/50 transition-transform ${
                      servicesOpen ? "rotate-180 text-[#D4A12A]" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {servicesOpen && (
                    <motion.div
                      id="mobile-services-menu"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 grid gap-1 rounded-[1.35rem] border border-primary/8 bg-white/55 p-2.5 shadow-[0_12px_34px_rgba(8,42,85,0.05)]">
                        {serviceItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={close}
                            className={childLinkClass(isItemActive(item.path))}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {publicLinks.map(([label, path]) => (
                <Link
                  key={path}
                  to={path}
                  onClick={close}
                  className={mobileLinkClass(isActive(path))}
                >
                  {label}
                </Link>
              ))}

              <section className="overflow-hidden rounded-[1.35rem]">
                <button
                  type="button"
                  onClick={() => toggleSection("about")}
                  className={accordionButtonClass(aboutOpen, aboutActive)}
                  aria-expanded={aboutOpen}
                  aria-controls="mobile-about-menu"
                >
                  <span>{aboutLabel}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-primary/50 transition-transform ${
                      aboutOpen ? "rotate-180 text-[#D4A12A]" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {aboutOpen && (
                    <motion.div
                      id="mobile-about-menu"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 grid gap-1 rounded-[1.35rem] border border-primary/8 bg-white/55 p-2.5 shadow-[0_12px_34px_rgba(8,42,85,0.05)]">
                        {aboutLinks.map(([label, path]) => (
                          <Link
                            key={path}
                            to={path}
                            onClick={close}
                            className={childLinkClass(isItemActive(path))}
                          >
                            {label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-primary/10 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-14px_40px_rgba(8,42,85,0.06)]">
          {!isApp && (
            <div className="mb-3 grid grid-cols-3 gap-1.5 rounded-2xl bg-[#f8f6ff] p-1">
              {languageOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => changeLanguage(item.value)}
                  className={`min-h-11 rounded-xl text-sm font-bold transition ${
                    item.value === currentLang
                      ? "bg-white text-[#082A55] shadow-sm"
                      : "text-primary/55"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {role ? (
            <div className="grid gap-3">
              <div className="rounded-2xl border bg-card px-4 py-3">
                <p className="text-sm font-semibold text-primary">{name}</p>
                <p className="text-xs capitalize text-muted-foreground">{role}</p>
              </div>
              <Button
                variant="outline"
                className="h-12 w-full rounded-2xl"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              <Link to={enquiryPath} onClick={close}>
                <Button className="h-12 w-full rounded-2xl text-base shadow-elegant">
                  {getStartedLabel}
                </Button>
              </Link>
              <Link to={loginPath} onClick={close}>
                <Button variant="outline" className="h-12 w-full rounded-2xl text-base">
                  {loginLabel}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

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
  const [servicesOpen, setServicesOpen] = useState(false);
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
    "/tutor/policy",
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
    if (!mobileOpen) return;

    const root = document.documentElement;
    const previousRootOverflow = root.style.overflow;
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;
    const scrollY = window.scrollY;

    document.body.classList.add("luna-mobile-menu-open");
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.classList.remove("luna-mobile-menu-open");
      root.style.overflow = previousRootOverflow;
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (isApp) {
      i18n.changeLanguage("en");
      return;
    }

    const hasLangPrefix = /^\/(en|zh|ja)(\/|$)/.test(location.pathname);

    if (!hasLangPrefix) {
      i18n.changeLanguage("en");
      return;
    }

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

  const homePath = isApp
    ? role === "admin"
      ? "/admin/dashboard"
      : role === "tutor"
        ? "/dashboard"
        : "/studentoverview"
    : withLang("/");

  const links: NavLinkItem[] =
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
          ];

  const aboutLinks: NavLinkItem[] = [
    [t("nav.whyLuna"), withLang("/whyluna")],
    [t("nav.careers"), withLang("/careers")],
  ];

  const serviceItems: ServiceItem[] = [
    {
      label: t("services.shortLabels.assessmentPreparation"),
      path: withLang("/subjects"),
    },
    {
      label: t("services.shortLabels.academicSupport"),
      path: withLang("/academic-support"),
    },
    {
      label: t("services.shortLabels.applicationEssay"),
      path: withLang("/services/essay-support"),
    },
    {
      label: t("services.shortLabels.parentInterview"),
      path: withLang("/services/parent-interview"),
    },
    {
      label: t("services.shortLabels.mockScreening"),
      path: withLang("/services/mock-interview"),
    },
    {
      label: t("services.shortLabels.examPackage"),
      path: withLang("/services/exam-package"),
    },
    {
      label: t("services.shortLabels.schoolConsulting"),
      path: withLang("/services/school-consulting"),
    },
    {
      label: t("services.shortLabels.consultation"),
      path: withLang("/services/consultation"),
    },
  ];

  const publicLinks: NavLinkItem[] = [
    [t("nav.tutors"), withLang("/tutors")],
    [t("nav.arcade"), withLang("/arcade")],
  ];

  const currentPathWithHash = `${location.pathname}${location.hash}`;
  const isActive = (path: string) => location.pathname === path;
  const isItemActive = (path: string) =>
    path.includes("#") ? currentPathWithHash === path : location.pathname === path;
  const servicesActive =
    pathWithoutLang.startsWith("/services") ||
    pathWithoutLang.startsWith("/subjects") ||
    pathWithoutLang === "/academic-support";
  const aboutActive = pathWithoutLang === "/whyluna" || pathWithoutLang.startsWith("/careers");

  const navItemClass = (active: boolean) =>
    `relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold tracking-[0.04em] transition-colors duration-200 after:absolute after:left-1/2 after:-bottom-1 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:transition-opacity ${
      active
        ? "text-[#082A55] after:bg-[#D4A12A] after:opacity-100"
        : "text-primary/60 after:opacity-0 hover:text-[#082A55]"
    }`;

  const dropdownPanelClass =
    "absolute left-0 top-[44px] z-50 w-56 overflow-hidden rounded-2xl border border-primary/10 bg-white p-2 shadow-[0_18px_45px_rgba(8,42,85,0.12)]";

  const dropdownItemClass = (active: boolean) =>
    `block rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
      active
        ? "bg-[#fff8e7] text-[#082A55]"
        : "text-[#082A55]/78 hover:bg-[#f8f6ff] hover:text-[#082A55]"
    }`;

  const logout = async () => {
    await supabase.auth.signOut();

    localStorage.removeItem("role");
    localStorage.removeItem("userName");

    window.location.href = "/en";
  };

  const mobileOverlay =
    typeof document === "undefined"
      ? null
      : createPortal(
          <AnimatePresence>
            {mobileOpen && (
              <MobileNavOverlay
                isApp={isApp}
                brandName={brandName}
                homePath={homePath}
                links={links}
                serviceItems={serviceItems}
                publicLinks={publicLinks}
                aboutLinks={aboutLinks}
                languageOptions={languageOptions}
                currentLang={currentLang}
                currentPath={location.pathname}
                currentPathWithHash={currentPathWithHash}
                role={role}
                name={name}
                close={() => setMobileOpen(false)}
                changeLanguage={changeLanguage}
                logout={logout}
                loginPath={withLang("/login")}
                enquiryPath={withLang("/enquiry")}
                getStartedLabel={t("nav.getStarted")}
                loginLabel={t("nav.login")}
                servicesLabel={t("nav.services")}
                aboutLabel={t("nav.aboutUs")}
              />
            )}
          </AnimatePresence>,
          document.body
        );

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-[72px] sm:px-6">
        <Link
          to={homePath}
          className="flex min-w-0 items-center gap-2.5 sm:gap-3"
          onClick={() => setMobileOpen(false)}
        >
          <img
            src="/lunalogo.png"
            className="h-9 w-9 shrink-0 object-contain"
          />

          <h1 className="max-w-[190px] truncate font-serif text-lg tracking-wide text-primary min-[390px]:max-w-none sm:text-xl">
            {brandName}
          </h1>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-1 rounded-full border border-primary/10 bg-white/80 px-2 py-1.5 shadow-[0_10px_28px_rgba(8,42,85,0.06)] md:flex">
          {isApp ? (
            links.map(([label, path]) => {
              const active = isActive(path);

              return (
                <Link
                  key={path}
                  to={path}
                  className={navItemClass(active)}
                >
                  {label}
                </Link>
              );
            })
          ) : (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setServicesOpen((prev) => !prev);
                    setAboutOpen(false);
                  }}
                  className={navItemClass(servicesActive)}
                >
                  {t("nav.services")}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${servicesOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.14 }}
                      className={dropdownPanelClass}
                    >
                      {serviceItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setServicesOpen(false)}
                          className={dropdownItemClass(isItemActive(item.path))}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {[
                [t("nav.tutors"), withLang("/tutors")],
                [t("nav.arcade"), withLang("/arcade")],
              ].map(([label, path]) => (
                <Link
                  key={path}
                  to={path}
                  className={navItemClass(isActive(path))}
                >
                  {label}
                </Link>
              ))}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setAboutOpen((prev) => !prev);
                    setServicesOpen(false);
                  }}
                  className={navItemClass(aboutActive)}
                >
                  {t("nav.aboutUs")}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${aboutOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                <AnimatePresence>
                  {aboutOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.14 }}
                      className="absolute left-0 top-[44px] z-50 w-48 overflow-hidden rounded-2xl border border-primary/10 bg-white p-2 shadow-[0_18px_45px_rgba(8,42,85,0.12)]"
                    >
                      {aboutLinks.map(([aboutLabel, aboutPath]) => (
                        <Link
                          key={aboutPath}
                          to={aboutPath}
                          onClick={() => setAboutOpen(false)}
                          className={dropdownItemClass(location.pathname === aboutPath)}
                        >
                          {aboutLabel}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </nav>

        {/* DESKTOP RIGHT */}
        <div className="hidden items-center gap-3 md:flex">
          {!isApp && (
            <div ref={langRef} className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((prev) => !prev)}
                className="flex h-10 items-center gap-2 rounded-full border border-primary/10 bg-white px-3.5 text-sm font-semibold text-[#082A55] shadow-[0_8px_24px_rgba(8,42,85,0.06)] transition hover:border-[#D4A12A]/40"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f8f6ff] text-[#082A55]">
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
                    className="absolute right-0 top-[48px] z-50 w-44 overflow-hidden rounded-2xl border border-primary/10 bg-white p-2 shadow-[0_18px_45px_rgba(8,42,85,0.12)]"
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
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${active
                            ? "bg-[#f8f6ff] text-[#082A55]"
                            : "text-[#082A55]/75 hover:bg-[#f8f6ff] hover:text-[#082A55]"
                            }`}
                        >
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${active
                              ? "bg-[#D4A12A] text-white"
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
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/10 bg-white shadow-[0_8px_24px_rgba(8,42,85,0.06)] md:hidden"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {mobileOpen ? (
            <X className="h-5 w-5 text-primary" />
          ) : (
            <Menu className="h-5 w-5 text-primary" />
          )}
        </button>
      </div>

    </header>
    {mobileOverlay}
    </>
  );
};

export default NavBar;
