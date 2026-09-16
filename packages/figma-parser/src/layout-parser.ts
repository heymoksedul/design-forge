import type {
  DimensionSpec,
  LayoutSpec,
  LayoutMode,
  SizingMode,
  PrimaryAxisAlign,
  CounterAxisAlign,
} from '@designforge/design-ir'

export function parseLayout(node: SceneNode): {
  dimensions: DimensionSpec
  layout: LayoutSpec
} {
  const width = 'width' in node ? Math.round(node.width) : 0
  const height = 'height' in node ? Math.round(node.height) : 0

  let minWidth: number | undefined
  let maxWidth: number | undefined
  let minHeight: number | undefined
  let maxHeight: number | undefined

  if ('minWidth' in node && typeof node.minWidth === 'number') minWidth = node.minWidth
  if ('maxWidth' in node && typeof node.maxWidth === 'number') maxWidth = node.maxWidth
  if ('minHeight' in node && typeof node.minHeight === 'number') minHeight = node.minHeight
  if ('maxHeight' in node && typeof node.maxHeight === 'number') maxHeight = node.maxHeight

  let horizontalSizing: SizingMode = 'FIXED'
  let verticalSizing: SizingMode = 'FIXED'

  if ('layoutSizingHorizontal' in node) {
    const hs = node.layoutSizingHorizontal as string
    if (hs === 'HUG') horizontalSizing = 'HUG'
    else if (hs === 'FILL') horizontalSizing = 'FILL'
    else horizontalSizing = 'FIXED'
  }

  if ('layoutSizingVertical' in node) {
    const vs = node.layoutSizingVertical as string
    if (vs === 'HUG') verticalSizing = 'HUG'
    else if (vs === 'FILL') verticalSizing = 'FILL'
    else verticalSizing = 'FIXED'
  }

  let mode: LayoutMode = 'NONE'
  let paddingTop = 0
  let paddingRight = 0
  let paddingBottom = 0
  let paddingLeft = 0
  let itemSpacing = 0
  let counterAxisSpacing: number | undefined
  let primaryAxisAlign: PrimaryAxisAlign = 'MIN'
  let counterAxisAlign: CounterAxisAlign = 'MIN'
  let wrap = false

  if ('layoutMode' in node && node.layoutMode && node.layoutMode !== 'NONE') {
    mode = node.layoutMode as LayoutMode

    if ('paddingTop' in node && typeof node.paddingTop === 'number') paddingTop = node.paddingTop
    if ('paddingRight' in node && typeof node.paddingRight === 'number')
      paddingRight = node.paddingRight
    if ('paddingBottom' in node && typeof node.paddingBottom === 'number')
      paddingBottom = node.paddingBottom
    if ('paddingLeft' in node && typeof node.paddingLeft === 'number') paddingLeft = node.paddingLeft

    if ('itemSpacing' in node && typeof node.itemSpacing === 'number')
      itemSpacing = Math.round(node.itemSpacing)
    if ('counterAxisSpacing' in node && typeof node.counterAxisSpacing === 'number') {
      counterAxisSpacing = Math.round(node.counterAxisSpacing)
    }

    if ('primaryAxisAlignItems' in node) {
      if (node.primaryAxisAlignItems === 'MAX') primaryAxisAlign = 'MAX'
      else if (node.primaryAxisAlignItems === 'CENTER') primaryAxisAlign = 'CENTER'
      else if (node.primaryAxisAlignItems === 'SPACE_BETWEEN') primaryAxisAlign = 'SPACE_BETWEEN'
    }

    if ('counterAxisAlignItems' in node) {
      if (node.counterAxisAlignItems === 'MAX') counterAxisAlign = 'MAX'
      else if (node.counterAxisAlignItems === 'CENTER') counterAxisAlign = 'CENTER'
      else if (node.counterAxisAlignItems === 'BASELINE') counterAxisAlign = 'BASELINE'
    }

    if ('layoutWrap' in node && node.layoutWrap === 'WRAP') {
      wrap = true
    }
  }

  let isAbsolutePositioned: boolean | undefined
  if ('layoutPositioning' in node && node.layoutPositioning === 'ABSOLUTE') {
    isAbsolutePositioned = true
  }

  let clipsContent: boolean | undefined
  if ('clipsContent' in node && typeof node.clipsContent === 'boolean') {
    clipsContent = node.clipsContent
  }

  let constraints: { horizontal: string; vertical: string } | undefined
  if (
    'constraints' in node &&
    node.constraints &&
    typeof node.constraints === 'object' &&
    'horizontal' in node.constraints &&
    'vertical' in node.constraints
  ) {
    constraints = {
      horizontal: String(node.constraints.horizontal),
      vertical: String(node.constraints.vertical),
    }
  }

  return {
    dimensions: {
      width,
      height,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
      horizontalSizing,
      verticalSizing,
    },
    layout: {
      mode,
      padding: {
        top: Math.round(paddingTop),
        right: Math.round(paddingRight),
        bottom: Math.round(paddingBottom),
        left: Math.round(paddingLeft),
      },
      itemSpacing,
      counterAxisSpacing,
      primaryAxisAlign,
      counterAxisAlign,
      wrap,
      isAbsolutePositioned,
      clipsContent,
      constraints,
    },
  }
}
