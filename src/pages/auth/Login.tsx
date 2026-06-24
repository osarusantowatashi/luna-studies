import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  GraduationCap,
  Lock,
  Mail,
  Sparkles,
  UserRound,
  KeyRound,
  BarChart3,
  BookOpen,
} from "lucide-react";

const Login = () => {
  const currentLang = window.location.pathname.startsWith("/zh")
    ? "zh"
    : window.location.pathname.startsWith("/ja")
      ? "ja"
      : "en";

  const langPath = (path: string) => `/${currentLang}${path}`;
  const { t } = useTranslation();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const loginPasswordRef = useRef<HTMLInputElement | null>(null);

  const signupEmailRef = useRef<HTMLInputElement | null>(null);
  const signupPasswordRef = useRef<HTMLInputElement | null>(null);
  const inviteCodeRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const hash = window.location.hash;

    if (hash && hash.includes("access_token")) {
      alert(t("login.alerts.emailVerified"));
    }
  }, [t]);

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
      alert(t("login.alerts.verifyEmail"));
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
      alert(t("login.alerts.disabled"));
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
      alert(t("login.alerts.fillAll"));
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
      alert(t("login.alerts.invalidCode"));
      return;
    }

    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      alert(t("login.alerts.expiredCode"));
      return;
    }

    const finalRole = codeData.role as "student" | "tutor" | "admin";

    if (finalRole !== "student" && finalRole !== "tutor") {
      alert(t("login.alerts.invalidRole"));
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: signupEmail.trim(),
      password: signupPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/${currentLang}/login`,
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

    alert(t("login.alerts.checkEmail"));

    setName("");
    setSignupEmail("");
    setSignupPassword("");
    setInviteCode("");
  };

  return (
    <>
      <Helmet>
        <title>{t("login.seo.title")}</title>
        <meta name="description" content={t("login.seo.description")} />
      </Helmet>

      <div className="min-h-screen overflow-hidden bg-[#fbfaff]">
        <NavBar />

        <main className="relative px-4 pb-14 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_82%_78%,#fff1bd_0%,transparent_30%),linear-gradient(180deg,#fffdf8_0%,#fbfaff_100%)]" />

          <motion.div
            animate={{ y: [0, -14, 0], rotate: [0, 4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[10%] top-[16%] hidden lg:block"
          >
            <img src="/stickers/plane.png" alt="plane" className="w-24" />
          </motion.div>

          <div className="relative z-10 mx-auto grid max-w-[1250px] items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
            {/* LEFT STORY */}
            <section>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]"
              >
                <Sparkles className="h-5 w-5" />
                {t("login.portal.label")}
              </motion.p>

              <h1 className="mt-5 font-poppins text-[2.35rem] font-black leading-[1.06] text-primary min-[390px]:text-[2.65rem] sm:text-[4rem] sm:leading-[1]">
                {t("login.portal.titleLine1")}<br />

                {t("login.portal.titleLine2")}
              </h1>

              <p className="mt-6 max-w-lg text-base leading-8 text-primary/60">
                {t("login.portal.description")}
              </p>


              <div className="mt-6 grid grid-cols-1 gap-3 min-[390px]:grid-cols-3 sm:mt-9 sm:max-w-xl sm:gap-4">
                {[
                  {
                    icon: BookOpen,
                    title: t("login.portal.cards.lessons.title"),
                    text: t("login.portal.cards.lessons.text"),
                  },
                  {
                    icon: BarChart3,
                    title: t("login.portal.cards.progress.title"),
                    text: t("login.portal.cards.progress.text"),
                  },
                  {
                    icon: GraduationCap,
                    title: t("login.portal.cards.support.title"),
                    text: t("login.portal.cards.support.text"),
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    whileHover={{ y: -8, rotate: i % 2 === 0 ? -2 : 2 }}
                    className="rounded-[1.2rem] bg-white/90 p-3 sm:rounded-[1.6rem] sm:p-5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center sm:h-12 sm:w-12">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <p className="mt-2 text-sm font-black sm:mt-4 sm:text-lg">
                      {item.title}
                    </p>
                    <p className="mt-1 hidden text-sm text-primary/55 sm:block">{item.text}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mt-8 rounded-[1.6rem] bg-white/80 p-4 shadow-[0_18px_55px_rgba(66,56,120,0.08)] backdrop-blur-xl sm:mt-9 sm:rounded-[2rem] sm:p-5"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#8d73ff]" />
                  <p className="text-sm font-bold text-primary/70">
                    {t("login.portal.secure")}
                  </p>
                </div>
              </motion.div>
            </section>

            {/* RIGHT AUTH CARD */}
            <motion.section
              initial={{ opacity: 0, y: 50, rotate: 1.5 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.75, delay: 0.15 }}
              className="relative"
            >
              <div className="overflow-hidden rounded-[1.8rem] bg-white/95 shadow-[0_35px_100px_rgba(66,56,120,0.16)] backdrop-blur-xl sm:rounded-[3rem]">
                <div className="bg-[#fbfaff] p-5 sm:p-7">
                  <div className="grid grid-cols-2 rounded-[1.5rem] bg-white p-1 shadow-[0_10px_35px_rgba(66,56,120,0.07)]">
                    {[
                      { key: "signin", label: t("login.signin.title") },
                      { key: "signup", label: t("login.signup.title") },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setMode(tab.key as "signin" | "signup")}
                        className={`relative min-h-11 rounded-[1.2rem] text-sm font-black transition ${mode === tab.key
                          ? "text-white"
                          : "text-primary/55 hover:text-primary"
                          }`}
                      >
                        {mode === tab.key && (
                          <motion.div
                            layoutId="auth-tab"
                            className="absolute inset-0 rounded-[1.2rem] bg-[#8d73ff]"
                            transition={{
                              type: "spring",
                              stiffness: 350,
                              damping: 30,
                            }}
                          />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 sm:p-8 lg:p-10">
                  <AnimatePresence mode="wait">
                    {mode === "signin" ? (
                      <motion.div
                        key="signin"
                        initial={{ opacity: 0, x: -25 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 25 }}
                        transition={{ duration: 0.25 }}
                      >
                        <AuthHeader
                          label={t("login.signin.label")}
                          title={t("login.signin.title")}
                          description={t("login.signin.description")}
                        />

                        <div className="mt-8 space-y-5">
                          <Field
                            label={t("login.fields.email")}
                            icon={<Mail className="h-5 w-5" />}
                          >
                            <input
                              type="email"
                              inputMode="email"
                              autoComplete="email"
                              enterKeyHint="next"
                              placeholder={t("login.placeholders.email")}
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  loginPasswordRef.current?.focus();
                                }
                              }}
                              className="w-full bg-transparent outline-none placeholder:text-primary/35"
                            />
                          </Field>

                          <Field
                            label={t("login.fields.password")}
                            icon={<Lock className="h-5 w-5" />}
                          >
                            <input
                              ref={loginPasswordRef}
                              type="password"
                              autoComplete="current-password"
                              enterKeyHint="done"
                              placeholder={t("login.placeholders.password")}
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleLogin();
                                }
                              }}
                              className="w-full bg-transparent outline-none placeholder:text-primary/35"
                            />
                          </Field>

                          <Link
                            to={langPath("/forgot-password")}
                            className="inline-block text-sm font-bold text-[#8d73ff] hover:underline"
                          >
                            {t("login.buttons.forgotPassword")}
                          </Link>

                          <Button
                            type="button"
                            onClick={handleLogin}
                            className="group h-14 w-full rounded-2xl bg-primary text-base font-black shadow-[0_18px_45px_rgba(10,36,84,0.22)]"
                          >
                            {t("login.buttons.signin")}
                            <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
                          </Button>

                          <TermsText langPath={langPath} />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="signup"
                        initial={{ opacity: 0, x: 25 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -25 }}
                        transition={{ duration: 0.25 }}
                      >
                        <AuthHeader
                          label={t("login.signup.label")}
                          title={t("login.signup.title")}
                          description={t("login.signup.description")}
                        />

                        <div className="mt-8 space-y-5">
                          <Field
                            label={t("login.fields.name")}
                            icon={<UserRound className="h-5 w-5" />}
                          >
                            <input
                              autoComplete="name"
                              enterKeyHint="next"
                              placeholder={t("login.placeholders.name")}
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  signupEmailRef.current?.focus();
                                }
                              }}
                              className="w-full bg-transparent outline-none placeholder:text-primary/35"
                            />
                          </Field>

                          <Field
                            label={t("login.fields.email")}
                            icon={<Mail className="h-5 w-5" />}
                          >
                            <input
                              ref={signupEmailRef}
                              type="email"
                              inputMode="email"
                              autoComplete="email"
                              enterKeyHint="next"
                              placeholder={t("login.placeholders.email")}
                              value={signupEmail}
                              onChange={(e) => setSignupEmail(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  signupPasswordRef.current?.focus();
                                }
                              }}
                              className="w-full bg-transparent outline-none placeholder:text-primary/35"
                            />
                          </Field>

                          <Field
                            label={t("login.fields.password")}
                            icon={<Lock className="h-5 w-5" />}
                          >
                            <input
                              ref={signupPasswordRef}
                              type="password"
                              autoComplete="new-password"
                              enterKeyHint="next"
                              placeholder={t("login.placeholders.createPassword")}
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  inviteCodeRef.current?.focus();
                                }
                              }}
                              className="w-full bg-transparent outline-none placeholder:text-primary/35"
                            />
                          </Field>

                          <Field
                            label={t("login.fields.accessCode")}
                            icon={<KeyRound className="h-5 w-5" />}
                          >
                            <input
                              ref={inviteCodeRef}
                              autoComplete="off"
                              enterKeyHint="done"
                              placeholder={t("login.placeholders.accessCode")}
                              value={inviteCode}
                              onChange={(e) => setInviteCode(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleSignup();
                                }
                              }}
                              className="w-full bg-transparent outline-none placeholder:text-primary/35"
                            />
                          </Field>

                          <Button
                            type="button"
                            onClick={handleSignup}
                            className="group h-14 w-full rounded-2xl bg-[#8d73ff] text-base font-black shadow-[0_18px_45px_rgba(141,115,255,0.35)]"
                          >
                            {t("login.buttons.create")}
                            <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
                          </Button>
                          <TermsText langPath={langPath} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

const AuthHeader = ({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) => {
  return (
    <div>
      <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
        {label}
      </p>
      <h2 className="mt-3 font-poppins text-3xl font-black text-primary sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-primary/60">{description}</p>
    </div>
  );
};

const Field = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-primary/45">
        {label}
      </label>

      <div className="flex h-14 items-center gap-3 rounded-[1.3rem] border border-primary/10 bg-[#fbfaff] px-5 text-base transition focus-within:border-[#8d73ff] focus-within:ring-4 focus-within:ring-[#8d73ff]/10">
        <div className="text-primary/40">{icon}</div>
        {children}
      </div>
    </div>
  );
};
const TermsText = ({ langPath }: { langPath: (path: string) => string }) => {
  const { t } = useTranslation();

  return (
    <p className="mt-5 text-center text-xs leading-6 text-primary/45">
      {t("login.terms.prefix")}{" "}

      <Link
        to={langPath("/terms")}
        className="font-semibold text-[#8d73ff] hover:underline"
      >
        {t("login.terms.terms")}
      </Link>{" "}

      {t("login.terms.and")}{" "}

      <Link
        to={langPath("/privacy")}
        className="font-semibold text-[#8d73ff] hover:underline"
      >
        {t("login.terms.privacy")}
      </Link>

      {t("login.terms.suffix")}
    </p>
  );
};
export default Login;
