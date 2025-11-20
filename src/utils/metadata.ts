import type { ExifMetadata } from '../types/exif'

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
  // Handle EXIF format "YYYY:MM:DD HH:MM:SS"
  if (/^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
    const [d, t] = dateStr.split(' ')
    dateStr = `${d.replace(/:/g, '-')}T${t}`
  }
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

export const getTagValue = (tag: unknown) => {
  if (tag === null || tag === undefined) return null

  let value: string | null = null

  if (typeof tag === 'string' || typeof tag === 'number') {
    value = String(tag)
  } else if (typeof tag === 'object' && tag !== null) {
    // Type guard for tag objects with value/description
    const hasValue = 'value' in tag
    const hasDescription = 'description' in tag

    if (hasDescription && typeof (tag as { description: unknown }).description === 'string') {
      const desc = (tag as { description: string }).description
      if (desc.trim().length > 0) {
        value = desc
      }
    }

    if (!value && hasValue) {
      const tagValue = (tag as { value: unknown }).value
      if (Array.isArray(tagValue)) {
        const parts = tagValue.filter(
          (v: unknown) => typeof v === 'string' || typeof v === 'number'
        )
        value = parts.length > 0 ? parts.join(', ') : null
      } else if (typeof tagValue === 'string' || typeof tagValue === 'number') {
        value = String(tagValue)
      }
    }
  }

  if (value === 'Unknown' || value === '' || value === '""') return null
  return value
}

export const getGPSData = (metadata: ExifMetadata | null): GPSData | null => {
  if (!metadata) return null
  if (!metadata.GPSLatitude || !metadata.GPSLongitude) return null

  try {
    const latTag = metadata.GPSLatitude
    const lngTag = metadata.GPSLongitude
    const latRefTag = metadata.GPSLatitudeRef
    const longRefTag = metadata.GPSLongitudeRef

    // Extract latitude and longitude references
    const latRef =
      (latRefTag &&
      typeof latRefTag === 'object' &&
      'value' in latRefTag &&
      Array.isArray(latRefTag.value)
        ? latRefTag.value[0]
        : null) ||
      (latRefTag && typeof latRefTag === 'object' && 'description' in latRefTag
        ? latRefTag.description
        : null) ||
      'N'
    const longRef =
      (longRefTag &&
      typeof longRefTag === 'object' &&
      'value' in longRefTag &&
      Array.isArray(longRefTag.value)
        ? longRefTag.value[0]
        : null) ||
      (longRefTag && typeof longRefTag === 'object' && 'description' in longRefTag
        ? longRefTag.description
        : null) ||
      'E'

    // Check if lat/lng tags have the expected value structure
    const latValue = latTag && typeof latTag === 'object' && 'value' in latTag ? latTag.value : null
    const lngValue = lngTag && typeof lngTag === 'object' && 'value' in lngTag ? lngTag.value : null

    if (
      Array.isArray(latValue) &&
      latValue.length === 3 &&
      Array.isArray(lngValue) &&
      lngValue.length === 3
    ) {
      const [latD, latM, latS] = latValue.map(parseRational)
      const [lngD, lngM, lngS] = lngValue.map(parseRational)
      return {
        lat: convertDMSToDD(latD, latM, latS, String(latRef)),
        lng: convertDMSToDD(lngD, lngM, lngS, String(longRef)),
        latRef: String(latRef),
        longRef: String(longRef),
      }
    }
    return null
  } catch {
    return null
  }
}
