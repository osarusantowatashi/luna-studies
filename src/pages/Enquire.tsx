import NavBar from "@/components/NavBar";
import EnquiryForm from "@/pages/EnquiryForm";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";

const Enquire = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* HERO */}
      <section className="bg-hero px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-widest text-accent font-medium">
            {t("enquire.hero.label")}
          </p>

          <h1 className="font-serif text-5xl md:text-6xl text-primary leading-tight">
            {t("enquire.hero.title")}
          </h1>

          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            {t("enquire.hero.description")}
          </p>

          <p className="mt-4 text-sm text-muted-foreground">
            {t("enquire.hero.trial")}
          </p>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y bg-secondary/40 px-6 py-10">
        <div className="mx-auto max-w-5xl grid gap-6 md:grid-cols-3 text-center">
          <div>
            <p className="text-sm text-muted-foreground">{t("enquire.trust.response")}</p>
            <p className="text-primary font-semibold mt-1">{t("enquire.trust.responseValue")}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("enquire.trust.format")}</p>
            <p className="text-primary font-semibold mt-1">{t("enquire.trust.formatValue")}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("enquire.trust.support")}</p>
            <p className="text-primary font-semibold mt-1">{t("enquire.trust.supportValue")}</p>
          </div>
        </div>
      </section>


      {/* FORM */}
      <section id="form" className="px-6 py-24">
        <div className="mx-auto max-w-2xl">
          <EnquiryForm />
        </div>
      </section>

      <section className="container mx-auto px-6 py-18">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="font-serif text-4xl text-primary">
            {t("enquire.process.title")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("enquire.process.description")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          {[
            {
              step: "01",
              title: t("enquire.steps.step1.title"),
              text: t("enquire.steps.step1.text"),
            },
            {
              step: "02",
              title: t("enquire.steps.step2.title"),
              text: t("enquire.steps.step2.text"),
            },
            {
              step: "03",
              title: t("enquire.steps.step3.title"),
              text: t("enquire.steps.step3.text"),
            },
            {
              step: "04",
              title: t("enquire.steps.step4.title"),
              text: t("enquire.steps.step4.text"),
            },
            {
              step: "05",
              title: t("enquire.steps.step5.title"),
              text: t("enquire.steps.step5.text"),
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



      {/* OPTIONAL CONTACT */}
      <section className="bg-secondary/30 px-6 py-16 text-center">
        <p className="text-muted-foreground">
          {t("enquire.contact.title")}
        </p>

        <p className="mt-2 text-primary font-medium">
          WeChat: luna-education · Email: enquiries@lunastudies.com
        </p>
      </section>

      <Footer />
    </div>
  );
};

export default Enquire;