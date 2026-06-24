import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Mail,
  MessageCircle,
  Sparkles,
  UserRound,
  GraduationCap,
} from "lucide-react";

const EnquiryForm = ({ subject }: { subject?: string }) => {
  const { t } = useTranslation();

  const label = (key: string, fallback: string) => {
    const value = t(key);
    if (typeof value !== "string") return fallback;
    return value === key ? fallback : value;
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    grade: "",
    message: "",
    subject: subject || "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (subject) {
      setForm((prev) => ({
        ...prev,
        subject,
      }));
    }
  }, [subject]);

  const handleSubmit = async () => {
    const name = form.name.trim();
    const email = form.email.trim();
    const grade = form.grade.trim();
    const message = form.message.trim();
    const selectedSubject = form.subject || subject || "";

    setErrorMsg("");
    setSuccess(false);

    if (!name || !email) {
      setErrorMsg(
        label(
          "enquiryForm.errors.fillRequired",
          "Please fill in your name and email."
        )
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setErrorMsg(
        label(
          "enquiryForm.errors.invalidEmail",
          "Please enter a valid email address."
        )
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("enquiries").insert([
        {
          name,
          email,
          grade,
          message,
          subject: selectedSubject,
        },
      ]);

      if (error) {
        setErrorMsg(
          label(
            "enquiryForm.errors.general",
            "Something went wrong. Please try again."
          )
        );
        console.error(error);
        setLoading(false);
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL;

      try {
        await fetch(`${API_URL}/api/send-admin-enquiry-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            subject: selectedSubject,
            grade,
            message,
          }),
        });
      } catch (emailError) {
        console.warn("Email failed:", emailError);
      }

      setSuccess(true);

      setForm({
        name: "",
        email: "",
        grade: "",
        message: "",
        subject: subject || "",
      });
    } catch (err) {
      console.error(err);
      setErrorMsg(
        label(
          "enquiryForm.errors.general",
          "Something went wrong. Please try again."
        )
      );
    }

    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.25 }}
      transition={{ duration: 0.55 }}
      className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[1.8rem] bg-white/95 shadow-[0_28px_90px_rgba(66,56,120,0.14)] backdrop-blur-xl sm:rounded-[3rem]"
    >
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#fff1bd]/70 blur-2xl" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#f0eaff]/80 blur-2xl" />

      <div className="relative z-10 grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
        {/* LEFT INFO */}
        <div className="relative overflow-hidden bg-[#fbfaff] p-5 sm:p-9 lg:p-10">
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-[#8d73ff] text-white shadow-[0_18px_40px_rgba(141,115,255,0.28)] sm:mb-8 sm:h-16 sm:w-16 sm:rounded-[1.5rem]"
          >
            <Sparkles className="h-7 w-7" />
          </motion.div>

          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
            {label("enquiryForm.label", "Start here")}
          </p>

          <h2 className="mt-4 font-poppins text-2xl font-black leading-tight text-primary sm:text-4xl lg:text-5xl">
            {subject
              ? `${label("enquiryForm.enquireAbout", "Enquire about")} ${subject}`
              : label("enquiryForm.bookTrial", "Book a trial lesson")}
          </h2>

          <p className="mt-5 text-base leading-8 text-primary/60">
            {label(
              "enquiryForm.description",
              "Tell us about the student and we’ll recommend the right support."
            )}
          </p>

          {subject && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-7 rounded-[1.7rem] bg-white px-5 py-4 shadow-[0_12px_35px_rgba(66,56,120,0.08)]"
            >
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d73ff]">
                {label("enquiryForm.subject", "Subject")}
              </p>
              <p className="mt-1 font-poppins text-xl font-black text-primary">
                {subject}
              </p>
            </motion.div>
          )}

          <div className="mt-8 space-y-3">
            {[
              label("enquiryForm.benefits.matching", "Personalised tutor matching"),
              label("enquiryForm.benefits.assessment", "Trial assessment available"),
              label("enquiryForm.benefits.support", "Online & offline support"),
            ].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3"
              >
                <CheckCircle className="h-5 w-5 text-[#8d73ff]" />
                <p className="text-sm font-bold text-primary/70">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FORM */}
        <div className="p-5 sm:p-9 lg:p-10">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <InputWrap icon={<UserRound className="h-5 w-5" />}>
                <input
                  placeholder={label(
                    "enquiryForm.placeholders.name",
                    "Parent / student name"
                  )}
                  className="w-full bg-transparent text-base outline-none placeholder:text-primary/35"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />
              </InputWrap>
            </div>

            <div>
              <InputWrap icon={<Mail className="h-5 w-5" />}>
                <input
                  type="email"
                  placeholder={label(
                    "enquiryForm.placeholders.email",
                    "Email address"
                  )}
                  className="w-full bg-transparent text-base outline-none placeholder:text-primary/35"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                />
              </InputWrap>
            </div>

            <div>
              <InputWrap icon={<GraduationCap className="h-5 w-5" />}>
                <input
                  placeholder={label(
                    "enquiryForm.placeholders.grade",
                    "Student grade / year level"
                  )}
                  className="w-full bg-transparent text-base outline-none placeholder:text-primary/35"
                  value={form.grade}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      grade: e.target.value,
                    })
                  }
                />
              </InputWrap>
            </div>

            <div className="sm:col-span-2">
              <div className="rounded-[1.4rem] border border-primary/10 bg-[#fbfaff] p-4 transition focus-within:border-[#8d73ff] focus-within:ring-4 focus-within:ring-[#8d73ff]/10 sm:rounded-[1.6rem] sm:p-5">
                <div className="mb-3 flex items-center gap-3 text-primary/45">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm font-bold">
                    {label("enquiryForm.fields.message", "Message")}
                  </span>
                </div>

                <textarea
                  placeholder={
                    subject
                      ? `${label(
                        "enquiryForm.placeholders.subjectHelp",
                        "What would you like help with for"
                      )} ${subject}?`
                      : label(
                        "enquiryForm.placeholders.generalHelp",
                        "What would you like help with?"
                      )
                  }
                  className="min-h-[140px] w-full resize-none bg-transparent text-base leading-7 outline-none placeholder:text-primary/35 sm:min-h-[160px]"
                  value={form.message}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      message: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-[1.3rem] bg-red-50 px-5 py-4 text-sm font-semibold text-red-600"
            >
              {errorMsg}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-[1.3rem] bg-green-50 px-5 py-4 text-sm font-semibold text-green-700"
            >
              ✅{" "}
              {label(
                "enquiryForm.success",
                "Thank you! Your enquiry has been submitted."
              )}
            </motion.div>
          )}

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="group mt-6 h-14 w-full rounded-[1.4rem] bg-primary text-base font-black shadow-[0_18px_45px_rgba(10,36,84,0.20)]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {label("enquiryForm.submitting", "Submitting...")}
              </span>
            ) : (
              <>
                {label("enquiryForm.submit", "Submit enquiry")}
                <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const InputWrap = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex min-h-14 items-center gap-3 rounded-[1.3rem] border border-primary/10 bg-[#fbfaff] px-4 py-3.5 transition focus-within:border-[#8d73ff] focus-within:ring-4 focus-within:ring-[#8d73ff]/10 sm:rounded-[1.4rem] sm:px-5 sm:py-4">
      <div className="text-primary/40">{icon}</div>
      {children}
    </div>
  );
};

export default EnquiryForm;
