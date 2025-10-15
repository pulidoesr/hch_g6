'use server';

import { auth } from '@/auth';
import { deleteSellerProduct } from '@/lib/repositories/sellerProducts';
import { revalidatePath } from 'next/cache';

export async function deleteProductAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const session = await auth();
  const role = (session?.user as any)?.role;
  const sellerId = (session?.user as any)?.sellerId;

  if (!session || role !== 'seller' || !sellerId) {
    throw new Error('Forbidden');
  }

  const deleted = await deleteSellerProduct(sellerId, id);
  if (!deleted) {
    throw new Error('Not found or not owned by this seller');
  }

  // Refresh the seller dashboard
  revalidatePath('/seller');
}
