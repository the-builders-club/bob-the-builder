import { Github, Globe, Linkedin, PencilIcon } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { XTwitterIcon } from '@/components/ui/icons';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Routes } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type ProfileHeaderProps = {
  profile: Profile;
  isOwner?: boolean;
  buildsCount?: number;
  totalUpvotes?: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Social link configuration — maps a profile field to an icon and label.
 * Each entry is only rendered when the corresponding URL is non-null.
 */
const SOCIAL_LINKS = [
  { key: 'github_url', icon: Github, label: 'GitHub' },
  { key: 'twitter_url', icon: XTwitterIcon, label: 'X (Twitter)' },
  { key: 'linkedin_url', icon: Linkedin, label: 'LinkedIn' },
  { key: 'website_url', icon: Globe, label: 'Website' },
] as const;

// ---------------------------------------------------------------------------
// ProfileHeader
// ---------------------------------------------------------------------------

/**
 * Renders the profile header section: card-wrapped horizontal layout with
 * gradient cover, square-rounded avatar, display name, bio, social links,
 * and a stats summary. All social/display fields are nullable — fields are
 * hidden rather than showing empty placeholders.
 */
export function ProfileHeader({
  profile,
  isOwner = false,
  buildsCount = 0,
  totalUpvotes = 0,
}: ProfileHeaderProps) {
  const displayName = profile.display_name ?? 'Anonymous';

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Cover gradient */}
      <div className="h-32 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-900" />

      {/* Content area — left-aligned */}
      <div className="px-6 pb-6">
        {/* Top row: Avatar left, Stats right */}
        <div className="flex items-start justify-between">
          {/* Avatar with edit overlay */}
          <div className="relative -mt-12 w-fit">
            <Avatar
              className={cn(
                'size-24 shrink-0 rounded-2xl ring-4 ring-background shadow-lg'
              )}
            >
              {profile.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={displayName} />
              )}
              <AvatarFallback className="rounded-2xl text-2xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {isOwner && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={Routes.PROFILE_SETTINGS}
                    className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-lg border border-border bg-muted shadow-lg transition-all hover:scale-110 hover:bg-accent"
                  >
                    <PencilIcon className="size-3.5 text-foreground" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Edit Profile</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Stats */}
          <div className="mt-3 flex items-center gap-6">
            <div className="text-center">
              <div className="font-display text-2xl text-foreground">
                {buildsCount}
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Builds
              </div>
            </div>

            <div className="h-10 w-px bg-border" />

            <div className="text-center">
              <div className="font-display text-2xl text-foreground">
                {totalUpvotes}
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Upvotes
              </div>
            </div>
          </div>
        </div>

        {/* Name */}
        <h1 className="mt-4 font-display text-2xl text-foreground">
          {displayName}
        </h1>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-1 text-sm text-muted-foreground">{profile.bio}</p>
        )}

        {/* Joined date */}
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          Joined{' '}
          {new Date(profile.created_at).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </p>

        {/* Social links */}
        <div className="mt-3">
          <SocialLinks profile={profile} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SocialLinks (internal)
// ---------------------------------------------------------------------------

function SocialLinks({ profile }: { profile: Profile }) {
  const links = SOCIAL_LINKS.filter((link) => profile[link.key] !== null);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {links.map(({ key, icon: Icon, label }) => (
        <a
          key={key}
          href={profile[key]!}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon className="size-3.5" />
          {label}
        </a>
      ))}
    </div>
  );
}
