import React, { useState, useCallback } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import { Upload, Image as ImageIcon, MapPin, Camera, Aperture, Clock, Calendar, Info, Trash2, ShieldCheck, Code, AlertCircle } from 'lucide-react'
import ExifReader from 'exifreader'

// --- Types ---
interface GPSData {
  lat: number; lng: number; latRef: string; longRef: string;
}

// --- Helpers ---
const convertDMSToDD = (d: number, m: number, s: number, dir: string) => {
  let dd = d + m / 60 + s / 3600
  if (dir === 'S' || dir === 'W') dd *= -1
  return dd
}

const parseRational = (val: any): number => {
  if (Array.isArray(val) && val.length === 2 && typeof val[0] === 'number' && typeof val[1] === 'number') {
    return val[0] / val[1]
  }
  return Number(val) || 0
}

const getTagValue = (tag: any) => {
  if (!tag) return null
  if (tag.description) return tag.description
  if (tag.value) return tag.value.toString()
  return tag.toString()
}

const getGPSData = (metadata: any): GPSData | null => {
  if (!metadata?.GPSLatitude || !metadata?.GPSLongitude) return null
  
  // ExifReader typically provides 'description' for simple tags, but for GPS it might be complex.
  // However, ExifReader often provides a parsed 'description' for GPS like "40, 42, 46".
  // But it's safer to look at the 'value' if it exists and is an array.
  
  try {
    const latTag = metadata.GPSLatitude
    const lngTag = metadata.GPSLongitude
    const latRef = metadata.GPSLatitudeRef?.value?.[0] || metadata.GPSLatitudeRef?.description || 'N'
    const longRef = metadata.GPSLongitudeRef?.value?.[0] || metadata.GPSLongitudeRef?.description || 'E'

    // Check if value is array of 3 numbers (DMS)
    if (Array.isArray(latTag.value) && latTag.value.length === 3 && Array.isArray(lngTag.value) && lngTag.value.length === 3) {
       const lat = convertDMSToDD(
         parseRational(latTag.value[0]),
         parseRational(latTag.value[1]),
         parseRational(latTag.value[2]),
         latRef
       )
       const lng = convertDMSToDD(
         parseRational(lngTag.value[0]),
         parseRational(lngTag.value[1]),
         parseRational(lngTag.value[2]),
         longRef
       )
       return { lat, lng, latRef, longRef }
    }
    
    // Fallback: if description is a decimal number (some parsers do this)
    // But ExifReader usually doesn't.
    
    return null
  } catch (e) {
    console.error("Error parsing GPS", e)
    return null
  }
}

// --- Components ---

const Header = () => (
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
)

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className='bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col gap-1 hover:border-indigo-500/30 transition-colors group'>
    <div className='text-indigo-400 mb-1 group-hover:scale-110 transition-transform duration-300 origin-left'>{icon}</div>
    <span className='text-slate-500 text-xs uppercase font-bold tracking-wider'>{label}</span>
    <span className='text-slate-100 font-semibold truncate' title={String(value)}>{value}</span>
  </div>
)

const DataRow = ({ label, value, icon }: { label: string, value: any, icon?: React.ReactNode }) => {
  const displayValue = getTagValue(value)
  if (!displayValue) return null
  return (
    <div className='flex items-center justify-between p-3 hover:bg-slate-800/30 transition-colors text-sm group'>
      <div className='flex items-center gap-2 text-slate-500 group-hover:text-slate-400 transition-colors'>
        {icon}
        <span>{label}</span>
      </div>
      <span className='text-slate-300 font-mono text-right max-w-[60%] break-words select-all'>{displayValue}</span>
    </div>
  )
}

const DataSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className='bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-colors'>
    <div className='px-4 py-3 bg-slate-800/50 border-b border-slate-800'>
      <h3 className='font-medium text-slate-200 text-sm'>{title}</h3>
    </div>
    <div className='divide-y divide-slate-800/50'>{children}</div>
  </div>
)

const ImageDropZone = ({ file, previewUrl, onFileSelect, onDrop, onClear, imageLoaded, onImageLoad, isDetailView }: any) => (
  <div className={`relative z-20 flex-shrink-0 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isDetailView ? 'w-full lg:w-[40%]' : 'w-full'}`}>
    <div 
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
      onDrop={onDrop}
      className={`relative group rounded-2xl overflow-hidden bg-black shadow-2xl border transition-all duration-700 ${isDetailView ? 'border-slate-800' : 'border-slate-700 hover:border-indigo-500/50 bg-slate-900/30 aspect-[4/3]'}`}
    >
      {!file && <input type='file' onChange={onFileSelect} className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30' accept='image/*' />}
      
      <div className={`absolute inset-0 flex flex-col items-center justify-center text-slate-400 transition-all duration-500 ${previewUrl ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
        <div className='p-4 bg-slate-800 rounded-full mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300'>
          <Upload size={48} strokeWidth={1.5} />
        </div>
        <h3 className='text-xl font-semibold text-slate-200'>Drop image here</h3>
        <p className='text-sm mt-1 text-slate-500'>or click to browse (JPEG, TIFF)</p>
      </div>

      {previewUrl && (
        <div className={`relative w-full h-full transition-all duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <img src={previewUrl} alt='Preview' onLoad={onImageLoad} className={`w-full h-full object-contain transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isDetailView ? 'max-h-[600px] bg-black' : 'max-h-[60vh] bg-transparent'}`} />
          <button onClick={onClear} className={`absolute top-4 right-4 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-lg backdrop-blur-sm transition-all duration-500 ${isDetailView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`} title='Remove image'>
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>

    <div className={`mt-6 bg-slate-900 rounded-xl border border-slate-800 p-4 transition-all duration-700 delay-200 ${isDetailView && file ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 absolute pointer-events-none'}`}>
      {file && (
        <div className="grid grid-cols-3 gap-4 divide-x divide-slate-800/50">
            <div className="text-center"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Size</p><p className="text-slate-200 font-mono text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB</p></div>
            <div className="text-center px-2"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Type</p><p className="text-slate-200 font-mono text-sm truncate">{file.type.split('/')[1].toUpperCase()}</p></div>
            <div className="text-center"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Name</p><p className="text-slate-200 font-mono text-sm truncate max-w-full px-2" title={file.name}>{file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name}</p></div>
        </div>
      )}
    </div>

    <div className={`mt-8 transition-all duration-500 ease-out ${!isDetailView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 absolute pointer-events-none'}`}>
      <div className="flex justify-center gap-6 text-slate-500">
        <div className="flex items-center gap-2 text-xs"><ShieldCheck size={16} className="text-emerald-500"/><span>Local Memory Only</span></div>
        <div className="flex items-center gap-2 text-xs"><Code size={16} className="text-indigo-500"/><span>No Server Uploads</span></div>
      </div>
    </div>
  </div>
)

const MetadataViewer = ({ metadata, loading, error, viewMode, setViewMode, isDetailView }: any) => {
  const gps = getGPSData(metadata)
  
  return (
    <div className={`transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${isDetailView ? 'lg:w-[60%] opacity-100 max-w-[1000px] lg:pl-8' : 'w-0 opacity-0 max-w-0'}`}>
      <div className="min-w-[320px]">
        <div className='flex items-center justify-between mb-6 pt-1'>
          <h2 className='text-2xl font-bold text-white flex items-center gap-3'>
            <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20"><ImageIcon size={20} className='text-indigo-400' /></div>
            Image Data
          </h2>
          <div className='flex bg-slate-900 p-1 rounded-lg border border-slate-800'>
            {['formatted', 'raw'].map(mode => (
              <button key={mode} onClick={() => setViewMode(mode as any)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === mode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className='p-8 text-center text-slate-500 animate-pulse bg-slate-900/50 rounded-xl border border-slate-800'>Processing image data...</div>}
        {error && <div className='p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-300 flex items-start gap-3'><AlertCircle className='shrink-0 mt-0.5' size={18} /><div><p className='font-medium'>Unable to read data</p><p className='text-sm opacity-80 mt-1'>{error}</p></div></div>}

        {!loading && !error && metadata && viewMode === 'formatted' && (
          <div className='space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both' style={{ animationDelay: '400ms' }}>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
              <StatCard icon={<Aperture size={18} />} label='Aperture' value={getTagValue(metadata.FNumber) || '—'} />
              <StatCard icon={<Clock size={18} />} label='Shutter' value={getTagValue(metadata.ExposureTime) || '—'} />
              <StatCard icon={<Info size={18} />} label='ISO' value={getTagValue(metadata.ISOSpeedRatings) || '—'} />
              <StatCard icon={<Camera size={18} />} label='Focal Length' value={getTagValue(metadata.FocalLength) || '—'} />
            </div>

            <DataSection title='Camera Equipment'>
              <DataRow label='Make' value={metadata.Make} />
              <DataRow label='Model' value={metadata.Model} />
              <DataRow label='Lens' value={metadata.LensModel || 'Unknown Lens'} />
              <DataRow label='Software' value={metadata.Software} />
            </DataSection>

            <DataSection title='Capture Details'>
              <DataRow label='Date Taken' value={metadata.DateTimeOriginal || metadata.DateTime} icon={<Calendar size={14} />} />
              <DataRow label='Flash' value={metadata.Flash} />
              <DataRow label='Metering Mode' value={metadata.MeteringMode} />
              <DataRow label='White Balance' value={metadata.WhiteBalance} />
              <DataRow label='Dimensions' value={(metadata.PixelXDimension && metadata.PixelYDimension) ? `${getTagValue(metadata.PixelXDimension)} x ${getTagValue(metadata.PixelYDimension)} px` : null} />
            </DataSection>

            {gps ? (
              <div className='bg-slate-900 rounded-xl border border-slate-800 overflow-hidden'>
                <div className='p-4 border-b border-slate-800 flex justify-between items-center'>
                  <h3 className='font-semibold text-slate-200 flex items-center gap-2'><MapPin size={16} className='text-indigo-400' />Location Data</h3>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${gps.lat},${gps.lng}`} target='_blank' rel='noreferrer' className='text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-full transition-colors'>Open Maps</a>
                </div>
                <div className='p-4 grid grid-cols-2 gap-4'>
                  <div><p className='text-xs text-slate-500 uppercase font-bold tracking-wider mb-1'>Latitude</p><p className='text-slate-300 font-mono'>{gps.lat.toFixed(6)}° {gps.latRef}</p></div>
                  <div><p className='text-xs text-slate-500 uppercase font-bold tracking-wider mb-1'>Longitude</p><p className='text-slate-300 font-mono'>{gps.lng.toFixed(6)}° {gps.longRef}</p></div>
                  {metadata.GPSAltitude && <div><p className='text-xs text-slate-500 uppercase font-bold tracking-wider mb-1'>Altitude</p><p className='text-slate-300 font-mono'>{Math.round(Number(getTagValue(metadata.GPSAltitude)) || 0)}m</p></div>}
                </div>
              </div>
            ) : (
              <div className='p-4 rounded-xl border border-dashed border-slate-800 text-slate-500 text-center text-sm'>No GPS data found in image</div>
            )}
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

// --- Main App ---

export default function App(): React.JSX.Element {
  const [state, setState] = useState({ file: null as File | null, previewUrl: null as string | null, metadata: null as any, loading: false, error: null as string | null, viewMode: 'formatted' as 'formatted' | 'raw', isDetailView: false, imageLoaded: false })

  const updateState = (updates: Partial<typeof state>) => setState(prev => ({ ...prev, ...updates }))

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return updateState({ error: 'Please select a valid image file (JPEG, PNG, TIFF).' })
    
    updateState({ loading: true, error: null, metadata: null, file, imageLoaded: false, previewUrl: URL.createObjectURL(file) })

    try {
      const tags = await ExifReader.load(file)
      updateState({ loading: false, metadata: tags, error: (!tags || Object.keys(tags).length === 0) ? 'No EXIF metadata found.' : null })
    } catch (err: any) {
      console.error(err)
      updateState({ loading: false, error: 'Failed to load EXIF data: ' + err.message })
    }
  }, [])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation()
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0])
  }, [processFile])

  const clearData = () => {
    updateState({ isDetailView: false })
    setTimeout(() => {
      if (state.previewUrl) URL.revokeObjectURL(state.previewUrl)
      updateState({ file: null, previewUrl: null, metadata: null, error: null, imageLoaded: false })
    }, 700)
  }

  return (
    <div className='min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden'>
      <Header />
      <main className={`mx-auto px-4 py-8 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${state.isDetailView ? 'max-w-7xl' : 'max-w-2xl'}`}>
        <div className={`transform transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${state.isDetailView ? 'translate-y-0' : 'translate-y-[15vh]'}`}>
          <div className='flex flex-col lg:flex-row items-start'>
            <ImageDropZone 
              {...state} 
              onFileSelect={(e: ChangeEvent<HTMLInputElement>) => e.target.files?.[0] && processFile(e.target.files[0])} 
              onDrop={handleDrop} 
              onClear={clearData} 
              onImageLoad={() => { updateState({ imageLoaded: true }); setTimeout(() => updateState({ isDetailView: true }), 400) }} 
            />
            <MetadataViewer {...state} setViewMode={(m: any) => updateState({ viewMode: m })} />
          </div>
        </div>
      </main>
    </div>
  )
}
