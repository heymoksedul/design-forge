import { parseSelection } from '@designforge/figma-parser'
import { generateDesignSystemMarkdown } from '@designforge/generators'

function sendSelectionToUI() {
  if (!figma.ui) return
  try {
    const selection = figma.currentPage.selection

    if (selection.length === 0) {
      figma.ui.postMessage({
        type: 'SELECTION_STATE',
        hasSelection: false,
        editorType: figma.editorType,
      })
      return
    }

    const node = selection[0]
    if (!node) return

    figma.ui.postMessage({
      type: 'SELECTION_STATE',
      hasSelection: true,
      editorType: figma.editorType,
      node: {
        id: node.id,
        name: node.name,
        type: node.type,
        width: 'width' in node ? Math.round(node.width) : 0,
        height: 'height' in node ? Math.round(node.height) : 0,
      },
    })
  } catch (err) {
    console.warn('sendSelectionToUI error:', err)
  }
}

function handleUIMessages() {
  figma.ui.onmessage = async (msg: { type: string; payload?: unknown }) => {
    if (msg.type === 'REQUEST_CURRENT_SELECTION') {
      sendSelectionToUI()
      return
    }

    if (msg.type === 'GENERATE_DESIGN_SYSTEM') {
      const selection = figma.currentPage.selection
      if (selection.length === 0) {
        figma.notify('⚠️ Please select a frame or component first', { error: true })
        figma.ui.postMessage({
          type: 'GENERATE_ERROR',
          error: 'No frame or component selected.',
        })
        return
      }

      const rootNode = selection[0]
      if (!rootNode) return

      try {
        figma.ui.postMessage({ type: 'GENERATING_START' })

        // 1. Deep parse selection
        const doc = parseSelection(rootNode)

        // 2. Generate comprehensive markdown
        const markdown = generateDesignSystemMarkdown(doc)

        figma.notify(`✓ Design System for "${doc.name}" generated!`)

        figma.ui.postMessage({
          type: 'GENERATE_SUCCESS',
          payload: {
            doc,
            markdown,
            summary: {
              name: doc.name,
              viewport: doc.viewport,
              componentsCount: doc.componentInventory.length,
              assetsCount: doc.assets?.length ?? 0,
              colorCount: Object.keys(doc.tokens.colors).length,
              typographyCount: Object.keys(doc.tokens.typography).length,
              spacingCount: doc.tokens.spacing.length,
              radiiCount: doc.tokens.radii.length,
            },
          },
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        figma.notify(`❌ Extraction failed: ${message}`, { error: true })
        figma.ui.postMessage({
          type: 'GENERATE_ERROR',
          error: message,
        })
      }
    }

    if (msg.type === 'NOTIFY' && typeof msg.payload === 'string') {
      figma.notify(msg.payload)
    }
  }
}

console.log('[DesignForge] Starting plugin. figma.mode =', (figma as any).mode, 'editorType =', figma.editorType)

try {
  if ((figma as any).mode === 'codegen' && 'codegen' in figma && (figma as any).codegen) {
    console.log('[DesignForge] Registering codegen handlers')
    figma.codegen.on('generate', async (event) => {
      try {
        const doc = parseSelection(event.node)
        const markdown = generateDesignSystemMarkdown(doc)
        return [
          {
            title: `${doc.name} — DESIGN_SYSTEM.md`,
            language: 'PLAINTEXT',
            code: markdown,
          },
        ]
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        return [
          {
            title: 'Extraction Error',
            language: 'PLAINTEXT',
            code: `# Unable to extract Design System\n\nError: ${errorMsg}\n\nTip: Try selecting a Frame or Component container.`,
          },
        ]
      }
    })

    // Handle direct click on Dev Mode action button: "💾 Download DESIGN_SYSTEM.md"
    figma.codegen.on('preferenceschange', async (event) => {
      if (event.propertyName === 'download_md') {
        const selection = figma.currentPage.selection
        if (selection.length === 0) {
          figma.notify('⚠️ Please select a frame first to download', { error: true })
          return
        }
        const rootNode = selection[0]
        if (!rootNode) return

        try {
          const doc = parseSelection(rootNode)
          const markdown = generateDesignSystemMarkdown(doc)
          const safeName = (doc.name || 'design-system').toLowerCase().replace(/[^a-z0-9]/g, '-')

          figma.showUI(__html__, {
            width: 320,
            height: 120,
            themeColors: true,
            title: 'Downloading...',
          })
          handleUIMessages()

          figma.ui.postMessage({
            type: 'AUTO_DOWNLOAD',
            payload: {
              filename: `${safeName}-design-system.md`,
              content: markdown,
            },
          })
        } catch (err) {
          figma.notify(`❌ Download failed: ${err instanceof Error ? err.message : String(err)}`, { error: true })
        }
      } else if (event.propertyName === 'open_exporter') {
        figma.showUI(__html__, {
          width: 420,
          height: 640,
          themeColors: true,
          title: 'DesignForge — Design System Exporter',
        })
        handleUIMessages()
        sendSelectionToUI()
      }
    })
  } else {
    // ============================================================================
    // 2. Full Interactive UI Mode (Design Mode or Dev Mode plugin window)
    // ============================================================================
    console.log('[DesignForge] Launching interactive UI window')
    figma.showUI(__html__, {
      width: 420,
      height: 640,
      themeColors: true,
      title: 'DesignForge — Design System Exporter',
    })

    handleUIMessages()
    sendSelectionToUI()

    figma.on('selectionchange', () => {
      sendSelectionToUI()
    })
    console.log('[DesignForge] Interactive UI launched successfully')
  }
} catch (startupErr) {
  const msg = startupErr instanceof Error ? startupErr.message : String(startupErr)
  console.error('[DesignForge] Startup error:', startupErr)
  figma.notify(`❌ DesignForge Startup Error: ${msg}`, { error: true, timeout: 10000 })
}
