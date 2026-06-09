import { Copy, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getI18n, getStaticParams } from "@/lib/i18n/server"
import { Metadata } from "next"

export function generateStaticParams() {
  return getStaticParams()
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18n()
  return {
    title: t("onboarding.configure-dns.meta.title"),
    description: t("onboarding.configure-dns.meta.description"),
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
        <h3 className="text-2xl leading-normal font-bold">Configure DNS</h3>
        <p className="text-sm leading-normal opacity-70">
          Add the provided DNS records to your domain
        </p>
      </div>
      <div>
        <Field>
          <FieldLabel htmlFor="input-group-url">Domain</FieldLabel>
          <InputGroup>
            <InputGroupInput id="input-group-url" value={domain} />
            <InputGroupAddon>
              <InputGroupText>https://</InputGroupText>
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <Globe />
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </div>
      <Card>
        <CardContent>
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-25">Name</TableHead>
                  <TableHead className="w-25">Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>www</TableCell>
                  <TableCell className="font-medium">CNAME</TableCell>
                  <TableCell className="flex items-center gap-2 font-medium">
                    <Button variant={"ghost"} size={"icon-lg"}>
                      <Copy />
                    </Button>
                    <span className="line-clamp-1">example.com</span>
                  </TableCell>
                  <TableCell className="text-right">10</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
