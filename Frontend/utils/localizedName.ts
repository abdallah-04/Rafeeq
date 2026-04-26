export function pickLocalizedName(
  isRTL: boolean,
  nameAr?: string | null,
  nameEn?: string | null,
  fallback = '-'
) {
  const primary = isRTL ? nameAr : nameEn;
  const secondary = isRTL ? nameEn : nameAr;
  return primary?.trim() || secondary?.trim() || fallback;
}
