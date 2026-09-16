import type { ColorToken } from '@designforge/design-ir'

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (val: number) => {
    const clamped = Math.round(Math.max(0, Math.min(1, val)) * 255)
    return clamped.toString(16).padStart(2, '0').toUpperCase()
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function figmaColorToToken(
  paint: Paint,
  defaultRole?: 'background' | 'text' | 'border' | 'accent' | 'neutral'
): ColorToken | null {
  if (!paint.visible) return null

  if (paint.type === 'SOLID') {
    const { r, g, b } = paint.color
    const a = paint.opacity ?? 1
    const hex = rgbToHex(r, g, b)

    return {
      hex,
      rgba: {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
        a,
      },
      type: 'SOLID',
      role: defaultRole,
      usageCount: 1,
    }
  }

  if (paint.type === 'GRADIENT_LINEAR' || paint.type === 'GRADIENT_RADIAL') {
    const stops = paint.gradientStops.map((stop) => ({
      position: stop.position,
      color: rgbToHex(stop.color.r, stop.color.g, stop.color.b),
    }))

    const firstStop = stops[0]?.color ?? '#000000'
    return {
      hex: firstStop,
      rgba: { r: 0, g: 0, b: 0, a: 1 },
      type: paint.type,
      gradientStops: stops,
      role: defaultRole,
      usageCount: 1,
    }
  }

  if (paint.type === 'IMAGE') {
    return {
      hex: 'IMAGE_FILL',
      rgba: { r: 0, g: 0, b: 0, a: 1 },
      type: 'IMAGE',
      role: 'background',
      usageCount: 1,
    }
  }

  return null
}
