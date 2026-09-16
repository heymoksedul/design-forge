import type { AssetSpec } from '@designforge/design-ir'
import { rgbToHex } from './color-parser'
import { calculateAspectRatio, slugify } from './asset-utils'

function hasVectorChildren(node: SceneNode): boolean {
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.some(
      (c) =>
        c.type === 'VECTOR' ||
        c.type === 'BOOLEAN_OPERATION' ||
        c.type === 'STAR' ||
        c.type === 'POLYGON'
    )
  }
  return false
}

export function detectAsset(
  node: SceneNode,
  path: string,
  parentIsAsset = false
): AssetSpec | null {
  const width = 'width' in node ? Math.round(node.width) : 0
  const height = 'height' in node ? Math.round(node.height) : 0
  const nameLower = node.name.toLowerCase()

  // 1. Detect Raster Images (Fills with IMAGE type)
  if ('fills' in node && Array.isArray(node.fills)) {
    const hasImageFill = node.fills.some((f) => f.type === 'IMAGE' && f.visible !== false)
    if (hasImageFill) {
      const aspectRatio = calculateAspectRatio(width, height)
      const cleanName = slugify(node.name)
      return {
        id: node.id,
        name: node.name,
        category: 'image',
        format: 'PNG',
        width,
        height,
        aspectRatio,
        path,
        suggestedFileName: `assets/images/${cleanName}.png`,
        exportPresets: ['PNG @1x', 'PNG @2x', 'WebP'],
      }
    }
  }

  // If this node is inside an already detected icon/vector container, avoid duplicate sub-vectors
  if (parentIsAsset) {
    return null
  }

  // 2. Detect Icon Containers (Frames/Components named "icon", "ic_", or <= 48x48 containing vectors)
  const isIconContainer =
    (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE' || node.type === 'GROUP') &&
    (nameLower.includes('icon') ||
      nameLower.startsWith('ic_') ||
      nameLower.includes('logo') ||
      (width > 0 && width <= 48 && height > 0 && height <= 48 && hasVectorChildren(node)))

  if (isIconContainer) {
    const aspectRatio = calculateAspectRatio(width, height)
    const cleanName = slugify(node.name)
    const category = nameLower.includes('logo') ? 'vector' : 'icon'
    return {
      id: node.id,
      name: node.name,
      category,
      format: 'SVG',
      width,
      height,
      aspectRatio,
      path,
      suggestedFileName: `assets/${category === 'icon' ? 'icons' : 'vectors'}/${cleanName}.svg`,
      exportPresets: ['SVG (vector)'],
    }
  }

  // 3. Standalone Vector Nodes
  const isRawVector =
    node.type === 'VECTOR' ||
    node.type === 'BOOLEAN_OPERATION' ||
    node.type === 'STAR' ||
    node.type === 'POLYGON'

  if (isRawVector) {
    const aspectRatio = calculateAspectRatio(width, height)
    const cleanName = slugify(node.name)
    const category = width <= 48 && height <= 48 ? 'icon' : 'vector'

    const fillColors: string[] = []
    if ('fills' in node && Array.isArray(node.fills)) {
      for (const f of node.fills) {
        if (f.visible !== false && f.type === 'SOLID') {
          fillColors.push(rgbToHex(f.color.r, f.color.g, f.color.b))
        }
      }
    }

    return {
      id: node.id,
      name: node.name,
      category,
      format: 'SVG',
      width,
      height,
      aspectRatio,
      path,
      suggestedFileName: `assets/${category === 'icon' ? 'icons' : 'vectors'}/${cleanName}.svg`,
      exportPresets: ['SVG (vector)'],
      fillColors: fillColors.length > 0 ? fillColors : undefined,
    }
  }

  return null
}
