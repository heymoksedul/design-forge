import { describe, it, expect } from 'vitest'
import { generateDesignSystemMarkdown, DesignSystemMarkdownGenerator } from './index'
import type { DesignDocument } from '@designforge/design-ir'

describe('Design System Markdown Generator', () => {
  const mockDoc: DesignDocument = {
    id: 'doc-hero',
    name: 'Hero Section Frame',
    version: '1.0.0',
    extractedAt: '2026-09-16T12:00:00.000Z',
    viewport: { width: 1440, height: 800 },
    tokens: {
      colors: {
        '#0F172A': {
          hex: '#0F172A',
          rgba: { r: 15, g: 23, b: 42, a: 1 },
          type: 'SOLID',
          role: 'background',
          usageCount: 2,
        },
        '#3B82F6': {
          hex: '#3B82F6',
          rgba: { r: 59, g: 130, b: 246, a: 1 },
          type: 'SOLID',
          role: 'accent',
          usageCount: 3,
        },
      },
      typography: {
        'Inter-700-48': {
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: 48,
          lineHeight: { value: 56, unit: 'PIXELS' },
          color: '#FFFFFF',
        },
        'Inter-400-18': {
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: 18,
          color: '#94A3B8',
        },
      },
      spacing: [12, 24, 48, 80],
      radii: [8, 12],
      shadows: [
        {
          type: 'DROP_SHADOW',
          color: '#00000033',
          offset: { x: 0, y: 4 },
          radius: 12,
        },
      ],
    },
    componentInventory: [
      {
        id: 'comp-btn',
        name: 'Primary CTA Button',
        type: 'button',
        path: 'Hero Section Frame > Primary CTA Button',
        depth: 1,
        dimensions: {
          width: 160,
          height: 48,
          horizontalSizing: 'HUG',
          verticalSizing: 'FIXED',
        },
        layout: {
          mode: 'HORIZONTAL',
          padding: { top: 12, right: 24, bottom: 12, left: 24 },
          itemSpacing: 8,
          primaryAxisAlign: 'CENTER',
          counterAxisAlign: 'CENTER',
          wrap: false,
        },
        backgrounds: [
          {
            hex: '#3B82F6',
            rgba: { r: 59, g: 130, b: 246, a: 1 },
            type: 'SOLID',
          },
        ],
        typography: {
          fontFamily: 'Inter',
          fontWeight: 600,
          fontSize: 16,
          color: '#FFFFFF',
        },
        border: {
          width: 0,
          radius: {
            topLeft: 8,
            topRight: 8,
            bottomRight: 8,
            bottomLeft: 8,
            isUniform: true,
            uniformRadius: 8,
          },
        },
        effects: [],
        subComponentsCount: 1,
      },
    ],
    assets: [
      {
        id: 'asset-icon',
        name: 'Icon / Arrow Right',
        category: 'icon',
        format: 'SVG',
        width: 20,
        height: 20,
        aspectRatio: '1:1',
        path: 'Hero Section Frame > Primary CTA Button > Icon / Arrow Right',
        suggestedFileName: 'assets/icons/arrow-right.svg',
        exportPresets: ['SVG (vector)'],
        fillColors: ['#FFFFFF'],
      },
    ],
    root: {
      id: 'root-node',
      name: 'Hero Section Frame',
      type: 'section',
      visible: true,
      dimensions: {
        width: 1440,
        height: 800,
        horizontalSizing: 'FIXED',
        verticalSizing: 'FIXED',
      },
      layout: {
        mode: 'VERTICAL',
        padding: { top: 80, right: 48, bottom: 80, left: 48 },
        itemSpacing: 32,
        primaryAxisAlign: 'CENTER',
        counterAxisAlign: 'CENTER',
        wrap: false,
      },
      backgrounds: [
        {
          hex: '#0F172A',
          rgba: { r: 15, g: 23, b: 42, a: 1 },
          type: 'SOLID',
        },
      ],
      effects: [],
    },
  }

  it('generates a detailed markdown document containing tokens and component specs', () => {
    const md = generateDesignSystemMarkdown(mockDoc)

    // Verify Title & Viewport
    expect(md).toContain('# Design System Specification: Hero Section Frame')
    expect(md).toContain('1440px × 800px')

    // Verify Color Palette
    expect(md).toContain('`#0F172A`')
    expect(md).toContain('`#3B82F6`')

    // Verify Typography Scales
    expect(md).toContain('Inter')
    expect(md).toContain('**48px**')
    expect(md).toContain('**18px**')

    // Verify Spacing Scale
    expect(md).toContain('`12px` • `24px` • `48px` • `80px`')

    // Verify Asset Manifest
    expect(md).toContain('## 2. Asset & Media Manifest (Icons, Vectors & Images)')
    expect(md).toContain('`assets/icons/arrow-right.svg`')
    expect(md).toContain('**20px × 20px**')

    // Verify Per-Component Specs
    expect(md).toContain('### 3.1 `Primary CTA Button` — BUTTON')
    expect(md).toContain('**160px** (W) × **48px** (H)')
    expect(md).toContain('`HUG`')
    expect(md).toContain('**12px 24px**')
    expect(md).toContain('**8px**') // Item Gap
    expect(md).toContain('`#3B82F6`') // Background Fill
    expect(md).toContain('8px (uniform)') // Corner radius

    // Verify Section 5: Developer Copy-Paste Snippets
    expect(md).toContain('## 5. Developer Copy-Paste Tokens & Styles')
    expect(md).toContain('### 5.1 CSS Custom Properties (`:root`)')
    expect(md).toContain(':root {')
    expect(md).toContain('--color-accent-1: #3B82F6;')
    expect(md).toContain('--spacing-12: 12px;')
    expect(md).toContain('--radius-8: 8px;')

    expect(md).toContain('### 5.2 Tailwind CSS v4 Theme (`@theme`)')
    expect(md).toContain('@theme {')
    expect(md).toContain('--color-accent-1: #3B82F6;')

    expect(md).toContain('### 5.3 Tailwind CSS v3 Configuration (`tailwind.config.js`)')
    expect(md).toContain('module.exports = {')
  })

  it('works seamlessly with DesignSystemMarkdownGenerator class', async () => {
    const generator = new DesignSystemMarkdownGenerator()
    const files = await generator.generate(mockDoc)

    expect(files).toHaveLength(1)
    expect(files[0]?.path).toBe('DESIGN_SYSTEM.md')
    expect(files[0]?.content).toContain('Primary CTA Button')
  })
})
