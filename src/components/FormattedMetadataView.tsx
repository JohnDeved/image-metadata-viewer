import React from 'react'
import { motion } from 'framer-motion'
import {
  Image as ImageIcon,
  Calendar,
  Monitor,
  Sliders,
  FileText,
  User,
  Globe,
  Type,
  Crosshair,
  Zap,
  Sun,
  Palette,
  Camera,
  Aperture,
  Focus,
  Contrast as ContrastIcon,
  Sparkle,
} from 'lucide-react'
import {
  getTagValue,
  getHeadline,
  type GPSData,
  calculateCameraStats,
  getCameraInfo,
  getTechnicalSpecs,
  getCaptureInfo,
  getEditInfo,
  getDescriptionInfo,
} from '../utils/metadata'
import { itemVariants, containerVariants } from '../utils/animations'
import { MetadataSection } from './MetadataSection'
import { MetadataGrid } from './MetadataGrid'
import { StatCard } from './StatCard'
import { GPSMetadataSection } from './GPSMetadataSection'
import type { Tags as ExifMetadata } from 'exifreader'
import { useStore } from '../store'

interface FormattedMetadataViewProps {
  metadata: ExifMetadata
  gps: GPSData | null
}

export const FormattedMetadataView: React.FC<FormattedMetadataViewProps> = ({ metadata, gps }) => {
  const { file } = useStore()
  
  const headline = getHeadline(metadata, file)
  const { camera, lens, subtitle } = getCameraInfo(metadata)
  const stats = calculateCameraStats(metadata)
  const techString = getTechnicalSpecs(metadata, file)
  const captureString = getCaptureInfo(metadata)
  const editString = getEditInfo(metadata)
  const descInfo = getDescriptionInfo(metadata)

  return (
    <motion.div
      key="formatted"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      {/* Hero Section - Camera & Lens */}
      {subtitle && (
        <motion.div variants={itemVariants} className="text-center mb-8 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-32 h-32 bg-teal-500/20 blur-[50px] rounded-full pointer-events-none" />
          <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight relative z-10 drop-shadow-sm">
            {camera}
          </h3>
          {lens && (
            <p className="text-lg text-teal-400 font-medium mt-2 relative z-10">
              {lens}
            </p>
          )}
        </motion.div>
      )}

      {/* Key Stats Row */}
      {stats.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((s, i) => (
            <StatCard key={i} label={s.l} value={s.v} />
          ))}
        </motion.div>
      )}

      {/* Contextual Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Image Context */}
        {(captureString || techString || editString) && (
          <MetadataSection
            title="Image Context"
            icon={<Monitor />}
            variants={itemVariants}
          >
            {captureString && (
              <div className="flex items-start gap-3 group">
                <Calendar className="w-4 h-4 text-slate-500 mt-1 shrink-0 group-hover:text-teal-400 transition-colors" />
                <p className="text-slate-300 text-sm leading-relaxed">
                  {captureString}
                </p>
              </div>
            )}
            {techString && (
              <div className="flex items-start gap-3 group">
                <ImageIcon className="w-4 h-4 text-slate-500 mt-1 shrink-0 group-hover:text-teal-400 transition-colors" />
                <p className="text-slate-300 text-sm leading-relaxed">{techString}</p>
              </div>
            )}
            {editString && (
              <div className="flex items-start gap-3 group">
                <Sliders className="w-4 h-4 text-slate-500 mt-1 shrink-0 group-hover:text-teal-400 transition-colors" />
                <p className="text-slate-300 text-sm leading-relaxed">{editString}</p>
              </div>
            )}
          </MetadataSection>
        )}

        {/* Description & Rights */}
        {descInfo.hasContent && (
          <MetadataSection
            title="Description & Rights"
            icon={<FileText />}
            variants={itemVariants}
          >
            <div className="text-slate-300">
              {descInfo.description && (
                <p className="italic text-sm leading-relaxed text-slate-400 border-l-2 border-slate-700 pl-3 py-1">
                  "{descInfo.description}"
                </p>
              )}
              <div className="flex flex-col gap-1 mt-2">
                {descInfo.copyright && (
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <span className="text-slate-400">©</span> {descInfo.copyright}
                  </p>
                )}
                {descInfo.artist && (
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <User size={12} /> {descInfo.artist}
                  </p>
                )}
              </div>
            </div>
          </MetadataSection>
        )}
      </div>

      {/* Additional Data Sections */}
      <div className="space-y-4">
        {/* Image Properties (Grid) */}
        <MetadataGrid
          title="Image Properties"
          variants={itemVariants}
          items={[
            { l: 'Image Width', v: metadata?.['Image Width'], i: <ImageIcon size={18} /> },
            { l: 'Image Height', v: metadata?.['Image Height'], i: <ImageIcon size={18} /> },
            { l: 'Bit Depth', v: metadata?.['Bit Depth'], i: <Palette size={18} /> },
            { l: 'Color Type', v: metadata?.['Color Type'], i: <Palette size={18} /> },
            { l: 'Compression', v: metadata?.Compression, i: <Sliders size={18} /> },
            { l: 'Filter', v: metadata?.Filter, i: <Focus size={18} /> },
            { l: 'Interlace', v: metadata?.Interlace, i: <Sliders size={18} /> },
          ]}
        />

        {/* Detailed Capture Settings (Grid) */}
        <MetadataGrid
          title="Capture Settings"
          variants={itemVariants}
          items={[
            {
              l: 'Exposure Program',
              v: metadata?.ExposureProgram,
              i: <Sliders size={18} />,
            },
            {
              l: 'Metering Mode',
              v: metadata?.MeteringMode,
              i: <Crosshair size={18} />,
            },
            { l: 'Flash', v: metadata?.Flash, i: <Zap size={18} /> },
            { l: 'White Balance', v: metadata?.WhiteBalance, i: <Sun size={18} /> },
          ]}
        />

        {/* Editorial & Instructions (Grid) */}
        <MetadataGrid
          title="Editorial"
          variants={itemVariants}
          items={[
            { l: 'Instructions', v: metadata?.Instructions, i: <FileText size={18} /> },
            { l: 'Credit', v: metadata?.Credit, i: <User size={18} /> },
            { l: 'Source', v: metadata?.Source, i: <Globe size={18} /> },
            {
              l: 'Headline',
              v:
                getTagValue(metadata?.Headline) !== headline
                  ? metadata?.Headline
                  : null,
              i: <Type size={18} />,
            },
          ]}
        />

        {/* Image Quality & Processing (Grid) */}
        <MetadataGrid
          title="Image Quality & Processing"
          variants={itemVariants}
          items={[
            { l: 'Color Space', v: metadata?.ColorSpace, i: <Palette size={18} /> },
            { l: 'Contrast', v: metadata?.Contrast, i: <ContrastIcon size={18} /> },
            { l: 'Saturation', v: metadata?.Saturation, i: <Sparkle size={18} /> },
            { l: 'Sharpness', v: metadata?.Sharpness, i: <Focus size={18} /> },
            { l: 'Scene Type', v: metadata?.SceneCaptureType, i: <Camera size={18} /> },
            { l: 'Custom Rendered', v: metadata?.CustomRendered, i: <Sliders size={18} /> },
          ]}
        />

        {/* Camera & Lens Details (Grid) */}
        <MetadataGrid
          title="Camera & Lens Details"
          variants={itemVariants}
          items={[
            { l: 'Camera Serial', v: metadata?.SerialNumber || metadata?.InternalSerialNumber, i: <Camera size={18} /> },
            { l: 'Lens Serial', v: metadata?.LensSerialNumber, i: <Aperture size={18} /> },
            { l: '35mm Focal Length', v: metadata?.FocalLengthIn35mmFormat, i: <Focus size={18} /> },
            { l: 'Sensing Method', v: metadata?.SensingMethod, i: <Crosshair size={18} /> },
            { l: 'Owner Name', v: metadata?.OwnerName, i: <User size={18} /> },
            { l: 'Lens Make', v: metadata?.LensMake, i: <Type size={18} /> },
          ]}
        />

        {/* Advanced Exposure Settings (Grid) */}
        <MetadataGrid
          title="Advanced Exposure"
          variants={itemVariants}
          items={[
            { l: 'Exposure Mode', v: metadata?.ExposureMode, i: <Sliders size={18} /> },
            { l: 'Exposure Bias', v: metadata?.ExposureBiasValue, i: <Sun size={18} /> },
            { l: 'Max Aperture', v: metadata?.MaxApertureValue, i: <Aperture size={18} /> },
            { l: 'Subject Distance', v: metadata?.SubjectDistance, i: <Focus size={18} /> },
            { l: 'Digital Zoom', v: metadata?.DigitalZoomRatio, i: <ImageIcon size={18} /> },
            { l: 'Gain Control', v: metadata?.GainControl, i: <Zap size={18} /> },
          ]}
        />
      </div>

      <GPSMetadataSection gps={gps} metadata={metadata} />
    </motion.div>
  )
}
