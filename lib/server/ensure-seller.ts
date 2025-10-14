// lib/server/ensure-seller.ts
import { q } from "@/lib/db";

/**
 * Ensure the user has a sellers row and their users.seller_id is set.
 * Returns the seller_id.
 */
export async function ensureSellerForUser(userId: string): Promise<string> {
  // If already set, just return it
  const existing = await q<{ seller_id: string | null }>`
    SELECT seller_id FROM public.users WHERE id = ${userId}::uuid
  `;
  const current = existing[0]?.seller_id;
  if (current) return current;

  // Create a seller row
  const inserted = await q<{ id: string }>`
    INSERT INTO public.sellers (name)
    VALUES (${`Seller for user ${userId}`})
    RETURNING id
  `;
  const sellerId = inserted[0].id;

  // Attach to user and set role='seller'
  await q`
    UPDATE public.users
    SET seller_id = ${sellerId}::uuid, role = 'seller'
    WHERE id = ${userId}::uuid
  `;

  return sellerId;
}
