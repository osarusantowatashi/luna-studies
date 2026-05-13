import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const EnquiryForm = ({ subject }: { subject?: string }) => {
  const { t } = useTranslation();
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
      setErrorMsg(t("enquiryForm.errors.fillRequired"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setErrorMsg(t("enquiryForm.errors.invalidEmail"));
      return;
    }

    setLoading(true);

    try {
      // 1. Save enquiry to Supabase
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
        setErrorMsg("enquiryForm.errors.general");
        console.error(error);
        setLoading(false);
        return;
      }

      console.log("✅ Enquiry saved to Supabase");

      // 2. Try sending email, but don't block enquiry success
      const API_URL = import.meta.env.VITE_API_URL;

      console.log("API URL:", API_URL);

      try {
        const emailResponse = await fetch(
          `${API_URL}/api/send-admin-enquiry-email`,
          {
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
          }
        );

        const emailText = await emailResponse.text();
        console.log("EMAIL RAW RESPONSE:", emailText);
      } catch (emailError) {
        console.warn("⚠️ Email failed, but enquiry was saved:", emailError);
      }

      setSuccess(true);
      setForm({
        name: "",
        email: "",
        grade: "",
        message: "",
        subject: subject || "",
      });
    } catch (err: any) {
      console.error("❌ Submit error:", err);
      setErrorMsg(t("enquiryForm.errors.general"));
    }

    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl rounded-[1.8rem] border bg-card p-5 shadow-soft sm:rounded-3xl sm:p-8">
      <h2 className="mb-3 font-serif text-2xl text-primary sm:text-3xl">
        {subject
          ? `${t("enquiryForm.enquireAbout")} ${subject}`
          : t("enquiryForm.bookTrial")}
      </h2>

      <p className="mb-6 text-sm leading-7 text-muted-foreground sm:text-base">
        {t("enquiryForm.description")}
      </p>

      {subject && (
        <div className="mb-5 rounded-2xl bg-secondary p-4 text-sm leading-7">
          {t("enquiryForm.subject")}:{" "}
          <span className="font-semibold text-primary">{subject}</span>
        </div>
      )}

      <div className="space-y-5 pb-1">
        <input
          autoComplete="name"
          placeholder={t("enquiryForm.placeholders.name")}
          className="w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus-visible:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 focus:ring-primary/10"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={t("enquiryForm.placeholders.email")}
          className="w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus-visible:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 focus:ring-primary/10"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <input
          autoComplete="off"
          placeholder={t("enquiryForm.placeholders.grade")}
          className="w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus-visible:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 focus:ring-primary/10"
          value={form.grade}
          onChange={(e) =>
            setForm({
              ...form,
              grade: e.target.value,
            })
          }
        />

        <textarea
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={
            subject
              ? `${t("enquiryForm.placeholders.subjectHelp")} ${subject}?`
              : t("enquiryForm.placeholders.generalHelp")
          }
          className="min-h-[140px] w-full resize-none rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus-visible:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 focus:ring-primary/10"
          value={form.message}
          onChange={(e) =>
            setForm({
              ...form,
              message: e.target.value,
            })
          }
        />

        {errorMsg && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-600">
            {errorMsg}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-7 text-green-700">
            ✅ {t("enquiryForm.success")}
          </div>
        )}

        <Button
          type ="button"
          className="h-12 w-full rounded-2xl text-sm sm:text-base"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t("enquiryForm.submitting")}
            </span>
          ) : (
            t("enquiryForm.submit")
          )}
        </Button>
      </div>
    </div>
  );
};

export default EnquiryForm;