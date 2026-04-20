import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { BookOpen, Layers, FlaskConical, History } from 'lucide-react'

const principleIcons = [BookOpen, FlaskConical, Layers, History]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
})

interface HeroSectionProps {
  evidenceCount: number
  sourceCount: number
}

export default function HeroSection({ evidenceCount, sourceCount }: HeroSectionProps) {
  const { t, i18n } = useTranslation()
  const isEn = i18n.language === 'en'

  const principleKeys = ['rigor', 'noForced', 'noAvoidance', 'graded'] as const

  const stats = [
    { value: evidenceCount, label: t('hero.stats.artifacts') },
    { value: 4, label: t('hero.stats.categories') },
    { value: sourceCount, label: t('hero.stats.sources') },
  ]

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto w-full text-center">
        {/* Eyebrow badge — glass pill */}
        <motion.div {...fadeUp(0.1)} className="mb-8">
          <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border border-white/40 bg-white/35 backdrop-blur-xl text-sapphire text-xs tracking-[0.18em] uppercase font-semibold shadow-glass">
            <span className="w-1.5 h-1.5 rounded-full bg-sapphire animate-pulse" />
            {isEn ? 'Academic Evidence Archive' : '学术实证档案'}
          </span>
        </motion.div>

        {/* Main title */}
        <motion.div {...fadeUp(0.2)}>
          <h1 className="font-display font-bold leading-[1.06] mb-5" style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)' }}>
            {isEn ? (
              <>
                <span className="text-parchment">Biblical &amp; Scientific</span>
                <br />
                <span
                  className="text-transparent bg-clip-text"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #d4a843 0%, #f0c85a 45%, #d4a843 100%)',
                  }}
                >
                  Evidence Archive
                </span>
              </>
            ) : (
              <>
                <span className="text-parchment">圣经与科学</span>
                <br />
                <span
                  className="text-transparent bg-clip-text"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #d4a843 0%, #f0c85a 45%, #d4a843 100%)',
                  }}
                >
                  实证档案
                </span>
              </>
            )}
          </h1>
        </motion.div>

        {/* Subtitle in other language */}
        <motion.p
          {...fadeUp(0.28)}
          className="text-parchment-muted font-display italic text-xl md:text-2xl mb-7"
        >
          {isEn ? '圣经与科学实证档案' : 'Biblical & Scientific Evidence Archive'}
        </motion.p>

        {/* Divider */}
        <motion.div {...fadeUp(0.32)} className="flex items-center gap-4 justify-center mb-8">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-gold/50" />
          <div className="w-2 h-2 rounded-full bg-gold/70" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-gold/50" />
        </motion.div>

        {/* Description */}
        <motion.p
          {...fadeUp(0.38)}
          className="text-parchment-dim text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-14"
        >
          {t('hero.description')}
        </motion.p>

        {/* Four principles — glass cards */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } },
          }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16"
        >
          {principleKeys.map((key, i) => {
            const Icon = principleIcons[i]
            return (
              <motion.div
                key={key}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="group relative flex flex-col items-center gap-3 p-5 rounded-3xl glass glass-hover cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-white/30 backdrop-blur-xl border border-white/40 flex items-center justify-center group-hover:bg-white/50 group-hover:border-white/60 transition-all duration-200">
                  <Icon className="w-[1.125rem] h-[1.125rem] text-sapphire group-hover:text-sapphire-light transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-parchment text-sm font-bold leading-snug">
                    {t(`hero.principles.${key}.title`)}
                  </p>
                  <p className="text-parchment-muted text-xs leading-snug mt-1.5 hidden md:block">
                    {t(`hero.principles.${key}.desc`)}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Stats — glass pills */}
        <motion.div
          {...fadeUp(0.85)}
          className="flex items-center justify-center gap-6 md:gap-12"
        >
          {stats.map(({ value, label }, i) => (
            <div key={i} className="text-center px-6 py-4 rounded-2xl glass-subtle">
              <p
                className="font-display text-3xl md:text-4xl font-bold text-transparent bg-clip-text mb-1"
                style={{ backgroundImage: 'linear-gradient(135deg, #d4a843, #f0c85a)' }}
              >
                {value}
              </p>
              <p className="text-parchment-muted text-xs font-medium tracking-widest uppercase">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          {...fadeUp(1.0)}
          className="mt-16 flex flex-col items-center gap-2"
        >
          <a
            href="#evidence"
            className="text-parchment-muted text-xs tracking-[0.18em] uppercase font-medium hover:text-gold transition-colors duration-200"
          >
            {isEn ? 'Explore Evidence' : '浏览实证'}
          </a>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-px h-8 bg-gradient-to-b from-gold/50 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  )
}
