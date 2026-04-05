import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY is missing. Stripe will not be initialized correctly.");
}

const key = process.env.STRIPE_SECRET_KEY || "dummy_key_for_build";

export const stripe = new Stripe(key, {
  apiVersion: "2026-03-25.dahlia", // specify latest stable API version or match installed package
  typescript: true,
});
