export interface ExtractedAsset {
  id: string
  name: string
  format: 'png' | 'jpg' | 'webp' | 'svg'
  data: Uint8Array | string
}

export function sanitizeAssetFilename(name: string, ext: string): string {
  return `${name.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}.${ext}`
}
