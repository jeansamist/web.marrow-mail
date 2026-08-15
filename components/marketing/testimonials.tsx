import { useTranslations } from "next-intl";
import { Section } from "@/components/marketing/section";
import { TestimonialCarousel } from "@/components/marketing/testimonial-carousel";

export function Testimonials() {
  const t = useTranslations("Testimonials");
  const items = t.raw("items") as {
    quote: string;
    name: string;
    role: string;
  }[];

  return (
    <Section eyebrow={t("eyebrow")} title={t("title")} tone="muted">
      <TestimonialCarousel items={items} />
    </Section>
  );
}
