import { loadStripe } from "@stripe/stripe-js"

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

// Card payments are optional (mobile money works without Stripe configured at
// all) — never let a missing key throw at module load and crash the whole
// onboarding page for users who aren't even paying by card.
export const stripePromise = publishableKey ? loadStripe(publishableKey) : null
