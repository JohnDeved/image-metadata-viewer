import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image as ImageIcon, AlertCircle, Sparkles } from 'lucide-react'
import { type GPSData, getTagValue } from '../utils/metadata'
import { parseAIParameters } from '../utils/aiMetadata'
import { RawMetadataView } from './RawMetadataView'
import { FormattedMetadataView } from './FormattedMetadataView'
import { AIMetadataSection } from './AIMetadataSection'
import { useStore } from '../store'
import { containerVariants } from '../utils/animations'

interface MetadataViewerProps {
  gps: GPSData | null
}

export const MetadataViewer: React.FC<MetadataViewerProps> = ({ gps }) => {
  const { metadata, viewMode, setViewMode, loading, error, isDetailView } = useStore()
  const ready = !!metadata && !loading && !error

  if (!ready && !loading && !error) return null

  // Get AI parameters from metadata
  const aiParameters =
    getTagValue(metadata?.parameters) ||
    getTagValue(metadata?.prompt) ||
    getTagValue(metadata?.workflow)
  const aiData = aiParameters ? parseAIParameters(aiParameters) : null

  return (
    <AnimatePresence mode="wait">
      {isDetailView && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '60%', opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'tween', ease: [0.25, 0.1, 0.25, 1], duration: 0.6 }}
          className="overflow-hidden lg:pl-8 flex-shrink-0"
        >
          {/* Inner container with min-width to prevent squeezing */}
          <motion.div
            className="min-w-[640px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="flex items-center justify-between mb-6 pt-1">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <AnimatePresence mode="wait">
                  {viewMode === 'ai' ? (
                    <motion.div
                      key="ai-title"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3"
                    >
                      <div className="p-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <Sparkles size={20} className="text-purple-400" />
                      </div>
                      AI Generation Data
                    </motion.div>
                  ) : (
                    <motion.div
                      key="image-title"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3"
                    >
                      <div className="p-1.5 bg-teal-500/10 rounded-lg border border-teal-500/20">
                        <ImageIcon size={20} className="text-teal-400" />
                      </div>
                      Image Data
                    </motion.div>
                  )}
                </AnimatePresence>
              </h2>
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                {aiData && (
                  <button
                    key="ai"
                    onClick={() => setViewMode('ai')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'ai' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    AI Data
                  </button>
                )}
                {['formatted', 'raw'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as 'formatted' | 'raw')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === mode ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </motion.div>

            {loading && (
              <div className="p-8 text-center text-slate-500 animate-pulse bg-slate-900/50 rounded-xl border border-slate-800">
                Processing image data...
              </div>
            )}
            {error && (
              <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-300 flex items-start gap-3">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-medium">Unable to read data</p>
                  <p className="text-sm opacity-80 mt-1">{error}</p>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {ready && viewMode === 'formatted' && (
                <FormattedMetadataView key="formatted" metadata={metadata!} gps={gps} />
              )}

              {ready && viewMode === 'raw' && <RawMetadataView key="raw" metadata={metadata} />}

              {ready && viewMode === 'ai' && aiData && (
                <AIMetadataSection key="ai" aiData={aiData} variants={containerVariants} />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
