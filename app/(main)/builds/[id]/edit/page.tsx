import { notFound, redirect } from 'next/navigation';

import { BuildForm } from '@/components/builds/build-form';
import { requireUser } from '@/lib/auth';
import { buildRoute } from '@/lib/constants/routes';
import { getAiTools } from '@/lib/queries/ai-tools';
import { getBuildById } from '@/lib/queries/builds';
import { getTechStackTags } from '@/lib/queries/tech-stack-tags';
import { isUuid } from '@/lib/utils';

type EditBuildPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBuildPage({ params }: EditBuildPageProps) {
  const { id } = await params;

  if (!isUuid(id)) {
    notFound();
  }

  const [
    user,
    { data: build },
    { data: aiTools, error: aiToolsError },
    { data: techStackTags, error: techStackTagsError },
  ] = await Promise.all([
    requireUser(),
    getBuildById(id),
    getAiTools(),
    getTechStackTags(),
  ]);

  if (!build) {
    notFound();
  }

  if (aiToolsError || techStackTagsError) {
    throw new Error('Failed to load form data');
  }

  // Builds are public, so redirecting non-owners to the view page is
  // preferred over notFound() — 404 would be confusing for a publicly-visible build.
  if (build.user_id !== user.id) {
    redirect(buildRoute(build.id));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Section header */}
      <div className="mb-2 flex items-center gap-3">
        <span className="inline-block size-1.5 rounded-full bg-amber-500" />
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Edit
        </span>
      </div>
      <h1 className="mb-2 font-display text-4xl text-foreground">Edit Build</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Update your build details. Changes are saved immediately.
      </p>
      <div className="mb-10 border-t border-border" />

      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-border bg-card p-8">
          <BuildForm
            mode="edit"
            initialData={build}
            aiTools={aiTools ?? []}
            techStackTags={techStackTags ?? []}
          />
        </div>
      </div>
    </div>
  );
}
