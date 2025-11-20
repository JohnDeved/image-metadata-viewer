import React from 'react'

interface StatCardProps {
  label: string
  value: string
}

export const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
  <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl flex flex-col items-center justify-center text-center hover:bg-slate-800/60 hover:border-teal-500/30 transition-all duration-300 backdrop-blur-sm group">
    <span className="text-2xl md:text-3xl font-bold text-slate-200 group-hover:text-white transition-colors">
      {value}
    </span>
    <span className="text-xs uppercase tracking-wider text-slate-500 font-medium mt-1 group-hover:text-teal-400 transition-colors">
      {label}
    </span>
  </div>
)
