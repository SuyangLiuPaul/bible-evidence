import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import EvidenceGrid from './components/EvidenceGrid'
import DetailModal from './components/DetailModal'
import { evidences, type Evidence } from './data/evidences'

export default function App() {
  const { i18n } = useTranslation()
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null)

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')
  }

  return (
    <div className="min-h-screen bg-canvas noise-overlay">
      <Navbar onToggleLanguage={toggleLanguage} />

      <main>
        <HeroSection evidenceCount={evidences.length} />
        <EvidenceGrid
          evidences={evidences}
          onSelectEvidence={setSelectedEvidence}
        />
      </main>

      <footer className="border-t border-canvas-border mt-24 py-14 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="gold-line mb-8" />
          <p className="text-parchment-muted text-sm leading-relaxed max-w-2xl mx-auto font-display italic">
            {i18n.language === 'en'
              ? 'This archive presents academic and archaeological evidence for scholarly analysis. All evidence is evaluated objectively without theological agenda.'
              : '本档案以学术研究为目的，客观呈现考古与历史证据，不带任何神学立场。'}
          </p>
          <p className="text-parchment font-semibold mt-6 tracking-wide">
            {i18n.language === 'en' ? 'Curated by Paul Liu (刘苏阳)' : '由刘苏阳整理'}
          </p>
          <p className="text-parchment-muted text-sm mt-1">
            {i18n.language === 'en' ? 'Contact: ' : '联系：'}
            <a
              href="mailto:paul.sy.liu@gmail.com"
              className="text-gold font-semibold hover:text-gold-dark transition-colors"
            >
              paul.sy.liu@gmail.com
            </a>
          </p>
          <p className="text-parchment-muted/70 text-xs mt-4 tracking-wider">
            {i18n.language === 'en'
              ? '© 2025 Biblical Evidence Archive'
              : '© 2025 圣经证据档案'}
          </p>
        </div>
      </footer>

      <AnimatePresence>
        {selectedEvidence && (
          <DetailModal
            evidence={selectedEvidence}
            onClose={() => setSelectedEvidence(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
