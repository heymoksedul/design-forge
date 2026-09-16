import type {
  BorderSpec,
  ColorToken,
  CornerRadiusSpec,
  EffectSpec,
} from '@designforge/design-ir'
import { figmaColorToToken, rgbToHex } from './color-parser'

export function parseBackgrounds(node: SceneNode): ColorToken[] {
  const tokens: ColorToken[] = []
  if ('fills' in node && Array.isArray(node.fills)) {
    for (const fill of node.fills) {
      if (fill.visible !== false) {
        const token = figmaColorToToken(fill, 'background')
        if (token) tokens.push(token)
      }
    }
  }
  return tokens
}

export function parseCornerRadius(node: SceneNode): CornerRadiusSpec {
  let topLeft = 0
  let topRight = 0
  let bottomRight = 0
  let bottomLeft = 0
  let isUniform = true

  if ('cornerRadius' in node && typeof node.cornerRadius === 'number') {
    topLeft = node.cornerRadius
    topRight = node.cornerRadius
    bottomRight = node.cornerRadius
    bottomLeft = node.cornerRadius
    return {
      topLeft,
      topRight,
      bottomRight,
      bottomLeft,
      isUniform: true,
      uniformRadius: node.cornerRadius,
    }
  }

  if ('topLeftRadius' in node && typeof node.topLeftRadius === 'number') {
    topLeft = node.topLeftRadius
    topRight = typeof node.topRightRadius === 'number' ? node.topRightRadius : 0
    bottomRight = typeof node.bottomRightRadius === 'number' ? node.bottomRightRadius : 0
    bottomLeft = typeof node.bottomLeftRadius === 'number' ? node.bottomLeftRadius : 0

    isUniform =
      topLeft === topRight &&
      topRight === bottomRight &&
      bottomRight === bottomLeft
  }

  return {
    topLeft: Math.round(topLeft),
    topRight: Math.round(topRight),
    bottomRight: Math.round(bottomRight),
    bottomLeft: Math.round(bottomLeft),
    isUniform,
    uniformRadius: isUniform ? Math.round(topLeft) : undefined,
  }
}

export function parseBorder(node: SceneNode): BorderSpec | undefined {
  const radius = parseCornerRadius(node)
  let width = 0
  let color: string | undefined
  let align: 'INSIDE' | 'OUTSIDE' | 'CENTER' | undefined

  if ('strokeWeight' in node && typeof node.strokeWeight === 'number') {
    width = Math.round(node.strokeWeight)
  }

  let individualWeights: { top: number; right: number; bottom: number; left: number } | undefined
  if ('strokeTopWeight' in node && typeof node.strokeTopWeight === 'number') {
    const top = Math.round(node.strokeTopWeight)
    const right =
      'strokeRightWeight' in node && typeof node.strokeRightWeight === 'number'
        ? Math.round(node.strokeRightWeight)
        : top
    const bottom =
      'strokeBottomWeight' in node && typeof node.strokeBottomWeight === 'number'
        ? Math.round(node.strokeBottomWeight)
        : top
    const left =
      'strokeLeftWeight' in node && typeof node.strokeLeftWeight === 'number'
        ? Math.round(node.strokeLeftWeight)
        : top

    if (top !== right || right !== bottom || bottom !== left) {
      individualWeights = { top, right, bottom, left }
      if (width === 0) {
        width = Math.max(top, right, bottom, left)
      }
    }
  }

  if ('strokeAlign' in node) {
    if (node.strokeAlign === 'INSIDE') align = 'INSIDE'
    else if (node.strokeAlign === 'OUTSIDE') align = 'OUTSIDE'
    else if (node.strokeAlign === 'CENTER') align = 'CENTER'
  }

  if ('strokes' in node && Array.isArray(node.strokes) && node.strokes.length > 0) {
    const firstStroke = node.strokes[0]
    if (firstStroke && firstStroke.visible !== false) {
      const strokeToken = figmaColorToToken(firstStroke, 'border')
      if (strokeToken) {
        color = strokeToken.hex
      }
    }
  }

  if (
    width === 0 &&
    !individualWeights &&
    radius.topLeft === 0 &&
    radius.topRight === 0 &&
    radius.bottomRight === 0 &&
    radius.bottomLeft === 0
  ) {
    return undefined
  }

  return {
    color,
    width,
    align,
    radius,
    individualWeights,
  }
}

export function parseEffects(node: SceneNode): EffectSpec[] {
  const result: EffectSpec[] = []

  if ('effects' in node && Array.isArray(node.effects)) {
    for (const effect of node.effects) {
      if (effect.visible !== false) {
        if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
          const hex = rgbToHex(effect.color.r, effect.color.g, effect.color.b)
          const alpha = Math.round((effect.color.a ?? 1) * 100) / 100
          result.push({
            type: effect.type,
            color: `${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0').toUpperCase()}`,
            offset: {
              x: Math.round(effect.offset.x),
              y: Math.round(effect.offset.y),
            },
            radius: Math.round(effect.radius),
            spread: effect.spread ? Math.round(effect.spread) : undefined,
          })
        } else if (effect.type === 'LAYER_BLUR' || effect.type === 'BACKGROUND_BLUR') {
          result.push({
            type: effect.type,
            radius: Math.round(effect.radius),
          })
        }
      }
    }
  }

  return result
}
