import { describe, it, expect } from 'vitest'
import { parseSelection } from './index'
import { generateDesignSystemMarkdown } from '@designforge/generators'
import { DesignDocumentSchema } from '@designforge/schemas'

describe('End-to-End Design System Extraction', () => {
  it('extracts complete design system from a realistic multi-component landing frame', () => {
    // 1. CTA Button
    const navCtaBtn = {
      id: 'nav-cta',
      name: 'Button / Nav CTA',
      type: 'FRAME' as const,
      visible: true,
      width: 100,
      height: 36,
      layoutMode: 'HORIZONTAL' as const,
      paddingTop: 8,
      paddingRight: 16,
      paddingBottom: 8,
      paddingLeft: 16,
      itemSpacing: 6,
      primaryAxisAlignItems: 'CENTER' as const,
      counterAxisAlignItems: 'CENTER' as const,
      layoutSizingHorizontal: 'HUG',
      layoutSizingVertical: 'FIXED',
      cornerRadius: 6,
      fills: [
        {
          type: 'SOLID' as const,
          visible: true,
          color: { r: 0.145, g: 0.388, b: 0.922 }, // #2563EB
          opacity: 1,
        },
      ],
      strokes: [],
      effects: [],
      children: [
        {
          id: 'text-nav-cta',
          name: 'Label',
          type: 'TEXT' as const,
          visible: true,
          characters: 'Sign In',
          fontName: { family: 'Inter', style: 'Medium' },
          fontSize: 14,
          fills: [{ type: 'SOLID' as const, visible: true, color: { r: 1, g: 1, b: 1 }, opacity: 1 }],
          width: 50,
          height: 20,
        },
      ],
    }

    // 2. Navbar Container
    const navbar = {
      id: 'navbar-root',
      name: 'Navbar / Main',
      type: 'FRAME' as const,
      visible: true,
      width: 1440,
      height: 72,
      layoutMode: 'HORIZONTAL' as const,
      paddingTop: 16,
      paddingRight: 64,
      paddingBottom: 16,
      paddingLeft: 64,
      itemSpacing: 32,
      primaryAxisAlignItems: 'SPACE_BETWEEN' as const,
      counterAxisAlignItems: 'CENTER' as const,
      layoutSizingHorizontal: 'FILL',
      layoutSizingVertical: 'FIXED',
      fills: [
        {
          type: 'SOLID' as const,
          visible: true,
          color: { r: 1, g: 1, b: 1 },
          opacity: 1,
        },
      ],
      strokes: [
        {
          type: 'SOLID' as const,
          visible: true,
          color: { r: 0.886, g: 0.91, b: 0.941 }, // #E2E8F0
          opacity: 1,
        },
      ],
      strokeWeight: 1,
      strokeAlign: 'INSIDE' as const,
      effects: [],
      children: [navCtaBtn],
    }

    // 3. Feature Card
    const featureCard = {
      id: 'card-1',
      name: 'Feature Card / Analytics',
      type: 'FRAME' as const,
      visible: true,
      width: 380,
      height: 240,
      layoutMode: 'VERTICAL' as const,
      paddingTop: 24,
      paddingRight: 24,
      paddingBottom: 24,
      paddingLeft: 24,
      itemSpacing: 12,
      primaryAxisAlignItems: 'MIN' as const,
      counterAxisAlignItems: 'MIN' as const,
      layoutSizingHorizontal: 'FIXED',
      layoutSizingVertical: 'FIXED',
      cornerRadius: 12,
      fills: [
        {
          type: 'SOLID' as const,
          visible: true,
          color: { r: 0.98, g: 0.98, b: 0.98 },
          opacity: 1,
        },
      ],
      strokes: [
        {
          type: 'SOLID' as const,
          visible: true,
          color: { r: 0.886, g: 0.91, b: 0.941 },
          opacity: 1,
        },
      ],
      strokeWeight: 1,
      effects: [
        {
          type: 'DROP_SHADOW' as const,
          visible: true,
          color: { r: 0, g: 0, b: 0, a: 0.05 },
          offset: { x: 0, y: 4 },
          radius: 12,
        },
      ],
      children: [
        {
          id: 'card-title',
          name: 'Title',
          type: 'TEXT' as const,
          visible: true,
          characters: 'Real-time Analytics',
          fontName: { family: 'Inter', style: 'SemiBold' },
          fontSize: 20,
          fills: [{ type: 'SOLID' as const, visible: true, color: { r: 0.06, g: 0.09, b: 0.16 }, opacity: 1 }],
          width: 200,
          height: 28,
        },
        {
          id: 'card-desc',
          name: 'Description',
          type: 'TEXT' as const,
          visible: true,
          characters: 'Track your conversion rates and engagement seamlessly.',
          fontName: { family: 'Inter', style: 'Regular' },
          fontSize: 14,
          lineHeight: { value: 20, unit: 'PIXELS' },
          fills: [{ type: 'SOLID' as const, visible: true, color: { r: 0.39, g: 0.45, b: 0.55 }, opacity: 1 }],
          width: 320,
          height: 40,
        },
      ],
    }

    // Root Landing Frame
    const landingPageFrame = {
      id: 'landing-frame-root',
      name: 'Landing Page / SaaS v1',
      type: 'FRAME' as const,
      visible: true,
      width: 1440,
      height: 1200,
      layoutMode: 'VERTICAL' as const,
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 80,
      paddingLeft: 0,
      itemSpacing: 64,
      primaryAxisAlignItems: 'MIN' as const,
      counterAxisAlignItems: 'CENTER' as const,
      layoutSizingHorizontal: 'FIXED',
      layoutSizingVertical: 'HUG',
      fills: [
        {
          type: 'SOLID' as const,
          visible: true,
          color: { r: 1, g: 1, b: 1 },
          opacity: 1,
        },
      ],
      strokes: [],
      effects: [],
      children: [navbar, featureCard],
    }

    // Run Parser
    const doc = parseSelection(landingPageFrame as unknown as SceneNode)

    // Validate with Zod schema
    const validated = DesignDocumentSchema.parse(doc)
    expect(validated.name).toBe('Landing Page / SaaS v1')
    expect(validated.viewport.width).toBe(1440)
    expect(validated.viewport.height).toBe(1200)

    // Verify component inventory extraction
    expect(doc.componentInventory.length).toBeGreaterThanOrEqual(3)
    const componentNames = doc.componentInventory.map((c) => c.name)
    expect(componentNames).toContain('Navbar / Main')
    expect(componentNames).toContain('Button / Nav CTA')
    expect(componentNames).toContain('Feature Card / Analytics')

    // Verify detailed specs on Feature Card
    const cardSpec = doc.componentInventory.find((c) => c.name.includes('Feature Card'))
    expect(cardSpec).toBeDefined()
    expect(cardSpec?.dimensions.width).toBe(380)
    expect(cardSpec?.dimensions.height).toBe(240)
    expect(cardSpec?.layout.padding.top).toBe(24)
    expect(cardSpec?.layout.padding.bottom).toBe(24)
    expect(cardSpec?.layout.itemSpacing).toBe(12)
    expect(cardSpec?.border?.radius.topLeft).toBe(12)
    expect(cardSpec?.border?.width).toBe(1)
    expect(cardSpec?.effects).toHaveLength(1)
    expect(cardSpec?.effects[0]?.radius).toBe(12)

    // Run Markdown Generator
    const markdown = generateDesignSystemMarkdown(doc)

    // Verify generated markdown details
    expect(markdown).toContain('# Design System Specification: Landing Page / SaaS v1')
    expect(markdown).toContain('`#2563EB`') // CTA button color
    expect(markdown).toContain('| **Padding** | **24px** |')
    expect(markdown).toContain('12px (uniform)') // Corner radius
    expect(markdown).toContain('`Feature Card / Analytics`')
    expect(markdown).toContain('`Navbar / Main`')
    expect(markdown).toContain('`Button / Nav CTA`')
  })
})
