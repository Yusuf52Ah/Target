import type { ExperienceLevel } from "@prisma/client";

import type { SearchFilters } from "@/types";

type SearchParams = Record<string, string | string[] | undefined>;

function getStringValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getNumberValue(value: string | string[] | undefined) {
  const parsed = Number.parseFloat(getStringValue(value) ?? "");
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function toSearchFilters(searchParams: SearchParams): SearchFilters {
  const levelRaw = getStringValue(searchParams.level);
  const level = (levelRaw as ExperienceLevel | undefined) ?? undefined;

  return {
    skill: getStringValue(searchParams.skill)?.trim() || undefined,
    minPrice: getNumberValue(searchParams.minPrice),
    maxPrice: getNumberValue(searchParams.maxPrice),
    minRating: getNumberValue(searchParams.minRating),
    level,
    niche: getStringValue(searchParams.niche)?.trim() || undefined,
  };
}
