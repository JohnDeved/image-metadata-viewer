import React from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Image as ImageIcon, MapPin, Calendar, AlertCircle, Monitor, Zap, Sun, Crosshair, Sliders, FileText, User, Globe, Type, Navigation, Mountain, Code } from 'lucide-react'
import { getTagValue, formatDate, type GPSData } from '../utils/metadata'
import { DataGridItem } from './DataGridItem'

interface MetadataViewerProps {
  metadata: any
  gps: GPSData | null
  viewMode: 'formatted' | 'raw'
  file: File | null
  setViewMode: (mode: 'formatted' | 'raw') => void
  isDetailView: boolean
  loading: boolean
  error: string | null
}

export const MetadataViewer: React.FC<MetadataViewerProps> = ({ metadata, gps, viewMode, file, setViewMode, isDetailView, loading, error }) => {
  if (!metadata && !loading && !error) return null

  const headline = metadata ? (getTagValue(metadata.Headline) || (file ? file.name : 'Unknown Image')) : ''
  const camera = metadata ? [getTagValue(metadata.Make), getTagValue(metadata.Model)].filter(Boolean).join(' ') : ''
  const lens = metadata ? getTagValue(metadata.LensModel) : ''
  const subtitle = [camera, lens].filter(Boolean).join(' • ')

  const stats = metadata ? [
    { l: 'Aperture', v: getTagValue(metadata.FNumber) ? `f/${getTagValue(metadata.FNumber)}` : null },
    { l: 'Shutter', v: getTagValue(metadata.ExposureTime) ? `${getTagValue(metadata.ExposureTime)}s` : null },
    { l: 'ISO', v: getTagValue(metadata.ISOSpeedRatings) ? `ISO ${getTagValue(metadata.ISOSpeedRatings)}` : null },
    { l: 'Focal Length', v: getTagValue(metadata.FocalLength) }
  ].filter(s => s.v) : []

  const dimensions = (metadata && metadata.PixelXDimension && metadata.PixelYDimension) 
    ? `${getTagValue(metadata.PixelXDimension)} x ${getTagValue(metadata.PixelYDimension)} px` 
    : null
  const fileSize = file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : null
  const fileType = file ? file.type.split('/')[1].toUpperCase() : null
  const techString = [dimensions, fileSize ? `${fileSize} ${fileType}` : null].filter(Boolean).join(' • ')

  const dateTaken = metadata ? formatDate(getTagValue(metadata.DateTimeOriginal) || getTagValue(metadata.DateTime)) : null
  const captureString = dateTaken ? `Taken on ${dateTaken}` : null
  
  const software = metadata ? getTagValue(metadata.Software) : null
  const editedDate = metadata ? formatDate(getTagValue(metadata.ModifyDate)) : null
  const editString = software ? `Edited with ${software}${editedDate ? ` on ${editedDate}` : ''}` : null

  const formattedContainerVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      x: 20, 
      transition: { duration: 0.2 } 
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

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
            <motion.div className='flex items-center justify-between mb-6 pt-1'>
              <h2 className='text-2xl font-bold text-white flex items-center gap-3'><div className="p-1.5 bg-teal-500/10 rounded-lg border border-teal-500/20"><ImageIcon size={20} className='text-teal-400' /></div>Image Data</h2>
              <div className='flex bg-slate-900 p-1 rounded-lg border border-slate-800'>
                {['formatted', 'raw'].map(mode => (
                  <button key={mode} onClick={() => setViewMode(mode as any)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === mode ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</button>
                ))}
              </div>
            </motion.div>

            {loading && <div className='p-8 text-center text-slate-500 animate-pulse bg-slate-900/50 rounded-xl border border-slate-800'>Processing image data...</div>}
            {error && <div className='p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-300 flex items-start gap-3'><AlertCircle className='shrink-0 mt-0.5' size={18} /><div><p className='font-medium'>Unable to read data</p><p className='text-sm opacity-80 mt-1'>{error}</p></div></div>}

            <AnimatePresence mode="wait">
              {!loading && !error && metadata && viewMode === 'formatted' && (
                <motion.div 
                  key="formatted"
                  variants={formattedContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className='space-y-8'
                >
                  
                  {/* Hero Section - Camera & Lens */}
                  {subtitle && (
                    <motion.div variants={itemVariants} className="text-center mb-8 relative">
                      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-32 h-32 bg-teal-500/20 blur-[50px] rounded-full pointer-events-none" />
                      <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight relative z-10 drop-shadow-sm">
                        {camera}
                      </h3>
                      {lens && <p className="text-lg text-teal-400 font-medium mt-2 relative z-10">{lens}</p>}
                    </motion.div>
                  )}

                  {/* Key Stats Row */}
                  {stats.length > 0 && (
                    <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      {stats.map((s, i) => (
                        <div key={i} className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl flex flex-col items-center justify-center text-center hover:bg-slate-800/60 hover:border-teal-500/30 transition-all duration-300 group">
                          <span className="text-2xl md:text-3xl font-bold text-slate-200 group-hover:text-white transition-colors">{s.v}</span>
                          <span className="text-xs uppercase tracking-wider text-slate-500 font-medium mt-1 group-hover:text-teal-400 transition-colors">{s.l}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                    {/* Contextual Details */}
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Image Context */}
                      <motion.div variants={itemVariants} className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-5 space-y-4 hover:border-slate-700 transition-colors">
                        <h3 className="text-xs font-bold text-teal-500/70 uppercase tracking-widest flex items-center gap-2">
                          <Monitor size={14} /> Image Context
                        </h3>
                        <div className="space-y-3">
                          {captureString && (
                            <div className="flex items-start gap-3 group">
                              <Calendar className="w-4 h-4 text-slate-500 mt-1 shrink-0 group-hover:text-teal-400 transition-colors" />
                              <p className="text-slate-300 text-sm leading-relaxed">{captureString}</p>
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
                        </div>
                      </motion.div>

                      {/* Description & Rights */}
                      {(() => {
                        const desc = getTagValue(metadata.ImageDescription) || getTagValue(metadata.description)
                        const copyright = getTagValue(metadata.Copyright)
                        const artist = getTagValue(metadata.Artist)
                        const hasDesc = desc && desc.trim().length > 0 && desc.trim() !== '""'
                        
                        if (!hasDesc && !copyright && !artist) return null

                        return (
                          <motion.div variants={itemVariants} className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-5 space-y-4 hover:border-slate-700 transition-colors">
                            <h3 className="text-xs font-bold text-teal-500/70 uppercase tracking-widest flex items-center gap-2">
                              <FileText size={14} /> Description & Rights
                            </h3>
                            <div className="space-y-3 text-slate-300">
                              {hasDesc && <p className="italic text-sm leading-relaxed text-slate-400 border-l-2 border-slate-700 pl-3 py-1">"{desc}"</p>}
                              <div className="flex flex-col gap-1 mt-2">
                                {copyright && <p className="text-xs text-slate-500 font-medium flex items-center gap-1"><span className="text-slate-400">©</span> {copyright}</p>}
                                {artist && <p className="text-xs text-slate-500 font-medium flex items-center gap-1"><User size={12} /> {artist}</p>}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })()}
                    </div>

                  {/* Additional Data Sections */}
                  <div className="space-y-4">
                  {/* Detailed Capture Settings (Grid) */}
                  {(() => {
                    const items = [
                      { l: 'Exposure Program', v: metadata.ExposureProgram, i: <Sliders size={18} /> },
                      { l: 'Metering Mode', v: metadata.MeteringMode, i: <Crosshair size={18} /> },
                      { l: 'Flash', v: metadata.Flash, i: <Zap size={18} /> },
                      { l: 'White Balance', v: metadata.WhiteBalance, i: <Sun size={18} /> },
                    ].filter(item => {
                      const val = getTagValue(item.v)
                      return val && val !== 'Unknown'
                    })

                    if (items.length === 0) return null

                    return (
                      <motion.div variants={itemVariants} className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Capture Settings</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {items.map((item, idx) => (
                            <DataGridItem key={idx} label={item.l} value={getTagValue(item.v)} icon={item.i} />
                          ))}
                        </div>
                      </motion.div>
                    )
                  })()}

                  {/* Editorial & Instructions (Grid) */}
                  {(() => {
                    const items = [
                      { l: 'Instructions', v: metadata.Instructions, i: <FileText size={18} /> },
                      { l: 'Credit', v: metadata.Credit, i: <User size={18} /> },
                      { l: 'Source', v: metadata.Source, i: <Globe size={18} /> },
                      { l: 'Headline', v: metadata.Headline !== headline ? metadata.Headline : null, i: <Type size={18} /> }
                    ].filter(item => {
                      const val = getTagValue(item.v)
                      return val && val !== 'Unknown'
                    })

                    if (items.length === 0) return null

                    return (
                      <motion.div variants={itemVariants} className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Editorial</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {items.map((item, idx) => (
                            <DataGridItem key={idx} label={item.l} value={getTagValue(item.v)} icon={item.i} />
                          ))}
                        </div>
                      </motion.div>
                    )
                  })()}
                  </div>

                  {/* GPS Section */}
                  {gps ? (
                    <motion.div variants={itemVariants} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</h3>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${gps.lat},${gps.lng}`} target='_blank' rel='noreferrer' className='text-xs bg-teal-600 hover:bg-teal-500 text-white px-3 py-1 rounded-full transition-colors flex items-center gap-1'>
                          <MapPin size={12} /> Open Maps
                        </a>
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <DataGridItem label="Latitude" value={`${gps.lat.toFixed(6)}° ${gps.latRef}`} icon={<Navigation size={18} />} />
                        <DataGridItem label="Longitude" value={`${gps.lng.toFixed(6)}° ${gps.longRef}`} icon={<Navigation size={18} className="rotate-90" />} />
                        {metadata.GPSAltitude && (
                          <DataGridItem label="Altitude" value={`${Math.round(Number(getTagValue(metadata.GPSAltitude)) || 0)}m`} icon={<Mountain size={18} />} />
                        )}
                      </div>
                    </motion.div>
                  ) : null}
                </motion.div>
              )}

              {!loading && !error && metadata && viewMode === 'raw' && (
                <motion.div 
                  key="raw"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className='bg-slate-900 rounded-xl border border-slate-800 p-4 overflow-hidden'
                >
                  <div className='flex justify-between items-center mb-4'>
                    <h3 className='font-semibold text-slate-200 flex items-center gap-2'><Code size={16} className='text-teal-400' />Raw JSON Output</h3>
                    <button onClick={() => {
                      try {
                        const url = URL.createObjectURL(new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' }))
                        const a = document.createElement('a'); a.href = url; a.download = 'exif-data.json'; a.click()
                        URL.revokeObjectURL(url)
                      } catch (e) {
                        console.error(e)
                        alert('Failed to create JSON download')
                      }
                    }} className='text-xs text-teal-400 hover:text-teal-300 font-medium'>Download .json</button>
                  </div>
                  <pre className='font-mono text-xs text-slate-400 bg-black/50 p-4 rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar'>
                    {(() => {
                      try {
                        const json = JSON.stringify(metadata, null, 2)
                        return json === '{}' ? 'No metadata found (empty object)' : json
                      } catch (e: any) {
                        return 'Error displaying JSON: ' + e.message
                      }
                    })()}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
