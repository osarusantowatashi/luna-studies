import { Helmet } from "react-helmet-async";

type Props = {
  title: string;
  description: string;
  canonicalUrl: string;
  currentLang: "en" | "zh" | "ja";
};

export default function SeoHelmet({
  title,
  description,
  canonicalUrl,
  currentLang,
}: Props) {
  const baseUrl = "https://www.lunastudies.com";

  return (
    <Helmet>
      <html lang={currentLang === "zh" ? "zh-Hans" : currentLang} />

      <title>{title}</title>

      <meta name="description" content={description} />

      <link rel="canonical" href={canonicalUrl} />

      <link rel="alternate" hrefLang="en" href={canonicalUrl.replace(`/${currentLang}`, "/en")} />
      <link rel="alternate" hrefLang="zh-Hans" href={canonicalUrl.replace(`/${currentLang}`, "/zh")} />
      <link rel="alternate" hrefLang="ja" href={canonicalUrl.replace(`/${currentLang}`, "/ja")} />
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/en`} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />

      <meta name="robots" content="index,follow" />
    </Helmet>
  );
}