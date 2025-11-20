import React from 'react'

interface DataGridItemProps {
  label: string
  value: any
  icon: React.ReactNode
}

export const DataGridItem: React.FC<DataGridItemProps> = ({ label, value, icon }) => (
  <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4 flex flex-col gap-1 hover:border-teal-500/30 transition-colors group">
    <div className="flex items-center gap-2 text-teal-400 mb-1 group-hover:text-teal-300 transition-colors">
      {icon}
      <span className="text-xs uppercase font-bold tracking-wider text-slate-500 group-hover:text-slate-400">{label}</span>
    </div>
    <span className="text-slate-200 font-semibold text-lg leading-tight">{value}</span>
  </div>
)
