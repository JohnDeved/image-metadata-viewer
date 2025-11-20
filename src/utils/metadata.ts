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

export const getTagValue = (tag: unknown) => {
  if (tag === null || tag === undefined) return null

  // Handle primitives
  if (typeof tag === 'string' || typeof tag === 'number') {
    const value = String(tag)
    return isInvalidValue(value) ? null : value
  }

  // Handle objects
  if (typeof tag !== 'object') return null

  // Try description first
  if ('description' in tag && typeof (tag as { description: unknown }).description === 'string') {
    const desc = (tag as { description: string }).description.trim()
    return isInvalidValue(desc) ? null : desc
  }

  // Try value property
  if (!('value' in tag)) return null
  
  const tagValue = (tag as { value: unknown }).value
  
  // Handle array values
  if (Array.isArray(tagValue)) {
    const parts = tagValue.filter((v: unknown) => typeof v === 'string' || typeof v === 'number')
    return parts.length > 0 ? parts.join(', ') : null
  }
  
  // Handle primitive values
  if (typeof tagValue === 'string' || typeof tagValue === 'number') {
    const value = String(tagValue)
    return isInvalidValue(value) ? null : value
  }

  return null
}



export const getGPSData = (metadata: ExifMetadata | null): GPSData | null => {
  if (!metadata?.GPSLatitude || !metadata.GPSLongitude) return null

  try {
    // Extract GPS references
    const getRef = (tag: unknown, defaultValue: string): string => {
      if (!tag || typeof tag !== 'object') return defaultValue
      if ('value' in tag && Array.isArray(tag.value)) return tag.value[0] as string
      if ('description' in tag) return tag.description as string
      return defaultValue
    }

    const latRef = getRef(metadata.GPSLatitudeRef, 'N')
    const longRef = getRef(metadata.GPSLongitudeRef, 'E')

    // Extract coordinate values - inline simple helper
    const latValue = metadata.GPSLatitude && typeof metadata.GPSLatitude === 'object' && 'value' in metadata.GPSLatitude 
      ? metadata.GPSLatitude.value 
      : null
    const lngValue = metadata.GPSLongitude && typeof metadata.GPSLongitude === 'object' && 'value' in metadata.GPSLongitude
      ? metadata.GPSLongitude.value
      : null

    if (!Array.isArray(latValue) || latValue.length !== 3) return null
    if (!Array.isArray(lngValue) || lngValue.length !== 3) return null

    return {
      lat: convertDMSToDD(...latValue.map(parseRational) as [number, number, number], latRef),
      lng: convertDMSToDD(...lngValue.map(parseRational) as [number, number, number], longRef),
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
