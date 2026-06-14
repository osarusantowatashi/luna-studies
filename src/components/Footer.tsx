import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { FaWhatsapp, FaWeixin, FaLinkedin } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

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

  return (
    <footer className="border-t border-[#e7edf5] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">

          {/* LEFT */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/lunalogo.png"
                alt="Luna Education"
                className="w-14 h-14 object-contain"
              />

              <div>
                <h2 className="text-2xl font-serif text-[#0b234a]">
                  LUNA
                </h2>

                <p className="text-sm text-slate-500 -mt-1">
                  Education
                </p>
              </div>
            </div>

            <p className="text-slate-500 leading-8 max-w-sm">
              {t("footer.description")}
            </p>
          </div>

          {/* CENTER */}
          <div>
            <h3 className="text-[#0b234a] font-semibold mb-5">
              {t("footer.quickLinks")}
            </h3>

            <div className="space-y-3 text-slate-500">
              <Link
                to={withLang("/")}
                className="block transition hover:text-[#0b234a]"
              >
                {t("nav.home")}
              </Link>

              <Link
                to={withLang("/tutors")}
                className="block transition hover:text-[#0b234a]"
              >
                {t("nav.tutors")}
              </Link>

              <Link
                to={withLang("/subjects")}
                className="block transition hover:text-[#0b234a]"
              >
                {t("footer.programmes")}
              </Link>

              <Link
                to={withLang("/enquiry")}
                className="block transition hover:text-[#0b234a]"
              >
                {t("footer.contact")}
              </Link>
            </div>
          </div>
          {/* RIGHT */}
          <div>
            <h3 className="text-[#0b234a] font-semibold mb-5">
              {t("footer.contact")}
            </h3>

            <div className="space-y-5">

              {/* WeChat */}
              <div className="flex items-center gap-4">
                <FaWeixin className="shrink-0 text-[24px] text-[#07C160]" />

                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    WeChat
                  </p>

                  <p className="text-base text-[#0b234a]">
                    luna-education
                  </p>
                </div>
              </div>

              {/* WhatsApp */}
              <a
                href="https://wa.me/6581381999?text=Hello%20LUNA%20Education%2C%20I%20would%20like%20to%20enquire%20about%20lessons."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <FaWhatsapp className="shrink-0 text-[22px] text-[#25D366]" />

                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    WhatsApp
                  </p>

                  <p className="text-base text-[#0b234a] transition group-hover:text-[#25D366]">
                    +65 81381999
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:enquiries@lunastudies.com"
                className="flex items-center gap-4 group"
              >
                <MdEmail className="shrink-0 text-[20px] text-slate-500" />

                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    Email
                  </p>

                  <p className="break-all text-base text-[#0b234a] transition group-hover:text-[#F6C65B]">
                    enquiries@lunastudies.com
                  </p>
                </div>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/luna-international-education/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <FaLinkedin className="shrink-0 text-[22px] text-[#0A66C2]" />

                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    LinkedIn
                  </p>

                  <p className="text-base text-[#0b234a] transition group-hover:text-[#0A66C2]">
                    Luna Education
                  </p>
                </div>
              </a>

            </div>
          </div>
        </div>
        <div className="border-t border-[#eef2f7] mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">

          <p className="text-sm text-slate-400">
            {t("footer.copyright")}
          </p>

          <p className="text-sm text-slate-400">
            {t("footer.locations")}
          </p>

        </div>
      </div>
    </footer>
  );
}
