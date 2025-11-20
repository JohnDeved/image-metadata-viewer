import React from 'react'
import { Camera, Zap, ShieldCheck } from 'lucide-react'

interface HeaderProps {
  onLoadTestImage: () => void
}

export const Header: React.FC<HeaderProps> = ({ onLoadTestImage }) => (
  <header className='border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50'>
    <div className='max-w-6xl mx-auto px-4 h-16 flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <div className='bg-teal-600 p-2 rounded-lg shadow-lg shadow-teal-900/20'><Camera size={20} className='text-white' /></div>
        <h1 className='font-bold text-xl tracking-tight text-slate-100'>LensData</h1>
      </div>
      <div className='flex items-center gap-3'>
        {import.meta.env.DEV && (
          <button onClick={onLoadTestImage} className='text-xs font-medium text-teal-400 hover:text-teal-300 bg-teal-950/30 px-3 py-1.5 rounded-full border border-teal-900/50 transition-colors flex items-center gap-1'>
            <Zap size={12} /> <span>Debug</span>
          </button>
        )}
        <div className='flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-900/50'>
          <ShieldCheck size={14} /><span>Local Processing Only</span>
        </div>
      </div>
    </div>
  </header>
)
