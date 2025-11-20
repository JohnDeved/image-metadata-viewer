import React from 'react'
import { motion } from 'framer-motion'
import { Upload, Trash2 } from 'lucide-react'
import { getHeadline } from '../utils/metadata'
import { useStore } from '../store'

interface ImageDropZoneProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onClear: () => void
  onImageLoad: () => void
}

// Motion configuration constants
const PANEL_TRANSITION = { type: 'tween', ease: [0.25, 0.1, 0.25, 1], duration: 0.6 } as const
const IMAGE_ANIMATION = {
  initial: { clipPath: 'inset(15% 15% 15% 15% round 20px)', opacity: 0 },
  animate: { clipPath: 'inset(0% 0% 0% 0% round 0px)', opacity: 1 },
  transition: { type: 'spring', stiffness: 200, damping: 30, delay: 0.1 },
} as const

const handleDragOver: React.DragEventHandler<HTMLDivElement> = e => {
  e.preventDefault()
  e.stopPropagation()
}

// Build dynamic class names for container
const getContainerClassName = (isDetailView: boolean) => {
  const baseClasses = 'relative group rounded-2xl overflow-hidden bg-black shadow-2xl border transition-all duration-300'
  const stateClasses = isDetailView
    ? 'border-slate-800'
    : 'border-slate-700 hover:border-teal-500/50 bg-slate-900/30 aspect-[4/3]'
  return `${baseClasses} ${stateClasses}`
}

// Build dynamic class names for placeholder
const getPlaceholderClassName = (hasPreview: boolean) => {
  const baseClasses = 'absolute inset-0 flex flex-col items-center justify-center text-slate-400 transition-all duration-500'
  const visibilityClasses = hasPreview ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
  return `${baseClasses} ${visibilityClasses}`
}

export const ImageDropZone: React.FC<ImageDropZoneProps> = ({
  onFileSelect,
  onDrop,
  onClear,
  onImageLoad,
}) => {
  const { file, previewUrl, isDetailView, metadata } = useStore()
  const headline = getHeadline(metadata, file)

  return (
    <motion.div
      initial={false}
      animate={{ width: isDetailView ? '40%' : '100%' }}
      transition={PANEL_TRANSITION}
      className="relative z-20 flex-shrink-0 w-full"
    >
      <div
        onDragOver={handleDragOver}
        onDrop={onDrop}
        className={getContainerClassName(isDetailView)}
      >
        {!file && (
          <input
            type="file"
            onChange={onFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
            accept="image/*"
          />
        )}
        <div className={getPlaceholderClassName(!!previewUrl)}>
          <div className="p-4 bg-slate-800 rounded-full mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
            <Upload size={48} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-semibold text-slate-200">Drop image here</h3>
          <p className="text-sm mt-1 text-slate-500">or click to browse (JPEG, TIFF)</p>
        </div>
        {previewUrl && (
          <motion.div {...IMAGE_ANIMATION} className="relative w-full h-full">
            <img
              src={previewUrl}
              alt="Preview"
              onLoad={onImageLoad}
              className={`w-full h-full object-contain ${isDetailView ? 'max-h-[600px] bg-black' : 'max-h-[60vh] bg-transparent'}`}
            />

            {/* Title Overlay */}
            {isDetailView && headline && (
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12">
                <h2 className="text-xl font-bold text-white tracking-tight break-words drop-shadow-md">
                  {headline}
                </h2>
              </div>
            )}

            <button
              onClick={onClear}
              className={`absolute top-4 right-4 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-500 ${isDetailView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
              title="Remove image"
            >
              <Trash2 size={18} />
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
