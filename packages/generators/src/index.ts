import type { DesignDocument } from '@designforge/design-ir'
import { generateDesignSystemMarkdown } from './design-system-markdown'

export * from './design-system-markdown'

export interface GeneratedFile {
  path: string
  content: string
}

export interface CodeGenerator {
  generate(doc: DesignDocument): Promise<GeneratedFile[]>
}

export class DesignSystemMarkdownGenerator implements CodeGenerator {
  async generate(doc: DesignDocument): Promise<GeneratedFile[]> {
    const markdown = generateDesignSystemMarkdown(doc)
    return [
      {
        path: 'DESIGN_SYSTEM.md',
        content: markdown,
      },
    ]
  }
}
