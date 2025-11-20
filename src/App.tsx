import React, { useCallback, type DragEvent, type ChangeEvent } from 'react'
import { useStore } from './store'
import { getGPSData } from './utils/metadata'
import { Header } from './components/Header'
import { ImageDropZone } from './components/ImageDropZone'
import { MetadataViewer } from './components/MetadataViewer'
import { ShaderBackground } from './components/ShaderBackground'

const getErrorMessage = (err: unknown) => err instanceof Error ? err.message : String(err)

export default function App(): React.JSX.Element {
  const { processFile, resetState, setImageLoaded, setIsDetailView, setError, isDetailView } = useStore()

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
        setError(`Failed to load test image: ${getErrorMessage(err)}`)
      })
  }, [processFile, setError])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0])
    },
    [processFile]
  )

  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) processFile(e.target.files[0])
    },
    [processFile]
  )

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
    setTimeout(() => setIsDetailView(true), 400)
  }, [setImageLoaded, setIsDetailView])

  const mainClassName = `mx-auto px-4 py-8 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isDetailView ? 'max-w-7xl' : 'max-w-2xl'}`
  const contentClassName = `transform transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isDetailView ? 'translate-y-0' : 'translate-y-[15vh]'}`

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden relative">
      <ShaderBackground />
      <div className="relative z-10">
        <Header onLoadTestImage={loadTestImage} />
        <main className={mainClassName}>
          <div className={contentClassName}>
            <div className="flex flex-col lg:flex-row items-start">
              <ImageDropZone
                onFileSelect={handleFileSelect}
                onDrop={handleDrop}
                onClear={resetState}
                onImageLoad={handleImageLoad}
              />
              <MetadataViewer gps={getGPSData(useStore.getState().metadata)} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
