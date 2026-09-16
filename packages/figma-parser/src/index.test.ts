import { describe, it, expect } from 'vitest'
import { parseSelection } from './index'

describe('Figma Parser Engine', () => {
  it('extracts complete design metrics, paddings, typography, and colors from a button frame', () => {
    // Construct a mock Figma button frame node
    const mockTextNode = {
      id: 'text-1',
      name: 'Button Label',
      type: 'TEXT' as const,
      visible: true,
      characters: 'Get Started',
      fontName: { family: 'Inter', style: 'SemiBold' },
      fontSize: 16,
      lineHeight: { value: 24, unit: 'PIXELS' },
      letterSpacing: { value: -0.01, unit: 'PERCENT' },
      textAlignHorizontal: 'CENTER' as const,
      textAlignVertical: 'CENTER' as const,
      fills: [
        {
          type: 'SOLID' as const,
          visible: true,
          color: { r: 1, g: 1, b: 1 },
          opacity: 1,
        },
      ],
      width: 90,
      height: 24,
    }

    const mockButtonFrame = {
      id: 'frame-btn',
      name: 'Button / Primary',
      type: 'FRAME' as const,
      visible: true,
      width: 140,
      height: 48,
      layoutMode: 'HORIZONTAL' as const,
      paddingTop: 12,
      paddingRight: 24,
      paddingBottom: 12,
      paddingLeft: 24,
      itemSpacing: 8,
      primaryAxisAlignItems: 'CENTER' as const,
      counterAxisAlignItems: 'CENTER' as const,
      layoutSizingHorizontal: 'HUG',
      layoutSizingVertical: 'FIXED',
      cornerRadius: 8,
      fills: [
        {
          type: 'SOLID' as const,
          visible: true,
          color: { r: 0.231, g: 0.51, b: 0.965 }, // #3B82F6
          opacity: 1,
        },
      ],
      strokes: [],
      effects: [
        {
          type: 'DROP_SHADOW' as const,
          visible: true,
          color: { r: 0, g: 0, b: 0, a: 0.1 },
          offset: { x: 0, y: 2 },
          radius: 4,
        },
      ],
      children: [mockTextNode],
    }

    const doc = parseSelection(mockButtonFrame as unknown as SceneNode)

    // 1. Verify Root
    expect(doc.name).toBe('Button / Primary')
    expect(doc.viewport.width).toBe(140)
    expect(doc.viewport.height).toBe(48)

    // 2. Verify Padding & Layout
    expect(doc.root.layout.mode).toBe('HORIZONTAL')
    expect(doc.root.layout.padding.top).toBe(12)
    expect(doc.root.layout.padding.right).toBe(24)
    expect(doc.root.layout.padding.bottom).toBe(12)
    expect(doc.root.layout.padding.left).toBe(24)
    expect(doc.root.layout.itemSpacing).toBe(8)
    expect(doc.root.dimensions.horizontalSizing).toBe('HUG')
    expect(doc.root.dimensions.verticalSizing).toBe('FIXED')

    // 3. Verify Colors & Backgrounds
    expect(doc.root.backgrounds).toHaveLength(1)
    expect(doc.root.backgrounds[0]?.hex).toBe('#3B82F6')

    // 4. Verify Corner Radius
    expect(doc.root.border?.radius.topLeft).toBe(8)
    expect(doc.root.border?.radius.isUniform).toBe(true)

    // 5. Verify Shadow
    expect(doc.root.effects).toHaveLength(1)
    expect(doc.root.effects[0]?.type).toBe('DROP_SHADOW')

    // 6. Verify Children & Text Typography
    expect(doc.root.children).toHaveLength(1)
    const childText = doc.root.children?.[0]
    expect(childText?.textContent).toBe('Get Started')
    expect(childText?.typography?.fontFamily).toBe('Inter')
    expect(childText?.typography?.fontWeight).toBe(600)
    expect(childText?.typography?.fontSize).toBe(16)
    expect(childText?.typography?.color).toBe('#FFFFFF')

    // 7. Verify Tokens & Element Inventory (Extracts every layer)
    expect(doc.tokens.spacing).toContain(12)
    expect(doc.tokens.spacing).toContain(24)
    expect(doc.tokens.spacing).toContain(8)
    expect(doc.tokens.radii).toContain(8)
    expect(doc.componentInventory).toHaveLength(2)
    expect(doc.componentInventory[0]?.name).toBe('Button / Primary')
    expect(doc.componentInventory[0]?.dimensions.width).toBe(140)
    expect(doc.componentInventory[1]?.name).toBe('Button Label')
    expect(doc.componentInventory[1]?.textContent).toBe('Get Started')
    expect(doc.componentInventory[1]?.typography?.fontSize).toBe(16)
  })

  it('correctly parses individual borders, clipsContent, absolute positioning, and mixed typography segments', () => {
    const mockMixedTextNode = {
      id: 'text-mixed',
      name: 'Mixed Text Layer',
      type: 'TEXT' as const,
      visible: true,
      characters: 'Figma to Next.js',
      fontName: Symbol('mixed'),
      fontSize: Symbol('mixed'),
      getStyledTextSegments: () => [
        {
          characters: 'Figma ',
          fontName: { family: 'Inter', style: 'Bold' },
          fontSize: 24,
          fills: [{ type: 'SOLID', visible: true, color: { r: 1, g: 0, b: 0 } }],
        },
        {
          characters: 'to Next.js',
          fontName: { family: 'Roboto', style: 'Regular' },
          fontSize: 18,
          fills: [{ type: 'SOLID', visible: true, color: { r: 0, g: 0, b: 1 } }],
        },
      ],
      width: 200,
      height: 30,
      layoutPositioning: 'ABSOLUTE',
      constraints: { horizontal: 'CENTER', vertical: 'MIN' },
    }

    const mockCardContainer = {
      id: 'card-container',
      name: 'Card Container',
      type: 'FRAME' as const,
      visible: true,
      width: 400,
      height: 300,
      clipsContent: true,
      strokeTopWeight: 2,
      strokeRightWeight: 0,
      strokeBottomWeight: 4,
      strokeLeftWeight: 0,
      strokes: [
        {
          type: 'SOLID' as const,
          visible: true,
          color: { r: 0.1, g: 0.1, b: 0.1 },
        },
      ],
      children: [mockMixedTextNode],
    }

    const doc = parseSelection(mockCardContainer as unknown as SceneNode)

    // Verify clipsContent
    expect(doc.root.layout.clipsContent).toBe(true)

    // Verify individual border weights
    expect(doc.root.border?.individualWeights).toEqual({
      top: 2,
      right: 0,
      bottom: 4,
      left: 0,
    })

    // Verify child with absolute positioning and constraints
    const child = doc.root.children?.[0]
    expect(child?.layout.isAbsolutePositioned).toBe(true)
    expect(child?.layout.constraints).toEqual({
      horizontal: 'CENTER',
      vertical: 'MIN',
    })

    // Verify mixed typography segments
    expect(child?.typography?.fontFamily).toBe('Inter')
    expect(child?.typography?.fontWeight).toBe(700)
    expect(child?.typography?.segments).toHaveLength(2)
    expect(child?.typography?.segments?.[0]?.text).toBe('Figma ')
    expect(child?.typography?.segments?.[1]?.text).toBe('to Next.js')
    expect(child?.typography?.segments?.[1]?.fontFamily).toBe('Roboto')
  })

  it('detects vector icons, image fills, aspect ratios, and computes WCAG contrast and rem metrics', () => {
    const mockIconNode = {
      id: 'icon-arrow',
      name: 'Icon / Arrow Right',
      type: 'FRAME' as const,
      visible: true,
      width: 24,
      height: 24,
      children: [
        {
          id: 'vec-1',
          name: 'Vector',
          type: 'VECTOR' as const,
          visible: true,
          width: 16,
          height: 16,
          fills: [{ type: 'SOLID', visible: true, color: { r: 1, g: 1, b: 1 } }],
        },
      ],
    }

    const mockImageBanner = {
      id: 'img-hero',
      name: 'Hero Cover Banner',
      type: 'RECTANGLE' as const,
      visible: true,
      width: 1600,
      height: 900,
      fills: [
        {
          type: 'IMAGE' as const,
          visible: true,
        },
      ],
    }

    const mockTextWithContrast = {
      id: 'text-contrast',
      name: 'Heading on Dark',
      type: 'TEXT' as const,
      visible: true,
      characters: 'Accessible Heading',
      fontName: { family: 'Inter', style: 'Bold' },
      fontSize: 32,
      lineHeight: { value: 48, unit: 'PIXELS' },
      letterSpacing: { value: 0, unit: 'PIXELS' },
      fills: [{ type: 'SOLID', visible: true, color: { r: 1, g: 1, b: 1 } }], // #FFFFFF
      width: 300,
      height: 48,
    }

    const mockDarkSection = {
      id: 'section-dark',
      name: 'Hero Section Dark',
      type: 'FRAME' as const,
      visible: true,
      width: 1600,
      height: 1000,
      fills: [
        {
          type: 'SOLID' as const,
          visible: true,
          color: { r: 0.059, g: 0.09, b: 0.165 }, // #0F172A
        },
      ],
      children: [mockIconNode, mockImageBanner, mockTextWithContrast],
    }

    const doc = parseSelection(mockDarkSection as unknown as SceneNode)

    // 1. Verify Assets Manifest Collection
    expect(doc.assets).toHaveLength(2)

    const iconAsset = doc.assets.find((a) => a.category === 'icon')
    expect(iconAsset).toBeDefined()
    expect(iconAsset?.name).toBe('Icon / Arrow Right')
    expect(iconAsset?.format).toBe('SVG')
    expect(iconAsset?.width).toBe(24)
    expect(iconAsset?.height).toBe(24)
    expect(iconAsset?.aspectRatio).toBe('1:1')
    expect(iconAsset?.suggestedFileName).toBe('assets/icons/arrow-right.svg')

    const imageAsset = doc.assets.find((a) => a.category === 'image')
    expect(imageAsset).toBeDefined()
    expect(imageAsset?.name).toBe('Hero Cover Banner')
    expect(imageAsset?.format).toBe('PNG')
    expect(imageAsset?.width).toBe(1600)
    expect(imageAsset?.height).toBe(900)
    expect(imageAsset?.aspectRatio).toBe('16:9')
    expect(imageAsset?.suggestedFileName).toBe('assets/images/hero-cover-banner.png')
    expect(imageAsset?.exportPresets).toContain('PNG @2x')

    // 2. Verify WCAG Contrast Calculation
    const textNode = doc.root.children?.find((c) => c.name === 'Heading on Dark')
    expect(textNode?.typography?.contrastWithParentBg).toBeDefined()
    const contrast = textNode?.typography?.contrastWithParentBg
    expect(contrast?.passesAA).toBe(true)
    expect(contrast?.passesAAA).toBe(true)
    expect(contrast?.rating).toBe('AAA')
    expect(contrast?.contrastRatio).toBeGreaterThan(10) // White on Dark is ~16:1

    // 3. Verify Rem and Line Height Ratio
    expect(textNode?.typography?.fontSizeRem).toBe(2) // 32 / 16 = 2rem
    expect(textNode?.typography?.lineHeightRatio).toBe(1.5) // 48 / 32 = 1.5
  })
})
