import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SeoHelmet from "@/components/SeoHelmet";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { apiUrl } from "@/lib/api";
import {
    ArrowRight,
    Briefcase,
    CheckCircle2,
    GraduationCap,
    Upload,
    Sparkles,
} from "lucide-react";



const CareerDetail = () => {
    const { t } = useTranslation();

    const alerts = t("careers.detail.alerts", {
        returnObjects: true,
    }) as Record<string, string>;


    const { slug } = useParams();

    const jobs = t("careers.detail.jobs", {
        returnObjects: true,
    }) as Record<
        string,
        {
            title: string;
            type: string;
            mode: string;
            about: string;
            responsibilities: string[];
            requirements: string[];
            workingArrangement: string[];
        }
    >;

    const job = slug ? jobs[slug] : null;

    const currentLang = window.location.pathname.startsWith("/zh")
        ? "zh"
        : window.location.pathname.startsWith("/ja")
            ? "ja"
            : "en";

    const [submitting, setSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        country: "",
        city: "",
        universities: "",
        degrees: "",
        graduationYear: "",
        teachingExperience: "",
        hoursPerWeek: "",
        englishProficiency: "",
        chineseProficiency: "",
        japaneseProficiency: "",
        whyJoin: "",
        hearAboutUs: "",
        hearAboutUsDetail: "",
    });

    const [studentAgeGroups, setStudentAgeGroups] = useState<string[]>([]);
    const [subjectsTaught, setSubjectsTaught] = useState<string[]>([]);
    const [availableOnline, setAvailableOnline] = useState(false);
    const [offlineJapan, setOfflineJapan] = useState(false);
    const [offlineSingapore, setOfflineSingapore] = useState(false);

    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);

    const updateForm = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const toggleValue = (
        value: string,
        list: string[],
        setter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        setter(
            list.includes(value)
                ? list.filter((item) => item !== value)
                : [...list, value]
        );
    };

    const uploadFile = async (file: File, type: "resume" | "cover") => {
        if (!slug) throw new Error(alerts.missingJob);

        if (file.type !== "application/pdf") {
            throw new Error(alerts.pdfOnly);
        }

        const cleanName = form.fullName.trim().replace(/\s+/g, "-").toLowerCase();
        const filePath = `${slug}/${Date.now()}-${cleanName}-${type}.pdf`;

        const { error } = await supabase.storage
            .from("career-files")
            .upload(filePath, file, {
                contentType: "application/pdf",
                upsert: false,
            });

        if (error) throw error;

        return filePath;
    };

    const isValidEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const scrollToField = (field: string) => {
        setTimeout(() => {
            document.querySelector(`[data-field="${field}"]`)?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }, 50);
    };

    const showHearAboutUsDetail =

        form.hearAboutUs === "Others" ||

        form.hearAboutUs === "Referral" ||

        form.hearAboutUs === "其他" ||

        form.hearAboutUs === "推荐" ||

        form.hearAboutUs === "紹介" ||

        form.hearAboutUs === "その他";
    const handleSubmit = async () => {
        if (!job || !slug) return;
        const errors: Record<string, boolean> = {};

        if (!form.fullName.trim()) errors.fullName = true;
        if (!form.email.trim() || !isValidEmail(form.email.trim())) errors.email = true;
        if (!form.phone.trim()) errors.phone = true;
        if (!form.country.trim()) errors.country = true;
        if (!form.city.trim()) errors.city = true;

        if (!form.universities.trim()) errors.universities = true;
        if (!form.degrees.trim()) errors.degrees = true;
        if (!form.graduationYear.trim()) errors.graduationYear = true;

        if (!form.teachingExperience.trim()) errors.teachingExperience = true;
        if (studentAgeGroups.length === 0) errors.studentAgeGroups = true;
        if (subjectsTaught.length === 0) errors.subjectsTaught = true;

        if (!availableOnline && !offlineJapan && !offlineSingapore) {
            errors.workingArrangement = true;
        }

        if (!form.englishProficiency.trim()) errors.englishProficiency = true;
        if (!form.chineseProficiency.trim()) errors.chineseProficiency = true;
        if (!form.japaneseProficiency.trim()) errors.japaneseProficiency = true;
        if (!form.hoursPerWeek.trim()) errors.hoursPerWeek = true;

        if (!form.whyJoin.trim()) errors.whyJoin = true;
        if (!form.hearAboutUs.trim()) errors.hearAboutUs = true;

        if (showHearAboutUsDetail && !form.hearAboutUsDetail.trim()) {
            errors.hearAboutUsDetail = true;
        }

        if (!resumeFile) errors.resumeFile = true;

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            scrollToField(Object.keys(errors)[0]);

            if (errors.email && form.email.trim()) {
                alert(alerts.invalidEmail);
            } else if (errors.resumeFile) {
                alert(alerts.uploadResume);
            } else if (errors.workingArrangement) {
                alert(alerts.selectArrangement);
            } else if (errors.hearAboutUsDetail) {
                alert(alerts.explainSource);
            } else {
                alert(alerts.completeRequired);
            }

            return;
        }

        setFieldErrors({});

        setSubmitting(true);

        try {
            const resumePath = await uploadFile(resumeFile, "resume");
            const coverPath = coverFile ? await uploadFile(coverFile, "cover") : null;
            const emailRes = await fetch(apiUrl("/api/submit-career-application"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    position: job.title,
                    slug,

                    full_name: form.fullName.trim(),
                    email: form.email.trim(),
                    phone: form.phone.trim(),
                    country: form.country.trim(),
                    city: form.city.trim(),

                    universities: form.universities.trim(),
                    degrees: form.degrees.trim(),
                    graduation_year: form.graduationYear.trim(),

                    teaching_experience: form.teachingExperience,
                    student_age_groups: studentAgeGroups,
                    subjects_taught: subjectsTaught,

                    available_online: availableOnline,
                    available_offline_japan: offlineJapan,
                    available_offline_singapore: offlineSingapore,

                    english_proficiency: form.englishProficiency,
                    chinese_proficiency: form.chineseProficiency,
                    japanese_proficiency: form.japaneseProficiency,

                    hours_per_week: form.hoursPerWeek,

                    why_join: form.whyJoin.trim(),
                    hear_about_us: form.hearAboutUs,
                    hear_about_us_detail: form.hearAboutUsDetail.trim(),

                    resume_url: resumePath,
                    cover_letter_url: coverPath,
                }),
            });


            const emailData = await emailRes.json();

            if (!emailRes.ok || !emailData.success) {
                throw new Error(
                    emailData.error || alerts.emailFailed
                );
            }
            alert(alerts.success);
            window.location.href = `/${currentLang}/careers`;
        } catch (error: any) {
            alert(
                error.message || alerts.somethingWrong
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (!job) {
        return (
            <div className="min-h-screen bg-[#fbfaff]">
                <NavBar />
                <main className="px-6 py-32 text-center">
                    <h1 className="text-4xl font-black text-primary">

                        {t("careers.detail.notFound")}

                    </h1>
                    <Link to={`/${currentLang}/careers`}>
                        <Button className="mt-6 rounded-2xl">

                            {t("careers.detail.backToCareers")}

                        </Button>
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }


    const baseUrl = "https://www.lunastudies.com";
    const canonicalUrl = `${baseUrl}/${currentLang}/careers/${slug}`;

    const seoTitle = `${job.title} | Luna Studies Careers`;
    const seoDescription = `${job.title} opportunity at Luna Studies. Join our international education team and support students through personalised learning.`;

    return (
        <>
            <SeoHelmet
                title={seoTitle}
                description={seoDescription}
                canonicalUrl={canonicalUrl}
                currentLang={currentLang}
            />

            <div className="min-h-screen bg-[#fbfaff]">
                <NavBar />

                <main className="px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8">
                    <div className="mx-auto mb-6 max-w-7xl">
                        <Link
                            to={`/${currentLang}/careers`}
                            className="inline-flex min-h-11 items-center rounded-2xl border border-primary/10 bg-white px-5 py-3 text-sm font-black text-primary shadow-sm hover:bg-[#fbfaff]"
                        >
                            ← {t("careers.detail.backToCareers")}
                        </Link>
                    </div>
                    <section className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="h-fit rounded-[2rem] bg-[#082A55] p-5 text-white shadow-[0_35px_100px_rgba(8,42,85,0.22)] sm:rounded-[3rem] sm:p-10"
                        >
                            <GraduationCap className="h-10 w-10 text-[#F6C65B]" />

                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <h1 className="font-poppins text-4xl font-black">
                                    {job.title}
                                </h1>

                                <span className="rounded-full bg-[#F6C65B] px-4 py-1.5 text-sm font-black text-[#082A55]">
                                    {job.type}
                                </span>
                            </div>

                            <p className="mt-4 text-white/70">{job.mode}</p>

                            <p className="mt-8 text-base leading-8 text-white/75 sm:text-lg">
                                {job.about}
                            </p>

                            <InfoSection title={t("careers.detail.responsibilitiesTitle")} items={job.responsibilities} />
                            <InfoSection title={t("careers.detail.requirementsTitle")} items={job.requirements} />
                            <InfoSection
                                title={t("careers.detail.workingArrangementTitle")}
                                items={job.workingArrangement}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 }}
                            className="rounded-[2rem] border border-[#E8D8B5] bg-white p-5 shadow-[0_25px_80px_rgba(66,56,120,0.12)] sm:rounded-[3rem] sm:p-8"
                        >
                            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                                <Sparkles className="h-4 w-4" />
                                {t("careers.detail.applicationForm")}
                            </p>

                            <h2 className="mt-3 font-poppins text-3xl font-black text-primary">
                                {t("careers.detail.applyFor", { title: job.title })}
                            </h2>

                            <FormBlock title={t("careers.detail.form.personalInformation")}>
                                <Input
                                    field="fullName"
                                    error={fieldErrors.fullName}
                                    label={t("careers.detail.form.fullName")}
                                    value={form.fullName}
                                    onChange={(v) => updateForm("fullName", v)}
                                />
                                <Input
                                    field="email"
                                    error={fieldErrors.email}
                                    type="email"
                                    label={t("careers.detail.form.emailAddress")}
                                    value={form.email}
                                    onChange={(v) => updateForm("email", v)}
                                />
                                <Input
                                    field="phone"
                                    error={fieldErrors.phone}
                                    label={t("careers.detail.form.phoneNumber")}
                                    value={form.phone}
                                    onChange={(v) => updateForm("phone", v)}
                                />
                                <Input
                                    field="country"
                                    error={fieldErrors.country}
                                    label={t("careers.detail.form.currentCountry")}
                                    value={form.country}
                                    onChange={(v) => updateForm("country", v)}
                                />
                                <Input
                                    field="city"
                                    error={fieldErrors.city}
                                    label={t("careers.detail.form.currentCity")}
                                    value={form.city}
                                    onChange={(v) => updateForm("city", v)}
                                />
                            </FormBlock>

                            <FormBlock title={t("careers.detail.form.education")}>
                                <Input
                                    field="universities"
                                    error={fieldErrors.universities}
                                    label={t("careers.detail.form.universities")}
                                    value={form.universities}
                                    onChange={(v) => updateForm("universities", v)}
                                />

                                <Input
                                    field="degrees"
                                    error={fieldErrors.degrees}
                                    label={t("careers.detail.form.degrees")}
                                    value={form.degrees}
                                    onChange={(v) => updateForm("degrees", v)}
                                />

                                <Input
                                    field="graduationYear"
                                    error={fieldErrors.graduationYear}
                                    label={t("careers.detail.form.graduationYear")}
                                    value={form.graduationYear}
                                    onChange={(v) => updateForm("graduationYear", v)}
                                />
                            </FormBlock>

                            <FormBlock title={t("careers.detail.form.teachingBackground")}>
                                <Select
                                    field="teachingExperience"
                                    error={fieldErrors.teachingExperience}
                                    label={t("careers.detail.form.teachingExperience")}
                                    value={form.teachingExperience}
                                    onChange={(v) => updateForm("teachingExperience", v)}
                                    options={t("careers.detail.form.options.teachingExperience", { returnObjects: true }) as string[]}
                                    placeholder={t("careers.detail.form.select")}
                                />

                                <CheckboxGroup
                                    field="studentAgeGroups"
                                    error={fieldErrors.studentAgeGroups}
                                    label={t("careers.detail.form.studentAgeGroups")}
                                    options={t("careers.detail.form.options.studentAgeGroups", { returnObjects: true }) as string[]}
                                    selected={studentAgeGroups}
                                    onToggle={(v) => toggleValue(v, studentAgeGroups, setStudentAgeGroups)}
                                />

                                <CheckboxGroup
                                    field="subjectsTaught"
                                    error={fieldErrors.subjectsTaught}
                                    label={t("careers.detail.form.subjectsTaught")}
                                    options={t("careers.detail.form.options.subjectsTaught", { returnObjects: true }) as string[]}
                                    selected={subjectsTaught}
                                    onToggle={(v) => toggleValue(v, subjectsTaught, setSubjectsTaught)}
                                />
                            </FormBlock>

                            <FormBlock title={t("careers.detail.form.availabilityLanguages")}>
                                <div data-field="workingArrangement">
                                    <p className={`mb-2 text-sm font-bold ${fieldErrors.workingArrangement ? "text-red-500" : "text-primary/60"}`}>
                                        Working Arrangement
                                    </p>

                                    <div className={`grid gap-3 rounded-2xl ${fieldErrors.workingArrangement ? "ring-2 ring-red-100" : ""}`}>
                                        <Checkbox label={t("careers.detail.form.online")} checked={availableOnline} onChange={setAvailableOnline} />
                                        <Checkbox label={t("careers.detail.form.offlineJapan")} checked={offlineJapan} onChange={setOfflineJapan} />
                                        <Checkbox label={t("careers.detail.form.offlineSingapore")} checked={offlineSingapore} onChange={setOfflineSingapore} />
                                    </div>
                                </div>
                                <Select
                                    field="englishProficiency"
                                    error={fieldErrors.englishProficiency}
                                    label={t("careers.detail.form.englishProficiency")}
                                    value={form.englishProficiency}
                                    onChange={(v) => updateForm("englishProficiency", v)}
                                    options={
                                        t(
                                            "careers.detail.form.options.languageProficiencyBasic",
                                            { returnObjects: true }
                                        ) as string[]
                                    }
                                    placeholder={t("careers.detail.form.select")}
                                />
                                <Select
                                    field="chineseProficiency"
                                    error={fieldErrors.chineseProficiency}
                                    label={t("careers.detail.form.chineseProficiency")}
                                    value={form.chineseProficiency}
                                    onChange={(v) => updateForm("chineseProficiency", v)}
                                    options={
                                        t(
                                            "careers.detail.form.options.languageProficiencyWithNone",
                                            { returnObjects: true }
                                        ) as string[]
                                    }
                                    placeholder={t("careers.detail.form.select")}
                                />
                                <Select
                                    field="japaneseProficiency"
                                    error={fieldErrors.japaneseProficiency}
                                    label={t("careers.detail.form.japaneseProficiency")}
                                    value={form.japaneseProficiency}
                                    onChange={(v) => updateForm("japaneseProficiency", v)}
                                    options={
                                        t(
                                            "careers.detail.form.options.languageProficiencyWithNone",
                                            { returnObjects: true }
                                        ) as string[]
                                    }
                                    placeholder={t("careers.detail.form.select")}
                                />
                                <Select
                                    field="hoursPerWeek"
                                    error={fieldErrors.hoursPerWeek}
                                    label={t("careers.detail.form.hoursPerWeek")}
                                    value={form.hoursPerWeek}
                                    onChange={(v) => updateForm("hoursPerWeek", v)}
                                    options={
                                        t(
                                            "careers.detail.form.options.hoursPerWeek",
                                            { returnObjects: true }
                                        ) as string[]
                                    }
                                    placeholder={t("careers.detail.form.select")}
                                />
                            </FormBlock>

                            <FormBlock title={t("careers.detail.form.applicationQuestions")}>
                                <Textarea
                                    field="whyJoin"
                                    error={fieldErrors.whyJoin}
                                    label={t("careers.detail.form.whyJoin")}
                                    value={form.whyJoin}
                                    onChange={(v) => updateForm("whyJoin", v)}
                                />

                                <Select
                                    field="hearAboutUs"
                                    error={fieldErrors.hearAboutUs}
                                    label={t("careers.detail.form.hearAboutUs")}
                                    value={form.hearAboutUs}
                                    onChange={(v) => {
                                        updateForm("hearAboutUs", v);

                                        if (!["Others", "Referral", "其他", "推荐", "紹介", "その他"].includes(v)) {
                                            updateForm("hearAboutUsDetail", "");
                                        }
                                    }}
                                    options={t("careers.detail.form.options.hearAboutUs", { returnObjects: true }) as string[]}
                                    placeholder={t("careers.detail.form.select")}
                                />
                                {showHearAboutUsDetail && (
                                    <Input
                                        field="hearAboutUsDetail"
                                        error={fieldErrors.hearAboutUsDetail}
                                        label={t("careers.detail.form.hearAboutUsDetail")}
                                        value={form.hearAboutUsDetail}
                                        onChange={(v) => updateForm("hearAboutUsDetail", v)}
                                    />
                                )}
                            </FormBlock>

                            <FormBlock title={t("careers.detail.form.documents")}>
                                <FileInput
                                    field="resumeFile"
                                    error={fieldErrors.resumeFile}
                                    label={t("careers.detail.form.resumePdf")}
                                    note={t("careers.detail.form.fileNote")}
                                    file={resumeFile}
                                    onChange={setResumeFile}
                                />

                                <FileInput
                                    label={t("careers.detail.form.coverLetterPdf")}
                                    note={t("careers.detail.form.fileNote")}
                                    file={coverFile}
                                    onChange={setCoverFile}
                                />
                            </FormBlock>

                            <Button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="mt-8 h-14 w-full rounded-2xl bg-[#082A55] text-base font-black shadow-elegant"
                            >
                                {submitting
                                    ? t("careers.detail.form.submitting")
                                    : t("careers.detail.form.submitApplication")}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </motion.div>
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
};

const InfoSection = ({ title, items }: { title: string; items: string[] }) => (
    <div className="mt-8">
        <h3 className="text-xl font-black text-[#F6C65B]">{title}</h3>
        <div className="mt-4 space-y-3">
            {items.map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6 text-white/75">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#F6C65B]" />
                    <span>{item}</span>
                </div>
            ))}
        </div>
    </div>
);

const FormBlock = ({ title, children }: any) => (
    <div className="mt-8">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-primary">
            <Briefcase className="h-5 w-5 text-[#8d73ff]" />
            {title}
        </h3>
        <div className="grid gap-4">{children}</div>
    </div>
);

const Input = ({
    label,
    value,
    onChange,
    type = "text",
    error = false,
    field,
}: any) => (
    <label className="block" data-field={field}>
        <span className={`text-sm font-bold ${error ? "text-red-500" : "text-primary/60"}`}>
            {label}
        </span>

        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`mt-2 h-12 w-full rounded-2xl border bg-[#fbfaff] px-4 outline-none ${error
                ? "border-red-400 ring-2 ring-red-100"
                : "border-primary/10 focus:border-[#8d73ff]"
                }`}
        />
    </label>
);

const Textarea = ({ label, value, onChange, error = false, field }: any) => (
    <label className="block" data-field={field}>
        <span className={`text-sm font-bold ${error ? "text-red-500" : "text-primary/60"}`}>
            {label}
        </span>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`mt-2 min-h-[120px] w-full rounded-2xl border bg-[#fbfaff] px-4 py-3 outline-none ${error
                ? "border-red-400 ring-2 ring-red-100"
                : "border-primary/10 focus:border-[#8d73ff]"
                }`}
        />
    </label>
);

const Select = ({
    label,
    value,
    onChange,
    options,
    placeholder = "Select",
    error = false,
    field,
}: any) => (
    <label className="block" data-field={field}>
        <span className={`text-sm font-bold ${error ? "text-red-500" : "text-primary/60"}`}>
            {label}
        </span>

        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`mt-2 h-12 w-full rounded-2xl border bg-[#fbfaff] px-4 outline-none ${error
                ? "border-red-400 ring-2 ring-red-100"
                : "border-primary/10 focus:border-[#8d73ff]"
                }`}
        >
            <option value="">{placeholder}</option>
            {options.map((item: string) => (
                <option key={item} value={item}>
                    {item}
                </option>
            ))}
        </select>
    </label>
);

const Checkbox = ({ label, checked, onChange }: any) => (
    <label className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-[#fbfaff] px-4 py-3 text-sm font-semibold text-primary/70">
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
        />
        {label}
    </label>
);

const CheckboxGroup = ({ label, options, selected, onToggle, error = false, field }: any) => (
    <div data-field={field}>
        <p className={`text-sm font-bold ${error ? "text-red-500" : "text-primary/60"}`}>
            {label}
        </p>

        <div className={`mt-2 flex flex-wrap gap-2 rounded-2xl ${error ? "ring-2 ring-red-100" : ""}`}>
            {options.map((item: string) => (
                <button
                    key={item}
                    type="button"
                    onClick={() => onToggle(item)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold ${selected.includes(item)
                        ? "border-[#082A55] bg-[#082A55] text-white"
                        : error
                            ? "border-red-300 bg-red-50 text-red-500"
                            : "border-[#E8D8B5] bg-white text-primary/65"
                        }`}
                >
                    {item}
                </button>
            ))}
        </div>
    </div>
);

const FileInput = ({ label, file, onChange, note, error = false, field }: any) => (
    <label
        data-field={field}
        className={`block rounded-2xl border border-dashed p-4 ${error
            ? "border-red-400 bg-red-50 ring-2 ring-red-100"
            : "border-[#E8D8B5] bg-[#fffdf8]"
            }`}
    >
        <span className={`flex items-center gap-2 text-sm font-bold ${error ? "text-red-500" : "text-primary/60"}`}>
            <Upload className="h-4 w-4" />
            {label}
        </span>

        <p className="mt-2 text-xs text-primary/45">{note}</p>

        <input
            type="file"
            accept="application/pdf"
            onChange={(e) => onChange(e.target.files?.[0] || null)}
            className="mt-3 block w-full text-sm"
        />

        {file && <p className="mt-2 text-xs font-bold text-[#082A55]">{file.name}</p>}
    </label>
);

export default CareerDetail;
