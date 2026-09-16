export type AIProviderName = 'gemini' | 'cloudflare'

export interface DesignAnalysisInput {
  irSummary: unknown
}

export interface DesignAnalysis {
  designDirection: string
  assumptions: string[]
}

export interface AIProvider {
  name: AIProviderName
  analyzeDesign(input: DesignAnalysisInput): Promise<DesignAnalysis>
}
