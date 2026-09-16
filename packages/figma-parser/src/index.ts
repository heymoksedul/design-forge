import type {
  DesignDocument,
  DesignNode,
  DesignTokens,
  ComponentSpecification,
  ColorToken,
  TypographySpec,
  EffectSpec,
} from '@designforge/design-ir'
import { parseLayout } from './layout-parser'
import { parseBackgrounds, parseBorder, parseEffects } from './style-parser'
import { parseTextNode } from './typography-parser'
import { inferNodeType } from './component-detector'
import { detectAsset } from './asset-parser'
import type { AssetSpec } from '@designforge/design-ir'

export * from './color-parser'
export * from './typography-parser'
export * from './layout-parser'
export * from './style-parser'
export * from './component-detector'
export * from './contrast-calculator'
export * from './asset-utils'
export * from './asset-parser'

class TokenCollector {
  colors: Record<string, ColorToken> = {}
  typography: Record<string, TypographySpec> = {}
  spacingSet: Set<number> = new Set()
  radiiSet: Set<number> = new Set()
  shadows: EffectSpec[] = []
  componentInventory: ComponentSpecification[] = []
  assets: AssetSpec[] = []

  recordColor(token: ColorToken) {
    if (token.hex === 'IMAGE_FILL') return
    const existing = this.colors[token.hex]
    if (existing) {
      existing.usageCount = (existing.usageCount ?? 1) + 1
    } else {
      this.colors[token.hex] = { ...token, usageCount: 1 }
    }
  }

  recordTypography(spec: TypographySpec) {
    const key = `${spec.fontFamily}-${spec.fontWeight}-${spec.fontSize}`
    if (!this.typography[key]) {
      this.typography[key] = spec
    }
  }

  recordSpacing(value: number) {
    if (value > 0) {
      this.spacingSet.add(Math.round(value))
    }
  }

  recordRadius(value: number) {
    if (value > 0) {
      this.radiiSet.add(Math.round(value))
    }
  }

  recordEffects(effects: EffectSpec[]) {
    for (const eff of effects) {
      if (eff.type === 'DROP_SHADOW' || eff.type === 'INNER_SHADOW') {
        const exists = this.shadows.some(
          (s) =>
            s.type === eff.type &&
            s.radius === eff.radius &&
            s.offset?.x === eff.offset?.x &&
            s.offset?.y === eff.offset?.y &&
            s.color === eff.color
        )
        if (!exists) this.shadows.push(eff)
      }
    }
  }

  recordComponent(spec: ComponentSpecification) {
    this.componentInventory.push(spec)
  }

  recordAsset(asset: AssetSpec) {
    const exists = this.assets.some((a) => a.id === asset.id)
    if (!exists) {
      this.assets.push(asset)
    }
  }

  toDesignTokens(): DesignTokens {
    return {
      colors: this.colors,
      typography: this.typography,
      spacing: Array.from(this.spacingSet).sort((a, b) => a - b),
      radii: Array.from(this.radiiSet).sort((a, b) => a - b),
      shadows: this.shadows,
    }
  }
}

export function parseFigmaNode(
  node: SceneNode,
  collector: TokenCollector,
  depth = 0,
  parentPath = '',
  parentBgColor?: string,
  parentIsAsset = false
): DesignNode {
  const { dimensions, layout } = parseLayout(node)
  const backgrounds = parseBackgrounds(node)
  const border = parseBorder(node)
  const effects = parseEffects(node)
  const type = inferNodeType(node)
  const currentPath = parentPath ? `${parentPath} > ${node.name}` : node.name

  // Determine current solid background color for contrast calculation in child layers
  const solidBg = node.type !== 'TEXT' ? backgrounds.find((b) => b.type === 'SOLID') : undefined
  const currentBgColor = solidBg ? solidBg.hex : parentBgColor

  // Detect and catalog Assets (SVG icons, vectors, and raster images)
  const detectedAsset = detectAsset(node, currentPath, parentIsAsset)
  if (detectedAsset) {
    collector.recordAsset(detectedAsset)
  }
  const isAssetOrInside =
    parentIsAsset ||
    Boolean(detectedAsset && (detectedAsset.category === 'icon' || detectedAsset.category === 'vector'))

  // Record tokens
  for (const bg of backgrounds) collector.recordColor(bg)
  if (border?.color) {
    collector.recordColor({
      hex: border.color,
      rgba: { r: 0, g: 0, b: 0, a: 1 },
      type: 'SOLID',
      role: 'border',
    })
  }
  if (border?.radius) {
    collector.recordRadius(border.radius.topLeft)
    collector.recordRadius(border.radius.topRight)
    collector.recordRadius(border.radius.bottomRight)
    collector.recordRadius(border.radius.bottomLeft)
  }

  collector.recordSpacing(layout.padding.top)
  collector.recordSpacing(layout.padding.right)
  collector.recordSpacing(layout.padding.bottom)
  collector.recordSpacing(layout.padding.left)
  collector.recordSpacing(layout.itemSpacing)
  if (layout.counterAxisSpacing) collector.recordSpacing(layout.counterAxisSpacing)
  collector.recordEffects(effects)

  let typography: TypographySpec | undefined
  let textContent: string | undefined

  if (node.type === 'TEXT') {
    const textSpec = parseTextNode(node, parentBgColor)
    if (textSpec) {
      typography = textSpec
      collector.recordTypography(textSpec)
      if (textSpec.color) {
        collector.recordColor({
          hex: textSpec.color,
          rgba: { r: 0, g: 0, b: 0, a: 1 },
          type: 'SOLID',
          role: 'text',
        })
      }
      if (textSpec.segments) {
        for (const seg of textSpec.segments) {
          collector.recordTypography({
            fontFamily: seg.fontFamily,
            fontWeight: seg.fontWeight,
            fontSize: seg.fontSize,
            fontStyle: seg.fontStyle,
            color: seg.color,
          })
          if (seg.color) {
            collector.recordColor({
              hex: seg.color,
              rgba: { r: 0, g: 0, b: 0, a: 1 },
              type: 'SOLID',
              role: 'text',
            })
          }
        }
      }
    }
    textContent = node.characters
  }

  const rawChildrenCount = 'children' in node && Array.isArray(node.children) ? node.children.length : 0

  let opacity: number | undefined
  if ('opacity' in node && typeof node.opacity === 'number' && node.opacity < 1) {
    opacity = Math.round(node.opacity * 100) / 100
  }

  let blendMode: string | undefined
  if (
    'blendMode' in node &&
    typeof node.blendMode === 'string' &&
    node.blendMode !== 'PASS_THROUGH' &&
    node.blendMode !== 'NORMAL'
  ) {
    blendMode = node.blendMode
  }

  // Record EVERY element in the inventory (containers, text layers, shapes, cards, buttons)
  // Pre-order ensures parent frames appear before their children
  collector.recordComponent({
    id: node.id,
    name: node.name,
    type,
    nodeType: node.type,
    path: currentPath,
    depth,
    textContent,
    dimensions,
    layout,
    backgrounds,
    opacity,
    blendMode,
    typography,
    border,
    effects,
    subComponentsCount: rawChildrenCount,
  })

  // Parse children recursively
  const children: DesignNode[] = []
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child.visible !== false) {
        children.push(
          parseFigmaNode(child, collector, depth + 1, currentPath, currentBgColor, isAssetOrInside)
        )
      }
    }
  }

  const isComponentRoot = node.type === 'COMPONENT' || (depth === 0 && node.type === 'FRAME')
  const isInstance = node.type === 'INSTANCE'

  return {
    id: node.id,
    name: node.name,
    type,
    visible: node.visible !== false,
    dimensions,
    layout,
    backgrounds,
    opacity,
    typography,
    textContent,
    border,
    effects,
    isComponentRoot,
    isInstance,
    children: children.length > 0 ? children : undefined,
  }
}

export function parseSelection(rootNode: SceneNode): DesignDocument {
  const collector = new TokenCollector()
  const root = parseFigmaNode(rootNode, collector, 0, '')
  const tokens = collector.toDesignTokens()

  // Detect if user selected a leaf layer (like a solitary Rectangle or Vector)
  let selectionHint: string | undefined
  const hasNoChildren = !('children' in rootNode) || (rootNode.children as unknown[]).length === 0
  if (hasNoChildren && rootNode.parent && rootNode.parent.type !== 'PAGE' && rootNode.parent.type !== 'DOCUMENT') {
    selectionHint = `💡 You have selected a single element ("${rootNode.name}", ${rootNode.type}). To extract the full section with all cards, text, and components, select the parent "${rootNode.parent.name}" in the layers panel or press Shift + Enter.`
  }

  return {
    id: rootNode.id,
    name: rootNode.name,
    version: '1.0.0',
    extractedAt: new Date().toISOString(),
    viewport: {
      width: root.dimensions.width,
      height: root.dimensions.height,
    },
    tokens,
    componentInventory: collector.componentInventory,
    assets: collector.assets,
    root,
    selectionHint,
  }
}
