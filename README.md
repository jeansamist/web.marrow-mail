# MarrowMail — redesigned landing page

A from-scratch Next.js 15 (App Router) + Tailwind v4 rebuild of the marketing
page, addressing the audit findings from the live site
(`web-marrowmail.vercel.app`).

## Setup

Node.js wasn't available in the environment this was built in, so the build
has not been run or type-checked yet. To get it running:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## What changed, and why

| Audit finding | Fix |
|---|---|
| Entire site (headline + body) set in Geist **Mono** | `font-sans` (Geist Sans) for all prose/headings; mono reserved for prices, stats, domains, and labels — see `app/layout.tsx` + `app/globals.css` |
| Hero headline was a `<div>`, no `<h1>` on the page | Real `<h1>` in `components/marketing/hero.tsx`; proper `<h2>` per section via `components/marketing/section.tsx` |
| `leading-normal` on 7xl display text | `leading-[1.05] tracking-tight` on the hero headline |
| Every section same visual weight, no rhythm | `Section` primitive supports a `tone` prop (`light` / `muted` / `ink`); Reliability + closing CTA use the `ink` tone to break up an all-white page |
| Inconsistent currency label (XAF vs CFA) | Standardized on **XAF** everywhere |
| Mobile nav hides the CTA behind a hamburger | Nav is now `sticky`, and a persistent `MobileCtaBar` stays pinned to the bottom on small screens |
| Copy typos ("guded," "entreprise," "comunnication," "evry," "adrdresses," "utilies") | Corrected throughout |
| 14 testimonials duplicated to 28 for an infinite marquee | Trimmed to 6 curated, non-duplicated testimonials |
| Inline ~140-character `className` strings on buttons | `Button` extracted into `class-variance-authority` variants (`components/ui/button.tsx`) |
| Hand-built inbox mockup used generic/placeholder content | Mockup now shows the actual custom-domain address (`victor@yourcompany.com`) and realistic business subject lines, reinforcing the trust pitch instead of a generic screenshot |
| No visible loading state behind the page's Suspense boundary | Not reproducible in this fresh build (no server-streamed data yet) — flagging as a reminder: if you reintroduce async/streamed sections, pair them with a skeleton that mirrors the real layout |

## Structure

```
app/
  layout.tsx        Geist Sans + Geist Mono, metadata
  page.tsx           Assembles all sections
  globals.css         Design tokens (@theme), base styles
components/
  ui/
    button.tsx        cva-based Button variants
  marketing/
    section.tsx        Shared section layout primitive (eyebrow/title/description/tone)
    nav.tsx             Sticky header, responsive menu
    hero.tsx
    trust-strip.tsx     "Gmail vs custom domain" contrast block
    features.tsx        2 primary feature blocks + 4 secondary
    compare.tsx          Comparison table vs Google Workspace / Microsoft 365
    testimonials.tsx
    reliability.tsx      Dark "ink" toned section
    pricing.tsx
    faq.tsx              Accordion
    cta.tsx              Closing dark CTA band
    footer.tsx
    mobile-cta-bar.tsx   Persistent bottom CTA on mobile
lib/
  utils.ts            cn() helper (clsx + tailwind-merge)
```

## Known gaps to close before shipping

- The hero "product mockup" is still a hand-built DOM approximation, not a
  real product screenshot. Swap in an actual inbox screenshot when you have
  brand-accurate UI to capture — it will read as more credible than any
  mockup, however polished.
- No real testimonial photos/logos — consider adding company logos if you
  have permission, since that's a stronger trust signal than initials avatars.
- `/signup` and `/sign-in` are placeholder routes; wire them to your actual
  auth/checkout flow.
