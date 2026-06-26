import { tutorPolicyContent, type PolicyBullet } from "@/content/tutorPolicy";
import { motion } from "framer-motion";
import { useState } from "react";

const renderBullets = (bullets: PolicyBullet[] = []) => (
  <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-primary/68 sm:text-base sm:leading-8">
    {bullets.map((bullet) => (
      <li key={bullet.text}>
        <span>{bullet.text}</span>

        {bullet.children && bullet.children.length > 0 && (
          <ul className="mt-2 list-[circle] space-y-2 pl-5">
            {bullet.children.map((child) => (
              <li key={child}>{child}</li>
            ))}
          </ul>
        )}
      </li>
    ))}
  </ul>
);

const TutorPolicy = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "zh">("en");

  const policy = tutorPolicyContent[selectedLanguage];
  const isChinese = selectedLanguage === "zh";

  return (
    <div className="min-h-screen bg-[#fbfaff] px-4 py-6 sm:px-6 sm:py-12">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_85%_75%,#fff1bd_0%,transparent_28%)]" />

      <div className="relative z-10 mx-auto max-w-5xl space-y-6 sm:space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="overflow-hidden rounded-[2rem] bg-white/92 p-5 shadow-[0_25px_80px_rgba(66,56,120,0.12)] backdrop-blur-xl sm:rounded-[3rem] sm:p-10"
        >
          <div className="mb-7 inline-flex rounded-full border border-primary/10 bg-[#f8f6ff] p-1">
            {[
              ["en", "English"],
              ["zh", "中文"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedLanguage(value as "en" | "zh")}
                className={`min-h-11 rounded-full px-5 text-sm font-black transition ${
                  selectedLanguage === value
                    ? "bg-primary text-white shadow-[0_12px_28px_rgba(10,36,84,0.18)]"
                    : "text-primary/58 hover:text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
            Luna Education
          </p>

          <h1
            className={`mt-5 font-poppins font-black leading-tight text-primary ${
              isChinese
                ? "text-[2.2rem] sm:text-[3.8rem]"
                : "text-[2.1rem] sm:text-[4rem]"
            }`}
          >
            {policy.title}
          </h1>

          {policy.subtitle && (
            <p className="mt-4 text-xl font-black text-[#8d73ff]">
              {policy.subtitle}
            </p>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_0.72fr]">
            <div className="rounded-[1.5rem] border border-primary/10 bg-[#fffdf8] p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary/42">
                {isChinese ? "政策标题" : "Policy"}
              </p>
              <p className="mt-2 text-xl font-black text-primary">
                {policy.policyTitle}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-primary/10 bg-[#fffdf8] p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary/42">
                {isChinese ? "最后更新" : "Last Updated"}
              </p>
              <p className="mt-2 text-xl font-black text-primary">
                {policy.lastUpdated}
              </p>
            </div>
          </div>
        </motion.section>

        <section className="space-y-4 rounded-[2rem] bg-white/92 p-4 shadow-[0_25px_80px_rgba(66,56,120,0.10)] backdrop-blur-xl sm:space-y-6 sm:rounded-[3rem] sm:p-8">
          <div className="rounded-[1.4rem] bg-[#fffdf8] p-4 sm:rounded-[2rem] sm:p-6">
            <h2 className="font-poppins text-2xl font-black text-primary">
              {policy.policyTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-primary/68 sm:text-base sm:leading-8">
              {policy.intro}
            </p>
          </div>

          {policy.sections.map((section, index) => (
            <motion.section
              key={`${selectedLanguage}-${section.number}`}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.03 }}
              className="rounded-[1.4rem] bg-[#fbfaff] p-4 sm:rounded-[2rem] sm:p-6"
            >
              <h2 className="font-poppins text-xl font-black leading-snug text-primary sm:text-2xl">
                {section.number}. {section.title}
              </h2>

              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-4 text-sm leading-7 text-primary/68 sm:text-base sm:leading-8"
                >
                  {paragraph}
                </p>
              ))}

              {renderBullets(section.bullets)}

              {section.afterBullets?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-4 text-sm leading-7 text-primary/68 sm:text-base sm:leading-8"
                >
                  {paragraph}
                </p>
              ))}
            </motion.section>
          ))}
        </section>
      </div>
    </div>
  );
};

export default TutorPolicy;
