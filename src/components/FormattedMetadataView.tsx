import React, { useMemo } from 'react'
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

const ICON_SIZE = 18

const buildGridSections = (metadata: ExifMetadata, headline: string | null) => [
  {
    title: 'Image Properties',
    items: [
      { l: 'Image Width', v: metadata?.['Image Width'], i: <ImageIcon size={ICON_SIZE} /> },
      { l: 'Image Height', v: metadata?.['Image Height'], i: <ImageIcon size={ICON_SIZE} /> },
      { l: 'Bit Depth', v: metadata?.['Bit Depth'], i: <Palette size={ICON_SIZE} /> },
      { l: 'Color Type', v: metadata?.['Color Type'], i: <Palette size={ICON_SIZE} /> },
      { l: 'Compression', v: metadata?.Compression, i: <Sliders size={ICON_SIZE} /> },
      { l: 'Filter', v: metadata?.Filter, i: <Focus size={ICON_SIZE} /> },
      { l: 'Interlace', v: metadata?.Interlace, i: <Sliders size={ICON_SIZE} /> },
    ],
  },
  {
    title: 'Capture Settings',
    items: [
      { l: 'Exposure Program', v: metadata?.ExposureProgram, i: <Sliders size={ICON_SIZE} /> },
      { l: 'Metering Mode', v: metadata?.MeteringMode, i: <Crosshair size={ICON_SIZE} /> },
      { l: 'Flash', v: metadata?.Flash, i: <Zap size={ICON_SIZE} /> },
      { l: 'White Balance', v: metadata?.WhiteBalance, i: <Sun size={ICON_SIZE} /> },
    ],
  },
  {
    title: 'Editorial',
    items: [
      { l: 'Instructions', v: metadata?.Instructions, i: <FileText size={ICON_SIZE} /> },
      { l: 'Credit', v: metadata?.Credit, i: <User size={ICON_SIZE} /> },
      { l: 'Source', v: metadata?.Source, i: <Globe size={ICON_SIZE} /> },
      {
        l: 'Headline',
        v: getTagValue(metadata?.Headline) !== headline ? metadata?.Headline : null,
        i: <Type size={ICON_SIZE} />,
      },
    ],
  },
  {
    title: 'Image Quality & Processing',
    items: [
      { l: 'Color Space', v: metadata?.ColorSpace, i: <Palette size={ICON_SIZE} /> },
      { l: 'Contrast', v: metadata?.Contrast, i: <ContrastIcon size={ICON_SIZE} /> },
      { l: 'Saturation', v: metadata?.Saturation, i: <Sparkle size={ICON_SIZE} /> },
      { l: 'Sharpness', v: metadata?.Sharpness, i: <Focus size={ICON_SIZE} /> },
      { l: 'Scene Type', v: metadata?.SceneCaptureType, i: <Camera size={ICON_SIZE} /> },
      { l: 'Custom Rendered', v: metadata?.CustomRendered, i: <Sliders size={ICON_SIZE} /> },
    ],
  },
  {
    title: 'Camera & Lens Details',
    items: [
      {
        l: 'Camera Serial',
        v: metadata?.SerialNumber || metadata?.InternalSerialNumber,
        i: <Camera size={ICON_SIZE} />,
      },
      { l: 'Lens Serial', v: metadata?.LensSerialNumber, i: <Aperture size={ICON_SIZE} /> },
      {
        l: '35mm Focal Length',
        v: metadata?.FocalLengthIn35mmFormat,
        i: <Focus size={ICON_SIZE} />,
      },
      { l: 'Sensing Method', v: metadata?.SensingMethod, i: <Crosshair size={ICON_SIZE} /> },
      { l: 'Owner Name', v: metadata?.OwnerName, i: <User size={ICON_SIZE} /> },
      { l: 'Lens Make', v: metadata?.LensMake, i: <Type size={ICON_SIZE} /> },
    ],
  },
  {
    title: 'Advanced Exposure',
    items: [
      { l: 'Exposure Mode', v: metadata?.ExposureMode, i: <Sliders size={ICON_SIZE} /> },
      { l: 'Exposure Bias', v: metadata?.ExposureBiasValue, i: <Sun size={ICON_SIZE} /> },
      { l: 'Max Aperture', v: metadata?.MaxApertureValue, i: <Aperture size={ICON_SIZE} /> },
      { l: 'Subject Distance', v: metadata?.SubjectDistance, i: <Focus size={ICON_SIZE} /> },
      { l: 'Digital Zoom', v: metadata?.DigitalZoomRatio, i: <ImageIcon size={ICON_SIZE} /> },
      { l: 'Gain Control', v: metadata?.GainControl, i: <Zap size={ICON_SIZE} /> },
    ],
  },
]

export const FormattedMetadataView: React.FC<FormattedMetadataViewProps> = ({ metadata, gps }) => {
  const { file } = useStore()
  const headline = getHeadline(metadata, file)
  const { camera, lens, subtitle } = getCameraInfo(metadata)
  const stats = calculateCameraStats(metadata)
  const techString = getTechnicalSpecs(metadata, file)
  const captureString = getCaptureInfo(metadata)
  const editString = getEditInfo(metadata)
  const descInfo = getDescriptionInfo(metadata)
  const grids = useMemo(() => buildGridSections(metadata, headline), [metadata, headline])

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
          {lens && <p className="text-lg text-teal-400 font-medium mt-2 relative z-10">{lens}</p>}
        </motion.div>
      )}

      {/* Key Stats Row */}
      {stats.length > 0 && (
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <StatCard key={i} label={s.l} value={s.v} />
          ))}
        </motion.div>
      )}

      {/* Contextual Details */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
        {/* Image Context */}
        {(captureString || techString || editString) && (
          <MetadataSection title="Image Context" icon={<Monitor />}>
            {captureString && (
              <div className="flex items-start gap-3 group">
                <Calendar className="w-4 h-4 text-slate-500 mt-1 shrink-0 group-hover:text-teal-400 transition-colors" />
                <p className="text-slate-300 text-sm leading-relaxed">{captureString}</p>
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
          <MetadataSection title="Description & Rights" icon={<FileText />}>
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
      </motion.div>

      {/* Additional Data Sections */}
      <motion.div variants={itemVariants} className="space-y-4">
        {grids.map(grid => (
          <MetadataGrid
            key={grid.title}
            title={grid.title}
            items={grid.items}
            variants={itemVariants}
          />
        ))}
      </motion.div>

      <GPSMetadataSection gps={gps} metadata={metadata} />
    </motion.div>
  )
}
