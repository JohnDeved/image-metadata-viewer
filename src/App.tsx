import React, { useState, useCallback } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import { Upload, Image as ImageIcon, MapPin, Camera, Calendar, Trash2, ShieldCheck, Code, AlertCircle, Monitor, Zap, Sun, Crosshair, Sliders, FileText, User, Globe, Type, Navigation, Mountain } from 'lucide-react'
import ExifReader from 'exifreader'

// --- Types & Helpers ---
interface GPSData { lat: number; lng: number; latRef: string; longRef: string }

const parseRational = (val: any): number => 
  (Array.isArray(val) && val.length === 2 && typeof val[0] === 'number' && typeof val[1] === 'number') ? val[0] / val[1] : (Number(val) || 0)

const convertDMSToDD = (d: number, m: number, s: number, dir: string) => {
  let dd = d + m / 60 + s / 3600
  return (dir === 'S' || dir === 'W') ? dd * -1 : dd
}

const formatDate = (dateString: any) => {
  if (!dateString) return null
  let dateStr = String(dateString).trim()
  // Handle EXIF format "YYYY:MM:DD HH:MM:SS"
  if (/^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
    const [d, t] = dateStr.split(' ')
    dateStr = `${d.replace(/:/g, '-')}T${t}`
  }
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateString
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: 'numeric', minute: 'numeric', hour12: true 
    }).format(date)
  } catch (e) { return dateString }
}

const getTagValue = (tag: any) => {
  if (tag === null || tag === undefined) return null
  if (typeof tag === 'string' || typeof tag === 'number') return String(tag)
  if (typeof tag.description === 'string' && tag.description.trim().length > 0) return tag.description
  if (Array.isArray(tag.value)) {
    const parts = tag.value.filter((v: any) => typeof v === 'string' || typeof v === 'number')
    return parts.length > 0 ? parts.join(', ') : null
  }
  return (typeof tag.value === 'string' || typeof tag.value === 'number') ? String(tag.value) : null
}

const getGPSData = (metadata: any): GPSData | null => {
  if (!metadata?.GPSLatitude || !metadata?.GPSLongitude) return null
  try {
    const [latTag, lngTag] = [metadata.GPSLatitude, metadata.GPSLongitude]
    const latRef = metadata.GPSLatitudeRef?.value?.[0] || metadata.GPSLatitudeRef?.description || 'N'
    const longRef = metadata.GPSLongitudeRef?.value?.[0] || metadata.GPSLongitudeRef?.description || 'E'

    if (Array.isArray(latTag.value) && latTag.value.length === 3 && Array.isArray(lngTag.value) && lngTag.value.length === 3) {
       const [latD, latM, latS] = latTag.value.map(parseRational)
       const [lngD, lngM, lngS] = lngTag.value.map(parseRational)
       return { 
         lat: convertDMSToDD(latD, latM, latS, latRef), 
         lng: convertDMSToDD(lngD, lngM, lngS, longRef), 
         latRef, longRef 
       }
    }
    return null
  } catch (e) { return null }
}

// --- Components ---
const Header = () => (
  <header className='border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50'>
    <div className='max-w-6xl mx-auto px-4 h-16 flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <div className='bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-900/20'><Camera size={20} className='text-white' /></div>
        <h1 className='font-bold text-xl tracking-tight text-slate-100'>LensData</h1>
      </div>
      <div className='flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-900/50'>
        <ShieldCheck size={14} /><span>Local Processing Only</span>
      </div>
    </div>
  </header>
)



const ImageDropZone = ({ file, previewUrl, onFileSelect, onDrop, onClear, imageLoaded, onImageLoad, isDetailView, metadata }: any) => {
  const headline = metadata ? (getTagValue(metadata.Headline) || (file ? file.name : 'Unknown Image')) : (file ? file.name : null)

  return (
    <div className={`relative z-20 flex-shrink-0 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isDetailView ? 'w-full lg:w-[40%]' : 'w-full'}`}>
      <div onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }} onDrop={onDrop} className={`relative group rounded-2xl overflow-hidden bg-black shadow-2xl border transition-all duration-700 ${isDetailView ? 'border-slate-800' : 'border-slate-700 hover:border-indigo-500/50 bg-slate-900/30 aspect-[4/3]'}`}>
        {!file && <input type='file' onChange={onFileSelect} className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30' accept='image/*' />}
        <div className={`absolute inset-0 flex flex-col items-center justify-center text-slate-400 transition-all duration-500 ${previewUrl ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
          <div className='p-4 bg-slate-800 rounded-full mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300'><Upload size={48} strokeWidth={1.5} /></div>
          <h3 className='text-xl font-semibold text-slate-200'>Drop image here</h3><p className='text-sm mt-1 text-slate-500'>or click to browse (JPEG, TIFF)</p>
        </div>
        {previewUrl && (
          <div className={`relative w-full h-full transition-all duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <img src={previewUrl} alt='Preview' onLoad={onImageLoad} className={`w-full h-full object-contain transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isDetailView ? 'max-h-[600px] bg-black' : 'max-h-[60vh] bg-transparent'}`} />
            
            {/* Title Overlay */}
            {isDetailView && headline && (
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12">
                <h2 className="text-xl font-bold text-white tracking-tight break-words drop-shadow-md">{headline}</h2>
              </div>
            )}

            <button onClick={onClear} className={`absolute top-4 right-4 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-lg backdrop-blur-sm transition-all duration-500 ${isDetailView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`} title='Remove image'><Trash2 size={18} /></button>
          </div>
        )}
      </div>
    </div>
  )
}

const MetadataViewer = ({ metadata, gps, viewMode, file, setViewMode, isDetailView, loading, error }: { metadata: any, gps: any, viewMode: 'formatted' | 'raw', file: File | null, setViewMode: (mode: 'formatted' | 'raw') => void, isDetailView: boolean, loading: boolean, error: string | null }) => {
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

  return (
    <div className={`transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${isDetailView ? 'lg:w-[60%] opacity-100 max-w-[1000px] lg:pl-8' : 'w-0 opacity-0 max-w-0'}`}>
      <div className="min-w-[320px]">
        <div className='flex items-center justify-between mb-6 pt-1'>
          <h2 className='text-2xl font-bold text-white flex items-center gap-3'><div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20"><ImageIcon size={20} className='text-indigo-400' /></div>Image Data</h2>
          <div className='flex bg-slate-900 p-1 rounded-lg border border-slate-800'>
            {['formatted', 'raw'].map(mode => (
              <button key={mode} onClick={() => setViewMode(mode as any)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === mode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</button>
            ))}
          </div>
        </div>

        {loading && <div className='p-8 text-center text-slate-500 animate-pulse bg-slate-900/50 rounded-xl border border-slate-800'>Processing image data...</div>}
        {error && <div className='p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-300 flex items-start gap-3'><AlertCircle className='shrink-0 mt-0.5' size={18} /><div><p className='font-medium'>Unable to read data</p><p className='text-sm opacity-80 mt-1'>{error}</p></div></div>}

        {!loading && !error && metadata && viewMode === 'formatted' && (
          <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both' style={{ animationDelay: '400ms' }}>
            
            {/* Hero Section - Subtitle Only */}
            {subtitle && (
              <div className="text-center mb-6">
                <p className="text-lg text-slate-400 font-medium">{subtitle}</p>
              </div>
            )}

            {/* Key Stats Row */}
            {stats.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 md:gap-8 py-6 border-y border-slate-800/50">
                {stats.map((s, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-xl md:text-2xl font-semibold text-slate-200">{s.v}</span>
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-medium mt-1">{s.l}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Contextual Details */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Image Context */}
              <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-6 space-y-4">
                <h3 className="text-sm uppercase tracking-wider text-slate-500 font-semibold">Image Context</h3>
                <div className="space-y-3">
                  {captureString && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-slate-300">{captureString}</p>
                    </div>
                  )}
                  {techString && (
                    <div className="flex items-start gap-3">
                      <ImageIcon className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-slate-300">{techString}</p>
                    </div>
                  )}
                  {editString && (
                    <div className="flex items-start gap-3">
                      <Monitor className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-slate-300">{editString}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description & Rights */}
              {(getTagValue(metadata.ImageDescription) || getTagValue(metadata.description) || getTagValue(metadata.Copyright)) && (
                <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-6 space-y-4">
                  <h3 className="text-sm uppercase tracking-wider text-slate-500 font-semibold">Description & Rights</h3>
                  <div className="space-y-3 text-slate-300">
                    {getTagValue(metadata.ImageDescription) || getTagValue(metadata.description) ? (
                      <p className="italic">"{getTagValue(metadata.ImageDescription) || getTagValue(metadata.description)}"</p>
                    ) : null}
                    {getTagValue(metadata.Copyright) && (
                      <p className="text-sm text-slate-400">© {getTagValue(metadata.Copyright)}</p>
                    )}
                    {getTagValue(metadata.Artist) && (
                       <p className="text-sm text-slate-400">By {getTagValue(metadata.Artist)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Data Sections */}
            <div className="space-y-4">
            {/* Detailed Capture Settings (Grid) */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { l: 'Exposure Program', v: metadata.ExposureProgram, i: <Sliders size={18} /> },
                { l: 'Metering Mode', v: metadata.MeteringMode, i: <Crosshair size={18} /> },
                { l: 'Flash', v: metadata.Flash, i: <Zap size={18} /> },
                { l: 'White Balance', v: metadata.WhiteBalance, i: <Sun size={18} /> },
              ].map((item, idx) => {
                const val = getTagValue(item.v)
                if (!val || val === 'Unknown') return null
                return (
                  <div key={idx} className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4 flex flex-col gap-1 hover:border-indigo-500/30 transition-colors group">
                    <div className="flex items-center gap-2 text-indigo-400 mb-1 group-hover:text-indigo-300 transition-colors">
                      {item.i}
                      <span className="text-xs uppercase font-bold tracking-wider text-slate-500 group-hover:text-slate-400">{item.l}</span>
                    </div>
                    <span className="text-slate-200 font-semibold text-lg leading-tight">{val}</span>
                  </div>
                )
              })}
            </div>

            {/* Editorial & Instructions (Grid) */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { l: 'Instructions', v: metadata.Instructions, i: <FileText size={18} /> },
                { l: 'Credit', v: metadata.Credit, i: <User size={18} /> },
                { l: 'Source', v: metadata.Source, i: <Globe size={18} /> },
                { l: 'Headline', v: metadata.Headline !== headline ? metadata.Headline : null, i: <Type size={18} /> }
              ].map((item, idx) => {
                const val = getTagValue(item.v)
                if (!val || val === 'Unknown') return null
                return (
                  <div key={idx} className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4 flex flex-col gap-1 hover:border-indigo-500/30 transition-colors group">
                    <div className="flex items-center gap-2 text-indigo-400 mb-1 group-hover:text-indigo-300 transition-colors">
                      {item.i}
                      <span className="text-xs uppercase font-bold tracking-wider text-slate-500 group-hover:text-slate-400">{item.l}</span>
                    </div>
                    <span className="text-slate-200 font-semibold text-lg leading-tight">{val}</span>
                  </div>
                )
              })}
            </div>
            </div>

            {/* GPS Section */}
            {gps ? (
              <div className='bg-slate-900 rounded-xl border border-slate-800 overflow-hidden'>
                <div className='p-4 border-b border-slate-800 flex justify-between items-center'>
                  <h3 className='font-semibold text-slate-200 flex items-center gap-2'><MapPin size={16} className='text-indigo-400' />Location Data</h3>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${gps.lat},${gps.lng}`} target='_blank' rel='noreferrer' className='text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-full transition-colors'>Open Maps</a>
                </div>
                <div className='p-4 grid grid-cols-2 gap-4'>
                  <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4 flex flex-col gap-1 hover:border-indigo-500/30 transition-colors group">
                    <div className="flex items-center gap-2 text-indigo-400 mb-1 group-hover:text-indigo-300 transition-colors">
                      <Navigation size={18} />
                      <span className="text-xs uppercase font-bold tracking-wider text-slate-500 group-hover:text-slate-400">Latitude</span>
                    </div>
                    <span className="text-slate-200 font-semibold text-lg leading-tight">{gps.lat.toFixed(6)}° {gps.latRef}</span>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4 flex flex-col gap-1 hover:border-indigo-500/30 transition-colors group">
                    <div className="flex items-center gap-2 text-indigo-400 mb-1 group-hover:text-indigo-300 transition-colors">
                      <Navigation size={18} className="rotate-90" />
                      <span className="text-xs uppercase font-bold tracking-wider text-slate-500 group-hover:text-slate-400">Longitude</span>
                    </div>
                    <span className="text-slate-200 font-semibold text-lg leading-tight">{gps.lng.toFixed(6)}° {gps.longRef}</span>
                  </div>
                  {metadata.GPSAltitude && (
                    <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4 flex flex-col gap-1 hover:border-indigo-500/30 transition-colors group">
                      <div className="flex items-center gap-2 text-indigo-400 mb-1 group-hover:text-indigo-300 transition-colors">
                        <Mountain size={18} />
                        <span className="text-xs uppercase font-bold tracking-wider text-slate-500 group-hover:text-slate-400">Altitude</span>
                      </div>
                      <span className="text-slate-200 font-semibold text-lg leading-tight">{Math.round(Number(getTagValue(metadata.GPSAltitude)) || 0)}m</span>
                    </div>
                  )}
                </div>
              </div>
            ) : <div className='p-4 rounded-xl border border-dashed border-slate-800 text-slate-500 text-center text-sm'>No GPS data found in image</div>}
          </div>
        )}

        {!loading && !error && metadata && viewMode === 'raw' && (
          <div className='bg-slate-900 rounded-xl border border-slate-800 p-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='font-semibold text-slate-200 flex items-center gap-2'><Code size={16} className='text-indigo-400' />Raw JSON Output</h3>
              <button onClick={() => {
                const url = URL.createObjectURL(new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' }))
                const a = document.createElement('a'); a.href = url; a.download = 'exif-data.json'; a.click()
              }} className='text-xs text-indigo-400 hover:text-indigo-300 font-medium'>Download .json</button>
            </div>
            <pre className='font-mono text-xs text-slate-400 bg-black/50 p-4 rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar'>
              {JSON.stringify(metadata, (k, v) => (k === 'thumbnail' || (Array.isArray(v) && v.length > 100)) ? '[Binary Data Omitted]' : v, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default function App(): React.JSX.Element {
  const [state, setState] = useState({ file: null as File | null, previewUrl: null as string | null, metadata: null as any, loading: false, error: null as string | null, viewMode: 'formatted' as 'formatted' | 'raw', isDetailView: false, imageLoaded: false })
  const updateState = (updates: Partial<typeof state>) => setState(prev => ({ ...prev, ...updates }))

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return updateState({ error: 'Please select a valid image file (JPEG, PNG, TIFF).' })
    updateState({ loading: true, error: null, metadata: null, file, imageLoaded: false, previewUrl: URL.createObjectURL(file) })
    try {
      const tags = await ExifReader.load(file)
      updateState({ loading: false, metadata: tags, error: (!tags || Object.keys(tags).length === 0) ? 'No EXIF metadata found.' : null })
    } catch (err: any) { updateState({ loading: false, error: 'Failed to load EXIF data: ' + err.message }) }
  }, [])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]) }, [processFile])
  const clearData = () => { updateState({ isDetailView: false }); setTimeout(() => { if (state.previewUrl) URL.revokeObjectURL(state.previewUrl); updateState({ file: null, previewUrl: null, metadata: null, error: null, imageLoaded: false }) }, 700) }

  return (
    <div className='min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden'>
      <Header />
      <main className={`mx-auto px-4 py-8 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${state.isDetailView ? 'max-w-7xl' : 'max-w-2xl'}`}>
        <div className={`transform transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${state.isDetailView ? 'translate-y-0' : 'translate-y-[15vh]'}`}>
          <div className='flex flex-col lg:flex-row items-start'>
            <ImageDropZone {...state} onFileSelect={(e: ChangeEvent<HTMLInputElement>) => e.target.files?.[0] && processFile(e.target.files[0])} onDrop={handleDrop} onClear={clearData} onImageLoad={() => { updateState({ imageLoaded: true }); setTimeout(() => updateState({ isDetailView: true }), 400) }} />
            <MetadataViewer {...state} gps={getGPSData(state.metadata)} setViewMode={(m: any) => updateState({ viewMode: m })} />
          </div>
        </div>
      </main>
    </div>
  )
}
