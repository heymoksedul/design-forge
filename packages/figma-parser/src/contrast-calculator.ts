import type { TypographyContrastInfo } from '@designforge/design-ir'

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '').trim()
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0]! + cleanHex[0]!, 16)
    const g = parseInt(cleanHex[1]! + cleanHex[1]!, 16)
    const b = parseInt(cleanHex[2]! + cleanHex[2]!, 16)
    return { r, g, b }
  }
  if (cleanHex.length === 6 || cleanHex.length === 8) {
    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)
    return { r, g, b }
  }
  return null
}

function channelLuminance(c: number): number {
  const normalized = c / 255
  return normalized <= 0.03928
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4)
}

export function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
}

export function calculateContrast(
  foregroundHex: string,
  backgroundHex: string,
  fontSize = 16,
  isBold = false
): TypographyContrastInfo | undefined {
  if (!foregroundHex.startsWith('#') || !backgroundHex.startsWith('#')) {
    return undefined
  }

  const fg = hexToRgb(foregroundHex)
  const bg = hexToRgb(backgroundHex)
  if (!fg || !bg) return undefined

  const l1 = relativeLuminance(fg.r, fg.g, fg.b)
  const l2 = relativeLuminance(bg.r, bg.g, bg.b)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  const rawRatio = (lighter + 0.05) / (darker + 0.05)
  const contrastRatio = Math.round(rawRatio * 10) / 10

  // WCAG 2.1 threshold: Large text is >= 24px or >= 18.66px and bold
  const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && isBold)
  const aaMin = isLargeText ? 3.0 : 4.5
  const aaaMin = isLargeText ? 4.5 : 7.0

  const passesAA = contrastRatio >= aaMin
  const passesAAA = contrastRatio >= aaaMin
  const rating: 'AAA' | 'AA' | 'FAIL' = passesAAA ? 'AAA' : passesAA ? 'AA' : 'FAIL'

  return {
    parentBgColor: backgroundHex,
    contrastRatio,
    passesAA,
    passesAAA,
    rating,
  }
}
