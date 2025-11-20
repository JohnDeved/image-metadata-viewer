import React from 'react'

interface DataGridItemProps {
  label: string
  value: unknown
  icon: React.ReactNode
}

export const DataGridItem: React.FC<DataGridItemProps> = ({ label, value, icon }) => (
  <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4 flex flex-col gap-2 hover:bg-slate-800/60 hover:border-teal-500/30 transition-all duration-300 group h-full">
    <div className="flex items-center gap-2 text-teal-500/70 mb-1 group-hover:text-teal-400 transition-colors">
      {React.cloneElement(icon as React.ReactElement<{ size: number }>, { size: 16 })}
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 group-hover:text-slate-400">
        {label}
      </span>
    </div>
    <span className="text-slate-200 font-medium text-base leading-snug break-words">
      {String(value)}
    </span>
  </div>
)
