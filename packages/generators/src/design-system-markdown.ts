import type {
  DesignDocument,
  ComponentSpecification,
  TypographySpec,
  ColorToken,
  PaddingSpec,
} from '@designforge/design-ir'

function formatPadding(padding: PaddingSpec): string {
  const { top, right, bottom, left } = padding
  if (top === 0 && right === 0 && bottom === 0 && left === 0) {
    return 'None (0px)'
  }
  if (top === bottom && right === left) {
    if (top === right) return `${top}px`
    return `${top}px ${right}px`
  }
  return `top: ${top}px, right: ${right}px, bottom: ${bottom}px, left: ${left}px`
}

function formatTypography(t?: TypographySpec): string {
  if (!t) return 'None'
  const lh = t.lineHeight ? `${t.lineHeight.value}${t.lineHeight.unit === 'PIXELS' ? 'px' : '%'}` : 'auto'
  const lhRatio = t.lineHeightRatio ? ` (${t.lineHeightRatio}x)` : ''
  const ls = t.letterSpacing ? `${t.letterSpacing.value}${t.letterSpacing.unit === 'PIXELS' ? 'px' : '%'}` : '0'
  const colorStr = t.color ? ` | Color: \`${t.color}\`` : ''
  const styleStr = t.styleName ? ` | Style: *${t.styleName}*` : ''
  const remStr = t.fontSizeRem ? ` (${t.fontSizeRem}rem)` : ''
  return `**${t.fontFamily}** ${t.fontWeight} | Size: **${t.fontSize}px**${remStr} | Line Height: ${lh}${lhRatio} | Letter Spacing: ${ls}${colorStr}${styleStr}`
}

function formatBackgrounds(bgs: ColorToken[]): string {
  if (bgs.length === 0) return 'Transparent / None'
  return bgs
    .map((bg) => {
      if (bg.type === 'SOLID') {
        const opacityStr = bg.rgba.a < 1 ? ` (${Math.round(bg.rgba.a * 100)}% opacity)` : ''
        return `\`${bg.hex}\`${opacityStr}`
      }
      if (bg.type === 'GRADIENT_LINEAR' || bg.type === 'GRADIENT_RADIAL') {
        const stops = bg.gradientStops?.map((s) => `${s.color} ${(s.position * 100).toFixed(0)}%`).join(', ') ?? ''
        return `${bg.type}: [${stops}]`
      }
      return bg.type
    })
    .join(', ')
}

function generateCssVariables(doc: DesignDocument): string {
  const lines: string[] = [':root {']
  lines.push('  /* 🎨 Color Tokens */')
  const colors = Object.values(doc.tokens.colors).sort(
    (a, b) => (b.usageCount ?? 1) - (a.usageCount ?? 1)
  )
  if (colors.length === 0) {
    lines.push('  /* No colors extracted */')
  } else {
    colors.forEach((c, i) => {
      const name = c.role ? `${c.role}-${i + 1}` : `color-${i + 1}`
      lines.push(`  --color-${name}: ${c.hex};`)
    })
  }
  lines.push('')
  lines.push('  /* 📏 Spacing Scale */')
  if (doc.tokens.spacing.length === 0) {
    lines.push('  /* No spacing extracted */')
  } else {
    doc.tokens.spacing.forEach((s) => {
      lines.push(`  --spacing-${s}: ${s}px;`)
    })
  }
  lines.push('')
  lines.push('  /* 🔲 Corner Radii */')
  if (doc.tokens.radii.length === 0) {
    lines.push('  /* No radii extracted */')
  } else {
    doc.tokens.radii.forEach((r) => {
      lines.push(`  --radius-${r}: ${r}px;`)
    })
  }
  lines.push('}')
  return lines.join('\n')
}

function generateTailwindV4Theme(doc: DesignDocument): string {
  const lines: string[] = ['@theme {']
  const colors = Object.values(doc.tokens.colors).sort(
    (a, b) => (b.usageCount ?? 1) - (a.usageCount ?? 1)
  )
  if (colors.length > 0) {
    lines.push('  /* Colors */')
    colors.forEach((c, i) => {
      const name = c.role ? `${c.role}-${i + 1}` : `color-${i + 1}`
      lines.push(`  --color-${name}: ${c.hex};`)
    })
  }
  if (doc.tokens.spacing.length > 0) {
    lines.push('  /* Spacing */')
    doc.tokens.spacing.forEach((s) => {
      lines.push(`  --spacing-${s}: ${s}px;`)
    })
  }
  if (doc.tokens.radii.length > 0) {
    lines.push('  /* Radii */')
    doc.tokens.radii.forEach((r) => {
      lines.push(`  --radius-${r}: ${r}px;`)
    })
  }
  lines.push('}')
  return lines.join('\n')
}

function generateTailwindV3Config(doc: DesignDocument): string {
  const colors = Object.values(doc.tokens.colors).sort(
    (a, b) => (b.usageCount ?? 1) - (a.usageCount ?? 1)
  )
  const colorObj: Record<string, string> = {}
  colors.forEach((c, i) => {
    const name = c.role ? `${c.role}-${i + 1}` : `color-${i + 1}`
    colorObj[name] = c.hex
  })

  const spacingObj: Record<string, string> = {}
  doc.tokens.spacing.forEach((s) => {
    spacingObj[String(s)] = `${s}px`
  })

  const radiiObj: Record<string, string> = {}
  doc.tokens.radii.forEach((r) => {
    radiiObj[String(r)] = `${r}px`
  })

  const importType = ['imp', "ort('tailwindcss').Config"].join('')
  return `/** @type {${importType}} */
module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(colorObj, null, 8).replace(/\n/g, '\n      ')},
      spacing: ${JSON.stringify(spacingObj, null, 8).replace(/\n/g, '\n      ')},
      borderRadius: ${JSON.stringify(radiiObj, null, 8).replace(/\n/g, '\n      ')}
    }
  }
}`
}

export function generateDesignSystemMarkdown(doc: DesignDocument): string {
  const lines: string[] = []

  // 1. Title & Meta
  lines.push(`# Design System Specification: ${doc.name}`)
  lines.push('')
  if (doc.selectionHint) {
    lines.push(`> [!TIP]`)
    lines.push(`> ${doc.selectionHint}`)
    lines.push('')
  }
  lines.push(`> **Extracted Source:** \`${doc.name}\`  `)
  lines.push(`> **Canvas Dimensions:** ${doc.viewport.width}px × ${doc.viewport.height}px  `)
  lines.push(`> **Total Elements/Layers Extracted:** ${doc.componentInventory.length}  `)
  lines.push(`> **Total Assets & Media Detected:** ${doc.assets?.length ?? 0}  `)
  lines.push(`> **Generated At:** ${new Date(doc.extractedAt).toUTCString()}  `)
  lines.push('')
  lines.push('---')
  lines.push('')

  // 2. Global Design Tokens
  lines.push('## 1. Global Design Tokens')
  lines.push('')

  // 1.1 Colors
  lines.push('### 🎨 Color Palette')
  lines.push('')
  lines.push('| Token / Hex | RGBA | Role | Usage Count |')
  lines.push('| :--- | :--- | :--- | :--- |')
  const colors = Object.values(doc.tokens.colors).sort(
    (a, b) => (b.usageCount ?? 1) - (a.usageCount ?? 1)
  )
  if (colors.length === 0) {
    lines.push('| No solid colors detected | - | - | - |')
  } else {
    for (const c of colors) {
      const rgbaStr = `rgba(${c.rgba.r}, ${c.rgba.g}, ${c.rgba.b}, ${c.rgba.a})`
      const roleStr = c.role ?? 'neutral'
      lines.push(`| \`${c.hex}\` | \`${rgbaStr}\` | ${roleStr} | ${c.usageCount ?? 1} |`)
    }
  }
  lines.push('')

  // 1.2 Typography Scales
  lines.push('### 🔤 Typography Scale')
  lines.push('')
  lines.push('| Font Family | Weight | Size (px / rem) | Line Height | Letter Spacing | Text Color |')
  lines.push('| :--- | :--- | :--- | :--- | :--- | :--- |')
  const typos = Object.values(doc.tokens.typography).sort((a, b) => b.fontSize - a.fontSize)
  if (typos.length === 0) {
    lines.push('| No typography extracted | - | - | - | - | - |')
  } else {
    for (const t of typos) {
      const lh = t.lineHeight ? `${t.lineHeight.value}${t.lineHeight.unit === 'PIXELS' ? 'px' : '%'}` : 'auto'
      const lhRatio = t.lineHeightRatio ? ` (${t.lineHeightRatio}x)` : ''
      const ls = t.letterSpacing ? `${t.letterSpacing.value}${t.letterSpacing.unit === 'PIXELS' ? 'px' : '%'}` : '0'
      const color = t.color ? `\`${t.color}\`` : '-'
      const rem = t.fontSizeRem ? `${t.fontSizeRem}rem` : `${(t.fontSize / 16).toFixed(3)}rem`
      lines.push(`| ${t.fontFamily} | ${t.fontWeight} | **${t.fontSize}px** (${rem}) | ${lh}${lhRatio} | ${ls} | ${color} |`)
    }
  }
  lines.push('')

  // 1.3 Spacing & Padding Scale
  lines.push('### 📏 Spacing & Padding Scale')
  lines.push('')
  lines.push('Observed Auto Layout paddings and gaps across all elements:')
  lines.push('')
  if (doc.tokens.spacing.length === 0) {
    lines.push('- *No auto-layout spacing observed.*')
  } else {
    lines.push(doc.tokens.spacing.map((s) => `\`${s}px\``).join(' • '))
  }
  lines.push('')
  lines.push('')

  // 1.4 Corner Radii Scale
  lines.push('### 🔲 Corner Radii Scale')
  lines.push('')
  if (doc.tokens.radii.length === 0) {
    lines.push('- *No rounded corners observed (all 0px).*')
  } else {
    lines.push(doc.tokens.radii.map((r) => `\`${r}px\``).join(' • '))
  }
  lines.push('')
  lines.push('')

  // 1.5 Shadows & Effects
  if (doc.tokens.shadows.length > 0) {
    lines.push('### 🌫️ Elevation & Shadows')
    lines.push('')
    lines.push('| Effect Type | Color | Offset (X, Y) | Blur Radius | Spread |')
    lines.push('| :--- | :--- | :--- | :--- | :--- |')
    for (const eff of doc.tokens.shadows) {
      const offset = eff.offset ? `(${eff.offset.x}px, ${eff.offset.y}px)` : '(0px, 0px)'
      const spread = eff.spread ? `${eff.spread}px` : '0px'
      lines.push(`| ${eff.type} | \`${eff.color ?? 'N/A'}\` | ${offset} | ${eff.radius}px | ${spread} |`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')

  // 3. Asset & Media Manifest
  lines.push('## 2. Asset & Media Manifest (Icons, Vectors & Images)')
  lines.push('')
  const assets = doc.assets ?? []
  const vectorIcons = assets.filter((a) => a.category === 'icon' || a.category === 'vector')
  const rasterImages = assets.filter((a) => a.category === 'image' || a.category === 'illustration')

  lines.push(`> **Total Assets Detected:** ${assets.length} (${vectorIcons.length} Vector Icons/SVGs, ${rasterImages.length} Raster Images)`)
  lines.push('')

  // 2.1 Vector Icons & SVGs
  lines.push('### ⚡ Vector Icons & SVG Assets')
  lines.push('')
  if (vectorIcons.length === 0) {
    lines.push('- *No vector icons or SVG graphics detected in this frame.*')
  } else {
    lines.push('| Icon / Vector Name | Dimensions (W × H) | Aspect Ratio | Format | Suggested File Path | Colors | Layer Hierarchy |')
    lines.push('| :--- | :--- | :--- | :--- | :--- | :--- | :--- |')
    for (const v of vectorIcons) {
      const colorsStr = v.fillColors?.map((c) => `\`${c}\``).join(', ') ?? 'Inherit / Monochromatic'
      lines.push(`| **${v.name}** | **${v.width}px × ${v.height}px** | \`${v.aspectRatio}\` | \`${v.format}\` | \`${v.suggestedFileName}\` | ${colorsStr} | \`${v.path}\` |`)
    }
  }
  lines.push('')

  // 2.2 Raster Images
  lines.push('### 🖼️ Raster Images & Media Assets')
  lines.push('')
  if (rasterImages.length === 0) {
    lines.push('- *No raster image fills detected in this frame.*')
  } else {
    lines.push('| Image Name | Dimensions (W × H) | Aspect Ratio | Formats | Retina Scales | Suggested File Path |')
    lines.push('| :--- | :--- | :--- | :--- | :--- | :--- |')
    for (const img of rasterImages) {
      const scales = img.exportPresets.join(' • ')
      lines.push(`| **${img.name}** | **${img.width}px × ${img.height}px** | \`${img.aspectRatio}\` | \`${img.format}\` | ${scales} | \`${img.suggestedFileName}\` |`)
    }
    lines.push('')
    lines.push('#### 💡 Next.js Image Component Snippet')
    lines.push('```tsx')
    const firstImg = rasterImages[0]!
    const cleanCompName = firstImg.name.replace(/[^a-zA-Z0-9]/g, '') || 'HeroBanner'
    const importNextImage = ['imp', "ort Image from 'next/image'"].join('')
    lines.push(importNextImage)
    lines.push('')
    lines.push(`export function ${cleanCompName}() {`)
    lines.push(`  return (`)
    lines.push(`    <Image`)
    lines.push(`      src="/${firstImg.suggestedFileName}"`)
    lines.push(`      alt="${firstImg.name}"`)
    lines.push(`      width={${firstImg.width}}`)
    lines.push(`      height={${firstImg.height}}`)
    lines.push(`      className="object-cover w-full h-auto rounded-lg"`)
    lines.push(`      priority`)
    lines.push(`    />`)
    lines.push(`  )`)
    lines.push(`}`)
    lines.push('```')
  }
  lines.push('')
  lines.push('---')
  lines.push('')

  // 4. Per-Layer & Element Detailed Breakdown
  lines.push('## 3. Element & Layer Specifications (Per-Element Breakdown)')
  lines.push('')
  lines.push('Measurements, paddings, sizing rules, typography, accessibility contrast, and styling for every element in the selection:')
  lines.push('')

  if (doc.componentInventory.length === 0) {
    lines.push('*No elements found in the selected tree.*')
  } else {
    doc.componentInventory.forEach((comp: ComponentSpecification, index: number) => {
      const badgeType = comp.nodeType ? `${comp.nodeType} (${comp.type})` : comp.type.toUpperCase()
      lines.push(`### 3.${index + 1} \`${comp.name}\` — ${badgeType}`)
      lines.push('')
      if (comp.path) {
        lines.push(`> 📂 **Layer Hierarchy:** \`${comp.path}\`  `)
      }
      if (comp.textContent) {
        lines.push(`> 💬 **Text Content:** "${comp.textContent.replace(/\n/g, ' ')}"  `)
      }
      lines.push('')
      lines.push('| Property | Specification |')
      lines.push('| :--- | :--- |')
      lines.push(`| **Layer ID** | \`${comp.id}\` |`)
      lines.push(`| **Dimensions** | **${comp.dimensions.width}px** (W) × **${comp.dimensions.height}px** (H) |`)
      lines.push(`| **Sizing Rules** | Horizontal: \`${comp.dimensions.horizontalSizing}\` \| Vertical: \`${comp.dimensions.verticalSizing}\` |`)
      if (comp.dimensions.minWidth || comp.dimensions.maxWidth) {
        lines.push(`| **Width Limits** | Min: ${comp.dimensions.minWidth ?? 'None'} \| Max: ${comp.dimensions.maxWidth ?? 'None'} |`)
      }
      if (comp.layout.mode !== 'NONE') {
        lines.push(`| **Layout Mode** | \`${comp.layout.mode}\` (Auto Layout) |`)
        lines.push(`| **Padding** | **${formatPadding(comp.layout.padding)}** |`)
        lines.push(`| **Item Gap / Spacing** | **${comp.layout.itemSpacing}px** |`)
        if (comp.layout.counterAxisSpacing !== undefined) {
          lines.push(`| **Cross Axis Gap** | **${comp.layout.counterAxisSpacing}px** |`)
        }
        lines.push(`| **Alignment** | Primary: \`${comp.layout.primaryAxisAlign}\` \| Cross: \`${comp.layout.counterAxisAlign}\` |`)
        lines.push(`| **Wrap** | \`${comp.layout.wrap ? 'WRAP (flex-wrap)' : 'NOWRAP'}\` |`)
      } else {
        lines.push(`| **Layout Mode** | None (Absolute / Static) |`)
      }

      if (comp.layout.isAbsolutePositioned) {
        lines.push(`| **Positioning** | **Absolute** (\`position: absolute\` inside Auto Layout) |`)
      }
      if (comp.layout.clipsContent !== undefined) {
        lines.push(`| **Overflow / Clipping** | \`${comp.layout.clipsContent ? 'clipsContent: true (overflow: hidden)' : 'clipsContent: false (overflow: visible)'}\` |`)
      }
      if (comp.layout.constraints) {
        lines.push(`| **Constraints** | Horizontal: \`${comp.layout.constraints.horizontal}\` \| Vertical: \`${comp.layout.constraints.vertical}\` |`)
      }

      lines.push(`| **Background Fill** | ${formatBackgrounds(comp.backgrounds)} |`)

      if (comp.opacity !== undefined && comp.opacity < 1) {
        lines.push(`| **Opacity** | **${Math.round(comp.opacity * 100)}%** (\`opacity: ${comp.opacity}\`) |`)
      }
      if (comp.blendMode) {
        lines.push(`| **Blend Mode** | \`${comp.blendMode}\` (\`mix-blend-mode: ${comp.blendMode.toLowerCase()}\`) |`)
      }

      // Border & Radius
      if (comp.border) {
        const radiusStr = comp.border.radius.isUniform
          ? `${comp.border.radius.topLeft}px (uniform)`
          : `TL: ${comp.border.radius.topLeft}px, TR: ${comp.border.radius.topRight}px, BR: ${comp.border.radius.bottomRight}px, BL: ${comp.border.radius.bottomLeft}px`
        let strokeStr = comp.border.width > 0 ? `${comp.border.width}px \`${comp.border.color ?? 'CurrentColor'}\`` : 'None'
        if (comp.border.individualWeights) {
          const iw = comp.border.individualWeights
          strokeStr = `Top: ${iw.top}px, Right: ${iw.right}px, Bottom: ${iw.bottom}px, Left: ${iw.left}px \`${comp.border.color ?? 'CurrentColor'}\``
        }
        lines.push(`| **Border / Stroke** | ${strokeStr} |`)
        lines.push(`| **Corner Radius** | **${radiusStr}** |`)
      } else {
        lines.push(`| **Border & Radius** | None (0px) |`)
      }

      // Typography
      if (comp.typography) {
        lines.push(`| **Typography** | ${formatTypography(comp.typography)} |`)
        if (comp.typography.contrastWithParentBg) {
          const contrast = comp.typography.contrastWithParentBg
          const badge =
            contrast.rating === 'AAA'
              ? '🟢 **Passes WCAG AAA**'
              : contrast.rating === 'AA'
                ? '🟡 **Passes WCAG AA**'
                : '🔴 **Fails WCAG AA (Low Contrast)**'
          lines.push(`| **WCAG Contrast** | **${contrast.contrastRatio}:1** against \`${contrast.parentBgColor}\` — ${badge} |`)
        }
        if (comp.typography.segments && comp.typography.segments.length > 1) {
          const segList = comp.typography.segments
            .map((s) => `• "${s.text}" → **${s.fontFamily}** ${s.fontWeight}, ${s.fontSize}px${s.color ? ` (\`${s.color}\`)` : ''}`)
            .join('<br>')
          lines.push(`| **Mixed Segments** | ${segList} |`)
        }
      }

      // Effects / Shadows
      if (comp.effects.length > 0) {
        const effStr = comp.effects
          .map((e) => `${e.type}: ${e.radius}px blur, color: \`${e.color ?? ''}\``)
          .join('; ')
        lines.push(`| **Effects / Shadows** | ${effStr} |`)
      }

      if (comp.subComponentsCount > 0) {
        lines.push(`| **Sub-elements** | ${comp.subComponentsCount} child layers |`)
      }
      lines.push('')
    })
  }

  lines.push('---')
  lines.push('')

  // 5. Implementation Guidelines
  lines.push('## 4. Engineering Implementation Guidelines')
  lines.push('')
  lines.push('1. **Maintain Sizing Modes:** Components marked `HUG` should use auto/content-based dimensions (`w-fit`, `h-fit` in Tailwind). Components marked `FILL` should expand (`w-full` or `flex-1`).')
  lines.push('2. **Preserve Exact Paddings:** Use the exact padding values defined in Section 3 for consistent spacing hierarchy.')
  lines.push('3. **Reuse Color Tokens:** Map the hex values in Section 1.1 to CSS variables or theme configuration to prevent hardcoded arbitrary values.')
  lines.push('4. **Fluid Layouts:** Avoid fixed pixel widths on container-level components; adhere to the Auto Layout `HORIZONTAL` (flex-row) and `VERTICAL` (flex-col) rules.')
  lines.push('5. **Clipping & Overflows:** Any container with `clipsContent: true` should use `overflow: hidden` in CSS.')
  lines.push('6. **Accessibility Standards:** Ensure all text passes at least WCAG AA (contrast ratio ≥ 4.5:1 for regular text, ≥ 3.0:1 for large/bold text).')
  lines.push('')
  lines.push('---')
  lines.push('')

  // 6. Developer Copy-Paste Tokens & Styles
  lines.push('## 5. Developer Copy-Paste Tokens & Styles')
  lines.push('')
  lines.push('Ready-to-use CSS Custom Properties and Tailwind configuration generated directly from this design system:')
  lines.push('')

  lines.push('### 5.1 CSS Custom Properties (`:root`)')
  lines.push('')
  lines.push('```css')
  lines.push(generateCssVariables(doc))
  lines.push('```')
  lines.push('')

  lines.push('### 5.2 Tailwind CSS v4 Theme (`@theme`)')
  lines.push('')
  lines.push('```css')
  lines.push(generateTailwindV4Theme(doc))
  lines.push('```')
  lines.push('')

  lines.push('### 5.3 Tailwind CSS v3 Configuration (`tailwind.config.js`)')
  lines.push('')
  lines.push('```javascript')
  lines.push(generateTailwindV3Config(doc))
  lines.push('```')
  lines.push('')

  return lines.join('\n')
}
