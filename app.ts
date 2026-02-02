import Fastify from "fastify";
import rawBody from "@fastify/raw-body";

import { mobileBillingRoutes } from "./src/routes/mobileBilling";
import { stripeWebhookRoutes } from "./src/routes/stripeWebhook";

export function buildApp() {
  const app = Fastify({ logger: true });

  // ✅ Stripe webhook needs raw body (Buffer) for signature verification
  app.register(rawBody, {
    field: "rawBody",   // req.rawBody
    global: false,      // only on routes that request it
    encoding: false,    // keep as Buffer
    runFirst: true,
  });

  // ✅ Normal JSON routes
  app.register(mobileBillingRoutes);

  // ✅ Webhook route (will use rawBody)
  app.register(stripeWebhookRoutes);

  return app;
}
