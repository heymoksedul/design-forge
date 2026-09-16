export type DesignNodeType =
  | 'page'
  | 'section'
  | 'container'
  | 'stack'
  | 'grid'
  | 'heading'
  | 'paragraph'
  | 'text'
  | 'button'
  | 'link'
  | 'image'
  | 'icon'
  | 'input'
  | 'card'
  | 'badge'
  | 'list'
  | 'navigation'
  | 'footer'
  | 'component'
  | 'instance'
  | 'group'
  | 'divider'
  | 'spacer'
  | 'unknown'

export type LayoutMode = 'NONE' | 'HORIZONTAL' | 'VERTICAL' | 'GRID'
export type SizingMode = 'FIXED' | 'HUG' | 'FILL'
export type PrimaryAxisAlign = 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN'
export type CounterAxisAlign = 'MIN' | 'MAX' | 'CENTER' | 'BASELINE'

export interface PaddingSpec {
  top: number
  right: number
  bottom: number
  left: number
}

export interface DimensionSpec {
  width: number
  height: number
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  horizontalSizing: SizingMode
  verticalSizing: SizingMode
}

export interface LayoutSpec {
  mode: LayoutMode
  padding: PaddingSpec
  itemSpacing: number
  counterAxisSpacing?: number
  primaryAxisAlign: PrimaryAxisAlign
  counterAxisAlign: CounterAxisAlign
  wrap: boolean
  isAbsolutePositioned?: boolean
  clipsContent?: boolean
  constraints?: {
    horizontal: string
    vertical: string
  }
}

export interface ColorToken {
  hex: string
  rgba: {
    r: number
    g: number
    b: number
    a: number
  }
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'IMAGE'
  gradientStops?: Array<{
    position: number
    color: string
  }>
  role?: 'background' | 'text' | 'border' | 'accent' | 'neutral'
  usageCount?: number
  styleName?: string
  variableName?: string
}

export interface TypographySegment {
  text: string
  fontFamily: string
  fontWeight: number
  fontStyle?: string
  fontSize: number
  color?: string
}

export interface TypographyContrastInfo {
  parentBgColor: string
  contrastRatio: number
  passesAA: boolean
  passesAAA: boolean
  rating: 'AAA' | 'AA' | 'FAIL'
}

export interface TypographySpec {
  fontFamily: string
  fontWeight: number
  fontStyle?: string
  fontSize: number
  fontSizeRem?: number
  lineHeight?: {
    value: number
    unit: 'PIXELS' | 'PERCENT' | 'AUTO'
  }
  lineHeightRatio?: number
  letterSpacing?: {
    value: number
    unit: 'PIXELS' | 'PERCENT'
  }
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED'
  textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM'
  textCase?: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE'
  textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH'
  color?: string
  styleName?: string
  contrastWithParentBg?: TypographyContrastInfo
  segments?: TypographySegment[]
}

export interface CornerRadiusSpec {
  topLeft: number
  topRight: number
  bottomRight: number
  bottomLeft: number
  isUniform: boolean
  uniformRadius?: number
}

export interface BorderSpec {
  color?: string
  width: number
  align?: 'INSIDE' | 'OUTSIDE' | 'CENTER'
  radius: CornerRadiusSpec
  individualWeights?: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export interface EffectSpec {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR'
  color?: string
  offset?: {
    x: number
    y: number
  }
  radius: number
  spread?: number
}

export interface DesignNode {
  id: string
  name: string
  type: DesignNodeType
  visible: boolean

  // Dimensions & Sizing
  dimensions: DimensionSpec

  // Layout & Spacing (Auto Layout)
  layout: LayoutSpec

  // Visual Properties
  backgrounds: ColorToken[]
  opacity?: number

  // Typography (for text nodes or components containing primary labels)
  typography?: TypographySpec
  textContent?: string

  // Borders & Radii
  border?: BorderSpec

  // Effects (Shadows & Blurs)
  effects: EffectSpec[]

  // Component metadata
  isComponentRoot?: boolean
  isInstance?: boolean
  componentName?: string
  variantProperties?: Record<string, string>

  // Nested hierarchy
  children?: DesignNode[]
}

export interface DesignTokens {
  colors: Record<string, ColorToken>
  typography: Record<string, TypographySpec>
  spacing: number[]
  radii: number[]
  shadows: EffectSpec[]
}

export interface AssetSpec {
  id: string
  name: string
  category: 'icon' | 'image' | 'vector' | 'illustration'
  format: 'SVG' | 'PNG' | 'JPG' | 'WEBP'
  width: number
  height: number
  aspectRatio: string
  path: string
  suggestedFileName: string
  exportPresets: string[]
  fillColors?: string[]
}

export interface ComponentSpecification {
  id: string
  name: string
  type: DesignNodeType
  nodeType?: string
  path: string
  depth: number
  textContent?: string
  dimensions: DimensionSpec
  layout: LayoutSpec
  backgrounds: ColorToken[]
  opacity?: number
  blendMode?: string
  typography?: TypographySpec
  border?: BorderSpec
  effects: EffectSpec[]
  subComponentsCount: number
}

export interface DesignDocument {
  id: string
  name: string
  version: string
  extractedAt: string
  viewport: {
    width: number
    height: number
  }
  tokens: DesignTokens
  componentInventory: ComponentSpecification[]
  assets: AssetSpec[]
  root: DesignNode
  selectionHint?: string
}
