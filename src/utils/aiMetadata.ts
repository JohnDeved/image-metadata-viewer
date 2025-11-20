export interface AIData {
  prompt: string
  negativePrompt: string
  settings: Record<string, string>
}

interface ComfyNode {
  inputs: Record<string, unknown>
  class_type: string
  _meta: { title: string }
}

type ComfyWorkflow = Record<string, ComfyNode>

export const parseAIParameters = (rawParameters: string): AIData | null => {
  if (!rawParameters) return null

  return tryParseComfyUI(rawParameters) ?? tryParseA1111(rawParameters)
}

const tryParseComfyUI = (raw: string): AIData | null => {
  if (!raw.trim().startsWith('{')) return null
  try {
    const workflow = JSON.parse(raw) as ComfyWorkflow
    return parseComfyWorkflow(workflow)
  } catch {
    return null
  }
}

const extractSettingsLine = (text: string): { content: string; settings: string } => {
  const lastNewLineIndex = text.lastIndexOf('\n')
  if (lastNewLineIndex === -1) return { content: text, settings: '' }

  const tail = text.substring(lastNewLineIndex + 1)
  // Check if last line looks like settings (contains typical AI params)
  const hasSettingsPattern = tail.includes('Steps:') || tail.includes('Model:')

  if (hasSettingsPattern) {
    return { content: text.substring(0, lastNewLineIndex).trim(), settings: tail.trim() }
  }
  return { content: text, settings: '' }
}

const tryParseA1111 = (raw: string): AIData | null => {
  try {
    const [promptPart, ...rest] = raw.split('Negative prompt:')
    let prompt = (promptPart ?? '').trim()
    let negativePrompt = rest.join('Negative prompt:').trim()
    let settingsLine = ''

    if (negativePrompt) {
      const result = extractSettingsLine(negativePrompt)
      negativePrompt = result.content
      settingsLine = result.settings
    } else {
      const result = extractSettingsLine(prompt)
      prompt = result.content
      settingsLine = result.settings
    }

    return { prompt, negativePrompt, settings: parseSettings(settingsLine) }
  } catch (e) {
    console.error('Failed to parse AI parameters', e)
    return null
  }
}

const parseSettings = (settingsStr: string): Record<string, string> => {
  if (!settingsStr) return {}

  return settingsStr.split(', ').reduce<Record<string, string>>((acc, item) => {
    const colonIndex = item.indexOf(':')
    if (colonIndex === -1) return acc

    acc[item.substring(0, colonIndex).trim()] = item.substring(colonIndex + 1).trim()
    return acc
  }, {})
}

const parseComfyWorkflow = (workflow: ComfyWorkflow): AIData | null => {
  let prompt = ''
  let negativePrompt = ''
  const settings: Record<string, string> = {}

  const kSamplerNode = Object.values(workflow).find(
    node => node.class_type === 'KSampler' || node.class_type === 'KSamplerAdvanced'
  )

  if (kSamplerNode) {
    const { inputs } = kSamplerNode
    if (inputs.seed) settings.Seed = String(inputs.seed)
    if (inputs.steps) settings.Steps = String(inputs.steps)
    if (inputs.cfg) settings['CFG scale'] = String(inputs.cfg)
    if (inputs.sampler_name) settings.Sampler = String(inputs.sampler_name)
    if (inputs.scheduler) settings.Scheduler = String(inputs.scheduler)
    if (inputs.denoise) settings.Denoise = String(inputs.denoise)

    if (Array.isArray(inputs.model)) {
      const modelNodeId = inputs.model[0] as string
      const modelNode = workflow[modelNodeId]
      const isLoader =
        modelNode?.class_type === 'CheckpointLoaderSimple' ||
        modelNode?.class_type === 'CheckpointLoader'
      if (isLoader && modelNode?.inputs.ckpt_name) {
        settings.Model = String(modelNode.inputs.ckpt_name)
      }
    }

    if (Array.isArray(inputs.positive)) {
      const posNodeId = inputs.positive[0] as string
      prompt = findPromptText(workflow, posNodeId)
    }

    if (Array.isArray(inputs.negative)) {
      const negNodeId = inputs.negative[0] as string
      negativePrompt = findPromptText(workflow, negNodeId)
    }
  }

  const emptyLatentNode = Object.values(workflow).find(
    node => node.class_type === 'EmptyLatentImage'
  )
  if (emptyLatentNode) {
    const { width, height } = emptyLatentNode.inputs
    if (width && height) settings.Size = `${width}x${height}`
  }

  return { prompt, negativePrompt, settings }
}

const findPromptText = (workflow: ComfyWorkflow, nodeId: string): string => {
  const node = workflow[nodeId]
  if (!node) return ''
  if (node.class_type === 'CLIPTextEncode' || node.class_type === 'CLIPTextEncodeSDXL') {
    return String(node.inputs.text || '')
  }
  return ''
}
