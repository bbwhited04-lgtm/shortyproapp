import "react-native-get-random-values";
import "react-native-reanimated";
import { LogBox } from "react-native";
import "./global.css";
import "expo-router/entry";
LogBox.ignoreLogs(["Expo AV has been deprecated", "Disconnected from Metro"]);
import Fastify from "fastify";
import rawBody from "@fastify/raw-body";
import { mobileBillingRoutes } from "./routes/mobileBilling.js";
import { stripeWebhookRoutes } from "./routes/stripeWebhook.js";

export async function buildServer() {
  const app = Fastify({ logger: true });

  // ✅ Adds req.rawBody ONLY when route config says it needs it
  await app.register(rawBody, {
    field: "rawBody",     // req.rawBody
    global: false,        // don't affect all routes
    encoding: false,      // keep as Buffer
    runFirst: true,
  });

  // ✅ Normal routes
  await app.register(mobileBillingRoutes);

  // ✅ Stripe webhook route (will use rawBody)
  await app.register(stripeWebhookRoutes);

  return app;
}

// If this is the actual entrypoint:
const app = await buildServer();
await app.listen({ port: Number(process.env.PORT || 3001), host: "0.0.0.0" });
