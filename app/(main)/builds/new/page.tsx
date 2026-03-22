import { BuildForm } from '@/components/builds/build-form';
import { requireUser } from '@/lib/auth';
import { getAiTools } from '@/lib/queries/ai-tools';
import { getTechStackTags } from '@/lib/queries/tech-stack-tags';

export default async function NewBuildPage() {
  await requireUser();

  const [
    { data: aiTools, error: aiToolsError },
    { data: techStackTags, error: techStackTagsError },
  ] = await Promise.all([getAiTools(), getTechStackTags()]);

  if (aiToolsError || techStackTagsError) {
    throw new Error('Failed to load form data');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Section header — matches HTML exploration */}
      <div className="mb-2 flex items-center gap-3">
        <span className="inline-block size-1.5 rounded-full bg-amber-500" />
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Submit
        </span>
      </div>
      <h1 className="mb-2 font-display text-4xl text-foreground">
        Submit a Build
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Share what you shipped. Keep it real — what you built, how AI helped,
        and what you learned.
      </p>
      <div className="mb-10 border-t border-border" />

      {/* Form card */}
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-border bg-card p-8">
          <BuildForm
            aiTools={aiTools ?? []}
            techStackTags={techStackTags ?? []}
          />
        </div>
      </div>
    </div>
  );
}
