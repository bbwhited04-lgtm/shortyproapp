export type Tier = "free" | "starter" | "pro" | "lifetime";

export function tierFromPriceId(priceId: string, env: NodeJS.ProcessEnv): Tier | null {
  if (priceId === env.PRICE_STARTER) return "starter";
  if (priceId === env.PRICE_PRO) return "pro";
  if (env.PRICE_LIFETIME && priceId === env.PRICE_LIFETIME) return "lifetime";
  return null;
}
