import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Terms = () => {
    const location = useLocation();

const currentLang = location.pathname.startsWith("/zh")
  ? "zh"
  : location.pathname.startsWith("/jp")
  ? "jp"
  : "en";
  return (
    <>
      <Helmet>
        <title>Terms of Service | LUNA Studies</title>
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
              Terms of Service
            </motion.h1>

            <p className="mt-5 text-primary/60">
              Last updated: May 2026
            </p>

            <div className="mt-12 space-y-6 rounded-[3rem] bg-white/90 p-7 shadow-[0_25px_80px_rgba(66,56,120,0.10)] backdrop-blur-xl sm:p-10">
              {[
                {
                  title: "1. Use of Our Services",
                  text: "LUNA Studies provides tutoring, academic support, consultation, and related educational services. By using our website or services, you agree to use them responsibly and lawfully.",
                },
                {
                  title: "2. Student Accounts",
                  text: "Students, tutors, and administrators may access protected areas using approved accounts or invite codes. You are responsible for keeping your login details secure.",
                },
                {
                  title: "3. Lessons and Scheduling",
                  text: "Lesson schedules, formats, and tutor arrangements may vary depending on availability, student needs, and agreed learning plans.",
                },
                {
                  title: "4. Payments and Cancellations",
                  text: "Fees, payment timing, cancellation rules, and rescheduling policies will be communicated separately before or during enrolment.",
                },
                {
                  title: "5. Learning Materials",
                  text: "Worksheets, question banks, lesson materials, and feedback documents are provided for personal learning use only and may not be copied, shared, sold, or redistributed without permission.",
                },
                {
                  title: "6. Limitation of Guarantee",
                  text: "We aim to support student improvement through structured tutoring, but we cannot guarantee specific exam scores, school admission results, or academic outcomes.",
                },
                {
                  title: "7. Changes to Terms",
                  text: "We may update these terms from time to time. Continued use of our services means you accept the updated terms.",
                },
                {
                  title: "8. Contact",
                  text: "For questions about these terms, please contact us at enquiries@lunastudies.com.",
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

export default Terms;