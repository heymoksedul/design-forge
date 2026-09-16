export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

export function deduplicate<T>(items: T[], keyFn?: (item: T) => string): T[] {
  if (!keyFn) {
    return Array.from(new Set(items))
  }
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = keyFn(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
