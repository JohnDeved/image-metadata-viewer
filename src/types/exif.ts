import type { Tags } from 'exifreader'

// Main EXIF metadata type from ExifReader
export type ExifMetadata = Tags

// Type guard to check if value is an EXIF tag object
export function isExifTag(value: unknown): value is { value?: unknown; description?: string } {
  return typeof value === 'object' && value !== null && ('value' in value || 'description' in value)
}

// Type guard to safely access metadata properties
export function getMetadataProperty<K extends keyof ExifMetadata>(
  metadata: unknown,
  key: K
): ExifMetadata[K] | undefined {
  if (!metadata || typeof metadata !== 'object') return undefined
  const meta = metadata as ExifMetadata
  return meta[key]
}
