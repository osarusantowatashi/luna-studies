import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
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


    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";


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
    console.log("slug", slug);
    console.log("jobs", jobs);
    const job = slug ? jobs[slug] : null;

    const currentLang = window.location.pathname.startsWith("/zh")
        ? "zh"
        : window.location.pathname.startsWith("/jp")
            ? "jp"
            : "en";

    const [submitting, setSubmitting] = useState(false);

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
        if (!slug) throw new Error("Missing job slug.");

        if (file.type !== "application/pdf") {
            throw new Error("Only PDF files are accepted.");
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

    const handleSubmit = async () => {
        if (!job || !slug) return;

        if (!form.fullName.trim() || !form.email.trim()) {
            alert("Please enter your full name and email address.");
            return;
        }

        if (!resumeFile) {
            alert("Please upload your resume in PDF format.");
            return;
        }

        setSubmitting(true);

        try {
            const resumePath = await uploadFile(resumeFile, "resume");
            const coverPath = coverFile ? await uploadFile(coverFile, "cover") : null;

            const { data: application, error } = await supabase
                .from("career_applications")
                .insert({
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
                })
                .select("id")
                .single();

            if (error) throw error;

            const emailRes = await fetch(`${API_URL}/api/send-career-application-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    applicationId: application.id,
                }),
            });

            const emailData = await emailRes.json();

            if (!emailRes.ok || !emailData.success) {
                throw new Error(emailData.error || "Application saved, but email notification failed.");
            }

            alert("Application submitted successfully. Thank you!");
            window.location.href = `/${currentLang}/careers`;
        } catch (error: any) {
            alert(error.message || "Something went wrong. Please try again.");
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

    return (
        <>
            <Helmet>
                <title>{job.title} | Luna Careers</title>
            </Helmet>

            <div className="min-h-screen bg-[#fbfaff]">
                <NavBar />

                <main className="px-4 pt-28 pb-24 sm:px-6 lg:px-8">
                    <section className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="h-fit rounded-[3rem] bg-[#082A55] p-8 text-white shadow-[0_35px_100px_rgba(8,42,85,0.22)] sm:p-10"
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

                            <p className="mt-8 text-lg leading-8 text-white/75">
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
                            className="rounded-[3rem] border border-[#E8D8B5] bg-white p-6 shadow-[0_25px_80px_rgba(66,56,120,0.12)] sm:p-8"
                        >
                            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                                <Sparkles className="h-4 w-4" />
                                {t("careers.detail.applicationForm")}
                            </p>

                            <h2 className="mt-3 font-poppins text-3xl font-black text-primary">
                                {t("careers.detail.applyFor", { title: job.title })}
                            </h2>

                            <FormBlock title={t("careers.detail.form.personalInformation")}>
                                <Input label={t("careers.detail.form.fullName")} value={form.fullName} onChange={(v) => updateForm("fullName", v)} />
                                <Input label={t("careers.detail.form.emailAddress")} value={form.email} onChange={(v) => updateForm("email", v)} />
                                <Input label={t("careers.detail.form.phoneNumber")} value={form.phone} onChange={(v) => updateForm("phone", v)} />
                                <Input label={t("careers.detail.form.currentCountry")} value={form.country} onChange={(v) => updateForm("country", v)} />
                                <Input label={t("careers.detail.form.currentCity")} value={form.city} onChange={(v) => updateForm("city", v)} />
                            </FormBlock>

                            <FormBlock title={t("careers.detail.form.education")}>
                                <Input label={t("careers.detail.form.universities")} value={form.universities} onChange={(v) => updateForm("universities", v)} />
                                <Input label={t("careers.detail.form.degrees")} value={form.degrees} onChange={(v) => updateForm("degrees", v)} />
                                <Input label={t("careers.detail.form.graduationYear")} value={form.graduationYear} onChange={(v) => updateForm("graduationYear", v)} />
                            </FormBlock>

                            <FormBlock title={t("careers.detail.form.teachingBackground")}>
                                <Select
                                    label={t("careers.detail.form.teachingExperience")}
                                    value={form.teachingExperience}
                                    onChange={(v) => updateForm("teachingExperience", v)}
                                    options={t("careers.detail.form.options.teachingExperience", { returnObjects: true }) as string[]}
                                    placeholder={t("careers.detail.form.select")}
                                />

                                <CheckboxGroup
                                    label={t("careers.detail.form.studentAgeGroups")}
                                    options={t("careers.detail.form.options.studentAgeGroups", { returnObjects: true }) as string[]}
                                    selected={studentAgeGroups}
                                    onToggle={(v) => toggleValue(v, studentAgeGroups, setStudentAgeGroups)}
                                />

                                <CheckboxGroup
                                    label={t("careers.detail.form.subjectsTaught")}
                                    options={t("careers.detail.form.options.subjectsTaught", { returnObjects: true }) as string[]}
                                    selected={subjectsTaught}
                                    onToggle={(v) => toggleValue(v, subjectsTaught, setSubjectsTaught)}
                                />
                            </FormBlock>

                            <FormBlock title={t("careers.detail.form.availabilityLanguages")}>
                                <Checkbox label={t("careers.detail.form.online")} checked={availableOnline} onChange={setAvailableOnline} />
                                <Checkbox label={t("careers.detail.form.offlineJapan")} checked={offlineJapan} onChange={setOfflineJapan} />
                                <Checkbox label={t("careers.detail.form.offlineSingapore")} checked={offlineSingapore} onChange={setOfflineSingapore} />

                                <Select
                                    label={t("careers.detail.form.englishProficiency")}
                                    value={form.englishProficiency}
                                    onChange={(v) => updateForm("englishProficiency", v)}
                                    options={t("careers.detail.form.options.languageProficiencyBasic", { returnObjects: true }) as string[]}
                                    placeholder={t("careers.detail.form.select")}
                                />

                                <Select
                                    label={t("careers.detail.form.chineseProficiency")}
                                    value={form.chineseProficiency}
                                    onChange={(v) => updateForm("chineseProficiency", v)}
                                    options={t("careers.detail.form.options.languageProficiencyWithNone", { returnObjects: true }) as string[]}
                                    placeholder={t("careers.detail.form.select")}
                                />

                                <Select
                                    label={t("careers.detail.form.japaneseProficiency")}
                                    value={form.japaneseProficiency}
                                    onChange={(v) => updateForm("japaneseProficiency", v)}
                                    options={t("careers.detail.form.options.languageProficiencyWithNone", { returnObjects: true }) as string[]}
                                    placeholder={t("careers.detail.form.select")}
                                />

                                <Select
                                    label={t("careers.detail.form.hoursPerWeek")}
                                    value={form.hoursPerWeek}
                                    onChange={(v) => updateForm("hoursPerWeek", v)}
                                    options={t("careers.detail.form.options.hoursPerWeek", { returnObjects: true }) as string[]}
                                    placeholder={t("careers.detail.form.select")}
                                />
                            </FormBlock>

                            <FormBlock title={t("careers.detail.form.applicationQuestions")}>
                                <Textarea label={t("careers.detail.form.whyJoin")} value={form.whyJoin} onChange={(v) => updateForm("whyJoin", v)} />

                                <Select
                                    label={t("careers.detail.form.hearAboutUs")}
                                    value={form.hearAboutUs}
                                    onChange={(v) => updateForm("hearAboutUs", v)}
                                    options={t("careers.detail.form.options.hearAboutUs", { returnObjects: true }) as string[]}
                                    placeholder={t("careers.detail.form.select")}
                                />

                                <Input label={t("careers.detail.form.hearAboutUsDetail")} value={form.hearAboutUsDetail} onChange={(v) => updateForm("hearAboutUsDetail", v)} />
                            </FormBlock>

                            <FormBlock title={t("careers.detail.form.documents")}>
                                <FileInput
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

const Input = ({ label, value, onChange }: any) => (
    <label className="block">
        <span className="text-sm font-bold text-primary/60">{label}</span>
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-2 h-12 w-full rounded-2xl border border-primary/10 bg-[#fbfaff] px-4 outline-none focus:border-[#8d73ff]"
        />
    </label>
);

const Textarea = ({ label, value, onChange }: any) => (
    <label className="block">
        <span className="text-sm font-bold text-primary/60">{label}</span>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-2 min-h-[120px] w-full rounded-2xl border border-primary/10 bg-[#fbfaff] px-4 py-3 outline-none focus:border-[#8d73ff]"
        />
    </label>
);

const Select = ({
    label,
    value,
    onChange,
    options,
    placeholder = "Select",
}: any) => (
    <label className="block">
        <span className="text-sm font-bold text-primary/60">{label}</span>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-2 h-12 w-full rounded-2xl border border-primary/10 bg-[#fbfaff] px-4 outline-none focus:border-[#8d73ff]"
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

const CheckboxGroup = ({ label, options, selected, onToggle }: any) => (
    <div>
        <p className="text-sm font-bold text-primary/60">{label}</p>
        <div className="mt-2 flex flex-wrap gap-2">
            {options.map((item: string) => (
                <button
                    key={item}
                    type="button"
                    onClick={() => onToggle(item)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold ${selected.includes(item)
                        ? "border-[#082A55] bg-[#082A55] text-white"
                        : "border-[#E8D8B5] bg-white text-primary/65"
                        }`}
                >
                    {item}
                </button>
            ))}
        </div>
    </div>
);

const FileInput = ({ label, file, onChange, note }: any) => (
    <label className="block rounded-2xl border border-dashed border-[#E8D8B5] bg-[#fffdf8] p-4">
        <span className="flex items-center gap-2 text-sm font-bold text-primary/60">
            <Upload className="h-4 w-4" />
            {label}
        </span>
        <p className="mt-2 text-xs text-primary/45">
            {note}
        </p>
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