"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { premiumButton } from "@/components/onboarding/styles";
import {
  registrantContactSchema,
  type RegistrantContactSchema,
} from "@/schemas/onboarding.schemas";

const EMPTY: RegistrantContactSchema = {
  firstName: "",
  lastName: "",
  organizationName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  countryCode: "",
  zipCode: "",
  phoneNumber: "",
  email: "",
};

export function RegistrantContactStep({
  initialValue,
  onContinue,
}: {
  initialValue: RegistrantContactSchema | null;
  onContinue: (contact: RegistrantContactSchema) => void;
}) {
  const t = useTranslations("Onboarding.registrantContact");
  const [values, setValues] = useState<RegistrantContactSchema>(initialValue ?? EMPTY);
  const [showErrors, setShowErrors] = useState(false);

  function set<K extends keyof RegistrantContactSchema>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registrantContactSchema.safeParse({
      ...values,
      countryCode: values.countryCode.trim().toUpperCase(),
    });
    if (!parsed.success) {
      setShowErrors(true);
      return;
    }
    onContinue(parsed.data);
  }

  const field = (
    key: keyof RegistrantContactSchema,
    label: string,
    props: React.ComponentProps<typeof Input> = {},
  ) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={key} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <Input
        id={key}
        value={values[key] ?? ""}
        onChange={(e) => set(key, e.target.value)}
        className="rounded-xl"
        {...props}
      />
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-muted-foreground">{t("description")}</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {field("firstName", t("firstName"))}
          {field("lastName", t("lastName"))}
        </div>
        {field("organizationName", t("organizationName"))}
        {field("addressLine1", t("addressLine1"))}
        {field("addressLine2", t("addressLine2"))}
        <div className="grid grid-cols-2 gap-3">
          {field("city", t("city"))}
          {field("state", t("state"))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="countryCode" className="text-sm font-medium text-foreground">
              {t("countryCode")}
            </label>
            <Input
              id="countryCode"
              value={values.countryCode}
              onChange={(e) => set("countryCode", e.target.value.toUpperCase())}
              maxLength={2}
              className="rounded-xl uppercase"
              placeholder="US"
            />
            <p className="text-xs text-muted-foreground">{t("countryCodeHint")}</p>
          </div>
          {field("zipCode", t("zipCode"))}
        </div>
        <div className="flex flex-col gap-1.5">
          {field("phoneNumber", t("phoneNumber"), { placeholder: "+1.4155552671" })}
          <p className="text-xs text-muted-foreground">{t("phoneNumberHint")}</p>
        </div>
        {field("email", t("email"), { type: "email" })}

        {showErrors && <p className="text-sm text-destructive">{t("error")}</p>}

        <Button type="submit" size="lg" className={cn("mt-4 w-full", premiumButton)}>
          {t("continue")}
        </Button>
      </form>
    </div>
  );
}
