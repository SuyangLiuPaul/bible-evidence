import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useScroll, useTransform } from 'framer-motion'
import { X, MapPin, Calendar, BookOpen, ScrollText, Quote, ExternalLink, Share2, Check } from 'lucide-react'
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
      <div className="w-7 h-7 rounded-lg bg-white/30 backdrop-blur-xl border border-white/40 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <h3 className="text-parchment text-[11px] font-bold uppercase tracking-[0.22em]">{label}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-gold/30 to-transparent ml-2" />
    </div>
  )
}

function SourceText({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  if (parts.length === 1) return <>{text}</>
  return (
    <>
      {parts.map((part, i) =>
        urlRegex.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer"
            className="text-sapphire underline decoration-sapphire/30 hover:decoration-sapphire transition-colors break-all">
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

export default function DetailModal({ evidence, onClose }: DetailModalProps) {
  const { t } = useTranslation()
  const [imgFailed, setImgFailed] = useState(false)
  const [copied, setCopied] = useState(false)
  const catColors = categoryColors[evidence.category]
  const grad = categoryGradients[evidence.category]
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Image parallax
  const { scrollY } = useScroll({ container: scrollRef })
  const heroY = useTransform(scrollY, [0, 200], [0, -30])

  // Focus trap
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement
    const modal = modalRef.current
    if (!modal) return
    // Delay focus to let animation start
    const timer = setTimeout(() => {
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      first?.focus()
      const trap = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus() }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus() }
        }
      }
      modal.addEventListener('keydown', trap)
      return () => modal.removeEventListener('keydown', trap)
    }, 100)
    return () => {
      clearTimeout(timer)
      previousFocusRef.current?.focus()
    }
  }, [])

  // ESC to close + lock scroll
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      try { document.body.style.overflow = previousOverflow }
      catch { document.body.style.overflow = '' }
    }
  }, [onClose])

  const handleShare = async () => {
    const url = `${window.location.origin}#${evidence.id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* fallback */ }
  }

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
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xl"
      />

      {/* Modal panel — mobile bottom sheet, desktop centered */}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, y: isMobile ? '100%' : 20, scale: isMobile ? 1 : 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: isMobile ? '100%' : 12, scale: isMobile ? 1 : 0.97 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed z-[60] flex flex-col overflow-hidden glass-heavy ${
          isMobile
            ? 'inset-x-0 bottom-0 top-[8vh] rounded-t-3xl'
            : 'inset-x-4 top-[4vh] bottom-[4vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-3xl md:rounded-3xl'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t(evidence.titleKey)}
      >
        {/* ── Hero band ─────────────────────────────────────────── */}
        <motion.div
          drag={isMobile ? 'y' : false}
          dragConstraints={{ top: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            if (isMobile && info.offset.y > 80) onClose()
          }}
          className="relative h-44 md:h-52 flex-shrink-0 flex items-end justify-start overflow-hidden"
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
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse 80% 70% at 20% 110%, rgba(0,0,0,0.30), transparent)` }}
          />

          {/* Image with parallax */}
          {evidence.images.length > 0 && !imgFailed ? (
            <motion.img
              src={evidence.images[0]}
              alt={t(evidence.titleKey)}
              className="absolute inset-0 w-full h-full object-cover opacity-55"
              style={{ y: heroY }}
              onError={() => setImgFailed(true)}
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-8xl select-none opacity-45">
              {evidence.icon}
            </span>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/50 backdrop-blur-xl border border-white/50 flex items-center justify-center hover:bg-white/70 transition-all group"
            aria-label={t('modal.close')}
          >
            <X className="w-4 h-4 text-parchment-muted group-hover:text-parchment transition-colors" />
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="absolute top-4 right-16 w-9 h-9 rounded-xl bg-white/50 backdrop-blur-xl border border-white/50 flex items-center justify-center hover:bg-white/70 transition-all"
            aria-label={t('modal.share')}
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald" />
            ) : (
              <Share2 className="w-4 h-4 text-parchment-muted" />
            )}
          </button>

          {/* Mobile drag handle */}
          {isMobile && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/30" />
          )}

          {/* Bottom overlay fade */}
          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white/72 to-transparent" />

          {/* Category tag */}
          <div className={`relative mb-5 ml-6 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-widest backdrop-blur-xl bg-white/25 border-white/40 ${catColors.text}`}>
            {t(`filter.${evidence.category}`)}
          </div>
        </motion.div>

        {/* ── Scrollable content ─────────────────────────────────── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {/* Title block */}
          <div className="px-7 pt-6 pb-5 border-b border-white/25">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-parchment leading-tight mb-4">
              {t(evidence.titleKey)}
            </h2>
            <ConfidenceBadge level={evidence.confidenceLevel} showBar size="md" />
          </div>

          {/* Metadata grid */}
          <div className="px-7 py-5 grid grid-cols-1 sm:grid-cols-3 gap-5 border-b border-white/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl glass-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-gold" />
              </div>
              <div>
                <p className="text-parchment-muted text-[11px] uppercase tracking-[0.18em] mb-1 font-semibold">
                  {t('modal.discovered')}
                </p>
                <p className="text-parchment text-base font-semibold">{evidence.discoveryDate}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl glass-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-gold" />
              </div>
              <div>
                <p className="text-parchment-muted text-[11px] uppercase tracking-[0.18em] mb-1 font-semibold">
                  {t('modal.location')}
                </p>
                <p className="text-parchment text-base font-semibold leading-snug">{evidence.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl glass-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
                <BookOpen className="w-3.5 h-3.5 text-gold" />
              </div>
              <div>
                <p className="text-parchment-muted text-[11px] uppercase tracking-[0.18em] mb-1 font-semibold">
                  {t('modal.scripture')}
                </p>
                <p className="text-gold text-base font-bold">{evidence.scriptureReference}</p>
              </div>
            </div>
          </div>

          <div className="px-7 py-7 space-y-8">
            {/* Historical Context */}
            <section>
              <SectionHeader
                icon={<ScrollText className="w-3.5 h-3.5 text-gold" />}
                label={t('modal.historicalContext')}
              />
              <div className="space-y-4">
                {historicalParagraphs.map((para, i) => (
                  <p key={i} className="text-parchment-dim leading-[1.8] text-base md:text-lg">
                    {para}
                  </p>
                ))}
              </div>
            </section>

            {/* Scriptural Correlation */}
            <section>
              <SectionHeader
                icon={<Quote className="w-3.5 h-3.5 text-gold" />}
                label={t('modal.scripturalCorrelation')}
              />

              {/* Scripture badge with accent bar */}
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gold/35 border-l-4 border-l-gold bg-gold/12 backdrop-blur-md mb-5">
                <BookOpen className="w-4 h-4 text-gold" />
                <span className="text-gold text-sm font-bold tracking-wide">
                  {evidence.scriptureReference}
                </span>
              </div>

              <div className="space-y-4">
                {scripturalParagraphs.map((para, i) => (
                  <p key={i} className="text-parchment-dim leading-[1.8] text-base md:text-lg">
                    {para}
                  </p>
                ))}
              </div>
            </section>

            {/* Academic Sources */}
            <section className="border-t border-white/20 pt-7">
              <SectionHeader
                icon={<ExternalLink className="w-3.5 h-3.5 text-gold" />}
                label={t('modal.sources')}
              />
              <ol className="space-y-3 list-none">
                {evidence.academicSources.map((source, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full glass-subtle flex items-center justify-center text-[11px] font-bold text-gold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-parchment-muted text-sm leading-relaxed">
                      <SourceText text={source} />
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
