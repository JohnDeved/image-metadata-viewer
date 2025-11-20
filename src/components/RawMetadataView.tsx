import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Code } from 'lucide-react'
import { downloadJSON } from '../utils/file'
import { rawViewVariants } from '../utils/animations'

interface RawMetadataViewProps {
  metadata: unknown
}

export const RawMetadataView: React.FC<RawMetadataViewProps> = ({ metadata }) => {
  const formatted = useMemo(() => {
    const json = JSON.stringify(metadata, null, 2)
    return json === '{}' ? 'No metadata found (empty object)' : json
  }, [metadata])

  return (
    <motion.div
      key="raw"
      variants={rawViewVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
      className="bg-slate-900 rounded-xl border border-slate-800 p-4 overflow-hidden"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
          <Code size={16} className="text-teal-400" />
          Raw JSON Output
        </h3>
        <button
          onClick={() => downloadJSON(metadata)}
          className="text-xs text-teal-400 hover:text-teal-300 font-medium"
        >
          Download .json
        </button>
      </div>
      <pre className="font-mono text-xs text-slate-400 bg-black/50 p-4 rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
        {formatted}
      </pre>
    </motion.div>
  )
}
