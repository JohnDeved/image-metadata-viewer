import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image as ImageIcon,
  Calendar,
  AlertCircle,
  Monitor,
  Zap,
  Sun,
  Crosshair,
  Sliders,
  FileText,
  User,
  Globe,
  Type,
} from 'lucide-react'
import { getTagValue, getHeadline, type GPSData } from '../utils/metadata'
import {
  calculateCameraStats,
  getCameraInfo,
  getTechnicalSpecs,
  getCaptureInfo,
  getEditInfo,
  getDescriptionInfo,
} from '../utils/metadataHelpers'
import { itemVariants, containerVariants } from '../utils/animations'
import { MetadataSection } from './MetadataSection'
import { MetadataGrid } from './MetadataGrid'
import { StatCard } from './StatCard'
import { GPSMetadataSection } from './GPSMetadataSection'
import { RawMetadataView } from './RawMetadataView'
import { useStore } from '../store'

interface MetadataViewerProps {
  gps: GPSData | null
}

export const MetadataViewer: React.FC<MetadataViewerProps> = ({ gps }) => {
  const { metadata, viewMode, setViewMode, file, loading, error, isDetailView } = useStore()

  if (!metadata && !loading && !error) return null

  const headline = getHeadline(metadata, file)
  const { camera, lens, subtitle } = getCameraInfo(metadata)
  const stats = calculateCameraStats(metadata)
  const techString = getTechnicalSpecs(metadata, file)
  const captureString = getCaptureInfo(metadata)
  const editString = getEditInfo(metadata)
  const descInfo = getDescriptionInfo(metadata)

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
                <motion.div
                  key="formatted"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-8"
                >
                  {/* Hero Section - Camera & Lens */}
                  {subtitle && (
                    <motion.div variants={itemVariants} className="text-center mb-8 relative">
                      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-32 h-32 bg-teal-500/20 blur-[50px] rounded-full pointer-events-none" />
                      <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight relative z-10 drop-shadow-sm">
                        {camera}
                      </h3>
                      {lens && (
                        <p className="text-lg text-teal-400 font-medium mt-2 relative z-10">
                          {lens}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Key Stats Row */}
                  {stats.length > 0 && (
                    <motion.div
                      variants={itemVariants}
                      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    >
                      {stats.map((s, i) => (
                        <StatCard key={i} label={s.l} value={s.v} />
                      ))}
                    </motion.div>
                  )}

                  {/* Contextual Details */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Image Context */}
                    {(captureString || techString || editString) && (
                      <MetadataSection
                        title="Image Context"
                        icon={<Monitor />}
                        variants={itemVariants}
                      >
                        {captureString && (
                          <div className="flex items-start gap-3 group">
                            <Calendar className="w-4 h-4 text-slate-500 mt-1 shrink-0 group-hover:text-teal-400 transition-colors" />
                            <p className="text-slate-300 text-sm leading-relaxed">
                              {captureString}
                            </p>
                          </div>
                        )}
                        {techString && (
                          <div className="flex items-start gap-3 group">
                            <ImageIcon className="w-4 h-4 text-slate-500 mt-1 shrink-0 group-hover:text-teal-400 transition-colors" />
                            <p className="text-slate-300 text-sm leading-relaxed">{techString}</p>
                          </div>
                        )}
                        {editString && (
                          <div className="flex items-start gap-3 group">
                            <Sliders className="w-4 h-4 text-slate-500 mt-1 shrink-0 group-hover:text-teal-400 transition-colors" />
                            <p className="text-slate-300 text-sm leading-relaxed">{editString}</p>
                          </div>
                        )}
                      </MetadataSection>
                    )}

                    {/* Description & Rights */}
                    {descInfo.hasContent && (
                      <MetadataSection
                        title="Description & Rights"
                        icon={<FileText />}
                        variants={itemVariants}
                      >
                        <div className="text-slate-300">
                          {descInfo.description && (
                            <p className="italic text-sm leading-relaxed text-slate-400 border-l-2 border-slate-700 pl-3 py-1">
                              "{descInfo.description}"
                            </p>
                          )}
                          <div className="flex flex-col gap-1 mt-2">
                            {descInfo.copyright && (
                              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                <span className="text-slate-400">©</span> {descInfo.copyright}
                              </p>
                            )}
                            {descInfo.artist && (
                              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                <User size={12} /> {descInfo.artist}
                              </p>
                            )}
                          </div>
                        </div>
                      </MetadataSection>
                    )}
                  </div>

                  {/* Additional Data Sections */}
                  <div className="space-y-4">
                    {/* Detailed Capture Settings (Grid) */}
                    <MetadataGrid
                      title="Capture Settings"
                      variants={itemVariants}
                      items={[
                        {
                          l: 'Exposure Program',
                          v: metadata?.ExposureProgram,
                          i: <Sliders size={18} />,
                        },
                        {
                          l: 'Metering Mode',
                          v: metadata?.MeteringMode,
                          i: <Crosshair size={18} />,
                        },
                        { l: 'Flash', v: metadata?.Flash, i: <Zap size={18} /> },
                        { l: 'White Balance', v: metadata?.WhiteBalance, i: <Sun size={18} /> },
                      ]}
                    />

                    {/* Editorial & Instructions (Grid) */}
                    <MetadataGrid
                      title="Editorial"
                      variants={itemVariants}
                      items={[
                        { l: 'Instructions', v: metadata?.Instructions, i: <FileText size={18} /> },
                        { l: 'Credit', v: metadata?.Credit, i: <User size={18} /> },
                        { l: 'Source', v: metadata?.Source, i: <Globe size={18} /> },
                        {
                          l: 'Headline',
                          v:
                            getTagValue(metadata?.Headline) !== headline
                              ? metadata?.Headline
                              : null,
                          i: <Type size={18} />,
                        },
                      ]}
                    />
                  </div>

                  <GPSMetadataSection gps={gps} metadata={metadata} />
                </motion.div>
              )}

              {!loading && !error && !!metadata && viewMode === 'raw' && (
                <RawMetadataView metadata={metadata} />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
