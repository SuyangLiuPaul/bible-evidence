import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { X, MapPin, Calendar, BookOpen, ScrollText, Quote, ExternalLink } from 'lucide-react'
import { type Evidence, type Category, categoryColors } from '../data/evidences'
import ConfidenceBadge from './ConfidenceBadge'

const categoryGradients: Record<Category, { from: string; to: string }> = {
  Archaeology: { from: '#0A369D', to: '#1A50C8' },
  Manuscripts: { from: '#B5451B', to: '#D96830' },
  Science: { from: '#166534', to: '#15803D' },
  History: { from: '#5B21B6', to: '#7C3AED' },
}

interface DetailModalProps {
  evidence: Evidence
  onClose: () => void
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-7 h-7 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <h3 className="text-parchment text-[11px] font-bold uppercase tracking-[0.22em]">{label}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-gold/30 to-transparent ml-2" />
    </div>
  )
}

export default function DetailModal({ evidence, onClose }: DetailModalProps) {
  const { t } = useTranslation()
  const catColors = categoryColors[evidence.category]
  const grad = categoryGradients[evidence.category]

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      try { document.body.style.overflow = previousOverflow }
      catch { document.body.style.overflow = '' }
    }
  }, [])

  const historicalParagraphs = t(evidence.detailedDescriptionKey).split('\n\n').filter(Boolean)
  const scripturalParagraphs = t(evidence.scripturalCorrelationKey).split('\n\n').filter(Boolean)

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/88 backdrop-blur-md"
      />

      {/* Modal panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-4 top-[4vh] bottom-[4vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-3xl z-50 flex flex-col rounded-2xl border border-canvas-border bg-canvas-elevated shadow-[0_40px_120px_rgba(10,54,157,0.12),0_0_0_1px_rgba(10,54,157,0.08)] overflow-hidden"
      >
        {/* ── Hero band ─────────────────────────────────────────── */}
        <div
          className="relative h-52 flex-shrink-0 flex items-end justify-start overflow-hidden"
          style={{ background: `linear-gradient(145deg, ${grad.from} 0%, ${grad.to} 100%)` }}
        >
          {/* Grid texture */}
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          {/* Radial depth */}
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse 80% 70% at 20% 110%, rgba(0,0,0,0.30), transparent)` }}
          />

          {/* Icon */}
          <span className="absolute inset-0 flex items-center justify-center text-8xl select-none opacity-45">
            {evidence.icon}
          </span>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/85 border border-white/60 backdrop-blur-sm flex items-center justify-center hover:bg-white hover:border-sapphire/40 transition-all group"
            aria-label={t('modal.close')}
          >
            <X className="w-4 h-4 text-parchment-muted group-hover:text-parchment transition-colors" />
          </button>

          {/* Bottom overlay fade */}
          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-canvas-elevated to-transparent" />

          {/* Category tag — bottom left */}
          <div className={`relative mb-5 ml-6 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase tracking-widest backdrop-blur-sm ${catColors.bg} ${catColors.text} ${catColors.border}`}>
            {t(`filter.${evidence.category}`)}
          </div>
        </div>

        {/* ── Scrollable content ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {/* Title block */}
          <div className="px-7 pt-6 pb-5 border-b border-canvas-border">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-parchment leading-tight mb-4">
              {t(evidence.titleKey)}
            </h2>
            <ConfidenceBadge level={evidence.confidenceLevel} showBar size="md" />
          </div>

          {/* Metadata grid */}
          <div className="px-7 py-5 grid grid-cols-1 sm:grid-cols-3 gap-5 border-b border-canvas-border bg-canvas-surface/60">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-gold" />
              </div>
              <div>
                <p className="text-parchment-muted text-[10px] uppercase tracking-[0.18em] mb-1 font-semibold">
                  {t('modal.discovered')}
                </p>
                <p className="text-parchment text-base font-semibold">{evidence.discoveryDate}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-gold" />
              </div>
              <div>
                <p className="text-parchment-muted text-[10px] uppercase tracking-[0.18em] mb-1 font-semibold">
                  {t('modal.location')}
                </p>
                <p className="text-parchment text-base font-semibold leading-snug">{evidence.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                <BookOpen className="w-3.5 h-3.5 text-gold" />
              </div>
              <div>
                <p className="text-parchment-muted text-[10px] uppercase tracking-[0.18em] mb-1 font-semibold">
                  {t('modal.scripture')}
                </p>
                <p className="text-gold text-base font-bold">{evidence.scriptureReference}</p>
              </div>
            </div>
          </div>

          <div className="px-7 py-7 space-y-8">
            {/* ── Section 1: Historical Context ─────────────────── */}
            <section>
              <SectionHeader
                icon={<ScrollText className="w-3.5 h-3.5 text-gold" />}
                label={t('modal.historicalContext')}
              />
              <div className="space-y-4">
                {historicalParagraphs.map((para, i) => (
                  <p key={i} className="text-parchment-dim leading-relaxed text-base md:text-lg">
                    {para}
                  </p>
                ))}
              </div>
            </section>

            {/* ── Section 2: Scriptural Correlation ─────────────── */}
            <section>
              <SectionHeader
                icon={<Quote className="w-3.5 h-3.5 text-gold" />}
                label={t('modal.scripturalCorrelation')}
              />

              {/* Scripture reference badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gold/35 bg-gold/12 mb-5">
                <BookOpen className="w-3.5 h-3.5 text-gold" />
                <span className="text-gold text-sm font-bold tracking-wide">
                  {evidence.scriptureReference}
                </span>
              </div>

              <div className="space-y-4">
                {scripturalParagraphs.map((para, i) => (
                  <p key={i} className="text-parchment-dim leading-relaxed text-base md:text-lg">
                    {para}
                  </p>
                ))}
              </div>
            </section>

            {/* ── Section 3: Academic Sources ───────────────────── */}
            <section className="border-t border-canvas-border pt-7">
              <SectionHeader
                icon={<ExternalLink className="w-3.5 h-3.5 text-gold" />}
                label={t('modal.sources')}
              />
              <ol className="space-y-3 list-none">
                {evidence.academicSources.map((source, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-[10px] font-bold text-gold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-parchment-muted text-sm leading-relaxed">
                      {source}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </motion.div>
    </>
  )
}
