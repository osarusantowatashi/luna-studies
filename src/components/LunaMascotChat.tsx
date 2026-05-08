import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const initialMessage = {
  role: "assistant",
  text: "What would you like help with today?",
};

const LunaMascotChat = () => {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    initialMessage,
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /* =========================
     SEND QUICK REPLY
  ========================= */

  const sendQuickReply = async (text: string) => {
    if (isLoading) return;

    const updatedMessages = [
      ...messages,
      { role: "user", text },
    ];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/luna-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            data.reply ||
            "Sorry, I could not generate a reply.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "Sorry, Luna is taking a short moon nap 🌙 Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================
     SEND MESSAGE
  ========================= */

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();

    const updatedMessages = [
      ...messages,
      { role: "user", text: userMessage },
    ];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/luna-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            data.reply ||
            "Sorry, I could not generate a reply.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "Sorry, Luna is taking a short moon nap 🌙 Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[999] hidden md:block">
      <AnimatePresence>
        {open && (
          <motion.div
            className="mb-4 w-[360px] overflow-hidden rounded-[28px] border border-[#E8D8B5] bg-white shadow-[0_25px_80px_rgba(8,42,85,0.25)]"
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between bg-[#082A55] px-5 py-4 text-white">
              <div>
                <div className="flex items-center gap-2 font-semibold">
                  <Sparkles className="h-4 w-4 text-[#F6C65B]" />
                  Luna AI Assistant
                </div>

                <p className="text-xs text-white/70">
                  Course guidance for parents & students
                </p>
              </div>

              <button onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* CHAT BODY */}
            <div className="flex h-[360px] flex-col bg-[#FAF8F3]">

              {/* SCROLL AREA */}
              <div className="flex-1 space-y-3 overflow-y-auto p-4">

                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#082A55] text-white"
                          : "bg-white text-slate-700 shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* LOADING */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                      <div className="flex items-center gap-2">

                        <div className="flex gap-1">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-[#082A55]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-[#082A55] [animation-delay:0.15s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-[#082A55] [animation-delay:0.3s]" />
                        </div>

                        <span>
                          Preparing personalised guidance
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* QUICK REPLIES */}
              {messages.length <= 1 && !isLoading && (
                <div className="border-t border-[#E8D8B5] bg-[#FAF8F3] px-4 py-3">
                  <div className="flex flex-wrap gap-2">

                    {[
                      "English improvement",
                      "MAP preparation",
                      "CAT4 preparation",
                      "School admissions",
                      "IELTS / TOEFL",
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

            {/* INPUT */}
            <div className="flex items-center gap-2 border-t border-[#E8D8B5] bg-white p-3">
              <input
                className="flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#F6C65B] disabled:cursor-not-allowed disabled:opacity-60"
                placeholder={
                  isLoading
                    ? "Luna is replying..."
                    : "Ask about MAP, TOEFL, CAT4..."
                }
                value={input}
                disabled={isLoading}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />

              <button
                onClick={sendMessage}
                disabled={isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#082A55] text-white transition hover:bg-[#123A70] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MASCOT BUTTON */}
      <motion.button
        onClick={() => setOpen(true)}
        className="relative flex h-[170px] w-[170px] items-center justify-center rounded-full bg-white shadow-[0_25px_70px_rgba(8,42,85,0.25)]"
        animate={{ y: [0, -10, 0] }}
        transition={{
          repeat: Infinity,
          duration: 3.4,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.06, rotate: -2 }}
      >
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#F6C65B]/35 via-white to-[#082A55]/20 blur-xl" />

        <svg
          viewBox="0 0 240 240"
          className="relative h-[145px] w-[145px] drop-shadow-xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M154 25C102 32 64 76 64 128C64 180 108 216 158 213C129 196 111 164 111 127C111 87 129 50 154 25Z"
            fill="#082A55"
          />

          <circle
            cx="113"
            cy="105"
            r="6"
            fill="#F6C65B"
          />

          <circle
            cx="138"
            cy="105"
            r="6"
            fill="#F6C65B"
          />

          <path
            d="M115 126C123 134 132 134 140 126"
            stroke="#F6C65B"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />

          <motion.g
            style={{ transformOrigin: "165px 124px" }}
            animate={{ rotate: [0, 18, -10, 18, 0] }}
            transition={{
              repeat: Infinity,
              repeatDelay: 1.8,
              duration: 1.1,
              ease: "easeInOut",
            }}
          >
            <path
              d="M158 126C172 112 184 114 191 128"
              stroke="#F6C65B"
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
            />

            <circle
              cx="194"
              cy="130"
              r="9"
              fill="#F6C65B"
            />
          </motion.g>

          <path
            d="M55 168C83 153 108 158 123 194C94 177 72 176 55 183Z"
            fill="#F6C65B"
          />

          <path
            d="M185 168C157 153 132 158 117 194C146 177 168 176 185 183Z"
            fill="#F6C65B"
          />

          <motion.path
            d="M172 55L180 78L204 87L180 96L172 121L164 96L140 87L164 78Z"
            fill="#C89235"
            animate={{
              scale: [1, 1.18, 1],
              rotate: [0, 8, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
            }}
          />
        </svg>
      </motion.button>
    </div>
  );
};

export default LunaMascotChat;