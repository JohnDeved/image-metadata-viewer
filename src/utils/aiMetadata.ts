export interface AIData {
  prompt: string
  negativePrompt: string
  settings: Record<string, string>
}

// ComfyUI Node Interfaces
interface ComfyNode {
  inputs: Record<string, unknown>
  class_type: string
  _meta: { title: string }
}

type ComfyWorkflow = Record<string, ComfyNode>

export const parseAIParameters = (rawParameters: string): AIData | null => {
  if (!rawParameters) return null

  // Try to parse as JSON (ComfyUI format)
  if (rawParameters.trim().startsWith('{')) {
    try {
      const workflow = JSON.parse(rawParameters) as ComfyWorkflow
      return parseComfyUI(workflow)
    } catch {
      // Not valid JSON, fall back to A1111 parsing
    }
  }

  // A1111 / Stable Diffusion WebUI Parsing
  try {
    let prompt = ''
    let negativePrompt = ''
    let settingsStr = ''

    // Split by "Negative prompt:" to separate prompt and the rest
    const [promptPart, ...rest] = rawParameters.split('Negative prompt:')
    const parts = [promptPart, rest.join('Negative prompt:')]

    if (parts.length > 0) {
      prompt = parts[0].trim()
    }

    if (parts.length > 1) {
      // The rest contains negative prompt and settings
      // Settings usually start with "Steps: " or similar key-value pairs at the end
      // We look for the last line that looks like settings
      const remaining = parts[1]
      const lastNewLineIndex = remaining.lastIndexOf('\n')

      if (lastNewLineIndex !== -1) {
        // Check if the last line looks like settings (contains "Steps:" or "Model:")
        const potentialSettings = remaining.substring(lastNewLineIndex + 1)
        if (potentialSettings.includes('Steps:') || potentialSettings.includes('Model:')) {
          negativePrompt = remaining.substring(0, lastNewLineIndex).trim()
          settingsStr = potentialSettings.trim()
        } else {
          // Maybe no settings line?
          negativePrompt = remaining.trim()
        }
      } else {
        negativePrompt = remaining.trim()
      }
    } else {
      // No negative prompt, check if we have settings in the prompt part?
      // Usually settings are at the end.
      const lastNewLineIndex = prompt.lastIndexOf('\n')
      if (lastNewLineIndex !== -1) {
        const potentialSettings = prompt.substring(lastNewLineIndex + 1)
        if (potentialSettings.includes('Steps:') || potentialSettings.includes('Model:')) {
          settingsStr = potentialSettings.trim()
          prompt = prompt.substring(0, lastNewLineIndex).trim()
        }
      }
    }

    const settings: Record<string, string> = {}
    if (settingsStr) {
      // Parse settings string: "Key: Value, Key2: Value2"
      // Be careful with values that might contain commas
      // Simple split by ", " might work for most, but let's be robust

      // Regex to match "Key: Value" where Value can contain anything until the next ", Key:" or end of string
      // This is tricky. A simpler approach for standard A1111 format:
      // It's usually comma separated, but some values might have commas (rare in this format).

      const items = settingsStr.split(', ')
      items.forEach(item => {
        const colonIndex = item.indexOf(':')
        if (colonIndex !== -1) {
          const key = item.substring(0, colonIndex).trim()
          const value = item.substring(colonIndex + 1).trim()
          settings[key] = value
        }
      })
    }

    return {
      prompt,
      negativePrompt,
      settings,
    }
  } catch (e) {
    console.error('Failed to parse AI parameters', e)
    return null
  }
}

const parseComfyUI = (workflow: ComfyWorkflow): AIData | null => {
  let prompt = ''
  let negativePrompt = ''
  const settings: Record<string, string> = {}

  // Find KSampler node(s) - usually the core of generation
  const kSamplerNode = Object.values(workflow).find(
    node => node.class_type === 'KSampler' || node.class_type === 'KSamplerAdvanced'
  )

  if (kSamplerNode) {
    const { inputs } = kSamplerNode

    // Extract Settings
    if (inputs.seed) settings.Seed = String(inputs.seed)
    if (inputs.steps) settings.Steps = String(inputs.steps)
    if (inputs.cfg) settings['CFG scale'] = String(inputs.cfg)
    if (inputs.sampler_name) settings.Sampler = String(inputs.sampler_name)
    if (inputs.scheduler) settings.Scheduler = String(inputs.scheduler)
    if (inputs.denoise) settings.Denoise = String(inputs.denoise)

    // Extract Model Name
    // Model input is usually ["NodeID", 0]
    if (Array.isArray(inputs.model)) {
      const modelNodeId = inputs.model[0] as string
      const modelNode = workflow[modelNodeId]
      if (
        modelNode &&
        (modelNode.class_type === 'CheckpointLoaderSimple' ||
          modelNode.class_type === 'CheckpointLoader')
      ) {
        if (modelNode.inputs.ckpt_name) {
          settings.Model = String(modelNode.inputs.ckpt_name)
        }
      }
    }

    // Extract Prompts
    // Positive input is usually ["NodeID", 0]
    if (Array.isArray(inputs.positive)) {
      const posNodeId = inputs.positive[0] as string
      prompt = findPromptText(workflow, posNodeId)
    }

    // Negative input is usually ["NodeID", 0]
    if (Array.isArray(inputs.negative)) {
      const negNodeId = inputs.negative[0] as string
      negativePrompt = findPromptText(workflow, negNodeId)
    }
  }

  // Try to find dimensions from EmptyLatentImage if available
  const emptyLatentNode = Object.values(workflow).find(
    node => node.class_type === 'EmptyLatentImage'
  )
  if (emptyLatentNode) {
    const { width, height } = emptyLatentNode.inputs
    if (width && height) {
      settings.Size = `${width}x${height}`
    }
  }

  return {
    prompt,
    negativePrompt,
    settings,
  }
}

const findPromptText = (workflow: ComfyWorkflow, nodeId: string): string => {
  const node = workflow[nodeId]
  if (!node) return ''

  if (node.class_type === 'CLIPTextEncode' || node.class_type === 'CLIPTextEncodeSDXL') {
    return String(node.inputs.text || '')
  }

  // Handle Reroute or other intermediate nodes if necessary (simple recursion)
  // For now, assume direct connection or simple chain
  return ''
}
