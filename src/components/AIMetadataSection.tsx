import React, { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Terminal, Settings, Copy, Check } from 'lucide-react'
import { type AIData } from '../utils/aiMetadata'
import { MetadataGrid } from './MetadataGrid'
import { itemVariants } from '../utils/animations'

// Custom hook for copy-to-clipboard functionality
const useCopyToClipboard = () => {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return { copiedField, copy }
}

interface AIMetadataSectionProps {
  aiData: AIData
  variants?: Variants
}

interface PromptSectionProps {
  title: string
  content: string
  field: string
  copiedField: string | null
  onCopy: (text: string, field: string) => void
  negative?: boolean
}

const PromptSection: React.FC<PromptSectionProps> = ({
  title,
  content,
  field,
  copiedField,
  onCopy,
  negative = false,
}) => (
  <motion.div variants={itemVariants} className="space-y-2">
    <div className="flex items-center justify-between">
      <h3
        className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
          negative ? 'text-red-400/70' : 'text-slate-500'
        }`}
      >
        <Terminal size={14} /> {title}
      </h3>
      <button
        onClick={() => onCopy(content, field)}
        className="text-xs flex items-center gap-1 text-slate-500 hover:text-teal-400 transition-colors"
      >
        {copiedField === field ? <Check size={14} /> : <Copy size={14} />}
        {copiedField === field ? 'Copied' : 'Copy'}
      </button>
    </div>
    <div
      className={`p-4 rounded-xl border text-sm leading-relaxed font-mono whitespace-pre-wrap ${
        negative
          ? 'bg-red-950/10 border-red-900/20 text-red-200/80'
          : 'bg-slate-900/50 border-slate-800 text-slate-300'
      }`}
    >
      {content}
    </div>
  </motion.div>
)

export const AIMetadataSection: React.FC<AIMetadataSectionProps> = ({ aiData, variants }) => {
  const { copiedField, copy } = useCopyToClipboard()

  // Convert settings object to GridItems
  const settingItems = Object.entries(aiData.settings).map(([key, value]) => ({
    l: key,
    v: value,
    i: <Settings size={18} />,
  }))

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {aiData.prompt && (
        <PromptSection
          title="Prompt"
          content={aiData.prompt}
          field="prompt"
          copiedField={copiedField}
          onCopy={copy}
        />
      )}

      {aiData.negativePrompt && (
        <PromptSection
          title="Negative Prompt"
          content={aiData.negativePrompt}
          field="negative"
          copiedField={copiedField}
          onCopy={copy}
          negative
        />
      )}

      {settingItems.length > 0 && (
        <MetadataGrid title="Generation Settings" items={settingItems} variants={itemVariants} />
      )}
    </motion.div>
  )
}
