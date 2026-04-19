import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ScrollText, Globe } from 'lucide-react'

interface NavbarProps {
  onToggleLanguage: () => void
}

export default function Navbar({ onToggleLanguage }: NavbarProps) {
  const { i18n } = useTranslation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isEn = i18n.language === 'en'

  return (
    <motion.nav
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-canvas/97 backdrop-blur-xl border-b border-canvas-border shadow-[0_4px_24px_rgba(10,54,157,0.08)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg border border-sapphire/40 flex items-center justify-center bg-sapphire/8 group-hover:bg-sapphire/15 group-hover:border-sapphire/70 transition-all duration-200">
            <ScrollText className="w-4 h-4 text-sapphire" />
          </div>
          <div className="hidden sm:block">
            <p className="text-parchment font-display font-semibold text-sm leading-none">
              {isEn ? 'Biblical Evidence Archive' : '圣经证据档案'}
            </p>
            <p className="text-parchment-muted text-[11px] leading-none mt-1">
              {isEn ? '圣经与科学实证档案' : 'Biblical & Scientific Evidence Archive'}
            </p>
          </div>
        </a>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#evidence"
            className="text-parchment-muted text-sm font-medium hover:text-parchment transition-colors duration-200"
          >
            {isEn ? 'Evidence' : '实证'}
          </a>
          <a
            href="#about"
            className="text-parchment-muted text-sm font-medium hover:text-parchment transition-colors duration-200"
          >
            {isEn ? 'Methodology' : '研究方法'}
          </a>
        </div>

        {/* Language Toggle */}
        <button
          onClick={onToggleLanguage}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-canvas-border bg-canvas-surface hover:border-sapphire/40 hover:bg-sapphire/8 hover:text-sapphire transition-all duration-200 group shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 text-parchment-muted group-hover:text-sapphire transition-colors" />
          <span className="text-parchment-muted group-hover:text-sapphire text-xs font-semibold transition-colors tracking-widest">
            {isEn ? '中文' : 'EN'}
          </span>
        </button>
      </div>
    </motion.nav>
  )
}
