export type MockEmail = {
  id: number
  sender: string
  email: string
  subject: string
  preview: string
  body: string
  time: string
  unread: boolean
  avatarSeed: string
  initials: string
}

export const MOCK_EMAILS: MockEmail[] = [
  {
    id: 1,
    sender: "Sarah Johnson",
    email: "sarah.johnson@acme.io",
    subject: "Project proposal feedback",
    preview:
      "Hey, I reviewed the proposal you sent over. Overall it looks really solid — a few minor points I wanted to flag before we present it to the board next week.",
    body: `Hey,

I reviewed the proposal you sent over. Overall it looks really solid — a few minor points I wanted to flag before we present it to the board next week.

1. The budget section on page 4 is missing the infrastructure line item. Can you add a rough estimate?
2. The timeline feels a bit optimistic for Q3. I'd suggest adding a 2-week buffer after the beta launch.
3. Love the executive summary — clear and concise.

Let me know when you've updated it and I'll give it a final read before Thursday.

Best,
Sarah`,
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
    body: `Hi team,

Here are the notes from this morning's standup:

**Done:**
- Merged PR #214 (auth refactor) ✅
- Deployed hotfix to production ✅

**In progress:**
- API rate-limit investigation (James)
- Design system update (Ava)

**Blockers:**
- Deployment pipeline is flaky on staging — failing about 30% of the time on the lint step. Noah is looking into it.

Action items are assigned in Linear. Please check your backlog and update ticket statuses by EOD.

Thanks,
Michael`,
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
    body: `Hello,

Please find attached your invoice for the month of June 2026.

Invoice #4521
Amount due: $1,240.00
Due date: July 17, 2026

Payment can be made via bank transfer or credit card through our billing portal. If you have any questions about the line items, don't hesitate to reach out.

Thank you for your continued business.

Best regards,
Emma Williams
Fincraft Billing Team`,
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
    body: `Hi,

We're integrating your API into our platform and ran into a rate-limit issue on the /messages endpoint. We're currently hitting the 100 req/min limit during our load tests.

Is there a way to request a higher quota for our account? We're on the Pro plan and expect to need around 500 req/min in production.

Also — is there a webhook alternative for receiving new messages instead of polling? That would help us reduce our request count significantly.

Thanks in advance!
James`,
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
    body: `Hi,

Just a quick heads-up — the Q2 review has been moved from Wednesday to Thursday at 3 PM CET. The Zoom link stays the same.

Agenda remains unchanged:
- Revenue breakdown by channel
- Churn analysis
- Roadmap priorities for Q3

Please let me know ASAP if Thursday doesn't work and we'll find another slot.

Thanks,
Olivia`,
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
    body: `Hey, welcome aboard! 🎉

We're so glad to have you on the team. Here's everything you need to get started:

**Tool access:**
- Slack invite: check your inbox
- Linear: liam will add you today
- GitHub org: request access in #dev-onboarding

**Your onboarding buddy:** Charlotte Garcia (charlotte.g@personal.me)

**Onboarding checklist:** shared in Notion — link in Slack #welcome

Your first week is intentionally low-pressure. Shadow some meetings, read through the codebase, and ask all the questions you want.

Looking forward to building great things with you.

Liam`,
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
    body: `Great news — your order is on its way!

Order: #ORD-88213
Carrier: FedEx
Tracking number: 7489 2310 8821 3004

Estimated delivery: June 19–21, 2026

You can track your package in real time at fedex.com or through the ShopFast app.

If you have any issues with your delivery, contact our support team at support@shopfast.store.

Thanks for shopping with us!
The ShopFast Team`,
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
    body: `Hi,

This is a confirmation that your password was successfully reset on June 15, 2026 at 10:32 AM UTC.

If you made this change, no further action is needed.

If you did NOT request this change, please contact our support team immediately at security@accounts.co or call +1 800 555 0192. We'll lock your account and help you recover it.

Stay safe,
The Accounts Security Team`,
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
    body: `Hey!

The Figma file is updated with all three homepage variants. Here's a quick summary:

**V1** — Keeps the current layout, minor polish. Safe choice.
**V2** — Cleaner hero, more whitespace, single CTA. My personal favourite.
**V3** — Bold gradient hero, stronger contrast, more "startup energy."

I'd love your thoughts, especially on the hero section. A quick async comment in Figma works perfectly if you don't want to schedule a call.

Link: figma.com/file/… (you should already have access)

Let me know by Wednesday so we can hand off to devs before the sprint.

Ava`,
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
    body: `Happy birthday!! 🎂🥳

Hope you're having an absolutely amazing day. The team and I got you something small — check your desk drawer when you get in, you'll find a little surprise waiting.

Drinks are on me tonight. We're thinking The Anchor at 7 PM — no pressure but it'd be great to celebrate with you.

Have a wonderful day!

Will`,
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
    body: `Hi,

This is a reminder that your SaasApp Pro subscription will automatically renew on July 1, 2026.

Plan: Pro
Renewal amount: $49.00 / month
Card on file: Visa ending in 4242

No action is needed if you'd like to continue. To update your payment method, switch plans, or cancel, visit your billing portal at saasapp.io/billing.

Thank you for being a Pro subscriber!

The SaasApp Team`,
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
    body: `Hi,

Someone replied to your post "Best practices for email auth in Next.js":

---

> Great write-up! One thing to add — consider using httpOnly cookies for token storage instead of localStorage. It's much harder to steal via XSS and the middleware can still read it server-side. Here's a quick example: [...]

---

Reply or view the full thread at devforum.dev/posts/email-auth-nextjs.

You can manage your notification preferences in your account settings.

The DevForum Team`,
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
    body: `Your booking is confirmed! ✈️

Flight: AA204
Route: New York JFK → Los Angeles LAX
Departure: June 22, 2026 at 7:15 AM
Arrival: June 22, 2026 at 10:44 AM (local time)
Seat: 14A (Window)
Class: Economy

Check-in opens 24 hours before departure. You can check in online at aa.com or at the airport kiosk.

Boarding pass will be available 24h before the flight in the American Airlines app.

Have a great trip!
Mia Harris — Travel.com Bookings`,
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
    body: `Security alert ⚠️

We detected a new sign-in to your account:

Location: Berlin, Germany
Time: June 15, 2026 at 2:14 AM UTC
Device: Chrome on Windows 11
IP: 185.220.101.47

If this was you, no action is needed.

If you don't recognize this sign-in, please:
1. Change your password immediately at securewatch.io/settings
2. Enable two-factor authentication
3. Contact us at security@securewatch.io

Stay secure,
The SecureWatch Team`,
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
    body: `Hey!

Are you free Saturday afternoon? A few of us are thinking of heading to the lake — probably around 2 PM. Nothing fancy, just a chill afternoon in the sun.

Just bring a towel, sunscreen, and whatever snacks you feel like. We'll handle the drinks.

We're meeting at the parking lot by the north entrance. Let me know if you're in (or if you want me to swing by and pick you up)!

Charlotte 🌊`,
    time: "Wed",
    unread: false,
    avatarSeed: "charlotte-garcia-wknd",
    initials: "CG",
  },
]
