import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { BookOpen, ArrowUpRight } from 'lucide-react'
import { type Evidence, type Category } from '../data/evidences'
import ConfidenceBadge from './ConfidenceBadge'

interface EvidenceCardProps {
  evidence: Evidence
  index: number
  onClick: () => void
}

const categoryGradients: Record<Category, { from: string; to: string; grid: string; tag: string; tagText: string; tagBorder: string }> = {
  Archaeology: {
    from: '#0A369D', to: '#1A50C8',
    grid: 'rgba(255,255,255,0.18)', tag: 'rgba(255,255,255,0.18)', tagText: '#ffffff', tagBorder: 'rgba(255,255,255,0.35)',
  },
  Manuscripts: {
    from: '#B5451B', to: '#D96830',
    grid: 'rgba(255,255,255,0.18)', tag: 'rgba(255,255,255,0.18)', tagText: '#ffffff', tagBorder: 'rgba(255,255,255,0.35)',
  },
  Science: {
    from: '#166534', to: '#15803D',
    grid: 'rgba(255,255,255,0.18)', tag: 'rgba(255,255,255,0.18)', tagText: '#ffffff', tagBorder: 'rgba(255,255,255,0.35)',
  },
  History: {
    from: '#5B21B6', to: '#7C3AED',
    grid: 'rgba(255,255,255,0.18)', tag: 'rgba(255,255,255,0.18)', tagText: '#ffffff', tagBorder: 'rgba(255,255,255,0.35)',
  },
}

export default function EvidenceCard({ evidence, index, onClick }: EvidenceCardProps) {
  const { t } = useTranslation()
  const grad = categoryGradients[evidence.category]
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = evidence.images.length > 0 && !imgFailed

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.45, delay: Math.min(index, 12) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      aria-label={t(evidence.titleKey)}
      className="group relative flex flex-col rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 bg-white/55 backdrop-blur-2xl border border-white/40 shadow-glass hover:bg-white/70 hover:shadow-glass-hover hover:-translate-y-1.5 hover:scale-[1.01] card-shimmer gpu-accelerated"
    >
      {/* Image hero area */}
      <div
        className="relative h-28 sm:h-32 flex items-end justify-start overflow-hidden"
        style={{ background: `linear-gradient(145deg, ${grad.from} 0%, ${grad.to} 100%)` }}
      >
        <div
          className="absolute inset-0 opacity-[0.10] group-hover:opacity-[0.18] transition-opacity duration-300"
          style={{
            backgroundImage: `linear-gradient(${grad.grid} 1px, transparent 1px), linear-gradient(90deg, ${grad.grid} 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: `radial-gradient(ellipse 80% 70% at 20% 110%, rgba(0,0,0,0.35), transparent)` }}
        />

        {showImage ? (
          <img
            src={evidence.images[0]}
            alt={t(evidence.titleKey)}
            className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
            loading={index < 4 ? 'eager' : 'lazy'}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-5xl select-none opacity-60 group-hover:opacity-90 group-hover:scale-110 transition-all duration-300 drop-shadow-lg">
            {evidence.icon}
          </span>
        )}

        {/* Category tag */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-bold tracking-widest uppercase backdrop-blur-sm border"
          style={{ background: grad.tag, color: grad.tagText, borderColor: grad.tagBorder }}
        >
          {t(`filter.${evidence.category}`)}
        </div>

        {/* Arrow chip — larger touch target */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 border border-white/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
          <ArrowUpRight className="w-3.5 h-3.5 text-white" />
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-white/55 to-transparent" />
      </div>

      {/* Content body */}
      <div className="flex flex-col flex-1 px-4 pt-2.5 pb-4 gap-2">
        <h3 className="font-display text-[0.95rem] font-semibold text-parchment leading-snug group-hover:text-sapphire transition-colors duration-200 line-clamp-2">
          {t(evidence.titleKey)}
        </h3>

        <p className="text-parchment-muted text-xs leading-relaxed line-clamp-2 flex-1">
          {t(evidence.summaryKey)}
        </p>

        <div className="flex items-center justify-between pt-2.5 border-t border-white/30">
          <div className="flex items-center gap-1.5 min-w-0">
            <BookOpen className="w-3 h-3 text-gold/70 flex-shrink-0" />
            <span className="text-gold-dark text-[11px] font-bold truncate">{evidence.scriptureReference}</span>
          </div>
          <ConfidenceBadge level={evidence.confidenceLevel} />
        </div>
      </div>
    </motion.article>
  )
}
