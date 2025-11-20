import React, { useState, useCallback, type DragEvent, type ChangeEvent } from 'react'
import ExifReader from 'exifreader'
import type { ExifMetadata } from './types/exif'
import { getGPSData } from './utils/metadata'
import { Header } from './components/Header'
import { ImageDropZone } from './components/ImageDropZone'
import { MetadataViewer } from './components/MetadataViewer'
import { ShaderBackground } from './components/ShaderBackground'

interface AppState {
  file: File | null
  previewUrl: string | null
  metadata: ExifMetadata | null
  loading: boolean
  error: string | null
  viewMode: 'formatted' | 'raw'
  isDetailView: boolean
  imageLoaded: boolean
}

const initialState: AppState = {
  file: null,
  previewUrl: null,
  metadata: null,
  loading: false,
  error: null,
  viewMode: 'formatted',
  isDetailView: false,
  imageLoaded: false,
}

export default function App(): React.JSX.Element {
  const [state, setState] = useState<AppState>(initialState)

  const processFile = useCallback(async (fileToProcess: File) => {
    if (!fileToProcess.type.startsWith('image/')) {
      setState(prev => ({ ...prev, error: 'Please select a valid image file (JPEG, PNG, TIFF).' }))
      return
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      metadata: null,
      file: fileToProcess,
      imageLoaded: false,
      previewUrl: URL.createObjectURL(fileToProcess),
    }))

    try {
      const tags = await ExifReader.load(fileToProcess)
      setState(prev => ({
        ...prev,
        loading: false,
        metadata: tags,
        error: !tags || Object.keys(tags).length === 0 ? 'No EXIF metadata found.' : null,
      }))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setState(prev => ({
        ...prev,
        loading: false,
        error: `Failed to load EXIF data: ${message}`,
      }))
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
        setState(prev => ({ ...prev, error: `Failed to load test image: ${err.message}` }))
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
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl)
    setState(initialState)
  }

  const handleImageLoad = () => {
    setState(prev => ({ ...prev, imageLoaded: true }))
    setTimeout(() => setState(prev => ({ ...prev, isDetailView: true })), 400)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden relative">
      <ShaderBackground isDetailView={state.isDetailView} />
      <div className="relative z-10">
        <Header onLoadTestImage={loadTestImage} />
        <main
          className={`mx-auto px-4 py-8 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${state.isDetailView ? 'max-w-7xl' : 'max-w-2xl'}`}
        >
          <div
            className={`transform transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${state.isDetailView ? 'translate-y-0' : 'translate-y-[15vh]'}`}
          >
            <div className="flex flex-col lg:flex-row items-start">
              <ImageDropZone
                file={state.file}
                previewUrl={state.previewUrl}
                imageLoaded={state.imageLoaded}
                isDetailView={state.isDetailView}
                metadata={state.metadata}
                onFileSelect={(e: ChangeEvent<HTMLInputElement>) =>
                  e.target.files?.[0] && processFile(e.target.files[0])
                }
                onDrop={handleDrop}
                onClear={clearData}
                onImageLoad={handleImageLoad}
              />
              <MetadataViewer
                metadata={state.metadata}
                gps={getGPSData(state.metadata)}
                viewMode={state.viewMode}
                file={state.file}
                loading={state.loading}
                error={state.error}
                isDetailView={state.isDetailView}
                setViewMode={(mode) => setState(prev => ({ ...prev, viewMode: mode }))}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
