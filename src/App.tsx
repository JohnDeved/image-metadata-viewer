import React, { useState, useCallback } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import { Upload, Image as ImageIcon, MapPin, Camera, Aperture, Clock, Calendar, Info, Trash2, ShieldCheck, Code, AlertCircle } from 'lucide-react'
import EXIF from 'exif-js'

interface GPSData {
  lat: number
  lng: number
  latRef: string
  longRef: string
}

const convertDMSToDD = (degrees: number, minutes: number, seconds: number, direction: string): number => {
  let dd = degrees + minutes / 60 + seconds / 3600
  if (direction === 'S' || direction === 'W') {
    dd = dd * -1
  }
  return dd
}

const formatFraction = (val: any): string | number => {
  if (!val) return 'N/A'
  if (typeof val === 'number') return Math.round(val * 100) / 100
  if (val && typeof val === 'object' && 'numerator' in val && 'denominator' in val) {
    const num = val.numerator
    const den = val.denominator
    if (den === 1) return num
    if (num === 1 && den > 1) return `1/${den}`
    return (num / den).toFixed(1)
  }
  return val
}

export default function App (): React.JSX.Element {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted')
  
  // Animation States
  const [isDetailView, setIsDetailView] = useState<boolean>(false)
  const [imageLoaded, setImageLoaded] = useState<boolean>(false)

  const processFile = useCallback((selectedFile: File | null) => {
    if (!selectedFile) return

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, TIFF).')
      return
    }

    setLoading(true)
    setError(null)
    setMetadata(null)
    setFile(selectedFile)
    setImageLoaded(false) // Reset load state for smooth fade-in
    
    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)

    // EXIF.getData works with the File object directly in modern browsers/exif-js versions
    EXIF.getData(selectedFile as any, function (this: any) {
        const allTags = EXIF.getAllTags(this)
        if (!allTags || Object.keys(allTags).length === 0) {
          setError('No EXIF metadata found. Some platforms strip this data.')
        } else {
          setMetadata(allTags)
        }
        setLoading(false)
    })
  }, [])

  // Trigger layout transition only after image has visually loaded to prevent empty jumps
  const handleImageLoad = () => {
    setImageLoaded(true)
    setTimeout(() => {
      setIsDetailView(true)
    }, 400) // Small delay to let user admire the image filling the box
  }

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }, [processFile])

  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const clearData = () => {
    setIsDetailView(false)
    // Wait for animation to reverse before clearing data
    setTimeout(() => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setFile(null)
      setPreviewUrl(null)
      setMetadata(null)
      setError(null)
      setImageLoaded(false)
    }, 700)
  }

  const gps = getGPSData(metadata)

  return (
    <div className='min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden'>
      {/* Header */}
      <header className='border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50'>
        <div className='max-w-6xl mx-auto px-4 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-900/20'>
              <Camera size={20} className='text-white' />
            </div>
            <h1 className='font-bold text-xl tracking-tight text-slate-100'>LensData</h1>
          </div>
          <div className='flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-900/50'>
            <ShieldCheck size={14} />
            <span>Local Processing Only</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`mx-auto px-4 py-8 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isDetailView ? 'max-w-7xl' : 'max-w-2xl'}`}>
        
        {/* Vertical Positioning Wrapper: Simulates centering without Flex column switching */}
        <div className={`transform transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isDetailView ? 'translate-y-0' : 'translate-y-[15vh]'}`}>
          
          {/* Content Row */}
          <div className='flex flex-col lg:flex-row items-start'>
            
            {/* LEFT PANEL: Image Container */}
            {/* We use flex-basis logic implicitly via width classes and flex-shrink-0 */}
            <div className={`relative z-20 flex-shrink-0 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isDetailView ? 'w-full lg:w-[40%]' : 'w-full'}`}>
              
              {/* Visual Card */}
              <div 
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                onDrop={onDrop}
                className={`relative group rounded-2xl overflow-hidden bg-black shadow-2xl border transition-all duration-700 ${isDetailView ? 'border-slate-800' : 'border-slate-700 hover:border-indigo-500/50 bg-slate-900/30 aspect-[4/3]'}`}
              >
                
                {/* Input Layer */}
                {!file && (
                  <input
                    type='file'
                    onChange={onFileSelect}
                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30'
                    accept='image/*'
                  />
                )}

                {/* Placeholder State */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center text-slate-400 transition-all duration-500 ${previewUrl ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                  <div className='p-4 bg-slate-800 rounded-full mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300'>
                    <Upload size={48} strokeWidth={1.5} />
                  </div>
                  <h3 className='text-xl font-semibold text-slate-200'>Drop image here</h3>
                  <p className='text-sm mt-1 text-slate-500'>or click to browse (JPEG, TIFF)</p>
                </div>

                {/* Image Layer */}
                {previewUrl && (
                  <div className={`relative w-full h-full transition-all duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <img
                      src={previewUrl}
                      alt='Preview'
                      onLoad={handleImageLoad}
                      className={`w-full h-full object-contain transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isDetailView ? 'max-h-[600px] bg-black' : 'max-h-[60vh] bg-transparent'}`}
                    />
                    
                    {/* Trash Button */}
                    <button
                      onClick={clearData}
                      className={`absolute top-4 right-4 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-lg backdrop-blur-sm transition-all duration-500 ${isDetailView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
                      title='Remove image'
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* File Info (Slides up from bottom) */}
              <div className={`mt-6 bg-slate-900 rounded-xl border border-slate-800 p-4 transition-all duration-700 delay-200 ${isDetailView && file ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 absolute pointer-events-none'}`}>
                {file && (
                  <div className="grid grid-cols-3 gap-4 divide-x divide-slate-800/50">
                     <div className="text-center">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Size</p>
                        <p className="text-slate-200 font-mono text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                     </div>
                     <div className="text-center px-2">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Type</p>
                        <p className="text-slate-200 font-mono text-sm truncate">{file.type.split('/')[1].toUpperCase()}</p>
                     </div>
                     <div className="text-center">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Name</p>
                        <p className="text-slate-200 font-mono text-sm truncate max-w-full px-2" title={file.name}>{file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name}</p>
                     </div>
                  </div>
                )}
              </div>

              {/* Privacy Badge Row (Fades out) */}
              <div className={`mt-8 transition-all duration-500 ease-out ${!isDetailView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 absolute pointer-events-none'}`}>
                <div className="flex justify-center gap-6 text-slate-500">
                  <div className="flex items-center gap-2 text-xs">
                    <ShieldCheck size={16} className="text-emerald-500"/>
                    <span>Local Memory Only</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Code size={16} className="text-indigo-500"/>
                    <span>No Server Uploads</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Metadata Container */}
            {/* Uses max-width for transition instead of width to allow smooth flex growth */}
            <div className={`transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${isDetailView ? 'lg:w-[60%] opacity-100 max-w-[1000px] lg:pl-8' : 'w-0 opacity-0 max-w-0'}`}>
              <div className="min-w-[320px]"> {/* Inner wrapper prevents text wrapping jank during expansion */}
                
                {/* Header */}
                <div className='flex items-center justify-between mb-6 pt-1'>
                  <h2 className='text-2xl font-bold text-white flex items-center gap-3'>
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                       <ImageIcon size={20} className='text-indigo-400' />
                    </div>
                    Image Data
                  </h2>
                  <div className='flex bg-slate-900 p-1 rounded-lg border border-slate-800'>
                    <button
                      onClick={() => setViewMode('formatted')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'formatted' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                      Formatted
                    </button>
                    <button
                      onClick={() => setViewMode('raw')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'raw' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                      Raw JSON
                    </button>
                  </div>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className='p-8 text-center text-slate-500 animate-pulse bg-slate-900/50 rounded-xl border border-slate-800'>
                    Processing image data...
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className='p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-300 flex items-start gap-3'>
                    <AlertCircle className='shrink-0 mt-0.5' size={18} />
                    <div>
                      <p className='font-medium'>Unable to read data</p>
                      <p className='text-sm opacity-80 mt-1'>{error}</p>
                    </div>
                  </div>
                )}

                {/* Data Content */}
                {!loading && !error && metadata && viewMode === 'formatted' && (
                  <div className='space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both' style={{ animationDelay: '400ms' }}>
                    {/* Key Stats Grid */}
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                      <StatCard
                        icon={<Aperture size={18} />}
                        label='Aperture'
                        value={metadata.FNumber ? `f/${metadata.FNumber}` : '—'}
                      />
                      <StatCard
                        icon={<Clock size={18} />}
                        label='Shutter'
                        value={metadata.ExposureTime ? formatFraction({ numerator: 1, denominator: (1 / metadata.ExposureTime) }) : '—'}
                      />
                      <StatCard
                        icon={<Info size={18} />}
                        label='ISO'
                        value={metadata.ISOSpeedRatings || '—'}
                      />
                      <StatCard
                        icon={<Camera size={18} />}
                        label='Focal Length'
                        value={metadata.FocalLength ? `${metadata.FocalLength}mm` : '—'}
                      />
                    </div>

                    {/* Camera Info */}
                    <DataSection title='Camera Equipment'>
                      <DataRow label='Make' value={metadata.Make} />
                      <DataRow label='Model' value={metadata.Model} />
                      <DataRow label='Lens' value={metadata.LensModel || 'Unknown Lens'} />
                      <DataRow label='Software' value={metadata.Software} />
                    </DataSection>

                    {/* Capture Info */}
                    <DataSection title='Capture Details'>
                      <DataRow
                        label='Date Taken'
                        value={metadata.DateTimeOriginal || metadata.DateTime}
                        icon={<Calendar size={14} />}
                      />
                      <DataRow label='Flash' value={metadata.Flash} />
                      <DataRow label='Metering Mode' value={metadata.MeteringMode} />
                      <DataRow label='White Balance' value={metadata.WhiteBalance} />
                      <DataRow label='Dimensions' value={metadata.PixelXDimension && metadata.PixelYDimension ? `${metadata.PixelXDimension} x ${metadata.PixelYDimension} px` : null} />
                    </DataSection>

                    {/* Location */}
                    {gps ? (
                        <div className='bg-slate-900 rounded-xl border border-slate-800 overflow-hidden'>
                          <div className='p-4 border-b border-slate-800 flex justify-between items-center'>
                            <h3 className='font-semibold text-slate-200 flex items-center gap-2'>
                              <MapPin size={16} className='text-indigo-400' />
                              Location Data
                            </h3>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${gps.lat},${gps.lng}`}
                              target='_blank'
                              rel='noreferrer'
                              className='text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-full transition-colors'
                            >
                              Open Maps
                            </a>
                          </div>
                          <div className='p-4 grid grid-cols-2 gap-4'>
                            <div>
                              <p className='text-xs text-slate-500 uppercase font-bold tracking-wider mb-1'>Latitude</p>
                              <p className='text-slate-300 font-mono'>{gps.lat.toFixed(6)}° {gps.latRef}</p>
                            </div>
                            <div>
                              <p className='text-xs text-slate-500 uppercase font-bold tracking-wider mb-1'>Longitude</p>
                              <p className='text-slate-300 font-mono'>{gps.lng.toFixed(6)}° {gps.longRef}</p>
                            </div>
                            {metadata.GPSAltitude && (
                            <div>
                              <p className='text-xs text-slate-500 uppercase font-bold tracking-wider mb-1'>Altitude</p>
                              <p className='text-slate-300 font-mono'>{Math.round(metadata.GPSAltitude)}m</p>
                            </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className='p-4 rounded-xl border border-dashed border-slate-800 text-slate-500 text-center text-sm'>
                          No GPS data found in image
                        </div>
                      )}
                  </div>
                )}

                {/* Raw JSON View */}
                {!loading && !error && metadata && viewMode === 'raw' && (
                  <div className='bg-slate-900 rounded-xl border border-slate-800 p-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700'>
                    <div className='flex justify-between items-center mb-4'>
                      <h3 className='font-semibold text-slate-200 flex items-center gap-2'>
                        <Code size={16} className='text-indigo-400' />
                        Raw JSON Output
                      </h3>
                      <button
                        onClick={() => {
                          const json = JSON.stringify(metadata, null, 2)
                          const blob = new Blob([json], { type: 'application/json' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = 'exif-data.json'
                          a.click()
                        }}
                        className='text-xs text-indigo-400 hover:text-indigo-300 font-medium'
                      >
                        Download .json
                      </button>
                    </div>
                    <pre className='font-mono text-xs text-slate-400 bg-black/50 p-4 rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar'>
                      {JSON.stringify(metadata, (key, value) => {
                        if (key === 'thumbnail' || (Array.isArray(value) && value.length > 100)) {
                          return '[Binary Data Omitted]'
                        }
                        return value
                      }, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

// Helpers

const getGPSData = (metadata: any): GPSData | null => {
  if (!metadata || !metadata.GPSLatitude || !metadata.GPSLongitude) return null

  const latRef = metadata.GPSLatitudeRef || 'N'
  const longRef = metadata.GPSLongitudeRef || 'E'

  const lat = convertDMSToDD(
    metadata.GPSLatitude[0],
    metadata.GPSLatitude[1],
    metadata.GPSLatitude[2],
    latRef
  )

  const lng = convertDMSToDD(
    metadata.GPSLongitude[0],
    metadata.GPSLongitude[1],
    metadata.GPSLongitude[2],
    longRef
  )

  return { lat, lng, latRef, longRef }
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
}

const StatCard = ({ icon, label, value }: StatCardProps): React.JSX.Element => (
  <div className='bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col gap-1 hover:border-indigo-500/30 transition-colors group'>
    <div className='text-indigo-400 mb-1 group-hover:scale-110 transition-transform duration-300 origin-left'>{icon}</div>
    <span className='text-slate-500 text-xs uppercase font-bold tracking-wider'>{label}</span>
    <span className='text-slate-100 font-semibold truncate' title={String(value)}>{value}</span>
  </div>
)

interface DataSectionProps {
  title: string
  children: React.ReactNode
}

const DataSection = ({ title, children }: DataSectionProps): React.JSX.Element => (
  <div className='bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-colors'>
    <div className='px-4 py-3 bg-slate-800/50 border-b border-slate-800'>
      <h3 className='font-medium text-slate-200 text-sm'>{title}</h3>
    </div>
    <div className='divide-y divide-slate-800/50'>
      {children}
    </div>
  </div>
)

interface DataRowProps {
  label: string
  value: any
  icon?: React.ReactNode
}

const DataRow = ({ label, value, icon }: DataRowProps): React.JSX.Element | null => {
  if (!value) return null
  return (
    <div className='flex items-center justify-between p-3 hover:bg-slate-800/30 transition-colors text-sm group'>
      <div className='flex items-center gap-2 text-slate-500 group-hover:text-slate-400 transition-colors'>
        {icon}
        <span>{label}</span>
      </div>
      <span className='text-slate-300 font-mono text-right max-w-[60%] break-words select-all'>{value.toString()}</span>
    </div>
  )
}
