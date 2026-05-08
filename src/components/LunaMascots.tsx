import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const LunaMascot = () => {
  return (
    <motion.div
      className="fixed bottom-8 right-8 z-[999] hidden md:flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {/* Speech Bubble */}
      <motion.div
        className="relative mb-3 rounded-[28px] border border-[#E8D8B5] bg-white px-5 py-3 shadow-[0_18px_45px_rgba(8,42,85,0.18)]"
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#C89235]" />
          <span className="text-[15px] font-semibold text-[#082A55]">
            Hi, I’m Luna!
          </span>
        </div>

        <p className="mt-1 text-xs font-medium text-slate-500">
          Let’s find your perfect course.
        </p>

        <div className="absolute -bottom-2 right-10 h-5 w-5 rotate-45 border-b border-r border-[#E8D8B5] bg-white" />
      </motion.div>

      {/* Mascot Card */}
      <motion.div
        className="relative flex h-[180px] w-[180px] cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_25px_70px_rgba(8,42,85,0.25)]"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut" }}
        whileHover={{ scale: 1.06, rotate: -2 }}
      >
        {/* Glow */}
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#F6C65B]/35 via-white to-[#082A55]/20 blur-xl" />
        <div className="absolute inset-5 rounded-full border border-[#F1DEB7]" />

        <svg
          viewBox="0 0 240 240"
          className="relative h-[150px] w-[150px] drop-shadow-xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Moon */}
          <path
            d="M154 25C102 32 64 76 64 128C64 180 108 216 158 213C129 196 111 164 111 127C111 87 129 50 154 25Z"
            fill="#082A55"
          />

          {/* Face */}
          <circle cx="113" cy="105" r="6" fill="#F6C65B" />
          <circle cx="138" cy="105" r="6" fill="#F6C65B" />
          <circle cx="104" cy="122" r="5" fill="#F9D98B" opacity="0.75" />
          <circle cx="150" cy="122" r="5" fill="#F9D98B" opacity="0.75" />
          <path
            d="M115 126C123 134 132 134 140 126"
            stroke="#F6C65B"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Waving arm */}
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
            <circle cx="194" cy="130" r="9" fill="#F6C65B" />
          </motion.g>

          {/* Book */}
          <path
            d="M55 168C83 153 108 158 123 194C94 177 72 176 55 183Z"
            fill="#F6C65B"
          />
          <path
            d="M185 168C157 153 132 158 117 194C146 177 168 176 185 183Z"
            fill="#F6C65B"
          />
          <path
            d="M55 188C86 178 108 184 123 199"
            stroke="#082A55"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M185 188C154 178 132 184 117 199"
            stroke="#082A55"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Main Star */}
          <motion.path
            d="M172 55L180 78L204 87L180 96L172 121L164 96L140 87L164 78Z"
            fill="#C89235"
            animate={{ scale: [1, 1.18, 1], rotate: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />

          {/* Small Stars */}
          <motion.circle
            cx="91"
            cy="83"
            r="5"
            fill="#C89235"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
          />
          <motion.circle
            cx="174"
            cy="135"
            r="5"
            fill="#C89235"
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default LunaMascot;