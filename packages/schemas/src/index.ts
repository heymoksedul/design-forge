import { z } from 'zod'
import type { DesignNode } from '@designforge/design-ir'

export const DesignNodeTypeSchema = z.enum([
  'page',
  'section',
  'container',
  'stack',
  'grid',
  'heading',
  'paragraph',
  'text',
  'button',
  'link',
  'image',
  'icon',
  'input',
  'card',
  'badge',
  'list',
  'navigation',
  'footer',
  'component',
  'instance',
  'group',
  'divider',
  'spacer',
  'unknown',
])

export const LayoutModeSchema = z.enum(['NONE', 'HORIZONTAL', 'VERTICAL', 'GRID'])
export const SizingModeSchema = z.enum(['FIXED', 'HUG', 'FILL'])
export const PrimaryAxisAlignSchema = z.enum(['MIN', 'MAX', 'CENTER', 'SPACE_BETWEEN'])
export const CounterAxisAlignSchema = z.enum(['MIN', 'MAX', 'CENTER', 'BASELINE'])

export const PaddingSpecSchema = z.object({
  top: z.number().nonnegative(),
  right: z.number().nonnegative(),
  bottom: z.number().nonnegative(),
  left: z.number().nonnegative(),
})

export const DimensionSpecSchema = z.object({
  width: z.number().nonnegative(),
  height: z.number().nonnegative(),
  minWidth: z.number().positive().optional(),
  maxWidth: z.number().positive().optional(),
  minHeight: z.number().positive().optional(),
  maxHeight: z.number().positive().optional(),
  horizontalSizing: SizingModeSchema,
  verticalSizing: SizingModeSchema,
})

export const LayoutSpecSchema = z.object({
  mode: LayoutModeSchema,
  padding: PaddingSpecSchema,
  itemSpacing: z.number().nonnegative(),
  counterAxisSpacing: z.number().nonnegative().optional(),
  primaryAxisAlign: PrimaryAxisAlignSchema,
  counterAxisAlign: CounterAxisAlignSchema,
  wrap: z.boolean(),
  isAbsolutePositioned: z.boolean().optional(),
  clipsContent: z.boolean().optional(),
  constraints: z
    .object({
      horizontal: z.string(),
      vertical: z.string(),
    })
    .optional(),
})

export const ColorTokenSchema = z.object({
  hex: z.string(),
  rgba: z.object({
    r: z.number().min(0).max(255),
    g: z.number().min(0).max(255),
    b: z.number().min(0).max(255),
    a: z.number().min(0).max(1),
  }),
  type: z.enum(['SOLID', 'GRADIENT_LINEAR', 'GRADIENT_RADIAL', 'IMAGE']),
  gradientStops: z
    .array(
      z.object({
        position: z.number(),
        color: z.string(),
      })
    )
    .optional(),
  role: z.enum(['background', 'text', 'border', 'accent', 'neutral']).optional(),
  usageCount: z.number().optional(),
  styleName: z.string().optional(),
  variableName: z.string().optional(),
})

export const TypographySegmentSchema = z.object({
  text: z.string(),
  fontFamily: z.string(),
  fontWeight: z.number(),
  fontStyle: z.string().optional(),
  fontSize: z.number().positive(),
  color: z.string().optional(),
})

export const TypographyContrastInfoSchema = z.object({
  parentBgColor: z.string(),
  contrastRatio: z.number(),
  passesAA: z.boolean(),
  passesAAA: z.boolean(),
  rating: z.enum(['AAA', 'AA', 'FAIL']),
})

export const TypographySpecSchema = z.object({
  fontFamily: z.string(),
  fontWeight: z.number(),
  fontStyle: z.string().optional(),
  fontSize: z.number().positive(),
  fontSizeRem: z.number().optional(),
  lineHeight: z
    .object({
      value: z.number(),
      unit: z.enum(['PIXELS', 'PERCENT', 'AUTO']),
    })
    .optional(),
  lineHeightRatio: z.number().optional(),
  letterSpacing: z
    .object({
      value: z.number(),
      unit: z.enum(['PIXELS', 'PERCENT']),
    })
    .optional(),
  textAlignHorizontal: z.enum(['LEFT', 'CENTER', 'RIGHT', 'JUSTIFIED']).optional(),
  textAlignVertical: z.enum(['TOP', 'CENTER', 'BOTTOM']).optional(),
  textCase: z.enum(['ORIGINAL', 'UPPER', 'LOWER', 'TITLE']).optional(),
  textDecoration: z.enum(['NONE', 'UNDERLINE', 'STRIKETHROUGH']).optional(),
  color: z.string().optional(),
  styleName: z.string().optional(),
  contrastWithParentBg: TypographyContrastInfoSchema.optional(),
  segments: z.array(TypographySegmentSchema).optional(),
})

export const CornerRadiusSpecSchema = z.object({
  topLeft: z.number().nonnegative(),
  topRight: z.number().nonnegative(),
  bottomRight: z.number().nonnegative(),
  bottomLeft: z.number().nonnegative(),
  isUniform: z.boolean(),
  uniformRadius: z.number().nonnegative().optional(),
})

export const BorderSpecSchema = z.object({
  color: z.string().optional(),
  width: z.number().nonnegative(),
  align: z.enum(['INSIDE', 'OUTSIDE', 'CENTER']).optional(),
  radius: CornerRadiusSpecSchema,
  individualWeights: z
    .object({
      top: z.number().nonnegative(),
      right: z.number().nonnegative(),
      bottom: z.number().nonnegative(),
      left: z.number().nonnegative(),
    })
    .optional(),
})

export const EffectSpecSchema = z.object({
  type: z.enum(['DROP_SHADOW', 'INNER_SHADOW', 'LAYER_BLUR', 'BACKGROUND_BLUR']),
  color: z.string().optional(),
  offset: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
  radius: z.number().nonnegative(),
  spread: z.number().optional(),
})

export const DesignNodeSchema: z.ZodType<DesignNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    type: DesignNodeTypeSchema,
    visible: z.boolean(),
    dimensions: DimensionSpecSchema,
    layout: LayoutSpecSchema,
    backgrounds: z.array(ColorTokenSchema),
    opacity: z.number().min(0).max(1).optional(),
    typography: TypographySpecSchema.optional(),
    textContent: z.string().optional(),
    border: BorderSpecSchema.optional(),
    effects: z.array(EffectSpecSchema),
    isComponentRoot: z.boolean().optional(),
    isInstance: z.boolean().optional(),
    componentName: z.string().optional(),
    variantProperties: z.record(z.string()).optional(),
    children: z.array(DesignNodeSchema).optional(),
  })
)

export const DesignTokensSchema = z.object({
  colors: z.record(ColorTokenSchema),
  typography: z.record(TypographySpecSchema),
  spacing: z.array(z.number()),
  radii: z.array(z.number()),
  shadows: z.array(EffectSpecSchema),
})

export const AssetSpecSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['icon', 'image', 'vector', 'illustration']),
  format: z.enum(['SVG', 'PNG', 'JPG', 'WEBP']),
  width: z.number().nonnegative(),
  height: z.number().nonnegative(),
  aspectRatio: z.string(),
  path: z.string(),
  suggestedFileName: z.string(),
  exportPresets: z.array(z.string()),
  fillColors: z.array(z.string()).optional(),
})

export const ComponentSpecificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: DesignNodeTypeSchema,
  nodeType: z.string().optional(),
  path: z.string().default(''),
  depth: z.number().default(0),
  textContent: z.string().optional(),
  dimensions: DimensionSpecSchema,
  layout: LayoutSpecSchema,
  backgrounds: z.array(ColorTokenSchema),
  opacity: z.number().min(0).max(1).optional(),
  blendMode: z.string().optional(),
  typography: TypographySpecSchema.optional(),
  border: BorderSpecSchema.optional(),
  effects: z.array(EffectSpecSchema),
  subComponentsCount: z.number(),
})

export const DesignDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  extractedAt: z.string(),
  viewport: z.object({
    width: z.number(),
    height: z.number(),
  }),
  tokens: DesignTokensSchema,
  componentInventory: z.array(ComponentSpecificationSchema),
  assets: z.array(AssetSpecSchema).default([]),
  root: DesignNodeSchema,
  selectionHint: z.string().optional(),
})

export type ValidatedAssetSpec = z.infer<typeof AssetSpecSchema>
export type ValidatedDesignDocument = z.infer<typeof DesignDocumentSchema>
export type ValidatedDesignNode = z.infer<typeof DesignNodeSchema>
