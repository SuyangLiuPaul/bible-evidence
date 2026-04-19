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
      {/* Background glow orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-sapphire/[0.07] blur-[160px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-gold/[0.10] blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full text-center">
        {/* Eyebrow badge */}
        <motion.div {...fadeUp(0.1)} className="mb-8">
          <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-sapphire/30 bg-sapphire/8 text-sapphire text-xs tracking-[0.18em] uppercase font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-sapphire animate-pulse" />
            {isEn ? 'Academic Evidence Archive' : '学术实证档案'}
          </span>
        </motion.div>

        {/* Main title */}
        <motion.div {...fadeUp(0.2)}>
          <h1 className="font-display text-6xl md:text-8xl font-bold leading-[1.06] mb-5">
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

        {/* Four principles */}
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
                className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl border border-canvas-border bg-canvas-surface hover:border-sapphire/30 hover:bg-sapphire-subtle transition-all duration-300 cursor-default shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl border border-sapphire/25 bg-sapphire/8 flex items-center justify-center group-hover:border-sapphire/50 group-hover:bg-sapphire/15 transition-all duration-200">
                  <Icon className="w-[1.125rem] h-[1.125rem] text-sapphire group-hover:text-sapphire-light transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-sapphire text-[11px] font-semibold tracking-wider mb-1">
                    {t(`hero.principles.${key}.label`)}
                  </p>
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

        {/* Stats */}
        <motion.div
          {...fadeUp(0.85)}
          className="flex items-center justify-center gap-10 md:gap-20"
        >
          {stats.map(({ value, label }, i) => (
            <div key={i} className="text-center">
              <p
                className="font-display text-4xl md:text-5xl font-bold text-transparent bg-clip-text mb-1"
                style={{ backgroundImage: 'linear-gradient(135deg, #d4a843, #f0c85a)' }}
              >
                {value}
              </p>
              <p className="text-parchment-muted text-sm font-medium tracking-widest uppercase">{label}</p>
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
