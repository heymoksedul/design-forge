import { describe, it, expect } from 'vitest'
import { slugify, deduplicate } from './index'

describe('utils', () => {
  it('slugify converts strings to kebab-case', () => {
    expect(slugify('Hero Section Heading!')).toBe('hero-section-heading')
  })

  it('deduplicate removes duplicate primitive values', () => {
    expect(deduplicate(['#fff', '#000', '#fff'])).toEqual(['#fff', '#000'])
  })

  it('deduplicate removes duplicates by key function', () => {
    const items = [
      { id: '1', name: 'A' },
      { id: '2', name: 'B' },
      { id: '1', name: 'Duplicate' },
    ]
    expect(deduplicate(items, (item) => item.id)).toEqual([
      { id: '1', name: 'A' },
      { id: '2', name: 'B' },
    ])
  })
})
