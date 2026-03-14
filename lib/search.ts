import type { SearchFilters } from "@/types";
import { searchSchema } from "@/lib/validations";

type SearchParams = Record<string, string | string[] | undefined>;

function getStringValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getOptionalString(value: string | string[] | undefined) {
  const raw = getStringValue(value);
  if (!raw) {
    return undefined;
  }

  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function toSearchFilters(searchParams: SearchParams): SearchFilters {
  const parsed = searchSchema.safeParse({
    skill: getOptionalString(searchParams.skill),
    minPrice: getOptionalString(searchParams.minPrice),
    maxPrice: getOptionalString(searchParams.maxPrice),
    minRating: getOptionalString(searchParams.minRating),
    level: getOptionalString(searchParams.level),
    niche: getOptionalString(searchParams.niche),
  });

  if (!parsed.success) {
    return {};
  }

  return {
    skill: parsed.data.skill?.trim() || undefined,
    minPrice: parsed.data.minPrice,
    maxPrice: parsed.data.maxPrice,
    minRating: parsed.data.minRating,
    level: parsed.data.level,
    niche: parsed.data.niche?.trim() || undefined,
  };
}
