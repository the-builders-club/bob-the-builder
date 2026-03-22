import { notFound } from 'next/navigation';

import { ProfileBuildList } from '@/components/profile/profile-build-list';
import { ProfileHeader } from '@/components/profile/profile-header';
import { getUser } from '@/lib/auth';
import { getBuildsForUser } from '@/lib/queries/builds';
import { getProfileById } from '@/lib/queries/profiles';
import { isUuid } from '@/lib/utils';

type PublicProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { id } = await params;

  if (!isUuid(id)) {
    notFound();
  }

  const [user, { data: profile }, { data: builds, error: buildsError }] =
    await Promise.all([getUser(), getProfileById(id), getBuildsForUser(id)]);

  if (!profile) {
    notFound();
  }

  if (buildsError) {
    throw buildsError;
  }

  const isOwner = user?.id === profile.id;

  const safeBuilds = builds ?? [];
  const buildsCount = safeBuilds.length;
  const totalUpvotes = safeBuilds.reduce((sum, b) => sum + b.upvote_count, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-10">
        <ProfileHeader
          profile={profile}
          isOwner={isOwner}
          buildsCount={buildsCount}
          totalUpvotes={totalUpvotes}
        />
        <ProfileBuildList
          builds={safeBuilds}
          displayName={profile.display_name ?? 'this builder'}
        />
      </div>
    </div>
  );
}
