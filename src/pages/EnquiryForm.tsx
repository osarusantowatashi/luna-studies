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
      setErrorMsg("Supabase error: " + error.message);
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
    <div className="mx-auto max-w-2xl rounded-3xl border bg-card p-8 shadow-soft">
      <h2 className="mb-3 font-serif text-3xl text-primary">
          {subject
      ? `${t("enquiryForm.enquireAbout")} ${subject}`
      : t("enquiryForm.bookTrial")}
      </h2>

      <p className="mb-6 text-muted-foreground">
        {t("enquiryForm.description")}
      </p>

      {subject && (
        <div className="mb-5 rounded-lg bg-secondary p-3 text-sm">
          {t("enquiryForm.subject")}:{" "}
          <span className="font-semibold text-primary">{subject}</span>
        </div>
      )}

      <div className="space-y-4">
        <input
          placeholder={t("enquiryForm.placeholders.name")}
          className="w-full rounded-lg border p-3"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <input
          placeholder={t("enquiryForm.placeholders.email")}
          className="w-full rounded-lg border p-3"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <input
          placeholder={t("enquiryForm.placeholders.grade")}
          className="w-full rounded-lg border p-3"
          value={form.grade}
          onChange={(e) =>
            setForm({
              ...form,
              grade: e.target.value,
            })
          }
        />

        <textarea
          placeholder={
            subject
              ? `${t("enquiryForm.placeholders.subjectHelp")} ${subject}?`
              : t("enquiryForm.placeholders.generalHelp")
          }
          className="min-h-[120px] w-full rounded-lg border p-3"
          value={form.message}
          onChange={(e) =>
            setForm({
              ...form,
              message: e.target.value,
            })
          }
        />

        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            ✅ {t("enquiryForm.success")}
          </div>
        )}

        <Button
          className="h-12 w-full"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
          ? t("enquiryForm.submitting")
          : t("enquiryForm.submit")}
        </Button>
      </div>
    </div>
  );
};

export default EnquiryForm;