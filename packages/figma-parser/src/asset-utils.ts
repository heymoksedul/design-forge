function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

export function calculateAspectRatio(width: number, height: number): string {
  if (width <= 0 || height <= 0) return '1:1'

  const w = Math.round(width)
  const h = Math.round(height)

  if (w === h) return '1:1'

  const divisor = gcd(w, h)
  const reducedW = w / divisor
  const reducedH = h / divisor

  // If simplified ratio is clean (e.g. 16:9, 4:3, 3:2, 5:4)
  if (reducedW <= 25 && reducedH <= 25) {
    return `${reducedW}:${reducedH}`
  }

  // Decimal approximation to nearest standard ratio
  const ratio = w / h
  if (Math.abs(ratio - 16 / 9) < 0.05) return '16:9'
  if (Math.abs(ratio - 4 / 3) < 0.05) return '4:3'
  if (Math.abs(ratio - 3 / 2) < 0.05) return '3:2'
  if (Math.abs(ratio - 21 / 9) < 0.05) return '21:9'
  if (Math.abs(ratio - 2 / 1) < 0.05) return '2:1'

  return `${(Math.round(ratio * 100) / 100).toString()}:1`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/^icon\s*[\/_\-\s]*/i, '') // strip leading "Icon / " prefix
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'asset'
}
