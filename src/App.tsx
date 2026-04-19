import { useState, useMemo, lazy, Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import BackToTop from './components/BackToTop'
import { evidences, type Evidence } from './data/evidences'

const EvidenceGrid = lazy(() => import('./components/EvidenceGrid'))
const DetailModal = lazy(() => import('./components/DetailModal'))

function GridSkeleton() {
  return (
    <section id="evidence" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-6 bg-canvas-elevated rounded w-48 mx-auto" />
          <div className="flex gap-3 justify-center">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-9 w-24 bg-canvas-elevated rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-56 bg-canvas-elevated rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const { i18n } = useTranslation()
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null)

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')
  }

  const isEn = i18n.language === 'en'
  const sourceCount = useMemo(() => evidences.reduce((sum, e) => sum + e.academicSources.length, 0), [])

  // Sync HTML lang attribute with i18n
  useEffect(() => {
    document.documentElement.lang = i18n.language === 'zh' ? 'zh' : 'en'
  }, [i18n.language])

  return (
    <div className="min-h-screen bg-canvas noise-overlay">
      <a href="#evidence" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-sapphire focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold">
        Skip to evidence
      </a>
      <Navbar onToggleLanguage={toggleLanguage} />

      <main>
        <HeroSection evidenceCount={evidences.length} sourceCount={sourceCount} />
        <Suspense fallback={<GridSkeleton />}>
          <EvidenceGrid
            evidences={evidences}
            onSelectEvidence={setSelectedEvidence}
          />
        </Suspense>

        {/* Methodology section */}
        <section id="methodology" className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="gold-line mb-8" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-parchment mb-6">
              {isEn ? 'Methodology' : '研究方法'}
            </h2>
            <div className="text-parchment-dim leading-relaxed space-y-4 text-base md:text-lg text-left">
              <p>
                {isEn
                  ? 'This archive evaluates each piece of evidence using a three-tier confidence scale:'
                  : '本档案采用三级置信度评估每项证据：'}
              </p>
              <ul className="list-none space-y-3 ml-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald mt-2" />
                  <span>
                    <strong className="text-parchment">{isEn ? 'Definitive:' : '确凿：'}</strong>{' '}
                    {isEn
                      ? 'Direct, widely accepted archaeological or scientific confirmation of a biblical person, place, or event.'
                      : '对圣经人物、地点或事件的直接、广泛接受的考古或科学确认。'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-sapphire mt-2" />
                  <span>
                    <strong className="text-parchment">{isEn ? 'Strong:' : '有力：'}</strong>{' '}
                    {isEn
                      ? 'Compelling circumstantial evidence that strongly supports a biblical claim, though some interpretive questions remain.'
                      : '令人信服的旁证，有力支持圣经记载，但仍存在一些解释性问题。'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-gold mt-2" />
                  <span>
                    <strong className="text-parchment">{isEn ? 'Circumstantial:' : '旁证：'}</strong>{' '}
                    {isEn
                      ? 'Interesting correlations that are consistent with the biblical record but not yet conclusive.'
                      : '与圣经记载一致的有趣关联，但尚未得出确切结论。'}
                  </span>
                </li>
              </ul>
              <p>
                {isEn
                  ? 'All entries cite peer-reviewed academic sources and are presented without theological bias. Evidence is categorized into Archaeology, Manuscripts, Science, and History for clarity.'
                  : '所有条目均引用经同行评审的学术来源，不带神学偏见。证据分为考古、手稿、科学和历史四大类以便查阅。'}
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-canvas-border mt-16 py-14 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="gold-line mb-8" />
          <p className="text-parchment-muted text-sm leading-relaxed max-w-2xl mx-auto font-display italic">
            {isEn
              ? 'This archive presents academic and archaeological evidence for scholarly analysis. All evidence is evaluated objectively without theological agenda.'
              : '本档案以学术研究为目的，客观呈现考古与历史证据，不带任何神学立场。'}
          </p>
          <p className="text-parchment font-semibold mt-6 tracking-wide">
            {isEn ? 'Curated by Paul Liu (刘苏阳)' : '由刘苏阳整理'}
          </p>
          <p className="text-parchment-muted text-sm mt-1">
            {isEn ? 'Contact: ' : '联系：'}
            <a
              href="mailto:paul.sy.liu@gmail.com"
              className="text-gold font-semibold hover:text-gold-dark transition-colors"
            >
              paul.sy.liu@gmail.com
            </a>
          </p>
          <p className="text-parchment-muted/70 text-xs mt-4 tracking-wider">
            {isEn ? '© 2026 Biblical Evidence Archive' : '© 2026 圣经证据档案'}
          </p>
        </div>
      </footer>

      <BackToTop />

      <AnimatePresence>
        {selectedEvidence && (
          <Suspense fallback={null}>
            <DetailModal
              evidence={selectedEvidence}
              onClose={() => setSelectedEvidence(null)}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  )
}
