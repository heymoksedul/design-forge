import type { TypographySpec } from '@designforge/design-ir'
import { figmaColorToToken } from './color-parser'
import { calculateContrast } from './contrast-calculator'

export function inferFontWeight(styleName: string): number {
  const normalized = styleName.toLowerCase().replace(/[\s-_]/g, '')
  if (normalized.includes('thin') || normalized.includes('hairline')) return 100
  if (normalized.includes('extralight') || normalized.includes('ultralight')) return 200
  if (normalized.includes('light')) return 300
  if (normalized.includes('medium')) return 500
  if (normalized.includes('semibold') || normalized.includes('demibold')) return 600
  if (normalized.includes('extrabold') || normalized.includes('ultrabold')) return 800
  if (normalized.includes('black') || normalized.includes('heavy')) return 900
  if (normalized.includes('bold')) return 700
  return 400 // default Regular
}

function isMixed(val: unknown): boolean {
  if (typeof globalThis !== 'undefined' && 'figma' in globalThis && (globalThis as unknown as { figma: { mixed: unknown } }).figma?.mixed) {
    return val === (globalThis as unknown as { figma: { mixed: unknown } }).figma.mixed
  }
  return typeof val === 'symbol'
}

export function parseTextNode(
  node: TextNode,
  parentBgColor?: string
): TypographySpec | null {
  // Check if styled segments are available (e.g. for mixed typography)
  let segments: import('@designforge/design-ir').TypographySegment[] | undefined
  if (
    typeof (node as unknown as { getStyledTextSegments?: unknown }).getStyledTextSegments ===
    'function'
  ) {
    try {
      const rawSegments = (node as any).getStyledTextSegments(['fontName', 'fontSize', 'fills'])
      if (Array.isArray(rawSegments) && rawSegments.length > 0) {
        segments = rawSegments.map((seg: any) => {
          let segColor: string | undefined
          if (Array.isArray(seg.fills) && seg.fills.length > 0) {
            const firstFill = seg.fills[0]
            if (firstFill && firstFill.visible !== false) {
              const colorToken = figmaColorToToken(firstFill, 'text')
              if (colorToken) segColor = colorToken.hex
            }
          }
          const fName = seg.fontName as FontName | undefined
          const style = fName?.style ?? 'Regular'
          return {
            text: seg.characters ?? '',
            fontFamily: fName?.family ?? 'Inter',
            fontWeight: inferFontWeight(style),
            fontStyle: style,
            fontSize: typeof seg.fontSize === 'number' ? seg.fontSize : 16,
            color: segColor,
          }
        })
      }
    } catch {
      // ignore
    }
  }

  let fontFamily = 'Inter'
  let fontWeight = 400
  let fontStyle = 'Regular'
  let fontSize = 16

  if (isMixed(node.fontName) || isMixed(node.fontSize)) {
    const firstSegment = segments?.[0]
    if (firstSegment) {
      fontFamily = firstSegment.fontFamily
      fontWeight = firstSegment.fontWeight
      fontStyle = firstSegment.fontStyle ?? 'Regular'
      fontSize = firstSegment.fontSize
    } else {
      return null
    }
  } else {
    const fontName = node.fontName as FontName
    fontFamily = fontName?.family ?? 'Inter'
    fontStyle = fontName?.style ?? 'Regular'
    fontWeight = inferFontWeight(fontStyle)
    fontSize = typeof node.fontSize === 'number' ? node.fontSize : 16
  }

  // Resolve styleName if available
  let styleName: string | undefined
  if (
    typeof globalThis !== 'undefined' &&
    'figma' in globalThis &&
    typeof (node as any).textStyleId === 'string' &&
    (node as any).textStyleId
  ) {
    try {
      const style = (globalThis as any).figma.getStyleById((node as any).textStyleId)
      if (style) styleName = style.name
    } catch {
      // ignore
    }
  }

  let lineHeight: TypographySpec['lineHeight']
  if (
    !isMixed(node.lineHeight) &&
    node.lineHeight &&
    typeof node.lineHeight === 'object' &&
    'unit' in node.lineHeight &&
    'value' in node.lineHeight
  ) {
    const lh = node.lineHeight as { unit: 'PIXELS' | 'PERCENT' | 'AUTO'; value: number }
    if (lh.unit === 'PIXELS') {
      lineHeight = { value: Math.round(lh.value * 10) / 10, unit: 'PIXELS' }
    } else if (lh.unit === 'PERCENT') {
      lineHeight = { value: Math.round(lh.value), unit: 'PERCENT' }
    } else {
      lineHeight = { value: 1.2, unit: 'AUTO' }
    }
  }

  let letterSpacing: TypographySpec['letterSpacing']
  if (
    !isMixed(node.letterSpacing) &&
    node.letterSpacing &&
    typeof node.letterSpacing === 'object' &&
    'unit' in node.letterSpacing &&
    'value' in node.letterSpacing
  ) {
    const ls = node.letterSpacing as { unit: 'PIXELS' | 'PERCENT'; value: number }
    if (ls.value !== 0) {
      letterSpacing = {
        value: Math.round(ls.value * 100) / 100,
        unit: ls.unit === 'PIXELS' ? 'PIXELS' : 'PERCENT',
      }
    }
  }

  let color: string | undefined
  if (!isMixed(node.fills) && Array.isArray(node.fills) && node.fills.length > 0) {
    const firstFill = node.fills[0]
    if (firstFill && firstFill.visible !== false) {
      const colorToken = figmaColorToToken(firstFill, 'text')
      if (colorToken) {
        color = colorToken.hex
      }
    }
  } else if (segments?.[0]?.color) {
    color = segments[0]?.color
  }

  const textCase = isMixed(node.textCase)
    ? 'ORIGINAL'
    : node.textCase === 'UPPER'
      ? 'UPPER'
      : node.textCase === 'LOWER'
        ? 'LOWER'
        : node.textCase === 'TITLE'
          ? 'TITLE'
          : 'ORIGINAL'

  const textDecoration = isMixed(node.textDecoration)
    ? 'NONE'
    : node.textDecoration === 'UNDERLINE'
      ? 'UNDERLINE'
      : node.textDecoration === 'STRIKETHROUGH'
        ? 'STRIKETHROUGH'
        : 'NONE'

  const fontSizeRem = Math.round((fontSize / 16) * 1000) / 1000

  let lineHeightRatio: number | undefined
  if (lineHeight) {
    if (lineHeight.unit === 'PIXELS') {
      lineHeightRatio = Math.round((lineHeight.value / fontSize) * 100) / 100
    } else if (lineHeight.unit === 'PERCENT') {
      lineHeightRatio = Math.round(lineHeight.value) / 100
    } else {
      lineHeightRatio = 1.2
    }
  }

  const contrastWithParentBg =
    color && parentBgColor
      ? calculateContrast(color, parentBgColor, fontSize, fontWeight >= 600)
      : undefined

  return {
    fontFamily,
    fontWeight,
    fontStyle,
    fontSize,
    fontSizeRem,
    lineHeight,
    lineHeightRatio,
    letterSpacing,
    textAlignHorizontal: !isMixed(node.textAlignHorizontal) ? node.textAlignHorizontal : 'LEFT',
    textAlignVertical: !isMixed(node.textAlignVertical) ? node.textAlignVertical : 'TOP',
    textCase,
    textDecoration,
    color,
    styleName,
    contrastWithParentBg,
    segments: segments && segments.length > 1 ? segments : undefined,
  }
}
