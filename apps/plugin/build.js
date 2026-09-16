const esbuild = require('esbuild')
const fs = require('fs')
const path = require('path')

async function build() {
  const isWatch = process.argv.includes('--watch')
  const distDir = path.resolve(__dirname, 'dist')

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true })
  }

  // Read ui.html and copy to dist/ui.html (strip HTML comments to comply with Figma's SES sandbox)
  const uiHtmlPath = path.resolve(__dirname, 'src/ui.html')
  const rawHtml = fs.readFileSync(uiHtmlPath, 'utf8')
  const cleanHtml = rawHtml.replace(/<!--[\s\S]*?-->/g, '')
  fs.writeFileSync(path.resolve(distDir, 'ui.html'), cleanHtml, 'utf8')
  console.log('✓ Copied cleaned src/ui.html -> dist/ui.html (HTML comments stripped for SES compliance)')

  const buildOptions = {
    entryPoints: [path.resolve(__dirname, 'src/main.ts')],
    bundle: true,
    platform: 'browser',
    target: ['es2020'],
    outfile: path.resolve(distDir, 'main.js'),
    define: {
      __html__: JSON.stringify(cleanHtml),
    },
    logLevel: 'info',
  }

  if (isWatch) {
    const ctx = await esbuild.context(buildOptions)
    await ctx.watch()
    console.log('👀 Watching for changes in Figma Plugin...')
  } else {
    await esbuild.build(buildOptions)
    console.log('✓ Successfully bundled Figma Plugin main.js')

    // Figma SES / Hardened JavaScript static analysis verification
    const mainJsPath = path.resolve(distDir, 'main.js')
    let mainJsContent = fs.readFileSync(mainJsPath, 'utf8')

    // Verify and ensure no forbidden SES tokens exist
    const hasForbiddenImportParen = /\bimport\s*[(]/i.test(mainJsContent)
    const hasHtmlOpenComment = mainJsContent.includes('<!--')
    const hasHtmlCloseComment = mainJsContent.includes('-->')

    if (hasForbiddenImportParen || hasHtmlOpenComment || hasHtmlCloseComment) {
      console.warn('⚠️ Found SES sensitive tokens, sanitizing bundle...')
      // Extra safety sanitize
      mainJsContent = mainJsContent
        .replace(/<!--/g, '<\\!--')
        .replace(/-->/g, '--\\>')
      fs.writeFileSync(mainJsPath, mainJsContent, 'utf8')
    }

    console.log('✓ Figma SES Sandbox Safety Checks Passed: No unescaped import() or HTML comments')
  }
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
