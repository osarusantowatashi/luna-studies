import { ArrowRight, BarChart3, Globe2, GraduationCap, UserRound } from "lucide-react";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#fbf7ef] text-[#071b3a] overflow-hidden">
      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fbf7ef]/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 lg:h-24 lg:px-10">
          <div className="flex items-center gap-3">
            <img src="/lunalogo.png" className="h-10 w-10 object-contain lg:h-12 lg:w-12" />
            <span className="font-serif text-xl tracking-tight lg:text-3xl">Luna Education</span>
          </div>

          <div className="hidden items-center gap-14 text-sm font-medium md:flex">
            <a>Why Luna</a>
            <a>Subjects</a>
            <a>Tutors</a>
            <a>Enquire</a>
          </div>

          <div className="flex items-center gap-3 lg:gap-8">
            <button className="hidden text-sm font-medium sm:block">Sign in</button>
            <button className="min-h-11 rounded-full bg-[#071b3a] px-4 py-3 text-sm text-white shadow-lg transition hover:-translate-y-0.5 lg:px-8 lg:py-4">
              Get started <ArrowRight className="ml-3 inline h-4 w-4" />
            </button>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative mx-auto max-w-[1500px] px-4 pt-24 lg:px-10 lg:pt-40">
        <div className="grid min-h-[auto] grid-cols-1 items-center gap-10 lg:min-h-[760px] lg:grid-cols-[0.9fr_1.1fr]">
          {/* LEFT TEXT */}
          <div className="relative z-20">
            <h1 className="max-w-[720px] leading-[0.95] tracking-[-0.04em] text-[#061a39] lg:leading-[0.9] lg:tracking-[-0.06em]">
  <span className="block overflow-hidden">
    <span className="block animate-title-1 font-sans text-[3.2rem] font-medium min-[390px]:text-[3.7rem] lg:text-[102px]">
      Your future
    </span>
  </span>

  <span className="mt-[-4px] block overflow-hidden lg:mt-[-10px]">
    <span className="block animate-title-2 font-sans text-[3.4rem] italic font-light min-[390px]:text-[3.9rem] lg:text-[110px]">
      seems to
    </span>
  </span>

  <span className="mt-[-8px] block overflow-hidden lg:mt-[-20px]">
    <span className="block animate-title-3 font-sans text-[3.4rem] italic font-light min-[390px]:text-[3.9rem] lg:text-[110px]">
      be
    </span>
  </span>

  <span className="mt-[-4px] block overflow-hidden lg:mt-[-10px]">
    <span className="block animate-title-4 font-serif text-[3.3rem] italic text-[#caa24a] min-[390px]:text-[3.8rem] lg:text-[115px]">
      travelling.
    </span>
  </span>
</h1>

            <div className="mt-4 h-[2px] w-40 bg-[#caa24a] lg:mt-3 lg:w-[360px]" />

            <p className="mt-7 max-w-[480px] text-base leading-8 text-[#071b3a]/90 lg:mt-8 lg:text-xl lg:leading-9">
              Premium 1-on-1 tutoring for international students.
              <br />
              Personalised. Global. Future-ready.
            </p>

            <div className="mt-9 flex flex-wrap gap-5">
              <button className="min-h-11 w-full rounded-full bg-[#071b3a] px-7 py-3 text-white shadow-xl transition hover:-translate-y-1 sm:w-auto lg:px-9 lg:py-4">
                Enquire now
                <ArrowRight className="ml-4 inline h-4 w-4" />
              </button>
              <button className="min-h-11 w-full rounded-full border border-[#071b3a]/40 bg-white/50 px-7 py-3 font-medium backdrop-blur transition hover:bg-white sm:w-auto lg:px-9 lg:py-4">
                View Programs
              </button>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                {["/student1.jpg", "/student2.jpg", "/student3.jpg", "/student4.jpg", "/student5.jpg"].map(
                  (src, i) => (
                    <img
                      key={i}
                      src={src}
                      className="h-10 w-10 rounded-full border-2 border-white object-cover bg-slate-200"
                    />
                  )
                )}
              </div>
              <p className="text-sm">
                Students from <span className="text-[#caa24a]">12+</span> countries
              </p>
            </div>
          </div>
{/* RIGHT VISUAL */}
<div className="relative hidden h-[820px] overflow-visible lg:block">
  {/* MAIN ARCH COLLAGE */}
  <div className="absolute right-[30px] top-[-90px] h-[760px] w-[760px] overflow-hidden rounded-t-full rounded-br-[46px] rounded-bl-[18px] bg-[#dceaf8] shadow-[0_35px_100px_rgba(7,27,58,0.14)]">
    {/* Aquarium background */}
    <img
  src="/hero/aquarium.jpeg"
  className="h-full w-full object-cover animate-aquarium"
/>
    

    {/* Sky/light area */}
    <div className="absolute right-0 top-0 h-full w-[48%] bg-gradient-to-b from-[#cfe7f7] to-[#f7efe2]" />

    {/* Europe photo right */}
    <img
      src="/hero/europe.jpeg"
      className="absolute right-[-20px] bottom-[90px] h-[310px] w-[250px] object-cover opacity-95"
    />

    {/* City photo bottom */}
    <img
      src="/hero/city.jpeg"
      className="absolute bottom-[60px] left-[120px] h-[180px] w-[310px] object-cover opacity-95 shadow-xl"
    />

    {/* Soft cream overlay for expensive feel */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-[#fbf7ef]/25" />

    {/* Thin gold orbit */}
    <div className="absolute bottom-[-100px] left-[40px] h-[430px] w-[430px] rounded-full border border-[#caa24a]/45" />
  </div>
  <div className="absolute inset-0 bg-gradient-to-t from-[#f8f4ec]/10 via-transparent to-[#f8f4ec]/15 rounded-[34px]" />

  {/* GIRL SUBJECT ONLY */}
  <img
    src="/hero/hero-student.png"
    className="absolute right-[150px] z-30 h-[670px] object-contain drop-shadow-2xl"
  />

  {/* Departure card top right */}
  <div className="absolute right-[35px] top-[65px] z-40 w-[210px] rotate-[-6deg] rounded-xl border border-white/60 bg-white/75 p-5 shadow-xl backdrop-blur-2xl">
    <p className="text-sm font-semibold">✈ Departures</p>
    <div className="mt-3 space-y-2 text-[11px] text-[#071b3a]/70">
      <div className="flex justify-between"><span>08:40</span><span>London</span><span>7</span></div>
      <div className="flex justify-between"><span>09:15</span><span>Singapore</span><span>12</span></div>
      <div className="flex justify-between"><span>09:30</span><span>Toronto</span><span>3</span></div>
      <div className="flex justify-between"><span>09:55</span><span>Melbourne</span><span>8</span></div>
    </div>
    <p className="mt-5 font-serif italic text-lg leading-5">
      The world is
      <br />
      wider than
      <br />
      we imagine.
    </p>
    <div className="mt-2 h-[2px] w-24 bg-[#caa24a]" />
  </div>

  {/* TOEFL card */}
  <div className="absolute left-[130px] top-[300px] z-40 rounded-2xl border border-white/60 bg-white/75 px-7 py-6 shadow-xl backdrop-blur-2xl">
    <p className="text-xs tracking-wide text-[#071b3a]/70">TOEFL iBT</p>
    <p className="mt-2 font-serif text-4xl text-[#071b3a]">117</p>
    <p className="mt-1 text-xs text-[#071b3a]/55">Total Score</p>
    <span className="absolute right-4 top-1/2 rounded-full bg-white p-2 text-[#caa24a] shadow">
      <ArrowRight className="h-3.5 w-3.5 -rotate-45" />
    </span>
  </div>

  {/* Waseda card */}
  <div className="absolute bottom-[215px] left-[45px] z-40 w-64 rounded-2xl border border-white/60 bg-white/75 px-7 py-6 shadow-xl backdrop-blur-2xl">
    <p className="text-sm text-[#071b3a]/70">Waseda University</p>
    <p className="mt-1 text-lg font-semibold text-[#071b3a]">SILS 合格</p>
    <p className="mt-4 text-xs text-[#071b3a]/50">Congratulations!</p>
  </div>

  {/* Countries card */}
  <div className="absolute bottom-[255px] right-[10px] z-40 w-72 rounded-2xl border border-white/60 bg-white/75 px-7 py-6 shadow-xl backdrop-blur-2xl">
    <p className="text-sm text-[#071b3a]/70">Students across</p>
    <p className="mt-2 font-serif text-3xl text-[#071b3a]">12+ countries</p>
    <div className="mt-4 flex gap-2 text-base">
      <span>🇯🇵</span>
      <span>🇸🇬</span>
      <span>🇨🇳</span>
      <span>🇬🇧</span>
      <span>🇺🇸</span>
      <span className="rounded-full bg-white px-2">＋</span>
    </div>
  </div>

  {/* elegant orbit */}
  <div className="absolute bottom-[110px] left-[30px] z-0 h-[360px] w-[360px] rounded-full border border-[#caa24a]/35" />
</div>

        {/* FEATURE BAR */}
        <div className="relative z-40 mb-12 mt-12 rounded-2xl bg-white/80 px-5 py-6 shadow-xl backdrop-blur-xl lg:-mt-4 lg:mb-16 lg:rounded-3xl lg:px-12 lg:py-9">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <Feature
              icon={<UserRound />}
              title="完全個別 1対1指導"
              text="あなた専用の学習プランで確実に力を伸ばす"
            />
            <Feature
              icon={<Globe2 />}
              title="多言語サポート"
              text="EN / 中文 / 日本語などバイリンガル講師が対応"
            />
            <Feature
              icon={<GraduationCap />}
              title="海外大学・進学に強い"
              text="出願サポートから面接対策までトータルでサポート"
            />
            <Feature
              icon={<BarChart3 />}
              title="結果につながる学習設計"
              text="思考力・表現力を育てる本質的な理解をサポート"
            />
          </div>
        </div>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-5 border-[#071b3a]/10 md:border-r md:pr-6 last:border-r-0">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f5ead2] text-[#caa24a]">
        <div className="h-6 w-6">{icon}</div>
      </div>
      <div>
        <h3 className="font-semibold text-[#071b3a]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#071b3a]/75">{text}</p>
      </div>
    </div>
  );
}
