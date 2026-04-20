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
          ? 'bg-white/60 backdrop-blur-2xl border-b border-white/40 shadow-glass'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 sm:gap-3 group min-w-0">
          <div className="w-8 h-8 rounded-xl border border-white/40 bg-white/30 backdrop-blur-xl flex items-center justify-center group-hover:bg-white/50 group-hover:border-white/60 transition-all duration-200 flex-shrink-0">
            <ScrollText className="w-4 h-4 text-sapphire" />
          </div>
          <div className="hidden sm:block min-w-0">
            <p className="text-parchment font-display font-semibold text-sm leading-none truncate">
              {isEn ? 'Biblical Evidence Archive' : '圣经证据档案'}
            </p>
            <p className="text-parchment-muted text-[11px] leading-none mt-1 truncate">
              {isEn ? '圣经与科学实证档案' : 'Biblical & Scientific Evidence Archive'}
            </p>
          </div>
          {/* Short title on mobile */}
          <span className="sm:hidden text-parchment font-display font-semibold text-sm truncate">
            {isEn ? 'Bible Evidence' : '圣经证据'}
          </span>
        </a>

        {/* Nav links — visible on all screens */}
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="#evidence"
            aria-label={isEn ? 'View evidence archive' : '查看实证档案'}
            className="text-parchment-muted text-sm font-medium hover:text-parchment transition-colors duration-200 px-1 py-2"
          >
            {isEn ? 'Evidence' : '实证'}
          </a>
          <a
            href="#methodology"
            aria-label={isEn ? 'View methodology' : '查看研究方法'}
            className="hidden xs:block text-parchment-muted text-sm font-medium hover:text-parchment transition-colors duration-200 px-1 py-2"
          >
            {isEn ? 'Methodology' : '研究方法'}
          </a>
        </div>

        {/* Language Toggle — glass pill */}
        <button
          onClick={onToggleLanguage}
          aria-label={isEn ? 'Switch to Chinese' : '切换到英文'}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/40 bg-white/30 backdrop-blur-xl hover:bg-white/50 hover:border-white/60 transition-all duration-200 group flex-shrink-0"
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
