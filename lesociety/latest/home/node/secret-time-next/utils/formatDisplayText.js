const capitalizeSegment = (segment = "") =>
  segment.replace(/(^|[\s'’\-_/([{"]+)([a-z])/g, (match, prefix, char) => {
    return `${prefix}${char.toUpperCase()}`;
  });

export const formatDisplayText = (value) => {
  if (value === null || value === undefined) return "";

  const normalized = String(value).trim().replace(/\s+/g, " ");
  if (!normalized) return "";

  return normalized
    .split(",")
    .map((segment) => capitalizeSegment(segment.toLowerCase()).trim())
    .join(", ");
};

export const formatDisplayName = (value) => formatDisplayText(value);

export const formatDisplayLocation = (city, province) => {
  const formattedCity = formatDisplayText(city);
  const formattedProvince = province ? String(province).trim().toUpperCase() : "";

  return [formattedCity, formattedProvince].filter(Boolean).join(", ");
};
