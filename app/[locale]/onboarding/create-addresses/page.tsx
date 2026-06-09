import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { getI18n, getStaticParams } from "@/lib/i18n/server"
import { Metadata } from "next"

export function generateStaticParams() {
  return getStaticParams()
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18n()
  return {
    title: t("onboarding.create-addresses.meta.title"),
    description: t("onboarding.create-addresses.meta.description"),
  }
}
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string }>
}) {
  const { domain } = await searchParams
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl leading-normal font-bold">
          Create email address
        </h3>
        <p className="text-sm leading-normal opacity-70">
          Create your email address and start sending emails
        </p>
      </div>
      <Card>
        <CardContent className="space-y-4">
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Username</FieldLabel>
                <InputGroup>
                  <InputGroupInput id="input" />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>@{domain}</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel>Owner email</FieldLabel>
                <InputGroup>
                  <InputGroupInput id="input" />
                </InputGroup>
              </Field>
            </div>
          </FieldGroup>
          <Button className="w-full" variant={"secondary"}>
            <Plus /> Add one more
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
