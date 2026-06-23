import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

let hasWarmedUpLunaChat = false;
let lunaChatWarmupPromise: Promise<void> | null = null;

const warmUpLunaChat = () => {
  if (hasWarmedUpLunaChat) return Promise.resolve();
  if (lunaChatWarmupPromise) return lunaChatWarmupPromise;

  lunaChatWarmupPromise = fetch(`${API_URL}/api/luna-chat/warmup`, {
    method: "GET",
    cache: "no-store",
    keepalive: true,
  })
    .then(() => undefined)
    .catch(() => {
      // Warmup is best-effort only. Chat messages still use the normal request flow.
    })
    .finally(() => {
      hasWarmedUpLunaChat = true;
      lunaChatWarmupPromise = null;
    });

  return lunaChatWarmupPromise;
};

const LunaMascotChat = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const hiddenRoutes = [
    "/admin",
    "/generate",
    "/practice",
    "/mistakes",
    "/studentoverview",
    "/student/lessons",
    "/dashboard",
    "/tutor/lessons",
    "/games",
    "/memory-flip",
    "/word-search",
    "/word-match",
    "/letter-match",
    "/games/word-match",
    "/games/letter-match",
    "/generate-games",
  
    "/en/careers",
    "/zh/careers",
    "/ja/careers",
  ];

  const shouldHide = hiddenRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  const [open, setOpen] = useState(false);


  const [showBubble, setShowBubble] = useState(true);
  const [peekOut, setPeekOut] = useState(false);

  const [bubbleIndex, setBubbleIndex] = useState(0);

  const bubbleMessages = t("chat.bubbleMessages", {
    returnObjects: true,
  }) as string[];

  const [messages, setMessages] = useState<
    { role: string; text: string }[]
  >(() => [
    {
      role: "assistant",
      text: t("chat.initialMessage"),
    },
  ]);



  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadContact, setLeadContact] = useState("");
  const [leadGrade, setLeadGrade] = useState("");
  const [leadGoal, setLeadGoal] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [
          {
            role: "assistant",
            text: t("chat.initialMessage"),
          },
        ];
      }

      return prev;
    });
  }, [i18n.language, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading, showLeadForm]);

  useEffect(() => {
    if (!open) return;

    warmUpLunaChat();
  }, [open]);

  useEffect(() => {
    let hideTimeout: ReturnType<typeof setTimeout> | null = null;

    if (open) {
      setShowBubble(false);
      setPeekOut(true);
      return;
    }

    const runCycle = () => {
      setPeekOut(true);
      setShowBubble(true);

      if (hideTimeout) clearTimeout(hideTimeout);

      hideTimeout = setTimeout(() => {
        setShowBubble(false);
        setPeekOut(false);
        setBubbleIndex((prev) => (prev + 1) % bubbleMessages.length);
      }, 4200);
    };

    const firstTimeout = setTimeout(runCycle, 1200);
    const interval = setInterval(runCycle, 8500);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [open]);


  const shouldShowCTA = (text: string) => {
    const lowerText = text.toLowerCase();

    return (
      lowerText.includes("assessment") ||
      lowerText.includes("consultation") ||
      lowerText.includes("enquiry") ||
      lowerText.includes("contact") ||
      lowerText.includes("trial") ||
      lowerText.includes("whatsapp")
    );
  };

  const sendQuickReply = async (text: string) => {
    if (isLoading || leadSubmitting) return;

    const updatedMessages = [...messages, { role: "user", text }];

    setMessages(updatedMessages);
    setInput("");
    setShowLeadForm(false);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/luna-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          language: i18n.language,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply || t("chat.errors.noReply"),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: t("chat.errors.general"),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || leadSubmitting) return;

    const userMessage = input.trim();
    const updatedMessages = [...messages, { role: "user", text: userMessage }];

    setMessages(updatedMessages);
    setInput("");
    setShowLeadForm(false);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/luna-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          language: i18n.language,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply || t("chat.errors.noReply"),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: t("chat.errors.general"),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitLeadForm = async () => {
    if (!leadName.trim() || !leadContact.trim()) {
      alert(t("chat.lead.alert"))
      return;
    }

    setLeadSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/send-admin-enquiry-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: "AI Chatbox Enquiry",
          name: leadName.trim(),
          email: leadContact.trim(),
          grade: leadGrade.trim(),
          message:
            leadGoal.trim() ||
            t("chat.lead.noGoal"),
          created_at: new Date().toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit enquiry.");
      }

      setShowLeadForm(false);
      setLeadName("");
      setLeadContact("");
      setLeadGrade("");
      setLeadGoal("");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: t("chat.lead.success"),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: t("chat.lead.error"),
        },
      ]);
    } finally {
      setLeadSubmitting(false);
    }
  };

  if (shouldHide) return null;

  return (<div className="fixed bottom-0 right-[-16px] z-[999] w-[92vw] max-w-[360px] md:w-[360px]">
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute bottom-[135px] right-[24px] flex w-[330px] max-h-[calc(100vh-155px)] flex-col overflow-hidden rounded-[28px] border border-[#E8D8B5] bg-white shadow-[0_25px_80px_rgba(8,42,85,0.25)] sm:bottom-[175px] sm:right-[32px] sm:w-[340px] sm:max-h-[calc(100vh-195px)]"
          initial={{ opacity: 0, y: 20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.92 }}
        >
          <div className="flex items-center justify-between bg-[#082A55] px-5 py-4 text-white">
            <div>
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4 text-[#F6C65B]" />
                {t("chat.header.title")}
              </div>

              <p className="text-xs text-white/70">
                {t("chat.header.subtitle")}
              </p>
            </div>

            <button onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col bg-[#FAF8F3]">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[82%] overflow-hidden [overflow-wrap:anywhere] rounded-2xl px-4 py-2 text-sm leading-relaxed ${msg.role === "user"
                      ? "bg-[#082A55] text-white"
                      : "bg-white text-slate-700 shadow-sm"
                      }`}
                  >
                    {msg.text}

                    {msg.role === "assistant" && shouldShowCTA(msg.text) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => setShowLeadForm(true)}
                          className="rounded-full bg-[#082A55] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#123A70]"
                        >
                          {t("chat.buttons.submitEnquiry")}
                        </button>

                        <a
                          href="https://api.whatsapp.com/send?phone=6594235165&text=Hello%20Luna%20Education%2C%20I%20would%20like%20to%20enquire%20about%20lessons."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-[#082A55] bg-white px-4 py-2 text-xs font-medium text-[#082A55] transition hover:bg-[#F8FAFF]"
                        >
                          {t("chat.buttons.whatsapp")}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-[#082A55]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-[#082A55] [animation-delay:0.15s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-[#082A55] [animation-delay:0.3s]" />
                      </div>

                      <span>{t("chat.loading")}</span>
                    </div>
                  </div>
                </div>
              )}

              {showLeadForm && (
                <div className="rounded-2xl border border-[#E8D8B5] bg-white p-4 shadow-sm">
                  <p className="mb-3 text-sm font-semibold text-[#082A55]">
                    {t("chat.lead.title")}
                  </p>

                  <div className="space-y-2">
                    <input
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder={t("chat.lead.name")}
                      className="w-full rounded-xl bg-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#F6C65B]"
                    />

                    <input
                      value={leadContact}
                      onChange={(e) => setLeadContact(e.target.value)}
                      placeholder={t("chat.lead.contact")}
                      className="w-full rounded-xl bg-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#F6C65B]"
                    />

                    <input
                      value={leadGrade}
                      onChange={(e) => setLeadGrade(e.target.value)}
                      placeholder={t("chat.lead.grade")}
                      className="w-full rounded-xl bg-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#F6C65B]"
                    />

                    <textarea
                      value={leadGoal}
                      onChange={(e) => setLeadGoal(e.target.value)}
                      placeholder={t("chat.lead.goal")}
                      className="min-h-[80px] w-full resize-none rounded-xl bg-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#F6C65B]"
                    />
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={submitLeadForm}
                      disabled={leadSubmitting}
                      className="flex-1 rounded-full bg-[#082A55] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#123A70] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {leadSubmitting ? t("chat.lead.submitting") : t("chat.lead.submit")}
                    </button>

                    <button
                      onClick={() => setShowLeadForm(false)}
                      className="rounded-full border border-[#E8D8B5] px-4 py-2 text-xs text-slate-500 transition hover:bg-[#FAF8F3]"
                    >
                      {t("chat.lead.cancel")}
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 1 && !isLoading && !showLeadForm && (
              <div className="border-t border-[#E8D8B5] bg-[#FAF8F3] px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {[
                    t("chat.quick.english"),
                    t("chat.quick.map"),
                    t("chat.quick.cat4"),
                    t("chat.quick.admissions"),
                    t("chat.quick.toefl"),
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() => sendQuickReply(item)}
                      className="rounded-full border border-[#E8D8B5] bg-white px-3 py-1.5 text-xs text-[#082A55] shadow-sm transition hover:bg-[#FFF7E6]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-[#E8D8B5] bg-white p-3">
            <input
              className="min-w-0 flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#F6C65B] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder={
                isLoading ? t("chat.input.loading") : t("chat.input.placeholder")
              }
              value={input}
              disabled={isLoading || leadSubmitting}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button
              onClick={sendMessage}
              disabled={isLoading || leadSubmitting}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#082A55] text-white transition hover:bg-[#123A70] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    <div className="relative ml-auto w-fit">
      <AnimatePresence>
        {!open && showBubble && (
          <motion.div
            key={bubbleIndex}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-[86px] right-[54px] z-30 w-fit max-w-[calc(100vw-120px)] rounded-full border border-white/75 bg-white/90 px-3 py-2 shadow-[0_12px_35px_rgba(15,23,42,0.10)] backdrop-blur-md sm:bottom-[108px] sm:right-[74px] sm:px-4 sm:py-2.5"
          >
            <div className="absolute -bottom-1 right-6 h-2.5 w-2.5 rotate-45 rounded-[2px] border-b border-r border-white/75 bg-white/90" />

            <p className="inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[12px] font-semibold leading-none text-[#082A55] sm:text-[13px]">
              <Sparkles className="h-3 w-3 shrink-0 text-[#C89235]" />
              <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                {bubbleMessages[bubbleIndex]}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        onMouseEnter={() => setPeekOut(true)}
        onMouseLeave={() => {
          if (!open && !showBubble) setPeekOut(false);
        }}
        className="relative ml-auto flex h-[118px] w-[138px] items-end justify-end overflow-visible bg-transparent sm:h-[170px] sm:w-[200px]"
        aria-label="Open Chokina AI Assistant"
      >
        <motion.div
          className="absolute bottom-[-6px] right-[-8px] z-10 h-[145px] w-[170px] sm:bottom-[-10px] sm:right-[-12px] sm:h-[215px] sm:w-[250px]"
          animate={{

            x: peekOut || open ? 0 : 14,

            y: peekOut || open ? 0 : 12,

          }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 22,
          }}
        >
          <img
            src="/mascot/chokina.png"
            alt="Chokina AI Assistant"
            className="h-full w-full object-contain object-bottom-right drop-shadow-[0_18px_30px_rgba(8,42,85,0.18)]"
          />
        </motion.div>

        <motion.span
          className="absolute right-5 top-6 z-20 h-3 w-3 rounded-full bg-[#F6C65B] shadow-[0_0_18px_rgba(246,198,91,0.9)]"
          animate={{ scale: [1, 1.35, 1], opacity: [0.65, 1, 0.65] }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
            ease: "easeInOut",
          }}
        />

        <motion.span
          className="absolute bottom-4 left-4 z-20 text-lg text-[#F6C65B]"
          animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            ease: "easeInOut",
          }}
        >
          ✦
        </motion.span>
      </motion.button>
    </div>
  </div>

  );
};

export default LunaMascotChat;
