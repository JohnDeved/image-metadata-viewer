import { create } from 'zustand'
import ExifReader, { type Tags as ExifMetadata } from 'exifreader'
import { getErrorMessage } from './utils/errors'

interface AppState {
  file: File | null
  previewUrl: string | null
  metadata: ExifMetadata | null
  loading: boolean
  error: string | null
  viewMode: 'formatted' | 'raw' | 'ai'
  isDetailView: boolean
  imageLoaded: boolean
}

interface AppActions {
  setFile: (file: File | null) => void
  setPreviewUrl: (url: string | null) => void
  setMetadata: (metadata: ExifMetadata | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setViewMode: (mode: 'formatted' | 'raw' | 'ai') => void
  setIsDetailView: (isDetailView: boolean) => void
  setImageLoaded: (loaded: boolean) => void
  resetState: () => void
  processFile: (file: File) => Promise<void>
}

type Store = AppState & AppActions

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

export const useStore = create<Store>((set, get) => ({
  ...initialState,

  setFile: file => set({ file }),
  setPreviewUrl: url => set({ previewUrl: url }),
  setMetadata: metadata => set({ metadata }),
  setLoading: loading => set({ loading }),
  setError: error => set({ error }),
  setViewMode: mode => set({ viewMode: mode }),
  setIsDetailView: isDetailView => set({ isDetailView }),
  setImageLoaded: loaded => set({ imageLoaded: loaded }),

  resetState: () => {
    const { previewUrl } = get()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    set(initialState)
  },

  processFile: async (fileToProcess: File) => {
    if (!fileToProcess.type.startsWith('image/')) {
      set({ error: 'Please select a valid image file (JPEG, PNG, TIFF).' })
      return
    }

    set({
      loading: true,
      error: null,
      file: fileToProcess,
      imageLoaded: false,
      previewUrl: URL.createObjectURL(fileToProcess),
    })

    try {
      const tags = await ExifReader.load(fileToProcess)

      // Check for AI metadata to determine default view
      const hasAIData = tags && (tags.parameters || tags.prompt || tags.workflow)

      set({
        loading: false,
        metadata: tags,
        error: !tags || Object.keys(tags).length === 0 ? 'No EXIF metadata found.' : null,
        viewMode: hasAIData ? 'ai' : 'formatted',
      })
    } catch (err: unknown) {
      set({
        loading: false,
        error: `Failed to load EXIF data: ${getErrorMessage(err)}`,
      })
    }
  },
}))
