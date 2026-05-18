
import EnquiryForm from "@/pages/EnquiryForm";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";

const Enquire = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">

      {/* HERO */}
      <section className="bg-hero px-4 py-16 text-center sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-widest text-accent font-medium">
            {t("enquire.hero.label")}
          </p>

          <h1 className="font-serif text-3xl leading-tight text-primary sm:text-5xl md:text-6xl">
            {t("enquire.hero.title")}
          </h1>

          <p className="mt-6 text-sm leading-7 text-muted-foreground sm:text-lg sm:leading-relaxed">
            {t("enquire.hero.description")}
          </p>

          <p className="mt-4 text-sm text-muted-foreground">
            {t("enquire.hero.trial")}
          </p>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y bg-secondary/40 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto grid max-w-5xl gap-4 text-center md:grid-cols-3">
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
      <section id="form" className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <EnquiryForm />
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-4xl mx-auto text-center mb-14">
        <h2 className="font-serif text-3xl text-primary sm:text-4xl">
            {t("enquire.process.title")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("enquire.process.description")}
          </p>
        </div>

        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-5">
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
              className="rounded-[1.8rem] border bg-card p-5 shadow-soft text-center sm:rounded-3xl sm:p-6"
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
      <section className="bg-secondary/30 px-4 py-14 text-center sm:px-6 sm:py-16">
        <p className="text-muted-foreground">
          {t("enquire.contact.title")}
        </p>

        <p className="mt-2 text-sm font-medium leading-7 text-primary sm:text-base">
          WeChat: luna-education · Email: enquiries@lunastudies.com
        </p>
      </section>

      <Footer />
    </div>
  );
};

export default Enquire;