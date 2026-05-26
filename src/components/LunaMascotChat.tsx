import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001";



const LunaMascotChat = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const hiddenRoutes = [
    "/admin",
    "/generate",
    "/practice",
    "/mistakes",
    "/studentoverview",
    "/dashboard",
    "/tutor/lessons",
  ];

  const shouldHide = hiddenRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  const [open, setOpen] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

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
    let timeout: ReturnType<typeof setTimeout>;

    const interval = setInterval(() => {
      setIsBlinking(true);

      timeout = setTimeout(() => {
        setIsBlinking(false);
      }, 260);
    }, 3200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);


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

  return (
    <div className="fixed bottom-5 right-4 z-[999] w-[92vw] max-w-[360px] md:bottom-8 md:right-6 md:w-[360px]">
      <AnimatePresence>
        {open && (
          <motion.div
           className="mb-4 w-full max-w-full overflow-hidden rounded-[28px] border border-[#E8D8B5] bg-white shadow-[0_25px_80px_rgba(8,42,85,0.25)]"
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

            <div className="flex h-[55vh] max-h-[390px] min-h-[320px] flex-col bg-[#FAF8F3] md:h-[390px]">
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    <div
                     className={`max-w-[82%] overflow-hidden break-words [overflow-wrap:anywhere] rounded-2xl px-4 py-2 text-sm leading-relaxed ${msg.role === "user"
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

        {!open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute bottom-[98px] right-[72px] z-30 isolate sm:bottom-[150px] sm:right-[105px]"
          >
            <div className="relative w-[185px] rounded-[26px] border border-white/60 bg-white/95 px-4 py-3 shadow-[0_20px_55px_rgba(8,42,85,0.12)] backdrop-blur-md sm:w-[280px] sm:rounded-[36px] sm:px-6 sm:py-5">

              {/* sparkle */}
              <div className="absolute left-5 top-4 text-[#F6C65B] opacity-90 text-[14px]">
                ✦
              </div>

              <div className="absolute left-10 top-2 text-[#E8D8B5] opacity-80 text-[18px]">
                ✦
              </div>

              {/* bubble tail */}
              <svg
                className="absolute -bottom-[18px] right-[58px] h-[28px] w-[46px] drop-shadow-[0_10px_14px_rgba(8,42,85,0.06)]"
                viewBox="0 0 46 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 0C14 11 22 20 36 24C25 29 10 25 0 8C-2 4 2 0 8 0Z"
                  fill="rgba(255,255,255,0.95)"
                />
              </svg>

              <div className="pl-6">
                <p className="text-[14px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#082A55] sm:text-[18px]">
                  {t("chat.bubbleText")}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          className="relative ml-auto flex h-[96px] w-[96px] items-center justify-center bg-transparent sm:h-[140px] sm:w-[140px] lg:h-[180px] lg:w-[180px]"
          whileHover={{ scale: 1.06, rotate: -2 }}
        >
          <motion.div
            className="relative z-10 h-[96px] w-[96px] max-w-none opacity-100 sm:h-[140px] sm:w-[140px] lg:h-[180px] lg:w-[180px]"
            animate={{
              y: [0, -9, 0],
              rotate: [-2.8, 2.8, -2.8],
            }}
            transition={{
              repeat: Infinity,
              duration: 4.6,
              ease: "easeInOut",
            }}
          >
            <img
              src={isBlinking ? "/mascot/chokina_blink.png" : "/mascot/chokina.png"}
              alt="Chokina AI Assistant"
              className="h-full w-full object-contain"
            />
          </motion.div>

          <motion.span
            className="absolute right-3 top-3 z-20 h-3 w-3 rounded-full bg-[#F6C65B] shadow-[0_0_18px_rgba(246,198,91,0.9)]"
            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
            transition={{
              repeat: Infinity,
              duration: 1.6,
              ease: "easeInOut",
            }}
          />

          <motion.span
            className="absolute bottom-4 left-4 z-20 text-lg"
            animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
            transition={{
              repeat: Infinity,
              duration: 2,
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