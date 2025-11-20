import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, Mountain } from 'lucide-react'
import { itemVariants } from '../utils/animations'
import { DataGridItem } from './DataGridItem'
import { getTagValue, type GPSData } from '../utils/metadata'
import type { Tags as ExifMetadata } from 'exifreader'

interface GPSMetadataSectionProps {
  gps: GPSData | null
  metadata: ExifMetadata | null
}

export const GPSMetadataSection: React.FC<GPSMetadataSectionProps> = ({ gps, metadata }) => {
  if (!gps) return null

  return (
    <motion.div variants={itemVariants} className="space-y-3">
      <div className="flex justify-between items-end">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</h3>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${gps.lat},${gps.lng}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs bg-teal-600 hover:bg-teal-500 text-white px-3 py-1 rounded-full transition-colors flex items-center gap-1"
        >
          <MapPin size={12} /> Open Maps
        </a>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <DataGridItem
          label="Latitude"
          value={`${gps.lat.toFixed(6)}° ${gps.latRef}`}
          icon={<Navigation size={18} />}
        />
        <DataGridItem
          label="Longitude"
          value={`${gps.lng.toFixed(6)}° ${gps.longRef}`}
          icon={<Navigation size={18} className="rotate-90" />}
        />
        {!!metadata?.GPSAltitude && (
          <DataGridItem
            label="Altitude"
            value={`${Math.round(Number(getTagValue(metadata.GPSAltitude)) || 0)}m`}
            icon={<Mountain size={18} />}
          />
        )}
      </div>
    </motion.div>
  )
}
