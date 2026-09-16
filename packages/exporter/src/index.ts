import JSZip from 'jszip'
import type { GeneratedFile } from '@designforge/generators'
import type { ExtractedAsset } from '@designforge/asset-pipeline'

export async function createZipBundle(
  files: GeneratedFile[],
  assets: ExtractedAsset[] = []
): Promise<Blob> {
  const zip = new JSZip()

  for (const file of files) {
    zip.file(file.path, file.content)
  }

  for (const asset of assets) {
    const assetPath = `assets/${asset.name}`
    zip.file(assetPath, asset.data)
  }

  return await zip.generateAsync({ type: 'blob' })
}
