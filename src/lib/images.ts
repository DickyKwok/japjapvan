export function productImageUrl(id: string) {
  return `/products/${encodeURIComponent(id)}.jpg`;
}

export function imageFileName(id: string, sku?: string) {
  const safe = (sku ?? id).replace(/[^\w.-]+/g, "-");
  return `${safe}.jpg`;
}
