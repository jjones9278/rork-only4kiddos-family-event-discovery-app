// Stripe key management.
//
// In TEST mode the mobile app uses the publishable key bundled in .env
// (EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY, must be a pk_test_…).
//
// In LIVE mode the mobile app does NOT bundle a live key. Instead it expects
// Laravel to return a `publishableKey` alongside the bookings response so the
// key can be rotated server-side without an app release. The checkout screen
// calls `initStripe({ publishableKey })` dynamically when that field arrives.
//
// Flip this flag to switch modes. The Laravel server's STRIPE_SECRET must be
// in the same mode (sk_test_… for test, sk_live_… for live) or Stripe will
// refuse the payment intent with the "No such payment intent" error.

export const STRIPE_TEST_MODE = true;

export const STRIPE_TEST_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

export function getInitialStripePublishableKey(): string {
  return STRIPE_TEST_MODE ? STRIPE_TEST_PUBLISHABLE_KEY : '';
}

// ─── DEV-ONLY: bypass Laravel for Stripe testing ─────────────────────────────
//
// When STRIPE_BYPASS_LARAVEL_FOR_TESTING is true the app does NOT call
// POST /api/bookings. Instead it creates a PaymentIntent directly against
// api.stripe.com using STRIPE_TEST_SECRET_KEY (a sk_test_…). The flow
// exercises the mobile Payment Sheet UI but does NOT touch Laravel's
// bookings table — useful only for verifying client-side wiring.
//
// HARD RULES, enforced below:
//   1. Helper REFUSES to run unless the key starts with `sk_test_`. A live
//      secret will throw immediately.
//   2. Set this flag to false (and remove EXPO_PUBLIC_STRIPE_TEST_SECRET_KEY
//      from .env) before any production build. The secret would otherwise
//      ship inside the JS bundle on every user's device.

export const STRIPE_BYPASS_LARAVEL_FOR_TESTING = true;

const STRIPE_TEST_SECRET_KEY = process.env.EXPO_PUBLIC_STRIPE_TEST_SECRET_KEY || '';

export async function createTestPaymentIntentDirect(amountUsd: number): Promise<{ clientSecret: string; id: string }> {
  if (!STRIPE_TEST_SECRET_KEY.startsWith('sk_test_')) {
    throw new Error('STRIPE_BYPASS_LARAVEL_FOR_TESTING is on but EXPO_PUBLIC_STRIPE_TEST_SECRET_KEY is missing or not a test key (must start with sk_test_).');
  }
  const amountCents = Math.max(50, Math.round(amountUsd * 100));   // Stripe minimum
  // payment_method_types[]=card forces card-only — hides Link, bank, Cash App,
  // and anything else enabled on the Stripe account.
  const body = new URLSearchParams({
    amount: String(amountCents),
    currency: 'usd',
    'payment_method_types[]': 'card',
  }).toString();

  console.log('[Stripe] POST /v1/payment_intents', body);
  const res = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRIPE_TEST_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  const data = await res.json();
  console.log('[Stripe] PaymentIntent created', {
    id: data.id,
    payment_method_types: data.payment_method_types,
    automatic_payment_methods: data.automatic_payment_methods,
  });
  if (!res.ok) {
    throw new Error(data?.error?.message || `Stripe API error ${res.status}`);
  }
  return { clientSecret: data.client_secret, id: data.id };
}
