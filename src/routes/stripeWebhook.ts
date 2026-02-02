import { FastifyInstance } from "fastify";
import { stripe } from "../billing/stripe.js";
import { pool } from "../db.js";
import { tierFromPriceId } from "../billing/prices.js";

export async function stripeWebhookRoutes(app: FastifyInstance) {
  app.post(
    "/api/stripe/webhook",
    {
      config: { rawBody: true },
    },
    async (req: any, reply) => {
      const sig = req.headers["stripe-signature"];
      if (!sig) return reply.code(400).send("Missing stripe-signature");

      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.rawBody, // raw buffer/string
          sig,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      } catch (err: any) {
        return reply.code(400).send(`Webhook signature failed: ${err.message}`);
      }

      // Helpers
      const upsertEntitlement = async (userId: string, patch: any) => {
        const {
          tier = "free",
          active = false,
          stripe_subscription_id = null,
          current_period_end = null,
        } = patch;

        await pool.query(
          `insert into billing_entitlements(user_id, tier, active, stripe_subscription_id, current_period_end)
           values ($1, $2, $3, $4, $5)
           on conflict (user_id)
           do update set tier = excluded.tier,
                        active = excluded.active,
                        stripe_subscription_id = excluded.stripe_subscription_id,
                        current_period_end = excluded.current_period_end,
                        updated_at = now()`,
          [userId, tier, active, stripe_subscription_id, current_period_end]
        );
      };

      // === Handle events ===
      switch (event.type) {
        // Subscription created/updated: set tier based on subscription items
        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const sub = event.data.object as any;
          const userId =
            sub.metadata?.user_id ||
            sub.customer_metadata?.user_id ||
            null;

          if (!userId) break;

          const priceId = sub.items?.data?.[0]?.price?.id;
          const tier = priceId ? tierFromPriceId(priceId, process.env) : null;

          await upsertEntitlement(userId, {
            tier: tier ?? "free",
            active: sub.status === "active" || sub.status === "trialing",
            stripe_subscription_id: sub.id,
            current_period_end: sub.current_period_end
              ? new Date(sub.current_period_end * 1000).toISOString()
              : null,
          });

          break;
        }

        // Subscription deleted: downgrade
        case "customer.subscription.deleted": {
          const sub = event.data.object as any;
          const userId = sub.metadata?.user_id || null;
          if (!userId) break;

          await upsertEntitlement(userId, {
            tier: "free",
            active: false,
            stripe_subscription_id: null,
            current_period_end: null,
          });

          break;
        }

        // Checkout completed:
        // - For subscriptions, subscription events will handle tier.
        // - For lifetime (one-time), we set tier here.
        case "checkout.session.completed": {
          const session = event.data.object as any;
          const userId = session.metadata?.user_id || session.client_reference_id || null;
          if (!userId) break;

          if (session.mode === "payment") {
            // lifetime purchase
            await upsertEntitlement(userId, {
              tier: "lifetime",
              active: true,
              stripe_subscription_id: null,
              current_period_end: null,
            });
          }
          break;
        }

        default:
          break;
      }

      return reply.send({ received: true });
    }
  );
}
