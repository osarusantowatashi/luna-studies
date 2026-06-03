import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    CheckCircle2,
    Clock,
    Sparkles,
    X,
    NotebookText,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

type LessonStatus =
    | "pending"
    | "completed"
    | "student_absent"
    | "reschedule_requested";

type Lesson = {
    id: string;
    tutor_id?: string | null;
    student_id: string;
    lesson_date: string;
    lesson_time?: string | null;
    hours: number;
    rescheduled_date?: string | null;
    reschedule_reason?: string | null;
    lesson_contents?: string | null;
    additional_remarks?: string | null;
    status: LessonStatus;
    checked_off_at?: string | null;
};

export default function StudentLessons() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [tutors, setTutors] = useState<any[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showAllLessons, setShowAllLessons] = useState(false);

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        const { data: userData } = await supabase.auth.getUser();
        const student = userData.user;
        if (!student) return;

        const { data, error } = await supabase
            .from("tutor_lessons")
            .select("*")
            .eq("student_id", student.id)
            .order("lesson_date", { ascending: true });

        if (error) {
            alert(error.message);
            return;
        }

        const lessonData = data || [];
        setLessons(lessonData);

        const tutorIds = [
            ...new Set(lessonData.map((lesson) => lesson.tutor_id).filter(Boolean)),
        ];

        if (tutorIds.length > 0) {
            const { data: tutorData } = await supabase
                .from("profiles")
                .select("id, name")
                .in("id", tutorIds);

            setTutors(tutorData || []);
        }
    };

    const getTutorName = (tutorId?: string | null) => {
        if (!tutorId) return "Tutor";
        return tutors.find((tutor) => tutor.id === tutorId)?.name || "Tutor";
    };


    const formatLessonTime = (time?: string | null) => {
        if (!time) return "No time";
        return time.slice(0, 5);
    };


    const getDisplayDate = (lesson: Lesson) => {
        return lesson.status === "reschedule_requested" && lesson.rescheduled_date
            ? lesson.rescheduled_date
            : lesson.lesson_date;
    };

    const toDateKey = (date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");

        return `${yyyy}-${mm}-${dd}`;
    };

    const todayDate = new Date();
    const todayKey = toDateKey(todayDate);

    const next7Date = new Date(todayDate);
    next7Date.setDate(todayDate.getDate() + 7);
    const next7Key = toDateKey(next7Date);

    const upcomingLessons = lessons.filter((lesson) => {
        if (
            lesson.status !== "pending" &&
            lesson.status !== "reschedule_requested"
        ) {
            return false;
        }

        const dateKey = getDisplayDate(lesson);

        return dateKey >= todayKey && dateKey <= next7Key;
    });


    const futureLessons = lessons.filter((lesson) => {
        if (
            lesson.status !== "pending" &&
            lesson.status !== "reschedule_requested"
        ) {
            return false;
        }

        const dateKey = getDisplayDate(lesson);

        return dateKey > next7Key;
    });

    const completedLessons = lessons.filter(
        (lesson) => lesson.status === "completed" || lesson.status === "student_absent"
    );

    const totalHours = lessons.reduce(
        (sum, lesson) => sum + Number(lesson.hours || 0),
        0
    );

    const monthStart = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
    );

    const monthEnd = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
    );

    const calendarDays = Array.from({ length: monthEnd.getDate() }, (_, i) => {
        const day = i + 1;
        const yyyy = currentMonth.getFullYear();
        const mm = String(currentMonth.getMonth() + 1).padStart(2, "0");
        const dd = String(day).padStart(2, "0");

        return `${yyyy}-${mm}-${dd}`;
    });

    const selectedDateLessons = selectedDate
        ? lessons.filter((lesson) => getDisplayDate(lesson) === selectedDate)
        : [];

    const sortedUpcoming = useMemo(() => {
        return [...upcomingLessons].sort((a, b) =>
            getDisplayDate(a).localeCompare(
                getDisplayDate(b)
            )
        );
    }, [upcomingLessons]);


    const sortedFuture = useMemo(() => {
        return [...futureLessons].sort((a, b) =>
            getDisplayDate(a).localeCompare(
                getDisplayDate(b)
            )
        );
    }, [futureLessons]);

    return (
        <div className="min-h-screen overflow-hidden bg-[#fbfaff] px-4 py-8 sm:px-6 sm:py-14">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_85%_75%,#fff1bd_0%,transparent_30%)]" />

            <div className="relative z-10 mx-auto max-w-[1350px] space-y-8">
                <motion.section
                    initial={{ opacity: 0, y: 35 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55 }}
                    className="relative overflow-hidden rounded-[3rem] bg-white/95 p-7 shadow-[0_28px_90px_rgba(66,56,120,0.13)] backdrop-blur-xl sm:p-10"
                >
                    <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#f0eaff]" />
                    <div className="absolute bottom-[-80px] left-[-80px] h-56 w-56 rounded-full bg-[#fff1bd]/70" />

                    <div className="relative z-10">
                        <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                            <Sparkles className="h-5 w-5" />
                            My Lessons
                        </p>

                        <h1 className="mt-5 font-poppins text-[3.2rem] font-black leading-[0.95] tracking-[-0.045em] text-primary sm:text-[4.8rem] lg:text-[5.6rem]">
                            Your lessons.
                            <br />
                            Clearly planned.
                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-8 text-primary/60 sm:text-lg">
                            Check your upcoming lessons, completed sessions, and recent learning notes in one place.
                        </p>
                    </div>
                </motion.section>

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        icon={<Calendar size={22} />}
                        title="Next 7 Days"
                        value={upcomingLessons.length}
                    />
                    <StatCard icon={<CheckCircle2 size={22} />} title="Completed" value={completedLessons.length} />
                    <StatCard icon={<Clock size={22} />} title="Study Hours" value={totalHours} />
                </div>

                <div className="rounded-[2.5rem] bg-white/95 p-5 shadow-[0_18px_55px_rgba(66,56,120,0.08)] backdrop-blur-xl sm:p-7">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                                Upcoming This Week
                            </p>

                            <h2 className="mt-2 font-poppins text-3xl font-black text-primary">
                                Next 7 Days
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowAllLessons(true)}
                            className="rounded-2xl bg-[#f6f1ff] px-5 py-3 text-sm font-black text-[#8d73ff] transition hover:bg-[#ebe1ff]"
                        >
                            View All Lessons
                        </button>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        {sortedUpcoming.slice(0, 6).map((lesson) => (
                            <div
                                key={lesson.id}
                                className="rounded-[2rem] border border-primary/10 bg-[#fbfaff] p-5"
                            >
                                <StatusBadge status={lesson.status} />

                                <h3 className="mt-4 font-poppins text-2xl font-black text-primary">
                                    {getTutorName(lesson.tutor_id)}
                                </h3>

                                <p className="mt-2 text-sm font-bold text-primary/55">
                                    {getDisplayDate(lesson)} · {formatLessonTime(lesson.lesson_time)}
                                </p>

                                <p className="mt-1 text-sm font-bold text-primary/45">
                                    {lesson.hours} hour(s)
                                </p>
                            </div>
                        ))}

                        {sortedUpcoming.length === 0 && (
                            <div className="rounded-[2rem] bg-[#fbfaff] p-6 text-center">
                                <p className="font-black text-primary">No lessons scheduled in the next 7 days.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-[2.5rem] bg-white/95 p-5 shadow-[0_18px_55px_rgba(66,56,120,0.08)] backdrop-blur-xl sm:p-7">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                                Lesson Calendar
                            </p>

                            <h2 className="mt-2 font-poppins text-3xl font-black text-primary">
                                {currentMonth.toLocaleString("default", {
                                    month: "long",
                                    year: "numeric",
                                })}
                            </h2>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() =>
                                    setCurrentMonth(
                                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                                    )
                                }
                                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/10 bg-[#fbfaff] text-primary"
                            >
                                <ChevronLeft />
                            </button>

                            <button
                                onClick={() =>
                                    setCurrentMonth(
                                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                                    )
                                }
                                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/10 bg-[#fbfaff] text-primary"
                            >
                                <ChevronRight />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div
                                key={day}
                                className="py-2 text-xs font-black uppercase tracking-widest text-primary/40"
                            >
                                {day}
                            </div>
                        ))}

                        {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                            <div key={`empty-${index}`} />
                        ))}

                        {calendarDays.map((date) => {
                            const dayLessons = lessons.filter(
                                (lesson) => getDisplayDate(lesson) === date
                            );

                            return (
                                <button
                                    key={date}
                                    type="button"
                                    onClick={() => setSelectedDate(date)}
                                    className="min-h-[130px] rounded-[1.5rem] border border-primary/10 bg-[#fbfaff] p-3 text-left transition hover:-translate-y-1 hover:bg-[#f6f1ff]"
                                >
                                    <p className="mb-2 text-sm font-black text-primary">
                                        {Number(date.split("-")[2])}
                                    </p>

                                    <div className="space-y-1">
                                        {dayLessons.slice(0, 3).map((lesson) => (
                                            <div
                                                key={lesson.id}
                                                className={`rounded-xl border px-2 py-1 shadow-sm ${getStatusPreviewClass(
                                                    lesson.status
                                                )}`}
                                            >
                                                <p className="truncate text-xs font-black">
                                                    {getTutorName(lesson.tutor_id)}
                                                </p>

                                                <p className="truncate text-[11px] font-bold opacity-70">
                                                    {formatLessonTime(lesson.lesson_time)} · {getStatusLabel(lesson.status)}
                                                </p>
                                            </div>
                                        ))}

                                        {dayLessons.length > 3 && (
                                            <p className="text-[11px] font-black text-[#8d73ff]">
                                                +{dayLessons.length - 3} more
                                            </p>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showAllLessons && (
                    <Modal onClose={() => setShowAllLessons(false)}>
                        <ModalHeader
                            label="All Lessons"
                            title="Upcoming Lessons"
                            description={`${sortedFuture.length + sortedUpcoming.length} upcoming lesson(s)`}
                        />

                        <div className="mt-6 space-y-4">
                            {[...sortedUpcoming, ...sortedFuture].length === 0 ? (
                                <div className="rounded-2xl bg-[#fbfaff] p-6 text-center">
                                    <p className="font-black text-primary">
                                        No upcoming lessons scheduled.
                                    </p>
                                </div>
                            ) : (
                                [...sortedUpcoming, ...sortedFuture].map((lesson) => (
                                    <div
                                        key={lesson.id}
                                        className="rounded-[1.5rem] border border-primary/10 bg-[#fbfaff] p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-poppins text-xl font-black text-primary">
                                                    {getTutorName(lesson.tutor_id)}
                                                </p>

                                                <p className="mt-1 text-sm font-bold text-primary/50">
                                                    {getDisplayDate(lesson)} · {formatLessonTime(
                                                        lesson.lesson_time
                                                    )}
                                                </p>
                                            </div>

                                            <StatusBadge status={lesson.status} />
                                        </div>

                                        <p className="mt-3 text-sm font-bold text-primary/45">
                                            {lesson.hours} hour(s)
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </Modal>
                )}
                {selectedDate && (
                    <Modal onClose={() => setSelectedDate(null)}>
                        <ModalHeader
                            label="Daily Schedule"
                            title={selectedDate}
                            description={`${selectedDateLessons.length} lesson(s) scheduled`}
                        />

                        <div className="mt-7 space-y-4">
                            {selectedDateLessons.length === 0 ? (
                                <div className="rounded-2xl bg-[#fbfaff] p-6 text-center">
                                    <p className="font-black text-primary">No lessons on this date.</p>
                                </div>
                            ) : (
                                selectedDateLessons.map((lesson) => (
                                    <div
                                        key={lesson.id}
                                        className="rounded-[1.5rem] border border-primary/10 bg-[#fbfaff] p-4"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className="font-poppins text-xl font-black text-primary">
                                                    {getTutorName(lesson.tutor_id)}
                                                </p>

                                                <p className="mt-1 text-sm font-bold text-primary/50">
                                                    {formatLessonTime(lesson.lesson_time)} · {lesson.hours} hour(s)
                                                </p>
                                            </div>

                                            <StatusBadge status={lesson.status} />
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {lesson.lesson_contents && (
                                                <InfoChip icon={<NotebookText size={15} />}>
                                                    {lesson.lesson_contents}
                                                </InfoChip>
                                            )}

                                            {lesson.additional_remarks && (
                                                <InfoChip icon={<AlertCircle size={15} />}>
                                                    {lesson.additional_remarks}
                                                </InfoChip>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ icon, title, value }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            whileHover={{ y: -8 }}
            className="rounded-[2.2rem] bg-white/95 p-6 shadow-[0_18px_55px_rgba(66,56,120,0.08)] backdrop-blur-xl"
        >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff6da] text-primary">
                {icon}
            </div>

            <p className="mb-1 text-sm font-bold text-primary/50">{title}</p>

            <h3 className="font-poppins text-4xl font-black text-primary">
                {value}
            </h3>
        </motion.div>
    );
}

function getStatusLabel(status: LessonStatus) {
    const labels: Record<LessonStatus, string> = {
        pending: "Upcoming",
        completed: "Completed",
        student_absent: "Absent",
        reschedule_requested: "Rescheduled",
    };

    return labels[status];
}

function getStatusPreviewClass(status: LessonStatus) {
    const styles: Record<LessonStatus, string> = {
        pending: "bg-[#f6f1ff] text-[#8d73ff] border-[#e7dcff]",
        completed: "bg-green-50 text-green-700 border-green-200",
        student_absent: "bg-orange-50 text-orange-700 border-orange-200",
        reschedule_requested: "bg-blue-50 text-blue-700 border-blue-200",
    };

    return styles[status];
}

function StatusBadge({ status }: { status: LessonStatus }) {
    const styles: Record<LessonStatus, string> = {
        pending: "bg-[#f6f1ff] text-[#8d73ff]",
        completed: "bg-green-100 text-green-700",
        student_absent: "bg-orange-100 text-orange-700",
        reschedule_requested: "bg-blue-100 text-blue-700",
    };

    return (
        <span className={`rounded-full px-4 py-2 text-sm font-black ${styles[status]}`}>
            {getStatusLabel(status)}
        </span>
    );
}

function InfoChip({ icon, children }: any) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary/70">
            {icon}
            {children}
        </span>
    );
}

function Modal({ children, onClose }: any) {
    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-3 backdrop-blur-md sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.96 }}
                transition={{ duration: 0.35 }}
                className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[2.5rem] bg-white p-6 shadow-[0_35px_110px_rgba(0,0,0,0.28)] sm:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-5 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[#f6f1ff] text-primary transition hover:scale-110 hover:bg-[#ebe1ff]"
                >
                    <X className="h-5 w-5" />
                </button>

                {children}
            </motion.div>
        </motion.div>
    );
}

function ModalHeader({ label, title, description }: any) {
    return (
        <div className="pr-12">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                {label}
            </p>

            <h2 className="mt-3 font-poppins text-3xl font-black leading-tight text-primary sm:text-4xl">
                {title}
            </h2>

            <p className="mt-3 text-sm leading-7 text-primary/55">{description}</p>
        </div>
    );
}