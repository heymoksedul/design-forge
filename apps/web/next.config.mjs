/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@designforge/design-ir',
    '@designforge/schemas',
    '@designforge/generators',
    '@designforge/ai',
    '@designforge/asset-pipeline',
    '@designforge/exporter',
    '@designforge/utils',
  ],
}

export default nextConfig
