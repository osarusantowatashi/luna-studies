import { X, GraduationCap, Globe2, MessageCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

type Tutor = {
  name: string;
  role: string;
  image?: string;
  subjects: string[];
  education: string;
  languages: string;
  bio?: string;
  desc?: string;
  experience: string[];
  teachingStyle?: string[];
  quote?: string;
};

type TutorProfileModalProps = {
  tutor: Tutor | null;
  onClose: () => void;
};

const TutorProfileModal = ({ tutor, onClose }: TutorProfileModalProps) => {
  const { t, i18n } = useTranslation();

  const label = (key: string, fallback: string) => {
    const value = t(key);

    if (typeof value !== "string") return fallback;

    return value === key ? fallback : value;
  };
  useEffect(() => {
    if (tutor) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [tutor]);

  if (!tutor) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 px-3 py-3 backdrop-blur-sm sm:p-6">
      <div className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-y-auto rounded-[1.6rem] border bg-white shadow-[0_30px_100px_rgba(0,0,0,0.25)] md:grid md:max-h-[88vh] md:grid-cols-[0.42fr_0.58fr] md:rounded-[2rem]">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-soft transition hover:bg-secondary md:right-5 md:top-5 md:h-10 md:w-10"
          aria-label="Close tutor profile"
        >
          <X className="h-5 w-5 text-primary" />
        </button>

        {/* LEFT */}
        <div className="bg-[#fbfaf6] px-5 pb-6 pt-5 text-center sm:p-8 md:p-10">
          <div
            className={`mx-auto mb-5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.6rem] font-serif text-4xl text-primary shadow-soft sm:h-36 sm:w-36 sm:rounded-[2rem] sm:text-5xl ${
              tutor.name === "Siya" ? "bg-white" : "bg-secondary"
            }`}
          >
            {tutor.image ? (
              <img
                src={tutor.image}
                alt={tutor.name}
                className={`h-full w-full object-center ${
                  tutor.name === "Siya" ? "object-contain" : "object-cover object-top"
                }`}
              />
            ) : (
              tutor.name[0]
            )}
          </div>

          <h2 className="font-serif text-3xl text-primary sm:text-4xl">
            {tutor.name}
          </h2>

          <p className="mt-2 text-sm font-semibold text-[#b8873a]">
            {tutor.role}
          </p>

          <div className="mt-6 space-y-5 text-left text-sm sm:mt-8">
            <div className="flex gap-3">
              <GraduationCap className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-primary">
                  {label("tutorsPage.labels.education", "Education")}                </p>
                <p className="mt-1 leading-6 text-muted-foreground">
                  {tutor.education}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Globe2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-primary">
                  {label("tutorsPage.labels.languages", "Languages")}                </p>
                <p className="mt-1 leading-6 text-muted-foreground">
                  {tutor.languages}
                </p>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 mt-7 bg-[#fbfaf6] pb-[env(safe-area-inset-bottom)] pt-4 sm:mt-8">
            <Link to={`/${i18n.language.startsWith("zh") ? "zh" : i18n.language.startsWith("ja") ? "ja" : "en"}/enquiry`} onClick={onClose}>
              <Button className="h-12 w-full rounded-xl bg-primary text-sm">
                {t("tutorsPage.buttons.book")}
              </Button>
            </Link>
          </div>
        </div>

        {/* RIGHT */}
        <div className="px-6 py-8 sm:p-8 md:max-h-[88vh] md:overflow-y-auto md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b8873a] sm:text-sm">
            {label("tutorsPage.popup.label", "Tutor Profile")}          </p>

          <h3 className="mt-4 font-serif text-2xl text-primary sm:text-3xl">
            {t("tutorsPage.popup.about", { name: tutor.name })}</h3>
          <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            {tutor.bio || tutor.desc}
          </p>

          {tutor.teachingStyle && tutor.teachingStyle.length > 0 && (
            <>
              <h3 className="mt-8 font-serif text-xl text-primary sm:text-2xl">
                {label("tutorsPage.popup.teachingStyle", "Teaching Style")}
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {tutor.teachingStyle.slice(0, 3).map((style) => (
                  <div
                    key={style}
                    className="flex min-h-[78px] items-center justify-center rounded-2xl bg-[#f8f6ff] px-4 py-4 text-center text-sm font-bold leading-5 text-primary"
                  >
                    {style}
                  </div>
                ))}
              </div>
            </>
          )}

          <h3 className="mt-8 font-serif text-xl text-primary sm:text-2xl">
            {label("tutorsPage.popup.experience", "Teaching Experience")}          </h3>
          <div className="mt-4 space-y-3">
            {(tutor.experience || []).map((item: string) => (
              <div
                key={item}
                className="rounded-2xl bg-[#f8f6ff] px-4 py-3 text-sm leading-7 text-primary/70"
              >
                ✦ {item}
              </div>
            ))}
          </div>
          <h3 className="mt-8 font-serif text-xl text-primary sm:text-2xl">
            {label("tutorsPage.popup.subjects", "Subjects")}          </h3>

          <div className="mt-4 flex flex-wrap gap-2">
            {tutor.subjects.map((subject) => (
              <span
                key={subject}
                className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-primary sm:px-4 sm:py-2"
              >
                {subject}
              </span>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border bg-[#fbfaf6] p-5">
            <MessageCircle className="mb-3 h-5 w-5 text-[#b8873a]" />
            <p className="text-sm leading-7 text-muted-foreground">
              {tutor.quote || t("tutorsPage.popup.quote", { name: tutor.name })}         </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfileModal;
