import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
  typescript: true,
});

export const PLANS = {
  pro: {
    name: "Pro",
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      "Unlimited scans",
      "5 sites",
      "6 months history",
      "AI suggestions",
      "Priority support",
    ],
  },
  team: {
    name: "Team",
    price: 79,
    priceId: process.env.STRIPE_TEAM_PRICE_ID!,
    features: [
      "Everything in Pro",
      "20 sites",
      "12 months history",
      "Team seats",
      "White-label reports",
      "Competitive tracking",
    ],
  },
};

export async function createCheckoutSession(
  userId: string,
  email: string,
  plan: "pro" | "team",
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: PLANS[plan].priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      plan,
    },
  });

  return session;
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}
