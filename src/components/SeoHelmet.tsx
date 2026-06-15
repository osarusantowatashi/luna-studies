import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

type Props = {
  title: string;
  description: string;
  canonicalUrl: string;
  currentLang: "en" | "zh" | "ja";
};

const baseUrl = "https://www.lunastudies.com";
const languages = ["en", "zh", "ja"] as const;

const normalizePath = (path: string) => {
  const withoutHashOrQuery = path.split("#")[0].split("?")[0] || "/";
  const withLeadingSlash = withoutHashOrQuery.startsWith("/")
    ? withoutHashOrQuery
    : `/${withoutHashOrQuery}`;
  const withoutJp = withLeadingSlash.replace(/^\/jp(?=\/|$)/, "/ja");

  if (withoutJp === "/") return "/";

  return withoutJp.replace(/\/+$/, "");
};

const buildCanonicalUrl = (path: string) =>
  path === "/" ? `${baseUrl}/` : `${baseUrl}${path}`;

const getPathFromCanonical = (canonicalUrl: string) => {
  try {
    return normalizePath(new URL(canonicalUrl).pathname);
  } catch {
    return normalizePath(canonicalUrl.replace(baseUrl, ""));
  }
};

const getLocalizedPath = (canonicalPath: string, lang: (typeof languages)[number]) => {
  if (canonicalPath === "/") return `/${lang}`;

  if (/^\/(en|zh|ja)(?=\/|$)/.test(canonicalPath)) {
    return canonicalPath.replace(/^\/(en|zh|ja)(?=\/|$)/, `/${lang}`);
  }

  return `/${lang}${canonicalPath}`;
};

export default function SeoHelmet({
  title,
  description,
  canonicalUrl,
  currentLang,
}: Props) {
  const location = useLocation();
  const canonicalPath =
    location.pathname === "/" ? "/" : getPathFromCanonical(canonicalUrl);
  const normalizedCanonicalUrl = buildCanonicalUrl(canonicalPath);
  const xDefaultPath = canonicalPath === "/" ? "/" : getLocalizedPath(canonicalPath, "en");
  const xDefaultUrl = buildCanonicalUrl(xDefaultPath);

  return (
    <Helmet>
      <html lang={currentLang === "zh" ? "zh-Hans" : currentLang} />

      <title>{title}</title>

      <meta name="description" content={description} />

      <link rel="canonical" href={normalizedCanonicalUrl} />

      {languages.map((lang) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={buildCanonicalUrl(getLocalizedPath(canonicalPath, lang))}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={xDefaultUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={normalizedCanonicalUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      <meta name="robots" content="index,follow" />
    </Helmet>
  );
}
