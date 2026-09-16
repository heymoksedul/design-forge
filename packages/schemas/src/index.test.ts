import { describe, it, expect } from 'vitest'
import {
  DesignDocumentSchema,
  DimensionSpecSchema,
  LayoutSpecSchema,
  ColorTokenSchema,
} from './index'
import type { DesignDocument } from '@designforge/design-ir'

describe('Design IR Schemas', () => {
  it('validates a complete DimensionSpec', () => {
    const dim = {
      width: 320,
      height: 48,
      horizontalSizing: 'FIXED' as const,
      verticalSizing: 'HUG' as const,
    }
    const parsed = DimensionSpecSchema.parse(dim)
    expect(parsed.width).toBe(320)
  })

  it('validates a complete ColorToken', () => {
    const color = {
      hex: '#3B82F6',
      rgba: { r: 59, g: 130, b: 246, a: 1 },
      type: 'SOLID' as const,
      role: 'accent' as const,
    }
    const parsed = ColorTokenSchema.parse(color)
    expect(parsed.hex).toBe('#3B82F6')
  })

  it('validates a complete LayoutSpec with paddings and gap', () => {
    const layout = {
      mode: 'HORIZONTAL' as const,
      padding: { top: 12, right: 24, bottom: 12, left: 24 },
      itemSpacing: 8,
      primaryAxisAlign: 'CENTER' as const,
      counterAxisAlign: 'CENTER' as const,
      wrap: false,
    }
    const parsed = LayoutSpecSchema.parse(layout)
    expect(parsed.padding.left).toBe(24)
    expect(parsed.itemSpacing).toBe(8)
  })

  it('validates a complete DesignDocument including component specs', () => {
    const doc: DesignDocument = {
      id: 'doc-1',
      name: 'Button Frame',
      version: '1.0.0',
      extractedAt: new Date().toISOString(),
      viewport: { width: 1440, height: 900 },
      tokens: {
        colors: {
          '#3B82F6': {
            hex: '#3B82F6',
            rgba: { r: 59, g: 130, b: 246, a: 1 },
            type: 'SOLID',
            role: 'accent',
            usageCount: 1,
          },
        },
        typography: {
          'Inter-600-16': {
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: 16,
            color: '#FFFFFF',
          },
        },
        spacing: [8, 12, 24],
        radii: [8],
        shadows: [
          {
            type: 'DROP_SHADOW',
            color: '#0000001A',
            offset: { x: 0, y: 2 },
            radius: 4,
          },
        ],
      },
      componentInventory: [
        {
          id: 'btn-1',
          name: 'Button/Primary',
          type: 'button',
          path: 'Button/Primary',
          depth: 0,
          dimensions: {
            width: 140,
            height: 44,
            horizontalSizing: 'HUG',
            verticalSizing: 'FIXED',
          },
          layout: {
            mode: 'HORIZONTAL',
            padding: { top: 10, right: 16, bottom: 10, left: 16 },
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
          subComponentsCount: 2,
        },
      ],
      assets: [],
      root: {
        id: 'node-root',
        name: 'Button/Primary',
        type: 'button',
        visible: true,
        dimensions: {
          width: 140,
          height: 44,
          horizontalSizing: 'HUG',
          verticalSizing: 'FIXED',
        },
        layout: {
          mode: 'HORIZONTAL',
          padding: { top: 10, right: 16, bottom: 10, left: 16 },
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
        effects: [],
      },
    }

    const validated = DesignDocumentSchema.parse(doc)
    expect(validated.name).toBe('Button Frame')
    expect(validated.componentInventory).toHaveLength(1)
    expect(validated.componentInventory[0]?.layout.padding.right).toBe(16)
  })
})
