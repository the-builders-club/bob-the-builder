'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@/lib/auth';
import { toggleUpvote } from '@/lib/queries/upvotes';

export async function toggleUpvoteAction(buildId: string) {
  const user = await requireUser();

  const { data, error } = await toggleUpvote(buildId, user.id);

  if (error) {
    throw new Error('Failed to toggle upvote');
  }

  revalidatePath(`/builds/${buildId}`);
  revalidatePath('/');

  return data;
}
