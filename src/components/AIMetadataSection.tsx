import React from 'react'
import { motion, type Variants } from 'framer-motion'
import { Sparkles, Terminal, Settings, Copy, Check } from 'lucide-react'
import { type AIData } from '../utils/aiMetadata'
import { MetadataGrid } from './MetadataGrid'

interface AIMetadataSectionProps {
  aiData: AIData
  variants?: Variants
}

export const AIMetadataSection: React.FC<AIMetadataSectionProps> = ({ aiData, variants }) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null)

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Convert settings object to GridItems
  const settingItems = Object.entries(aiData.settings).map(([key, value]) => ({
    l: key,
    v: value,
    i: <Settings size={18} />,
  }))

  return (
    <motion.div variants={variants} className="space-y-6">
      {/* Prompt Section */}
      {aiData.prompt && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Terminal size={14} /> Prompt
            </h3>
            <button
              onClick={() => copyToClipboard(aiData.prompt, 'prompt')}
              className="text-xs flex items-center gap-1 text-slate-500 hover:text-teal-400 transition-colors"
            >
              {copiedField === 'prompt' ? <Check size={14} /> : <Copy size={14} />}
              {copiedField === 'prompt' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-300 text-sm leading-relaxed font-mono whitespace-pre-wrap">
            {aiData.prompt}
          </div>
        </div>
      )}

      {/* Negative Prompt Section */}
      {aiData.negativePrompt && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-red-400/70 uppercase tracking-wider flex items-center gap-2">
              <Terminal size={14} /> Negative Prompt
            </h3>
            <button
              onClick={() => copyToClipboard(aiData.negativePrompt, 'negative')}
              className="text-xs flex items-center gap-1 text-slate-500 hover:text-teal-400 transition-colors"
            >
              {copiedField === 'negative' ? <Check size={14} /> : <Copy size={14} />}
              {copiedField === 'negative' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="p-4 bg-red-950/10 rounded-xl border border-red-900/20 text-red-200/80 text-sm leading-relaxed font-mono whitespace-pre-wrap">
            {aiData.negativePrompt}
          </div>
        </div>
      )}

      {/* Settings Grid */}
      {settingItems.length > 0 && (
        <MetadataGrid
          title="Generation Settings"
          items={settingItems}
          variants={variants}
        />
      )}
    </motion.div>
  )
}
