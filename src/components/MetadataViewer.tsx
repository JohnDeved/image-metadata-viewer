import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image as ImageIcon, AlertCircle } from 'lucide-react'
import { type GPSData } from '../utils/metadata'
import { RawMetadataView } from './RawMetadataView'
import { FormattedMetadataView } from './FormattedMetadataView'
import { useStore } from '../store'

interface MetadataViewerProps {
  gps: GPSData | null
}

export const MetadataViewer: React.FC<MetadataViewerProps> = ({ gps }) => {
  const { metadata, viewMode, setViewMode, loading, error, isDetailView } = useStore()

  if (!metadata && !loading && !error) return null

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
                <div className="p-1.5 bg-teal-500/10 rounded-lg border border-teal-500/20">
                  <ImageIcon size={20} className="text-teal-400" />
                </div>
                Image Data
              </h2>
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
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
              {!loading && !error && !!metadata && viewMode === 'formatted' && (
                <FormattedMetadataView key="formatted" metadata={metadata} gps={gps} />
              )}

              {!loading && !error && !!metadata && viewMode === 'raw' && (
                <RawMetadataView key="raw" metadata={metadata} />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
