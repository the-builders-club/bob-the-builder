import { notFound } from 'next/navigation';

import { ProfileSettingsForm } from '@/components/profile/profile-settings-form';
import { requireUser } from '@/lib/auth';
import { getProfileById } from '@/lib/queries/profiles';

export default async function ProfileSettingsPage() {
  const user = await requireUser();
  const { data: profile } = await getProfileById(user.id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Section header */}
      <div className="mb-2 flex items-center gap-3">
        <span className="inline-block size-1.5 rounded-full bg-amber-500" />
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Settings
        </span>
      </div>
      <h1 className="mb-2 font-display text-4xl text-foreground">
        Profile Settings
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Update your profile information and social links.
      </p>
      <div className="mb-10 border-t border-border" />

      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-border bg-card p-8">
          <ProfileSettingsForm initialData={profile} />
        </div>
      </div>
    </div>
  );
}
