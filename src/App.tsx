import React, { useState, useCallback, type DragEvent, type ChangeEvent } from 'react'
import ExifReader from 'exifreader'
import type { ExifMetadata } from './types/exif'
import { getGPSData } from './utils/metadata'
import { Header } from './components/Header'
import { ImageDropZone } from './components/ImageDropZone'
import { MetadataViewer } from './components/MetadataViewer'

export default function App(): React.JSX.Element {
  const [state, setState] = useState({
    file: null as File | null,
    previewUrl: null as string | null,
    metadata: null as ExifMetadata | null,
    loading: false,
    error: null as string | null,
    viewMode: 'formatted' as 'formatted' | 'raw',
    isDetailView: false,
    imageLoaded: false,
  })
  const updateState = (updates: Partial<typeof state>) =>
    setState(prev => ({ ...prev, ...updates }))

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/'))
      return updateState({ error: 'Please select a valid image file (JPEG, PNG, TIFF).' })
    updateState({
      loading: true,
      error: null,
      metadata: null,
      file,
      imageLoaded: false,
      previewUrl: URL.createObjectURL(file),
    })
    try {
      const tags = await ExifReader.load(file)
      updateState({
        loading: false,
        metadata: tags,
        error: !tags || Object.keys(tags).length === 0 ? 'No EXIF metadata found.' : null,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      updateState({ loading: false, error: `Failed to load EXIF data: ${message}` })
    }
  }, [])

  const loadTestImage = useCallback(() => {
    console.log('Loading test image via button/shortcut...')
    // Use a real image from the public/test directory
    fetch('/test/DSCN0010.jpg')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load test image')
        return res.blob()
      })
      .then(blob => {
        const file = new File([blob], 'Canon_40D_photoshop_import.jpg', { type: 'image/jpeg' })
        processFile(file)
      })
      .catch(err => {
        console.error('Error loading test image:', err)
        updateState({ error: `Failed to load test image: ${err.message}` })
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
    updateState({ isDetailView: false })
    setTimeout(() => {
      if (state.previewUrl) URL.revokeObjectURL(state.previewUrl)
      updateState({ file: null, previewUrl: null, metadata: null, error: null, imageLoaded: false })
    }, 700)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      <Header onLoadTestImage={loadTestImage} />
      <main
        className={`mx-auto px-4 py-8 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${state.isDetailView ? 'max-w-7xl' : 'max-w-2xl'}`}
      >
        <div
          className={`transform transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${state.isDetailView ? 'translate-y-0' : 'translate-y-[15vh]'}`}
        >
          <div className="flex flex-col lg:flex-row items-start">
            <ImageDropZone
              {...state}
              onFileSelect={(e: ChangeEvent<HTMLInputElement>) =>
                e.target.files?.[0] && processFile(e.target.files[0])
              }
              onDrop={handleDrop}
              onClear={clearData}
              onImageLoad={() => {
                updateState({ imageLoaded: true })
                setTimeout(() => updateState({ isDetailView: true }), 400)
              }}
            />
            <MetadataViewer
              {...state}
              gps={getGPSData(state.metadata)}
              setViewMode={(m: 'formatted' | 'raw') => updateState({ viewMode: m })}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
