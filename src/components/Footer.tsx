import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { FaLinkedin, FaWhatsapp, FaWeixin } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

type FooterLink = {
  label: string;
  path: string;
};

export default function Footer() {
  const location = useLocation();
  const { t } = useTranslation();

  const currentLang = location.pathname.startsWith("/zh")
    ? "zh"
    : location.pathname.startsWith("/ja")
      ? "ja"
      : "en";

  const withLang = (path: string) =>
    `/${currentLang}${path === "/" ? "" : path}`;

  const hiddenRoutes = [
    "/dashboard",
    "/practice",
    "/mistakes",
    "/generate",
    "/studentoverview",
    "/admin",
    "/tutor/lessons",
  ];

  const shouldHide = hiddenRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  if (shouldHide) return null;

  const aboutUs: FooterLink[] = [
    [t("footer.about.aboutLuna"), withLang("/whyluna")],
    [t("footer.about.tutors"), withLang("/tutors")],
    [t("footer.about.careers"), withLang("/careers")],
    [t("footer.about.contact"), withLang("/enquiry")],
  ].map(([label, path]) => ({ label, path }));

  const assessmentPreparation: FooterLink[] = [
    [t("footer.programs.map"), withLang("/subjects/map-preparation")],
    [t("footer.programs.wida"), withLang("/subjects/wida-preparation")],
    [t("footer.programs.cat4"), withLang("/subjects/cat4-preparation")],
    [t("footer.programs.aeis"), withLang("/subjects/aeis-preparation")],
    [t("footer.programs.toefl"), withLang("/subjects/toefl-preparation")],
    [t("footer.programs.ielts"), withLang("/subjects/ielts-preparation")],
  ].map(([label, path]) => ({ label, path }));

  const serviceSupport: FooterLink[] = [
    [t("footer.programs.academicSupport"), withLang("/subjects#academic")],
    [t("footer.services.applicationEssays"), withLang("/services/essay-support")],
    [t("footer.services.parentInterview"), withLang("/services/parent-interview")],
    [t("footer.services.mockInterview"), withLang("/services/mock-interview")],
    [t("footer.services.entranceExamPackage"), withLang("/services/exam-package")],
    [t("footer.services.schoolConsulting"), withLang("/services/school-consulting")],
  ].map(([label, path]) => ({ label, path }));

  const additionalServices: FooterLink[] = [
    [t("footer.services.consultation"), withLang("/services/consultation")],
    [t("footer.services.arcade"), withLang("/arcade")],
  ].map(([label, path]) => ({ label, path }));

  const legalLinks: FooterLink[] = [
    [t("footer.services.terms"), withLang("/terms")],
    [t("footer.services.privacy"), withLang("/privacy")],
  ].map(([label, path]) => ({ label, path }));

  const renderLinks = (links: FooterLink[]) => (
    <ul className="space-y-2.5">
      {links.map((link) => (
        <li key={`${link.label}-${link.path}`}>
          <Link
            to={link.path}
            className="inline-flex min-h-9 items-center text-sm leading-6 text-slate-300 transition hover:text-white"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <footer className="relative overflow-hidden bg-[#071b3a] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />

      <div className="mx-auto max-w-7xl px-4 pb-28 pt-12 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-10">
          <nav aria-label={t("footer.columns.aboutUs")}>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              {t("footer.columns.aboutUs")}
            </h3>

            {renderLinks(aboutUs)}
          </nav>

          <nav aria-label={t("footer.columns.assessmentPreparation")}>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              {t("footer.columns.assessmentPreparation")}
            </h3>

            {renderLinks(assessmentPreparation)}
          </nav>

          <nav aria-label={t("footer.columns.serviceSupport")}>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              {t("footer.columns.serviceSupport")}
            </h3>

            {renderLinks(serviceSupport)}
          </nav>

          <div className="space-y-8">
            <nav aria-label={t("footer.columns.additionalServices")}>
              <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                {t("footer.columns.additionalServices")}
              </h3>

              {renderLinks(additionalServices)}
            </nav>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              {t("footer.columns.contact")}
            </h3>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <FaWeixin className="mt-0.5 shrink-0 text-[21px] text-[#07C160]" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {t("footer.contact.wechat")}
                  </p>

                  <p className="mt-1 text-sm text-slate-200">
                    luna-education
                  </p>
                </div>
              </div>

              <a
                href="https://wa.me/6581381999?text=Hello%20LUNA%20Education%2C%20I%20would%20like%20to%20enquire%20about%20lessons."
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3"
              >
                <FaWhatsapp className="mt-0.5 shrink-0 text-[21px] text-[#25D366]" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {t("footer.contact.whatsapp")}
                  </p>

                  <p className="mt-1 text-sm text-slate-200 transition group-hover:text-[#25D366]">
                    +65 81381999
                  </p>
                </div>
              </a>

              <a
                href="mailto:enquiries@lunastudies.com"
                className="group flex items-start gap-3"
              >
                <MdEmail className="mt-0.5 shrink-0 text-[21px] text-slate-400" />

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {t("footer.contact.email")}
                  </p>

                  <p className="mt-1 break-all text-sm text-slate-200 transition group-hover:text-[#f6c65b] sm:break-normal">
                    enquiries@lunastudies.com
                  </p>
                </div>
              </a>

              <a
                href="https://www.linkedin.com/company/luna-international-education/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3"
              >
                <FaLinkedin className="mt-0.5 shrink-0 text-[21px] text-[#0A66C2]" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {t("footer.contact.linkedin")}
                  </p>

                  <p className="mt-1 text-sm text-slate-200 transition group-hover:text-[#60a5fa]">
                    Luna Education
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm leading-6 text-slate-400">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-2">
            <span>{t("footer.bottom.copyright")}</span>

            {legalLinks.map((link) => (
              <span key={`${link.label}-${link.path}`} className="inline-flex items-center gap-x-2">
                <span aria-hidden="true" className="hidden sm:inline">{t("footer.bottom.separator")}</span>
                <Link
                  to={link.path}
                  className="inline-flex min-h-9 items-center transition hover:text-white"
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
