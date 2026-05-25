import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Privacy = () => {
  const location = useLocation();

  const currentLang = location.pathname.startsWith("/zh")
    ? "zh"
    : location.pathname.startsWith("/jp")
    ? "jp"
    : "en";

  return (
    <>
      <Helmet>
        <title>Privacy Policy | LUNA Studies</title>
      </Helmet>

      <div className="min-h-screen bg-[#fbfaff]">
        <NavBar />

        <section className="relative overflow-hidden px-4 pt-28 pb-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_82%_78%,#fff1bd_0%,transparent_30%)]" />

          <div className="relative z-10 mx-auto max-w-4xl">
            <Link
              to={`/${currentLang}/login`}
              className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-bold text-primary shadow-[0_12px_35px_rgba(66,56,120,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(66,56,120,0.12)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]"
            >
              LUNA Studies
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-5 font-poppins text-5xl font-black leading-tight text-primary sm:text-6xl"
            >
              Privacy Policy
            </motion.h1>

            <p className="mt-5 text-primary/60">
              Last updated: May 2026
            </p>

            <div className="mt-12 space-y-6 rounded-[3rem] bg-white/90 p-7 shadow-[0_25px_80px_rgba(66,56,120,0.10)] backdrop-blur-xl sm:p-10">
              {[
                {
                  title: "1. Information We Collect",
                  text: "We may collect information such as names, email addresses, lesson preferences, student levels, and communication history when you use our services or submit enquiries.",
                },
                {
                  title: "2. How We Use Information",
                  text: "Your information is used to provide tutoring services, manage accounts, respond to enquiries, improve learning support, and communicate important updates.",
                },
                {
                  title: "3. Student Data Protection",
                  text: "We take reasonable steps to protect student information and restrict access to authorised tutors, staff, and administrators only.",
                },
                {
                  title: "4. Payments and Third-Party Services",
                  text: "Some services may involve trusted third-party providers such as payment processors, email systems, scheduling tools, or analytics platforms.",
                },
                {
                  title: "5. Cookies and Analytics",
                  text: "Our website may use cookies or analytics tools to improve user experience, understand website usage, and maintain platform functionality.",
                },
                {
                  title: "6. Sharing of Information",
                  text: "We do not sell personal information. Information may only be shared where necessary for educational support, legal compliance, or operational purposes.",
                },
                {
                  title: "7. Data Retention",
                  text: "We may retain account and learning information for operational, educational, and administrative purposes unless deletion is requested.",
                },
                {
                  title: "8. Contact",
                  text: "For privacy-related questions, please contact us at enquiries@lunastudies.com.",
                },
              ].map((section, i) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-[2rem] bg-[#fbfaff] p-5"
                >
                  <h2 className="font-poppins text-xl font-black text-primary">
                    {section.title}
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-primary/65">
                    {section.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Privacy;