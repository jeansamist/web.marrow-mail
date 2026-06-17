import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ComposeEmailDialog } from "@/components/compose-email-dialog"
import { getI18n, getStaticParams } from "@/lib/i18n/server"
import { Metadata } from "next"

export function generateStaticParams() {
  return getStaticParams()
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18n()
  return {
    title: t("mail.inbox.meta.title"),
    description: t("mail.inbox.meta.description"),
  }
}

type MockEmail = {
  id: number
  sender: string
  email: string
  subject: string
  preview: string
  time: string
  unread: boolean
  avatarSeed: string
  initials: string
}

const MOCK_EMAILS: MockEmail[] = [
  {
    id: 1,
    sender: "Sarah Johnson",
    email: "sarah.johnson@acme.io",
    subject: "Project proposal feedback",
    preview:
      "Hey, I reviewed the proposal you sent over. Overall it looks really solid — a few minor points I wanted to flag before we present it to the board next week.",
    time: "9:41 AM",
    unread: true,
    avatarSeed: "sarah-johnson",
    initials: "SJ",
  },
  {
    id: 2,
    sender: "Michael Chen",
    email: "m.chen@devteam.co",
    subject: "Team standup notes — June 17",
    preview:
      "Sharing the notes from this morning's standup. Blockers: deployment pipeline is flaky on staging. Action items assigned to everyone, please check your section.",
    time: "8:55 AM",
    unread: true,
    avatarSeed: "michael-chen-dev",
    initials: "MC",
  },
  {
    id: 3,
    sender: "Emma Williams",
    email: "billing@fincraft.com",
    subject: "Invoice #4521 — June 2026",
    preview:
      "Please find attached your invoice for the month of June. Payment is due within 30 days. Reach out if you have any questions about line items.",
    time: "Yesterday",
    unread: true,
    avatarSeed: "emma-williams-fin",
    initials: "EW",
  },
  {
    id: 4,
    sender: "James Martinez",
    email: "james@startupxyz.com",
    subject: "Quick question about the API",
    preview:
      "Hi! We're integrating your API into our platform and ran into a rate-limit issue on the /messages endpoint. Is there a way to request a higher quota?",
    time: "Yesterday",
    unread: false,
    avatarSeed: "james-martinez-api",
    initials: "JM",
  },
  {
    id: 5,
    sender: "Olivia Brown",
    email: "olivia.brown@corp.net",
    subject: "Meeting rescheduled to Thursday",
    preview:
      "Just a heads-up — the Q2 review has been moved from Wednesday to Thursday at 3 PM CET. Room: Zoom link unchanged. Let me know if that doesn't work.",
    time: "Mon",
    unread: false,
    avatarSeed: "olivia-brown-corp",
    initials: "OB",
  },
  {
    id: 6,
    sender: "Liam Davis",
    email: "liam.davis@onboarding.io",
    subject: "Welcome to the team! 🎉",
    preview:
      "We're so glad to have you on board. This email contains everything you need to get started: tool access, your buddy's contact, and the onboarding checklist.",
    time: "Mon",
    unread: false,
    avatarSeed: "liam-davis-welcome",
    initials: "LD",
  },
  {
    id: 7,
    sender: "Sophia Wilson",
    email: "noreply@shopfast.store",
    subject: "Your order has shipped 📦",
    preview:
      "Good news! Order #ORD-88213 is on its way. Estimated delivery: June 19–21. Track your package in real time using the link below.",
    time: "Sun",
    unread: false,
    avatarSeed: "sophia-wilson-shop",
    initials: "SW",
  },
  {
    id: 8,
    sender: "Noah Taylor",
    email: "security@accounts.co",
    subject: "Password reset confirmation",
    preview:
      "Your password was successfully reset on June 15 at 10:32 AM. If this wasn't you, please contact support immediately and we'll secure your account.",
    time: "Sun",
    unread: false,
    avatarSeed: "noah-taylor-sec",
    initials: "NT",
  },
  {
    id: 9,
    sender: "Ava Anderson",
    email: "ava@designstudio.co",
    subject: "Design mockups ready for review",
    preview:
      "The Figma file is updated with all three homepage variants. I'd love your thoughts on the hero section — V2 feels cleaner but V3 has better contrast.",
    time: "Sat",
    unread: false,
    avatarSeed: "ava-anderson-design",
    initials: "AA",
  },
  {
    id: 10,
    sender: "William Thomas",
    email: "william.thomas@friends.me",
    subject: "Happy birthday! 🎂",
    preview:
      "Hope you're having an amazing day! The team and I got you something small — check your desk drawer when you get in. Drinks on me tonight!",
    time: "Sat",
    unread: false,
    avatarSeed: "william-thomas-bday",
    initials: "WT",
  },
  {
    id: 11,
    sender: "Isabella Jackson",
    email: "noreply@saasapp.io",
    subject: "Subscription renewal reminder",
    preview:
      "Your Pro plan renews on July 1, 2026. No action needed — we'll charge the card on file. To update your payment method or cancel, visit your billing portal.",
    time: "Fri",
    unread: false,
    avatarSeed: "isabella-jackson-sub",
    initials: "IJ",
  },
  {
    id: 12,
    sender: "Benjamin White",
    email: "notifications@devforum.dev",
    subject: "New comment on your post",
    preview:
      'Someone replied to your post "Best practices for email auth in Next.js": "Great write-up! One thing to add — consider using httpOnly cookies for token storage..."',
    time: "Fri",
    unread: false,
    avatarSeed: "benjamin-white-forum",
    initials: "BW",
  },
  {
    id: 13,
    sender: "Mia Harris",
    email: "mia.harris@travel.com",
    subject: "Flight confirmation — NYC → LAX",
    preview:
      "Your booking is confirmed! Flight AA204 departs JFK on June 22 at 7:15 AM, arrives LAX at 10:44 AM. Check-in opens 24 hours before departure.",
    time: "Thu",
    unread: false,
    avatarSeed: "mia-harris-travel",
    initials: "MH",
  },
  {
    id: 14,
    sender: "Elijah Martin",
    email: "alerts@securewatch.io",
    subject: "Security alert: new login detected",
    preview:
      "We noticed a sign-in to your account from Berlin, Germany at 2:14 AM. Browser: Chrome on Windows. If this was you, no action is needed.",
    time: "Thu",
    unread: false,
    avatarSeed: "elijah-martin-alert",
    initials: "EM",
  },
  {
    id: 15,
    sender: "Charlotte Garcia",
    email: "charlotte.g@personal.me",
    subject: "Weekend plans?",
    preview:
      "Hey! Are you free Saturday afternoon? A few of us are thinking of heading to the lake. Nothing fancy — just bring a towel and snacks. Let me know!",
    time: "Wed",
    unread: false,
    avatarSeed: "charlotte-garcia-wknd",
    initials: "CG",
  },
]

export default async function InboxPage() {
  const t = await getI18n()
  return (
    <div className="flex h-screen gap-2 bg-primary p-2">
      <ResizablePanelGroup orientation="horizontal" className="gap-1">
        <ResizablePanel
          defaultSize={450}
          maxSize={600}
          minSize={300}
          className="flex flex-col rounded-2xl bg-background"
        >
          <div className="shrink-0 space-y-4 p-6 lg:p-8">
            <div>
              <h3 className="text-2xl leading-normal font-bold">
                {t("mail.inbox.title")}
              </h3>
              <p className="text-sm leading-normal opacity-70">
                {t("mail.inbox.description")}
              </p>
            </div>
            <ComposeEmailDialog />
          </div>
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-1 px-2 pb-4">
              {MOCK_EMAILS.map((mail) => (
                <div
                  key={mail.id}
                  className="flex cursor-pointer items-start gap-4 rounded-xl bg-transparent p-4 transition-colors hover:bg-accent"
                >
                  <Avatar className="mt-0.5 size-12 shrink-0">
                    <AvatarImage
                      src={`https://i.pravatar.cc/48?u=${mail.avatarSeed}`}
                      alt={mail.sender}
                    />
                    <AvatarFallback>{mail.initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">
                        {mail.sender}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {mail.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-sm font-medium">
                        {mail.subject}
                      </h4>
                      {mail.unread && (
                        <Badge className="size-2 shrink-0 rounded-full p-0" />
                      )}
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {mail.preview}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className="opacity-0 transition-opacity hover:opacity-100"
        />
        <ResizablePanel className="rounded-2xl bg-background">
          Two
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
