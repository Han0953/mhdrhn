/** Build only local catalog URLs, preserving the intersection of all three filters. */
export function projectFilterHref(category: string, query: string, status: string) {
  const params = new URLSearchParams();
  if (category !== "Semua") params.set("category", category);
  if (query.trim()) params.set("q", query.trim().slice(0, 100));
  if (status !== "Semua") params.set("status", status);
  return `/projects${params.size ? `?${params}` : ""}`;
}
