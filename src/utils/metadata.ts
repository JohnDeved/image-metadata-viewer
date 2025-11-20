export interface GPSData { lat: number; lng: number; latRef: string; longRef: string }

export const parseRational = (val: any): number => 
  (Array.isArray(val) && val.length === 2 && typeof val[0] === 'number' && typeof val[1] === 'number') ? val[0] / val[1] : (Number(val) || 0)

export const convertDMSToDD = (d: number, m: number, s: number, dir: string) => {
  const dd = d + m / 60 + s / 3600
  return (dir === 'S' || dir === 'W') ? dd * -1 : dd
}

export const formatDate = (dateString: any) => {
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
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: 'numeric', minute: 'numeric', hour12: true 
    }).format(date)
  } catch (e) { return dateString }
}

export const getTagValue = (tag: any) => {
  if (tag === null || tag === undefined) return null
  if (typeof tag === 'string' || typeof tag === 'number') return String(tag)
  if (typeof tag.description === 'string' && tag.description.trim().length > 0) return tag.description
  if (Array.isArray(tag.value)) {
    const parts = tag.value.filter((v: any) => typeof v === 'string' || typeof v === 'number')
    return parts.length > 0 ? parts.join(', ') : null
  }
  return (typeof tag.value === 'string' || typeof tag.value === 'number') ? String(tag.value) : null
}

export const getGPSData = (metadata: any): GPSData | null => {
  if (!metadata?.GPSLatitude || !metadata?.GPSLongitude) return null
  try {
    const [latTag, lngTag] = [metadata.GPSLatitude, metadata.GPSLongitude]
    const latRef = metadata.GPSLatitudeRef?.value?.[0] || metadata.GPSLatitudeRef?.description || 'N'
    const longRef = metadata.GPSLongitudeRef?.value?.[0] || metadata.GPSLongitudeRef?.description || 'E'

    if (Array.isArray(latTag.value) && latTag.value.length === 3 && Array.isArray(lngTag.value) && lngTag.value.length === 3) {
       const [latD, latM, latS] = latTag.value.map(parseRational)
       const [lngD, lngM, lngS] = lngTag.value.map(parseRational)
       return { 
         lat: convertDMSToDD(latD, latM, latS, latRef), 
         lng: convertDMSToDD(lngD, lngM, lngS, longRef), 
         latRef, longRef 
       }
    }
    return null
  } catch (e) { return null }
}
