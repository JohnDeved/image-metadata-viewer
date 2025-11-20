import type { ExifMetadata } from '../types/exif'
import { getTagValue, formatDate } from './metadata'

// Calculate camera stats for display
export const calculateCameraStats = (metadata: ExifMetadata | null) => {
  if (!metadata) return []

  return [
    {
      l: 'Aperture',
      v: getTagValue(metadata.FNumber) ? `f/${getTagValue(metadata.FNumber)}` : null,
    },
    {
      l: 'Shutter',
      v: getTagValue(metadata.ExposureTime) ? `${getTagValue(metadata.ExposureTime)}s` : null,
    },
    {
      l: 'ISO',
      v: getTagValue(metadata.ISOSpeedRatings)
        ? `ISO ${getTagValue(metadata.ISOSpeedRatings)}`
        : null,
    },
    { l: 'Focal Length', v: getTagValue(metadata.FocalLength) },
  ].filter(s => s.v)
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
  const hasDesc = desc && desc.trim().length > 0 && desc.trim() !== '""'

  return {
    hasContent: hasDesc || !!copyright || !!artist,
    description: hasDesc ? desc : null,
    copyright,
    artist,
  }
}
