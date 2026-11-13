// One place for everything Whop. Plans are in the "Lean Keep" business (biz_xxn1n8RArqWOuV).
// All four plans were created HIDDEN on 10 Nov 2026. Hidden plans still work as direct checkout
// links, which is all the app needs. Nothing here is a secret.
export type PaidTier = "care" | "growth";

export type WhopPlan = {
  tier: PaidTier;
  founding: boolean;
  productId: string;
  planId: string;
  price: number;
  checkoutUrl: string;
};

const plan = (tier: PaidTier, founding: boolean, productId: string, planId: string, price: number): WhopPlan => ({
  tier,
  founding,
  productId,
  planId,
  price,
  checkoutUrl: `https://whop.com/checkout/${planId}`,
});

export const WHOP_PLANS: WhopPlan[] = [
  plan("care", false, "prod_Sekd1ChkFqqK6", "plan_8tnneDa1AiqYi", 49),
  plan("care", true, "prod_Sekd1ChkFqqK6", "plan_83fVGMKdf3J9r", 29),
  plan("growth", false, "prod_kyxjs9MLL5H96", "plan_0bF14CSmRXbQg", 99),
  plan("growth", true, "prod_kyxjs9MLL5H96", "plan_GV13tzo4oC1Ph", 69),
];

export function findPlan(tier: PaidTier, founding: boolean): WhopPlan {
  const found = WHOP_PLANS.find((item) => item.tier === tier && item.founding === founding);
  if (!found) throw new Error(`No Whop plan for ${tier}${founding ? " (founding)" : ""}`);
  return found;
}

/** The checkout link, with the buyer's login email filled in so the payment can be matched to their account. */
export function checkoutHref(tier: PaidTier, founding: boolean, email?: string | null): string {
  const url = new URL(findPlan(tier, founding).checkoutUrl);
  if (email) url.searchParams.set("email", email);
  return url.toString();
}

/** Where a paying customer manages or cancels their Whop subscription. */
export const WHOP_MANAGE_URL = "https://whop.com/hub/";
