import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const getGuideKey = (userId?: string | null) => {
    if (!userId) return null;
    return `hapiko_student_guide_hidden_${userId}`;
};

const steps = [
    {
        page: "/studentoverview",
        image: "/mascot/hapiko-step-2.png",
        target: "overview-stats",
        title: "Step 1 of 5",
        heading: "Track your progress",
        text: "Check your accuracy, study streak, and total questions solved here.",
        position: { right: 70, bottom: 70 },
    },
    {
        page: "/studentoverview",
        image: "/mascot/hapiko-step-2.png",
        target: "overview-practice-feedback",
        title: "Step 2 of 5",
        heading: "Follow your learning plan",
        text: "Your daily goal and tutor feedback help guide what to practise next.",
        position: { right: 70, bottom: 70 },
    },
    {
        page: "/practice",
        image: "/mascot/hapiko-step-4.png",
        target: "practice-setup",
        title: "Step 3 of 5",
        heading: "Choose your practice",
        text: "Your assigned grade, difficulty, and question type decide your practice set.",
        position: { left: 70, bottom: 150 },
    },
    {
        page: "/practice",
        image: "/mascot/hapiko-step-4.png",
        target: "practice-actions",
        title: "Step 4 of 5",
        heading: "Start when ready",
        text: "Start Practice begins your session. Reset Progress clears previous records.",
        position: { left: 70, bottom: 150 },
    },
    {
        page: "/mistakes",
        image: "/mascot/hapiko-step-5.png",
        target: "mistakes-review",
        title: "Step 5 of 5",
        heading: "Review your mistakes",
        text: "Mistakes help you see weak areas. Answers may be shown when enabled by admin.",
        position: { left: 70, top: 230 },
    },
];

const allowedPages = ["/studentoverview", "/practice", "/mistakes"];
const hiddenRoutes = ["/word-match", "/letter-match", "/games/word-match", "/games/letter-match"];

const HapikoGuide = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [show, setShow] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isMobileGuide, setIsMobileGuide] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth < 640 : false
    );

    const step = steps[stepIndex];

    useEffect(() => {
        const checkGuide = async () => {
            const role = localStorage.getItem("role");
            const isStudentGuidePage = allowedPages.includes(location.pathname);
            const shouldHide = hiddenRoutes.some((route) =>
                location.pathname.startsWith(route)
            );
    
            if (role !== "student" || !isStudentGuidePage || shouldHide) {
                setShow(false);
                return;
            }
    
            const {
                data: { session },
            } = await supabase.auth.getSession();
    
            const userId = session?.user?.id || localStorage.getItem("userId");
            const guideKey = getGuideKey(userId);
    
            if (!guideKey) {
                setShow(false);
                return;
            }
    
            const hidden = localStorage.getItem(guideKey);
    
            if (hidden === "true") {
                setShow(false);
                return;
            }
    
            setShow(true);
        };
    
        checkGuide();
    }, [location.pathname]);

    useEffect(() => {
        const syncGuideViewport = () => {
            setIsMobileGuide(window.innerWidth < 640);
        };

        syncGuideViewport();
        window.addEventListener("resize", syncGuideViewport);

        return () => window.removeEventListener("resize", syncGuideViewport);
    }, []);

    useEffect(() => {
        const role = localStorage.getItem("role");
        const isStudentGuidePage = allowedPages.includes(location.pathname);
        const shouldHide = hiddenRoutes.some((route) =>
            location.pathname.startsWith(route)
        );

        if (!show || role !== "student" || !isStudentGuidePage || shouldHide) return;

        const currentStep = steps[stepIndex];

        if (location.pathname !== currentStep.page) {
            navigate(currentStep.page, { replace: true });
            return;
        }

        const timer = setTimeout(() => {
            const el = document.querySelector(`[data-guide="${currentStep.target}"]`);

            if (!el) return;

            el.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });

            setTimeout(() => {
                setTargetRect(el.getBoundingClientRect());
            }, 650);
        }, 300);

        return () => clearTimeout(timer);
    }, [show, stepIndex, location.pathname, navigate]);

    const next = () => {
        if (stepIndex >= steps.length - 1) {
            const userId = localStorage.getItem("userId");
            const guideKey = getGuideKey(userId);
    
            if (guideKey) {
                localStorage.setItem(guideKey, "true");
            }
    
            setShow(false);
            return;
        }
    
        setTargetRect(null);
        setStepIndex((prev) => prev + 1);
    };

    const skipForever = () => {
        const userId = localStorage.getItem("userId");
        const guideKey = getGuideKey(userId);
    
        if (guideKey) {
            localStorage.setItem(guideKey, "true");
        }
    
        setShow(false);
    };

    const role = localStorage.getItem("role");
    const isStudentGuidePage = allowedPages.includes(location.pathname);

    if (!show || role !== "student" || !isStudentGuidePage) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[998] pointer-events-none">
                <div className="absolute inset-0 bg-slate-950/35" />

                {targetRect && (
                    <motion.div
                        className="absolute rounded-[28px] border-2 border-[#F6C65B] shadow-[0_0_42px_rgba(246,198,91,0.75)]"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            top: targetRect.top - 10,
                            left: targetRect.left - 10,
                            width: targetRect.width + 20,
                            height: targetRect.height + 20,
                        }}
                    />
                )}

                <motion.div
                    className="pointer-events-auto fixed inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom))] flex max-h-[calc(100dvh-2rem)] items-end justify-center gap-3 sm:inset-x-auto sm:max-h-none sm:justify-start sm:gap-4"
                    initial={{ opacity: 0, y: 18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    style={isMobileGuide ? undefined : step.position}
                >
                    <motion.img
                        src={step.image}
                        alt="Hapiko Guide"
                        className="hidden h-[260px] w-[260px] object-contain drop-shadow-[0_26px_42px_rgba(8,42,85,0.38)] sm:block"
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                            repeat: Infinity,
                            duration: 3.6,
                            ease: "easeInOut",
                        }}
                    />

                    <div className="relative w-full max-w-[340px] rounded-[24px] border border-white/70 bg-white/95 px-4 py-4 shadow-[0_24px_60px_rgba(8,42,85,0.22)] backdrop-blur-xl sm:mb-8 sm:w-[330px] sm:rounded-[28px] sm:px-5">
                        <div className="absolute bottom-9 -left-3 hidden h-6 w-6 rotate-45 rounded-[6px] bg-white/95 sm:block" />

                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#F6C65B]">
                            {step.title}
                        </p>

                        <h3 className="mt-2 text-[19px] font-bold leading-snug text-[#082A55]">
                            {step.heading}
                        </h3>

                        <p className="mt-2 text-[13px] leading-5 text-slate-600">
                            {step.text}
                        </p>

                        <div className="mt-4 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={skipForever}
                                className="min-h-11 text-left text-xs font-semibold text-slate-500 transition hover:text-[#082A55]"
                            >
                                Skip & Don’t show again
                            </button>

                            <button
                                type="button"
                                onClick={next}
                                className="min-h-11 rounded-full bg-[#082A55] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#123A70]"
                            >
                                {stepIndex === steps.length - 1 ? "Got it" : "Next"}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default HapikoGuide;
