import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { MapPin, Calendar, BookOpen, ArrowUpRight } from 'lucide-react'
import { type Evidence, type Category } from '../data/evidences'
import ConfidenceBadge from './ConfidenceBadge'

interface EvidenceCardProps {
  evidence: Evidence
  index: number
  onClick: () => void
}

// Vivid, category-based gradient backgrounds
const categoryGradients: Record<Category, { from: string; to: string; grid: string; tag: string; tagText: string; tagBorder: string }> = {
  Archaeology: {
    from: '#0A369D',
    to: '#1A50C8',
    grid: 'rgba(255,255,255,0.18)',
    tag: 'rgba(255,255,255,0.18)',
    tagText: '#ffffff',
    tagBorder: 'rgba(255,255,255,0.35)',
  },
  Manuscripts: {
    from: '#B5451B',
    to: '#D96830',
    grid: 'rgba(255,255,255,0.18)',
    tag: 'rgba(255,255,255,0.18)',
    tagText: '#ffffff',
    tagBorder: 'rgba(255,255,255,0.35)',
  },
  Science: {
    from: '#166534',
    to: '#15803D',
    grid: 'rgba(255,255,255,0.18)',
    tag: 'rgba(255,255,255,0.18)',
    tagText: '#ffffff',
    tagBorder: 'rgba(255,255,255,0.35)',
  },
  History: {
    from: '#5B21B6',
    to: '#7C3AED',
    grid: 'rgba(255,255,255,0.18)',
    tag: 'rgba(255,255,255,0.18)',
    tagText: '#ffffff',
    tagBorder: 'rgba(255,255,255,0.35)',
  },
}

export default function EvidenceCard({ evidence, index, onClick }: EvidenceCardProps) {
  const { t, i18n } = useTranslation()
  const isEn = i18n.language === 'en'
  const grad = categoryGradients[evidence.category]

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="group relative flex flex-col rounded-2xl border border-canvas-border bg-canvas-surface cursor-pointer overflow-hidden transition-all duration-300 hover:border-sapphire/30 hover:shadow-[0_0_0_1px_rgba(10,54,157,0.15),0_24px_48px_rgba(10,54,157,0.10),0_4px_20px_rgba(232,163,23,0.10)] hover:-translate-y-1.5 hover:scale-[1.01]"
    >
      {/* Vivid gradient hero area */}
      <div
        className="relative h-36 sm:h-44 flex items-end justify-start overflow-hidden"
        style={{ background: `linear-gradient(145deg, ${grad.from} 0%, ${grad.to} 100%)` }}
      >
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.10] group-hover:opacity-[0.18] transition-opacity duration-300"
          style={{
            backgroundImage: `linear-gradient(${grad.grid} 1px, transparent 1px), linear-gradient(90deg, ${grad.grid} 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Radial depth */}
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: `radial-gradient(ellipse 80% 70% at 20% 110%, rgba(0,0,0,0.35), transparent)` }}
        />

        {/* Evidence image or icon fallback */}
        {evidence.images.length > 0 ? (
          <img
            src={evidence.images[0]}
            alt={t(evidence.titleKey)}
            className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
            loading="lazy"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-6xl select-none opacity-60 group-hover:opacity-90 group-hover:scale-110 transition-all duration-300 drop-shadow-lg">
            {evidence.icon}
          </span>
        )}

        {/* Category tag — top left */}
        <div
          className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase backdrop-blur-sm border"
          style={{ background: grad.tag, color: grad.tagText, borderColor: grad.tagBorder }}
        >
          {t(`filter.${evidence.category}`)}
        </div>

        {/* Arrow chip — top right */}
        <div className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/20 border border-white/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
          <ArrowUpRight className="w-3.5 h-3.5 text-white" />
        </div>

        {/* Bottom fade into white card body */}
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Content body */}
      <div className="flex flex-col flex-1 px-5 pt-3 pb-5 gap-3">
        {/* Confidence badge */}
        <ConfidenceBadge level={evidence.confidenceLevel} />

        {/* Title */}
        <h3 className="font-display text-[1.05rem] font-semibold text-parchment leading-snug group-hover:text-sapphire transition-colors duration-200 line-clamp-2">
          {t(evidence.titleKey)}
        </h3>

        {/* Summary */}
        <p className="text-parchment-muted text-sm leading-relaxed line-clamp-3 flex-1">
          {t(evidence.summaryKey)}
        </p>

        {/* Metadata */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-canvas-border">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-parchment-muted/50 flex-shrink-0" />
            <span className="text-parchment-muted text-xs truncate">{evidence.discoveryDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 text-parchment-muted/50 flex-shrink-0" />
            <span className="text-parchment-muted text-xs truncate">{evidence.location}</span>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-3 h-3 text-gold/70 flex-shrink-0" />
              <span className="text-gold text-xs font-semibold">{evidence.scriptureReference}</span>
            </div>
            <span className="text-sapphire text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-0.5">
              {t('card.view')}
              <ArrowUpRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
