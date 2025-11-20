import React from 'react'
import { motion, type Variants } from 'framer-motion'

interface MetadataSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  variants?: Variants
  className?: string
}

const baseClassName = 
  'bg-slate-900/40 rounded-xl border border-slate-800/60 p-5 space-y-4 ' +
  'hover:bg-slate-800/60 hover:border-teal-500/30 transition-all duration-300 backdrop-blur-sm'

export const MetadataSection: React.FC<MetadataSectionProps> = ({
  title,
  icon,
  children,
  variants,
  className = '',
}) => (
  <motion.div variants={variants} className={`${baseClassName} ${className}`}>
    <h3 className="text-xs font-bold text-teal-500/70 uppercase tracking-widest flex items-center gap-2">
      <span className="[&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span>
      {title}
    </h3>
    <div className="space-y-3">{children}</div>
  </motion.div>
)
