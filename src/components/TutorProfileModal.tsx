import { X, GraduationCap, Globe2, MessageCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

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
};

type TutorProfileModalProps = {
  tutor: Tutor | null;
  onClose: () => void;
};

const TutorProfileModal = ({ tutor, onClose }: TutorProfileModalProps) => {
  const { t } = useTranslation();

  if (!tutor) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 px-6 backdrop-blur-sm">
      <div className="relative grid max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border bg-white shadow-[0_30px_100px_rgba(0,0,0,0.25)] md:grid-cols-[0.42fr_0.58fr]">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft transition hover:bg-secondary"
        >
          <X className="h-5 w-5 text-primary" />
        </button>

        <div className="bg-[#fbfaf6] p-8 text-center md:p-10">
          <div className="mx-auto mb-6 flex h-36 w-36 items-center justify-center overflow-hidden rounded-[2rem] bg-secondary font-serif text-5xl text-primary shadow-soft">
            {tutor.image ? (
              <img
                src={tutor.image}
                alt={tutor.name}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              tutor.name[0]
            )}
          </div>

          <h2 className="font-serif text-4xl text-primary">
            {tutor.name}
          </h2>

          <p className="mt-2 text-sm font-semibold text-[#b8873a]">
            {tutor.role}
          </p>

          <div className="mt-8 space-y-5 text-left text-sm">
            <div className="flex gap-3">
              <GraduationCap className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-primary">
                  {t("tutorsPage.labels.education")}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {tutor.education}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Globe2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-primary">
                  {t("tutorsPage.labels.languages")}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {tutor.languages}
                </p>
              </div>
            </div>
          </div>

          <Link to="/enquiry">
            <Button className="mt-8 h-12 w-full rounded-xl bg-primary text-sm">
              {t("landing.headTutors.book")}
            </Button>
          </Link>
        </div>

        <div className="overflow-y-auto p-8 md:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#b8873a]">
            {t("tutorsPage.popup.label")}
          </p>

          <h3 className="mt-4 font-serif text-3xl text-primary">
            {t("tutorsPage.popup.about", { name: tutor.name })}
          </h3>

          <p className="mt-5 text-base leading-8 text-muted-foreground">
            {tutor.bio || tutor.desc}
          </p>

          <h3 className="mt-8 font-serif text-2xl text-primary">
            {t("tutorsPage.popup.experience")}
          </h3>

          <div className="mt-4 space-y-3">
            {tutor.experience.map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#b8873a]" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <h3 className="mt-8 font-serif text-2xl text-primary">
            {t("tutorsPage.popup.subjects")}
          </h3>

          <div className="mt-4 flex flex-wrap gap-2">
            {tutor.subjects.map((subject) => (
              <span
                key={subject}
                className="rounded-full bg-secondary px-4 py-2 text-xs font-medium text-primary"
              >
                {subject}
              </span>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border bg-[#fbfaf6] p-5">
            <MessageCircle className="mb-3 h-5 w-5 text-[#b8873a]" />
            <p className="text-sm leading-7 text-muted-foreground">
              {t("tutorsPage.popup.quote", { name: tutor.name })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfileModal;