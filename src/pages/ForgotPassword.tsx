import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!email.trim()) {
            alert(t("forgotPassword.alerts.enterEmail"));
            return;
        }

        setLoading(true);

        const currentLang = window.location.pathname.startsWith("/zh")
            ? "zh"
            : "en";

        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/${currentLang}/reset-password`,
        });

        setLoading(false);

        if (error) {
            alert(error.message);
            return;
        }

        alert(t("forgotPassword.alerts.success"));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f7f6f3] via-[#f1eee7] to-[#e8e3d8]">
            <NavBar />

            <div className="mx-auto max-w-xl px-6 py-24">
                <div className="rounded-[2rem] border bg-white/80 p-8 shadow-xl backdrop-blur">
                    <p className="text-sm font-semibold uppercase tracking-widest text-accent">
                    {t("forgotPassword.label")}
                    </p>

                    <h1 className="mt-2 font-serif text-4xl text-primary">
                    {t("forgotPassword.title")}
                    </h1>

                    <p className="mt-3 text-sm text-muted-foreground">
                    {t("forgotPassword.description")}
                    </p>

                    <div className="mt-8 space-y-5">
                        <input
                            className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                            placeholder={t("forgotPassword.placeholder")}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Button
                            className="h-12 w-full rounded-2xl"
                            onClick={handleReset}
                            disabled={loading}
                        >
                            {loading ? t("forgotPassword.loading") : t("forgotPassword.button")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;