"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { cn } from "@/lib/utils";
import { cardShadow, premiumButton } from "@/components/onboarding/styles";

export default function AssistancePage() {
  const t = useTranslations("Assistance");
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("");
  const [topic, setTopic] = useState("domain");
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70">
        <div className="container flex h-16 items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("backLabel")}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <div
          className={cn(
            "w-full max-w-lg rounded-2xl border border-border bg-card p-8 sm:p-10",
            cardShadow,
          )}
        >
          {submitted ? (
            <div className="flex flex-col items-center py-4 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="size-6" strokeWidth={2} />
              </span>
              <h1 className="mt-5 text-xl font-bold text-foreground">
                {t("successTitle")}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("successDescription", { name: name.split(" ")[0] || "there", email })}
              </p>
              <Button size="lg" className={cn("mt-6 w-full", premiumButton)} asChild>
                <Link href="/">{t("successCta")}</Link>
              </Button>
            </div>
          ) : (
            <>
              <span className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-primary">
                {t("eyebrow")}
              </span>
              <h1 className="mt-2 text-xl font-bold text-foreground">{t("title")}</h1>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {t("description")}
              </p>

              <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    {t("nameLabel")}
                  </label>
                  <Input
                    id="name"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("namePlaceholder")}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    {t("emailLabel")}
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="domain" className="text-sm font-medium text-foreground">
                    {t("domainLabel")}
                  </label>
                  <Input
                    id="domain"
                    name="domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder={t("domainPlaceholder")}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="topic" className="text-sm font-medium text-foreground">
                    {t("topicLabel")}
                  </label>
                  <select
                    id="topic"
                    name="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="h-10 rounded-xl border border-border bg-background px-3.5 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/20"
                  >
                    <option value="domain">{t("topicDomain")}</option>
                    <option value="mailboxes">{t("topicMailboxes")}</option>
                    <option value="billing">{t("topicBilling")}</option>
                    <option value="other">{t("topicOther")}</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">
                    {t("messageLabel")}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("messagePlaceholder")}
                    className="w-full resize-none rounded-xl border border-border bg-background px-3.5 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/20"
                  />
                </div>

                <Button type="submit" size="lg" className={cn("mt-2 w-full", premiumButton)}>
                  {t("submit")}
                </Button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
