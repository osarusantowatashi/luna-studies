import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const Values = () => {
  const values = [
    {
      title: "Clarity",
      text: "Students should understand why an answer is correct, not just memorise it. Clear thinking leads to confident answers.",
    },
    {
      title: "Structure",
      text: "Learning should follow a clear path. Each lesson builds on the previous one with defined goals and direction.",
    },
    {
      title: "Growth",
      text: "Mistakes are not failures. They are signals. We focus on weak areas to drive measurable improvement.",
    },
    {
      title: "Responsibility",
      text: "Students take ownership of their learning, while tutors guide, support, and challenge them to improve.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* HERO */}
      <section className="bg-hero px-4 py-16 text-center sm:px-6 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-sm uppercase tracking-widest text-accent font-medium">
            Our Values
          </p>

          <h1 className="font-serif text-4xl leading-tight text-primary sm:text-5xl md:text-6xl">
            What we believe learning should be
          </h1>

          <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg sm:leading-relaxed">
            At Luna Education, we don’t believe in random practice or passive learning.
            We focus on clarity, structure, and real improvement.
          </p>
        </div>
      </section>

      {/* VALUES GRID */}
      <section className="container mx-auto px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-2 hover:shadow-elegant sm:rounded-3xl sm:p-7"
            >
              <h3 className="font-serif text-2xl text-primary">
                {value.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {value.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT SHOWS IN PRACTICE */}
      <section className="bg-secondary/40 px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm uppercase tracking-widest text-accent font-medium mb-4">
            In Practice
          </p>

          <h2 className="mb-8 font-serif text-3xl text-primary sm:mb-10 sm:text-4xl">
            How these values shape every lesson
          </h2>

          <div className="grid gap-6 md:grid-cols-2 text-left">
            {[
              "Lessons follow a clear structure instead of random topics",
              "Mistakes are tracked and reviewed systematically",
              "Students learn how to explain answers, not just give them",
              "Parents receive clear progress feedback",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border bg-background p-5"
              >
                <p className="text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-14 text-center sm:px-6 sm:py-20 lg:py-24">
        <h2 className="mb-6 font-serif text-3xl text-primary sm:text-4xl">
          Start your learning journey
        </h2>

        <p className="text-muted-foreground mb-10">
          Tell us your goals and we’ll recommend the right plan.
        </p>

        <Link to="/#enquiry">
          <Button size="lg" className="min-h-11 w-full px-10 shadow-elegant sm:w-auto">
            Enquire now
          </Button>
        </Link>
      </section>
      <Footer />
    </div>
  );
};

export default Values;
