import type { Tags as ExifMetadata } from 'exifreader'

export interface GPSData {
  lat: number
  lng: number
  latRef: string
  longRef: string
}

export const parseRational = (val: unknown): number =>
  Array.isArray(val) && val.length === 2 && typeof val[0] === 'number' && typeof val[1] === 'number'
    ? val[0] / val[1]
    : Number(val) || 0

export const convertDMSToDD = (d: number, m: number, s: number, dir: string) => {
  const dd = d + m / 60 + s / 3600
  return dir === 'S' || dir === 'W' ? dd * -1 : dd
}

export const formatDate = (dateString: unknown) => {
  if (!dateString) return null
  let dateStr = String(dateString).trim()

  // Convert EXIF format "YYYY:MM:DD HH:MM:SS" to ISO format
  dateStr = dateStr.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')

  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateString
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date)
  } catch {
    return dateString
  }
}

const isInvalidValue = (value: string) => !value || value === 'Unknown' || value === '""'

export const getTagValue = (tag: unknown): string | null => {
  if (tag === null || tag === undefined) return null

  if (typeof tag === 'string' || typeof tag === 'number') {
    const val = String(tag)
    return isInvalidValue(val) ? null : val
  }

  if (typeof tag !== 'object') return null

  // Check for description
  if ('description' in tag) {
    const desc = (tag as { description: unknown }).description
    if (typeof desc === 'string') {
      const trimmed = desc.trim()
      return isInvalidValue(trimmed) ? null : trimmed
    }
  }

  // Check for value
  if ('value' in tag) {
    const val = (tag as { value: unknown }).value
    if (Array.isArray(val)) {
      const parts = val.filter(v => typeof v === 'string' || typeof v === 'number')
      return parts.length > 0 ? parts.join(', ') : null
    }
    if (typeof val === 'string' || typeof val === 'number') {
      const strVal = String(val)
      return isInvalidValue(strVal) ? null : strVal
    }
  }

  return null
}

const getRef = (tag: unknown, defaultRef: string): string => {
  if (!tag || typeof tag !== 'object') return defaultRef
  if ('value' in tag && Array.isArray(tag.value) && tag.value[0]) return String(tag.value[0])
  if ('description' in tag && tag.description) return String(tag.description)
  return defaultRef
}

const getCoords = (tag: unknown) => {
  if (tag && typeof tag === 'object' && 'value' in tag) {
    return (tag as { value: unknown }).value
  }
  return null
}

export const getGPSData = (metadata: ExifMetadata | null): GPSData | null => {
  if (!metadata?.GPSLatitude || !metadata.GPSLongitude) return null

  try {
    const latRef = getRef(metadata.GPSLatitudeRef, 'N')
    const longRef = getRef(metadata.GPSLongitudeRef, 'E')

    const latValue = getCoords(metadata.GPSLatitude)
    const lngValue = getCoords(metadata.GPSLongitude)

    if (!Array.isArray(latValue) || latValue.length !== 3) return null
    if (!Array.isArray(lngValue) || lngValue.length !== 3) return null

    const [latD, latM, latS] = latValue.map(parseRational)
    const [lngD, lngM, lngS] = lngValue.map(parseRational)

    return {
      lat: convertDMSToDD(latD, latM, latS, latRef),
      lng: convertDMSToDD(lngD, lngM, lngS, longRef),
      latRef,
      longRef,
    }
  } catch {
    return null
  }
}

export const getHeadline = (metadata: ExifMetadata | null, file: File | null): string => {
  if (!metadata && !file) return 'Unknown Image'
  const headline = metadata ? getTagValue(metadata.Headline) : null
  return headline || file?.name || 'Unknown Image'
}

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

  const dateTaken = formatDate(
    getTagValue(metadata.DateTimeOriginal) || getTagValue(metadata.DateTime)
  )
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
