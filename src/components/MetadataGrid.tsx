import React from 'react'
import { motion, type Variants } from 'framer-motion'
import { DataGridItem } from './DataGridItem'
import { getTagValue } from '../utils/metadata'

interface GridItem {
  l: string // label
  v: unknown // value (tag)
  i: React.ReactNode // icon
}

interface MetadataGridProps {
  title: string
  items: GridItem[]
  variants?: Variants
}

export const MetadataGrid: React.FC<MetadataGridProps> = ({ title, items, variants }) => {
  // Filter and extract values in one pass
  const validItems = items
    .map(item => ({ ...item, value: getTagValue(item.v) }))
    .filter(item => item.value && item.value !== 'Unknown')

  if (validItems.length === 0) return null

  return (
    <motion.div variants={variants} className="space-y-3">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {validItems.map((item, idx) => (
          <DataGridItem key={idx} label={item.l} value={item.value} icon={item.i} />
        ))}
      </div>
    </motion.div>
  )
}
