import React, { useState, useCallback, type DragEvent, type ChangeEvent } from 'react'
import ExifReader from 'exifreader'
import type { ExifMetadata } from './types/exif'
import { getGPSData } from './utils/metadata'
import { Header } from './components/Header'
import { ImageDropZone } from './components/ImageDropZone'
import { MetadataViewer } from './components/MetadataViewer'
import { ShaderBackground } from './components/ShaderBackground'

export default function App(): React.JSX.Element {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<ExifMetadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted')
  const [isDetailView, setIsDetailView] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const processFile = useCallback(async (fileToProcess: File) => {
    if (!fileToProcess.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, TIFF).')
      return
    }

    setLoading(true)
    setError(null)
    setMetadata(null)
    setFile(fileToProcess)
    setImageLoaded(false)
    setPreviewUrl(URL.createObjectURL(fileToProcess))

    try {
      const tags = await ExifReader.load(fileToProcess)
      setLoading(false)
      setMetadata(tags)
      setError(!tags || Object.keys(tags).length === 0 ? 'No EXIF metadata found.' : null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setLoading(false)
      setError(`Failed to load EXIF data: ${message}`)
    }
  }, [])

  const loadTestImage = useCallback(() => {
    console.log('Loading test image via button/shortcut...')
    fetch('/test/DSCN0010.jpg')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load test image')
        return res.blob()
      })
      .then(blob => {
        const testFile = new File([blob], 'Canon_40D_photoshop_import.jpg', { type: 'image/jpeg' })
        processFile(testFile)
      })
      .catch(err => {
        console.error('Error loading test image:', err)
        setError(`Failed to load test image: ${err.message}`)
      })
  }, [processFile])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0])
    },
    [processFile]
  )

  const clearData = () => {
    setIsDetailView(false)
    setTimeout(() => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setFile(null)
      setPreviewUrl(null)
      setMetadata(null)
      setError(null)
      setImageLoaded(false)
    }, 700)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
    setTimeout(() => setIsDetailView(true), 400)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden relative">
      <ShaderBackground isDetailView={isDetailView} />
      <div className="relative z-10">
        <Header onLoadTestImage={loadTestImage} />
        <main
          className={`mx-auto px-4 py-8 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isDetailView ? 'max-w-7xl' : 'max-w-2xl'}`}
        >
          <div
            className={`transform transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isDetailView ? 'translate-y-0' : 'translate-y-[15vh]'}`}
          >
            <div className="flex flex-col lg:flex-row items-start">
              <ImageDropZone
                file={file}
                previewUrl={previewUrl}
                imageLoaded={imageLoaded}
                isDetailView={isDetailView}
                metadata={metadata}
                onFileSelect={(e: ChangeEvent<HTMLInputElement>) =>
                  e.target.files?.[0] && processFile(e.target.files[0])
                }
                onDrop={handleDrop}
                onClear={clearData}
                onImageLoad={handleImageLoad}
              />
              <MetadataViewer
                metadata={metadata}
                gps={getGPSData(metadata)}
                viewMode={viewMode}
                file={file}
                loading={loading}
                error={error}
                isDetailView={isDetailView}
                setViewMode={setViewMode}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
