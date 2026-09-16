import type { DesignNodeType } from '@designforge/design-ir'

export function inferNodeType(node: SceneNode): DesignNodeType {
  const name = node.name.toLowerCase()

  if (node.type === 'TEXT') {
    if ('fontSize' in node && typeof node.fontSize === 'number' && node.fontSize >= 24) {
      return 'heading'
    }
    if (name.includes('heading') || name.includes('title') || name.includes('headline')) {
      return 'heading'
    }
    if (name.includes('caption') || name.includes('label')) {
      return 'text'
    }
    return 'paragraph'
  }

  if (node.type === 'VECTOR') {
    return 'icon'
  }

  if (node.type === 'LINE') {
    return 'divider'
  }

  if (node.type === 'RECTANGLE') {
    if ('fills' in node && Array.isArray(node.fills) && node.fills.some((f) => f.type === 'IMAGE')) {
      return 'image'
    }
    return 'container'
  }

  // Name heuristics for frames/components/groups
  if (name.includes('button') || name.includes('btn') || name.includes('cta')) {
    return 'button'
  }
  if (name.includes('badge') || name.includes('tag') || name.includes('chip')) {
    return 'badge'
  }
  if (name.includes('card')) {
    return 'card'
  }
  if (name.includes('input') || name.includes('textfield') || name.includes('search')) {
    return 'input'
  }
  if (name.includes('navbar') || name.includes('nav') || name.includes('header')) {
    return 'navigation'
  }
  if (name.includes('footer')) {
    return 'footer'
  }
  if (name.includes('hero') || name.includes('section')) {
    return 'section'
  }
  if (name.includes('icon') || (node.width <= 32 && node.height <= 32 && node.type === 'FRAME')) {
    return 'icon'
  }

  if (node.type === 'COMPONENT') return 'component'
  if (node.type === 'INSTANCE') return 'instance'
  if (node.type === 'GROUP') return 'group'
  if (node.type === 'FRAME') return 'container'

  return 'unknown'
}
