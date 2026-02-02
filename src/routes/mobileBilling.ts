import { FastifyInstance } from "fastify";
import { stripe } from "../billing/stripe.js";
import { pool } from "../db.js";
import type { Tier } from "../billing/prices.js";

function assertEnv(name: string) {
  if (!process.env[name]) throw new Error(`Missing env: ${name}`);
}

async function getOrCreateCustomer(userId: string) {
  const existing = await pool.query(
    `select stripe_customer_id from billing_customers where user_id = $1`,
    [userId]
  );
  if (existing.rowCount) return existing.rows[0].stripe_customer_id as string;

  const customer = await stripe.customers.create({
    metadata: { user_id: userId },
  });

  await pool.query(
    `insert into billing_customers(user_id, stripe_customer_id)
     values ($1, $2)
     on conflict (user_id) do update set stripe_customer_id = excluded.stripe_customer_id, updated_at = now()`,
    [userId, customer.id]
  );

  return customer.id;
}

function tierFromPlan(plan: string): Tier {
  if (plan === "starter") return "starter";
  if (plan === "pro") return "pro";
  if (plan === "lifetime") return "lifetime";
  throw new Error("Invalid plan");
}

function priceIdForTier(tier: Tier): string {
  if (tier === "starter") return process.env.PRICE_STARTER!;
  if (tier === "pro") return process.env.PRICE_PRO!;
  if (tier === "lifetime") return process.env.PRICE_LIFETIME!;
  throw new Error("No price for tier");
}

export async function mobileBillingRoutes(app: FastifyInstance) {
  assertEnv("APP_BASE_URL");
  assertEnv("MOBILE_SUCCESS_URL");
  assertEnv("MOBILE_CANCEL_URL");
  assertEnv("PRICE_STARTER");
  assertEnv("PRICE_PRO");

  // NOTE: Replace this with your real auth
  // For now, assume user_id comes from header.
  function getUserId(req: any) {
    const userId = req.headers["x-user-id"];
    if (!userId || typeof userId !== "string") throw new Error("Missing x-user-id");
    return userId;
  }

  // 1) Create Stripe Checkout session
  app.post("/api/mobile/billing/checkout", async (req, reply) => {
    const userId = getUserId(req);
    const body = req.body as { plan: "starter" | "pro" | "lifetime" };
    const tier = tierFromPlan(body.plan);

    const customerId = await getOrCreateCustomer(userId);

    const mode = tier === "lifetime" ? "payment" : "subscription";
    if (tier === "lifetime" && !process.env.PRICE_LIFETIME) {
      throw new Error("PRICE_LIFETIME not configured");
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode,
      line_items: [{ price: priceIdForTier(tier), quantity: 1 }],
      success_url: `${process.env.MOBILE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.MOBILE_CANCEL_URL}`,
      allow_promotion_codes: true,
      client_reference_id: userId,
      metadata: { user_id: userId, requested_tier: tier },
    });

    return reply.send({ url: session.url });
  });

  // 2) Subscription status for the app
  app.get("/api/mobile/billing/status", async (req, reply) => {
    const userId = getUserId(req);

    const res = await pool.query(
      `select tier, active, current_period_end from billing_entitlements where user_id = $1`,
      [userId]
    );

    if (!res.rowCount) {
      return reply.send({ tier: "free", active: false, current_period_end: null });
    }

    return reply.send(res.rows[0]);
  });

  // 3) Customer Portal
  app.post("/api/mobile/billing/portal", async (req, reply) => {
    const userId = getUserId(req);

    const r = await pool.query(
      `select stripe_customer_id from billing_customers where user_id = $1`,
      [userId]
    );
    if (!r.rowCount) throw new Error("No Stripe customer for user");

    const portal = await stripe.billingPortal.sessions.create({
      customer: r.rows[0].stripe_customer_id,
      return_url: process.env.APP_BASE_URL!,
    });

    return reply.send({ url: portal.url });
  });
}
