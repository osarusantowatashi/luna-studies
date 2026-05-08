import { ArrowRight, BarChart3, Globe2, GraduationCap, UserRound } from "lucide-react";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#fbf7ef] text-[#071b3a] overflow-hidden">
      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fbf7ef]/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-24 max-w-[1500px] items-center justify-between px-10">
          <div className="flex items-center gap-3">
            <img src="/lunalogo.png" className="h-12 w-12 object-contain" />
            <span className="font-serif text-3xl tracking-tight">Luna Education</span>
          </div>

          <div className="hidden items-center gap-14 text-sm font-medium md:flex">
            <a>Why Luna</a>
            <a>Subjects</a>
            <a>Tutors</a>
            <a>Enquire</a>
          </div>

          <div className="flex items-center gap-8">
            <button className="text-sm font-medium">Sign in</button>
            <button className="rounded-full bg-[#071b3a] px-8 py-4 text-white shadow-lg transition hover:-translate-y-0.5">
              Get started <ArrowRight className="ml-3 inline h-4 w-4" />
            </button>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative mx-auto max-w-[1500px] px-10 pt-40">
        <div className="grid min-h-[760px] grid-cols-1 items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          {/* LEFT TEXT */}
          <div className="relative z-20">
            <h1 className="max-w-[650px] font-poppins text-[88px] leading-[0.95] tracking-[-0.04em] text-[#061a39] xl:text-[108px]">
              Your future
              <br />
              <span className="font-light italic tracking-[0.08em]">seems to be</span>
              <br />
              <span className="font-serif italic text-[#caa24a]">travelling.</span>
            </h1>

            <div className="mt-3 h-[2px] w-[360px] bg-[#caa24a]" />

            <p className="mt-8 max-w-[480px] text-xl leading-9 text-[#071b3a]/90">
              Premium 1-on-1 tutoring for international students.
              <br />
              Personalised. Global. Future-ready.
            </p>

            <div className="mt-9 flex flex-wrap gap-5">
              <button className="rounded-full bg-[#071b3a] px-9 py-4 text-white shadow-xl transition hover:-translate-y-1">
                無料体験を予約する
                <ArrowRight className="ml-4 inline h-4 w-4" />
              </button>
              <button className="rounded-full border border-[#071b3a]/40 bg-white/50 px-9 py-4 font-medium backdrop-blur transition hover:bg-white">
                プログラムを見る
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
<div className="relative h-[720px] overflow-visible">
  {/* soft background */}
  <div className="absolute right-[90px] top-[-10px] h-[680px] w-[620px] rounded-t-full bg-[#dceaf8]/50 blur-xl" />


  {/* main girl photo */}
  <img
    src="/hero/hero-student.jpeg"
    className="absolute bottom-[55px] right-[120px] z-40 h-[560px] w-[430px] rounded-[34px] object-cover shadow-2xl animate-fade-in"
  />
  {/* aquarium pasted first */}
  <div className="absolute left-[40px] top-[40px] z-10 h-[610px] w-[520px] overflow-hidden rounded-t-full opacity-70 animate-paste-1">
    <img
      src="/hero/aquarium.jpeg"
      className="h-full w-full scale-110 object-cover opacity-55"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#fbf7ef]/45" />
  </div>

  {/* europe photo - top layer */}
<img
  src="/hero/europe.jpeg"
  className="
    absolute
    right-[40px]
    top-[20px]
    z-40
    h-[170px]
    w-[250px]
    rotate-[4deg]
    rounded-md
    object-cover
    shadow-2xl
    animate-paste-2
  "
/>

{/* city photo - underneath europe */}
<img
  src="/hero/city.jpeg"
  className="
    absolute
    right-[120px]
    top-[130px]
    z-30
    h-[160px]
    w-[240px]
    rotate-[-3deg]
    rounded-md
    object-cover
    opacity-90
    shadow-2xl
    animate-paste-1
  "
/>


  {/* TOEFL card */}
  <div className="absolute left-[150px] top-[250px] z-50 rounded-2xl border border-white/50 bg-white/70 px-7 py-6 shadow-xl backdrop-blur-2xl animate-card-1">
    <p className="text-xs tracking-wide text-[#071b3a]/70">TOEFL iBT</p>
    <p className="mt-2 font-serif text-4xl text-[#071b3a]">117</p>
    <p className="mt-1 text-xs text-[#071b3a]/55">Total Score</p>
    <span className="absolute right-4 top-1/2 rounded-full bg-white p-2 text-[#caa24a] shadow">
      <ArrowRight className="h-3.5 w-3.5 -rotate-45" />
    </span>
  </div>

  {/* Waseda card */}
  <div className="absolute right-[30px] top-[165px] z-50 w-64 rotate-[1deg] rounded-2xl border border-white/50 bg-white/70 px-7 py-6 shadow-xl backdrop-blur-2xl animate-card-2">
    <p className="text-sm text-[#071b3a]/70">Waseda University</p>
    <p className="mt-1 text-xl font-semibold text-[#071b3a]">SILS 合格</p>
    <p className="mt-5 text-xs text-[#071b3a]/50">Congratulations!</p>
  </div>

  {/* paper note */}
  <div className="absolute bottom-[230px] left-[170px] z-50 rotate-[-4deg] bg-[#fffdf8] px-7 py-5 shadow-xl animate-card-3">
    <p className="font-serif italic text-xl leading-7 text-[#071b3a]">
      The world is
      <br />
      wider than
      <br />
      we imagine.
    </p>
    <div className="mt-2 h-[2px] w-28 bg-[#caa24a]" />
  </div>

  {/* countries card */}
  <div className="absolute bottom-[180px] right-[0px] z-50 w-72 rounded-2xl border border-white/50 bg-white/60 px-7 py-6 shadow-xl backdrop-blur-2xl animate-card-4">
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
        <div className="relative z-40 -mt-4 mb-16 rounded-3xl bg-white/80 px-12 py-9 shadow-xl backdrop-blur-xl">
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