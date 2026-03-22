'use client';

import { ChevronsUpDownIcon, XIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { CommandCheckbox } from '@/components/ui/command-checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AI_TOOL_PARAM,
  BUILD_TYPE_LABELS,
  BUILD_TYPE_PARAM,
  TECH_STACK_PARAM,
} from '@/lib/constants/builds';
import { cn } from '@/lib/utils';
import type { AiTool, BuildType, TechStackTag } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** All build type keys in display order. */
const BUILD_TYPES = Object.keys(BUILD_TYPE_LABELS) as BuildType[];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FeedFiltersProps {
  /** Available AI tools, passed from the server page component. */
  aiTools: AiTool[];
  /** Available tech stack tags, passed from the server page component. */
  techStackTags: TechStackTag[];
}

// ---------------------------------------------------------------------------
// FeedFilters
// ---------------------------------------------------------------------------

/**
 * Client component that renders three dropdown filter controls for the home feed.
 *
 * - Build Type multi-select dropdown
 * - Tech Stack multi-select dropdown
 * - AI Tool multi-select dropdown
 * - Active filter badges with individual dismiss buttons
 * - "Clear all" button when any filter is active
 *
 * Filter state is stored in URL search params so the server page
 * component can read them and pass to `getBuilds()`.
 */
export function FeedFilters({ aiTools, techStackTags }: FeedFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [buildTypePopoverOpen, setBuildTypePopoverOpen] = useState(false);
  const [techStackPopoverOpen, setTechStackPopoverOpen] = useState(false);
  const [aiToolPopoverOpen, setAiToolPopoverOpen] = useState(false);

  // -------------------------------------------------------------------------
  // Read current filter state from URL
  // -------------------------------------------------------------------------

  const activeBuildTypes = parseBuildTypes(searchParams.get(BUILD_TYPE_PARAM));
  const activeAiToolIds = parseIds(
    searchParams.get(AI_TOOL_PARAM),
    aiTools.map((t) => t.id)
  );
  const activeTechStackTagIds = parseIds(
    searchParams.get(TECH_STACK_PARAM),
    techStackTags.map((t) => t.id)
  );

  const hasActiveFilters =
    activeBuildTypes.length > 0 ||
    activeAiToolIds.length > 0 ||
    activeTechStackTagIds.length > 0;

  // -------------------------------------------------------------------------
  // URL update helper
  // -------------------------------------------------------------------------

  const updateUrl = useCallback(
    (
      buildTypes: BuildType[],
      aiToolIds: string[],
      techStackTagIds: string[]
    ) => {
      const params = new URLSearchParams();

      if (buildTypes.length > 0) {
        params.set(BUILD_TYPE_PARAM, buildTypes.join(','));
      }
      if (aiToolIds.length > 0) {
        params.set(AI_TOOL_PARAM, aiToolIds.join(','));
      }
      if (techStackTagIds.length > 0) {
        params.set(TECH_STACK_PARAM, techStackTagIds.join(','));
      }

      const queryString = params.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;

      router.replace(url, { scroll: false });
    },
    [pathname, router]
  );

  // -------------------------------------------------------------------------
  // Toggle handlers
  // -------------------------------------------------------------------------

  function toggleBuildType(type: BuildType) {
    const next = activeBuildTypes.includes(type)
      ? activeBuildTypes.filter((t) => t !== type)
      : [...activeBuildTypes, type];
    updateUrl(next, activeAiToolIds, activeTechStackTagIds);
  }

  function toggleAiTool(toolId: string) {
    const next = activeAiToolIds.includes(toolId)
      ? activeAiToolIds.filter((id) => id !== toolId)
      : [...activeAiToolIds, toolId];
    updateUrl(activeBuildTypes, next, activeTechStackTagIds);
  }

  function toggleTechStack(tagId: string) {
    const next = activeTechStackTagIds.includes(tagId)
      ? activeTechStackTagIds.filter((id) => id !== tagId)
      : [...activeTechStackTagIds, tagId];
    updateUrl(activeBuildTypes, activeAiToolIds, next);
  }

  function clearAll() {
    updateUrl([], [], []);
  }

  // -------------------------------------------------------------------------
  // Derived data for badge display
  // -------------------------------------------------------------------------

  const selectedAiTools = aiTools.filter((tool) =>
    activeAiToolIds.includes(tool.id)
  );
  const selectedTechStackTags = techStackTags.filter((tag) =>
    activeTechStackTagIds.includes(tag.id)
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-3 pb-2">
      {/* Filter controls row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Build Type dropdown */}
        <Popover
          open={buildTypePopoverOpen}
          onOpenChange={setBuildTypePopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              role="combobox"
              aria-expanded={buildTypePopoverOpen}
              className={cn(
                'justify-between',
                activeBuildTypes.length === 0 && 'text-muted-foreground'
              )}
            >
              {activeBuildTypes.length > 0
                ? `${activeBuildTypes.length} build type${activeBuildTypes.length === 1 ? '' : 's'}`
                : 'Build Type'}
              <ChevronsUpDownIcon className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  {BUILD_TYPES.map((type) => {
                    const isSelected = activeBuildTypes.includes(type);
                    return (
                      <CommandItem
                        key={type}
                        value={type}
                        onSelect={() => toggleBuildType(type)}
                      >
                        <CommandCheckbox isSelected={isSelected} />
                        {BUILD_TYPE_LABELS[type]}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Tech Stack dropdown */}
        <Popover
          open={techStackPopoverOpen}
          onOpenChange={setTechStackPopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              role="combobox"
              aria-expanded={techStackPopoverOpen}
              className={cn(
                'justify-between',
                activeTechStackTagIds.length === 0 && 'text-muted-foreground'
              )}
            >
              {activeTechStackTagIds.length > 0
                ? `${activeTechStackTagIds.length} tech stack${activeTechStackTagIds.length === 1 ? '' : 's'}`
                : 'Tech Stack'}
              <ChevronsUpDownIcon className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search tech stack..." />
              <CommandList>
                <CommandEmpty>No tech stack found.</CommandEmpty>
                <CommandGroup>
                  {techStackTags.map((tag) => {
                    const isSelected = activeTechStackTagIds.includes(tag.id);
                    return (
                      <CommandItem
                        key={tag.id}
                        value={tag.name}
                        onSelect={() => toggleTechStack(tag.id)}
                      >
                        <CommandCheckbox isSelected={isSelected} />
                        {tag.name}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* AI Tools dropdown */}
        <Popover open={aiToolPopoverOpen} onOpenChange={setAiToolPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              role="combobox"
              aria-expanded={aiToolPopoverOpen}
              className={cn(
                'justify-between',
                activeAiToolIds.length === 0 && 'text-muted-foreground'
              )}
            >
              {activeAiToolIds.length > 0
                ? `${activeAiToolIds.length} AI tool${activeAiToolIds.length === 1 ? '' : 's'}`
                : 'AI Tools'}
              <ChevronsUpDownIcon className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search AI tools..." />
              <CommandList>
                <CommandEmpty>No AI tools found.</CommandEmpty>
                <CommandGroup>
                  {aiTools.map((tool) => {
                    const isSelected = activeAiToolIds.includes(tool.id);
                    return (
                      <CommandItem
                        key={tool.id}
                        value={tool.name}
                        onSelect={() => toggleAiTool(tool.id)}
                      >
                        <CommandCheckbox isSelected={isSelected} />
                        {tool.name}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Clear all button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-muted-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5">
          {activeBuildTypes.map((type) => (
            <Badge key={type} variant="secondary">
              {BUILD_TYPE_LABELS[type]}
              <button
                type="button"
                className="ml-1 rounded-full outline-none hover:text-foreground"
                onClick={() =>
                  updateUrl(
                    activeBuildTypes.filter((t) => t !== type),
                    activeAiToolIds,
                    activeTechStackTagIds
                  )
                }
                aria-label={`Remove ${BUILD_TYPE_LABELS[type]} filter`}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
          {selectedTechStackTags.map((tag) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
              <button
                type="button"
                className="ml-1 rounded-full outline-none hover:text-foreground"
                onClick={() =>
                  updateUrl(
                    activeBuildTypes,
                    activeAiToolIds,
                    activeTechStackTagIds.filter((id) => id !== tag.id)
                  )
                }
                aria-label={`Remove ${tag.name} filter`}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
          {selectedAiTools.map((tool) => (
            <Badge key={tool.id} variant="secondary">
              {tool.name}
              <button
                type="button"
                className="ml-1 rounded-full outline-none hover:text-foreground"
                onClick={() =>
                  updateUrl(
                    activeBuildTypes,
                    activeAiToolIds.filter((id) => id !== tool.id),
                    activeTechStackTagIds
                  )
                }
                aria-label={`Remove ${tool.name} filter`}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// URL param parsing helpers
// ---------------------------------------------------------------------------

function parseBuildTypes(raw: string | null): BuildType[] {
  if (!raw) {
    return [];
  }
  const validTypes = new Set<string>(BUILD_TYPES);
  return raw
    .split(',')
    .filter((value): value is BuildType => validTypes.has(value));
}

function parseIds(raw: string | null, validIdList: string[]): string[] {
  if (!raw) {
    return [];
  }
  const validIds = new Set(validIdList);
  return raw.split(',').filter((id) => validIds.has(id));
}
