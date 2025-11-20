import type { Tags as ExifMetadata } from 'exifreader'
import { getTagValue, formatDate } from './metadata'

// Calculate camera stats for display
export const calculateCameraStats = (metadata: ExifMetadata | null) => {
  if (!metadata) return []

  const stats = [
    { l: 'Aperture', v: metadata.FNumber, format: (v: string) => `f/${v}` },
    { l: 'Shutter', v: metadata.ExposureTime, format: (v: string) => `${v}s` },
    { l: 'ISO', v: metadata.ISOSpeedRatings, format: (v: string) => `ISO ${v}` },
    { l: 'Focal Length', v: metadata.FocalLength, format: (v: string) => v },
  ]

  return stats
    .map(({ l, v, format }) => {
      const value = getTagValue(v)
      return value ? { l, v: format(value) } : null
    })
    .filter((s): s is { l: string; v: string } => s !== null)
}

// Build camera and lens display strings
export const getCameraInfo = (metadata: ExifMetadata | null) => {
  if (!metadata) return { camera: '', lens: '', subtitle: '' }

  const camera = [getTagValue(metadata.Make), getTagValue(metadata.Model)].filter(Boolean).join(' ')
  const lens = getTagValue(metadata.LensModel) || ''
  const subtitle = [camera, lens].filter(Boolean).join(' • ')

  return { camera, lens, subtitle }
}

// Build technical specs string
export const getTechnicalSpecs = (metadata: ExifMetadata | null, file: File | null) => {
  const dimensions =
    metadata && metadata.PixelXDimension && metadata.PixelYDimension
      ? `${getTagValue(metadata.PixelXDimension)} x ${getTagValue(metadata.PixelYDimension)} px`
      : null

  const fileSize = file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : null
  const fileType = file ? file.type.split('/')[1].toUpperCase() : null

  return [dimensions, fileSize ? `${fileSize} ${fileType}` : null].filter(Boolean).join(' • ')
}

// Build capture date string
export const getCaptureInfo = (metadata: ExifMetadata | null) => {
  if (!metadata) return null

  const dateTaken = formatDate(getTagValue(metadata.DateTimeOriginal) || getTagValue(metadata.DateTime))
  return dateTaken ? `Taken on ${dateTaken}` : null
}

// Build edit info string
export const getEditInfo = (metadata: ExifMetadata | null) => {
  if (!metadata) return null

  const software = getTagValue(metadata.Software)
  const editedDate = formatDate(getTagValue(metadata.ModifyDate))

  return software ? `Edited with ${software}${editedDate ? ` on ${editedDate}` : ''}` : null
}

// Get description and rights info
export const getDescriptionInfo = (metadata: ExifMetadata | null) => {
  if (!metadata) return { hasContent: false, description: null, copyright: null, artist: null }

  const desc = getTagValue(metadata?.ImageDescription) || getTagValue(metadata?.description)
  const copyright = getTagValue(metadata?.Copyright)
  const artist = getTagValue(metadata?.Artist)

  return {
    hasContent: !!desc || !!copyright || !!artist,
    description: desc,
    copyright,
    artist,
  }
}
