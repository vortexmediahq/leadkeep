import { checkoutHref, type PaidTier } from "@/lib/whop-config";

/**
 * Payments go through Whop. The checkout link carries the buyer's login email so the
 * Whop webhook (supabase/proposed/functions/whop-webhook) can match the payment to the account.
 */
export function startCheckout(tier: PaidTier, founding: boolean, email: string | null | undefined): string {
  return checkoutHref(tier, founding, email);
}

export { WHOP_MANAGE_URL as MANAGE_URL } from "@/lib/whop-config";
