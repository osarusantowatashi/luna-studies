import NavBar from "@/components/NavBar";
import EnquiryForm from "@/pages/EnquiryForm";

const Enquire = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* HERO */}
      <section className="bg-hero px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-widest text-accent font-medium">
            Enquire
          </p>

          <h1 className="font-serif text-5xl md:text-6xl text-primary leading-tight">
            Start your learning journey
          </h1>

          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Tell us about your needs and we’ll recommend the most suitable plan.
          </p>

          <p className="mt-4 text-sm text-muted-foreground">
            Trial lesson from $60 · No commitment
          </p>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y bg-secondary/40 px-6 py-10">
        <div className="mx-auto max-w-5xl grid gap-6 md:grid-cols-3 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Response time</p>
            <p className="text-primary font-semibold mt-1">Within 24 hours</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Lesson format</p>
            <p className="text-primary font-semibold mt-1">Online & Offline</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Support</p>
            <p className="text-primary font-semibold mt-1">Chat + Tutor guidance</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
  <div className="max-w-4xl mx-auto text-center mb-14">
    <h2 className="font-serif text-4xl text-primary">
      What happens after you enquire
    </h2>
    <p className="mt-4 text-muted-foreground">
      A clear and structured process designed to ensure real improvement.
    </p>
  </div>

  <div className="grid gap-6 md:grid-cols-5">
    {[
      {
        step: "01",
        title: "Trial Assessment",
        text: "Initial assessment by head tutor to understand level and learning style.",
      },
      {
        step: "02",
        title: "Comprehensive Report",
        text: "Detailed evaluation across all key academic areas.",
      },
      {
        step: "03",
        title: "Tutor Matching",
        text: "Assigned tutor based on student’s needs and goals.",
      },
      {
        step: "04",
        title: "Progress Tracking",
        text: "Feedback every 3 lessons with continuous plan adjustments.",
      },
      {
        step: "05",
        title: "Final Evaluation",
        text: "Clear progress comparison with graphs and next-step guidance.",
      },
    ].map((item) => (
      <div
        key={item.step}
        className="rounded-3xl border bg-card p-6 shadow-soft text-center"
      >
        <p className="text-accent font-semibold">{item.step}</p>

        <h3 className="mt-2 font-serif text-lg text-primary">
          {item.title}
        </h3>

        <p className="mt-3 text-sm text-muted-foreground leading-6">
          {item.text}
        </p>
      </div>
    ))}
  </div>
</section>

      {/* FORM */}
      <section id="form" className="px-6 pb-24">
        <div className="mx-auto max-w-2xl">
          <EnquiryForm />
        </div>
      </section>

      {/* OPTIONAL CONTACT */}
      <section className="bg-secondary/30 px-6 py-16 text-center">
        <p className="text-muted-foreground">
          Prefer to contact us directly?
        </p>

        <p className="mt-2 text-primary font-medium">
          WeChat: lunaeducation · Email: enquiries@lunastudies.com
        </p>
      </section>
    </div>
  );
};

export default Enquire;