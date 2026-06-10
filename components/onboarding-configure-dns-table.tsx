"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useOnboarding } from "@/contexts/onboarding.context"
import { useCurrentLocaleUrl } from "@/lib/i18n/client"
import { Record } from "@/types"
import { ArrowLeft, Check, Copy, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FunctionComponent, useEffect, useState } from "react"

export type OnboardingConfigureDNSTableProps = {
  domainParams: string
  [key: string]: unknown
}

export const OnboardingConfigureDNSTable: FunctionComponent<
  OnboardingConfigureDNSTableProps
> = ({ domainParams }) => {
  const onboarding = useOnboarding()
  const { currentLocaleUrl } = useCurrentLocaleUrl()
  const router = useRouter()
  // Check if the domain in the context matches the domain in the URL params
  useEffect(() => {
    const contextStepValues = onboarding.steps[0].values as
      | { domain?: string }
      | undefined
    const contextDomain = contextStepValues?.domain
    if (contextDomain && contextDomain !== domainParams) {
      // If they don't match, redirect to the correct URL with the domain from the context
      router.push(currentLocaleUrl(`/onboarding/`))
    }
  }, [currentLocaleUrl, domainParams, onboarding.steps, router])

  const [fetchedDNSRecords, setFetchedDNSRecords] = useState<
    Record[] | undefined
  >(undefined)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  function copyRecord(record: Record) {
    navigator.clipboard.writeText(record.value)
    setCopiedId(record.id)
    setTimeout(() => setCopiedId(null), 3000)
  }

  const [domainVerified, setDomainVerified] = useState<boolean | undefined>(
    false
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setFetchedDNSRecords([
        {
          id: 1,
          type: "MX",
          name: domainParams,
          value: `mail.${domainParams}`,
          priority: 10,
          createdAt: new Date().toISOString(),
          updatedAt: null,
        },
        {
          id: 2,
          type: "TXT",
          name: domainParams,
          value: `v=spf1 include:${domainParams} ~all`,
          priority: null,
          createdAt: new Date().toISOString(),
          updatedAt: null,
        },
        {
          id: 3,
          type: "CNAME",
          name: `mail.${domainParams}`,
          value: `mta.${domainParams}`,
          priority: null,
          createdAt: new Date().toISOString(),
          updatedAt: null,
        },
      ])
    }, 2000)
    return () => clearTimeout(timer)
  }, [domainParams])

  // Update the context current step
  useEffect(() => {
    onboarding.setCurrentStep(1)
  }, [onboarding])
  return (
    <>
      <Card>
        <CardContent className="space-y-6">
          <div>
            {fetchedDNSRecords === undefined ? (
              <div className="flex h-60 w-full items-center justify-center gap-4 rounded-lg bg-accent">
                <Loader2
                  size={24}
                  className="animate-spin text-accent-foreground"
                />
                Loading DNS records...
              </div>
            ) : (
              <>
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
                    {fetchedDNSRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.name}</TableCell>
                        <TableCell className="font-medium">
                          {record.type}
                        </TableCell>
                        <TableCell className="flex items-center gap-2 font-medium">
                          <Button
                            variant={"ghost"}
                            size={"icon-lg"}
                            onClick={() => copyRecord(record)}
                          >
                            {copiedId === record.id ? <Check /> : <Copy />}
                          </Button>
                          <span className="line-clamp-1">{record.value}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {record.priority}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button
                  variant={domainVerified === true ? "default" : "secondary"}
                  disabled={
                    domainVerified === true || domainVerified === undefined
                  }
                  className="w-full"
                >
                  {domainVerified === true ? (
                    <>
                      <Check /> Verified
                    </>
                  ) : domainVerified === undefined ? (
                    <>
                      <Loader2 className="animate-spin" /> Checking
                    </>
                  ) : (
                    "Check"
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-4">
        <Button variant={"outline"} asChild>
          <Link href={currentLocaleUrl("/onboarding")}>
            <ArrowLeft />
            Change the domain
          </Link>
        </Button>
        <Button asChild>
          <Link
            href={currentLocaleUrl(
              `/onboarding/create-addresses?domain=${domainParams}`
            )}
          >
            Continue
          </Link>
        </Button>
      </div>
    </>
  )
}
