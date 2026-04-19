import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Clock, X } from 'lucide-react'
import { type Evidence, type Category, type ConfidenceLevel } from '../data/evidences'
import EvidenceCard from './EvidenceCard'

const categories: Array<Category | 'All'> = ['All', 'Archaeology', 'Manuscripts', 'History', 'Science']
const confidenceLevels: Array<ConfidenceLevel | 'All'> = ['All', 'Definitive', 'Strong', 'Circumstantial']

// Standard Bible books grouped by Testament
const OLD_TESTAMENT = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
  'Job', 'Psalms', 'Ecclesiastes', 'Isaiah', 'Jeremiah', 'Daniel',
  'Amos', 'Micah',
]
const NEW_TESTAMENT = [
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', 'Galatians', 'James',
]
const SPECIAL = ['Multiple Books', 'Hebrew Bible']

const BOOK_ZH: Record<string, string> = {
  Genesis: '创世记', Exodus: '出埃及记', Leviticus: '利未记', Numbers: '民数记',
  Deuteronomy: '申命记', Joshua: '约书亚记', '1 Samuel': '撒母耳记上', '2 Samuel': '撒母耳记下',
  '1 Kings': '列王纪上', '2 Kings': '列王纪下', '1 Chronicles': '历代志上', '2 Chronicles': '历代志下',
  Ezra: '以斯拉记', Nehemiah: '尼希米记', Esther: '以斯帖记',
  Job: '约伯记', Psalms: '诗篇', Proverbs: '箴言', Ecclesiastes: '传道书',
  Isaiah: '以赛亚书', Jeremiah: '耶利米书', Ezekiel: '以西结书', Daniel: '但以理书',
  Amos: '阿摩司书', Micah: '弥迦书',
  Matthew: '马太福音', Mark: '马可福音', Luke: '路加福音', John: '约翰福音',
  Acts: '使徒行传', Romans: '罗马书', Galatians: '加拉太书', James: '雅各书',
  'Multiple Books': '多卷书', 'Hebrew Bible': '希伯来圣经',
}

interface EvidenceGridProps {
  evidences: Evidence[]
  onSelectEvidence: (e: Evidence) => void
}

export default function EvidenceGrid({ evidences, onSelectEvidence }: EvidenceGridProps) {
  const { t, i18n } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All')
  const [selectedConfidence, setSelectedConfidence] = useState<ConfidenceLevel | 'All'>('All')
  const [selectedBook, setSelectedBook] = useState('All')
  const [selectedTimeline, setSelectedTimeline] = useState('All')
  const isEn = i18n.language === 'en'
  const bookLabel = (b: string) => isEn ? b : (BOOK_ZH[b] || b)
  const translateTimeline = (tl: string) => {
    if (isEn) return tl
    return tl
      .replace(/(\d+)(?:st|nd|rd|th)/g, '$1')
      .replace(/Century/g, '世纪')
      .replace(/Millennium/g, '千年期')
      .replace(/BCE/g, '公元前')
      .replace(/CE/g, '公元')
      .replace(/\s*–\s*/g, '–')
      .replace(/Late Bronze Age/g, '青铜时代晚期')
      .replace(/Middle Bronze Age/g, '青铜时代中期')
      .replace(/Medieval/g, '中世纪')
      .replace(/~\s*/g, '约')
  }

  // Extract unique individual books from the bibleBooks arrays
  const bookCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of evidences) {
      for (const book of e.bibleBooks) {
        counts.set(book, (counts.get(book) || 0) + 1)
      }
    }
    return counts
  }, [evidences])

  // Filter books by what actually exists in data, keep defined order
  const otBooks = OLD_TESTAMENT.filter(b => bookCounts.has(b))
  const ntBooks = NEW_TESTAMENT.filter(b => bookCounts.has(b))
  const specialBooks = SPECIAL.filter(b => bookCounts.has(b))

  const timelines = Array.from(new Set(evidences.map(e => e.timeline)))

  const filtered = evidences.filter(e => {
    const catMatch = activeCategory === 'All' || e.category === activeCategory
    const confMatch = selectedConfidence === 'All' || e.confidenceLevel === selectedConfidence
    const bookMatch = selectedBook === 'All' || e.bibleBooks.includes(selectedBook)
    const timelineMatch = selectedTimeline === 'All' || e.timeline === selectedTimeline
    return catMatch && confMatch && bookMatch && timelineMatch
  })

  const hasFilters = selectedBook !== 'All' || selectedTimeline !== 'All' || selectedConfidence !== 'All'

  return (
    <section id="evidence" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gold text-xs tracking-[0.25em] uppercase font-medium mb-3"
          >
            {isEn ? 'Curated Evidence' : '精选实证'}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl font-bold text-parchment mb-4"
          >
            {t('section.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="text-parchment-dim text-lg max-w-xl mx-auto"
          >
            {t('section.subtitle')}
          </motion.p>
          <div className="gold-line mt-8" />
        </div>

        {/* ── Filter panel ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-10 rounded-2xl border border-canvas-border bg-canvas-surface shadow-sm p-5"
        >
          {/* Row 1: Category pills */}
          <div className="mb-3">
            <p className="text-parchment-muted text-[10px] font-bold uppercase tracking-widest mb-2">
              {isEn ? 'Category' : '类别'}
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => {
                const isActive = activeCategory === cat
                const count = cat === 'All' ? evidences.length : evidences.filter(e => e.category === cat).length
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      isActive
                        ? 'border-sapphire bg-sapphire text-white shadow-sm'
                        : 'border-canvas-border text-parchment-muted bg-canvas-elevated hover:border-sapphire/40 hover:text-sapphire'
                    }`}
                  >
                    {cat === 'All' ? t('filter.all') : t(`filter.${cat}`)}
                    <span className={`ml-1.5 text-[10px] font-bold tabular-nums ${isActive ? 'text-white/80' : 'text-parchment-muted'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Row 2: Confidence pills */}
          <div className="mb-3">
            <p className="text-parchment-muted text-[10px] font-bold uppercase tracking-widest mb-2">
              {isEn ? 'Confidence' : '置信度'}
            </p>
            <div className="flex flex-wrap gap-2">
              {confidenceLevels.map(level => {
                const isActive = selectedConfidence === level
                const count = level === 'All' ? evidences.length : evidences.filter(e => e.confidenceLevel === level).length
                return (
                  <button
                    key={level}
                    onClick={() => setSelectedConfidence(level)}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      isActive
                        ? 'border-sapphire bg-sapphire text-white shadow-sm'
                        : 'border-canvas-border text-parchment-muted bg-canvas-elevated hover:border-sapphire/40 hover:text-sapphire'
                    }`}
                  >
                    {level === 'All' ? (isEn ? 'All' : '全部') : t(`confidence.${level}`)}
                    <span className={`ml-1.5 text-[10px] font-bold tabular-nums ${isActive ? 'text-white/80' : 'text-parchment-muted'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Row 3: Book & Timeline dropdowns */}
          <div className="pt-3 border-t border-canvas-border flex flex-wrap gap-4 items-end">
            {/* Bible Book */}
            <div className="flex flex-col gap-1.5 min-w-[220px]">
              <label className="flex items-center gap-1.5 text-parchment-muted text-[10px] font-bold uppercase tracking-widest">
                <BookOpen className="w-3 h-3" />
                {isEn ? 'Bible Book' : '圣经书卷'}
              </label>
              <select
                value={selectedBook}
                onChange={e => setSelectedBook(e.target.value)}
                className="px-3 py-2 rounded-lg border border-canvas-border bg-canvas-elevated text-parchment text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sapphire/30 focus:border-sapphire/50 hover:border-sapphire/30 transition-colors cursor-pointer"
              >
                <option value="All">{isEn ? 'All Books' : '全部书卷'}</option>
                <optgroup label={isEn ? 'Old Testament' : '旧约'}>
                  {otBooks.map(b => (
                    <option key={b} value={b}>{bookLabel(b)} ({bookCounts.get(b)})</option>
                  ))}
                </optgroup>
                <optgroup label={isEn ? 'New Testament' : '新约'}>
                  {ntBooks.map(b => (
                    <option key={b} value={b}>{bookLabel(b)} ({bookCounts.get(b)})</option>
                  ))}
                </optgroup>
                <optgroup label={isEn ? 'General' : '综合'}>
                  {specialBooks.map(b => (
                    <option key={b} value={b}>{bookLabel(b)} ({bookCounts.get(b)})</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Timeline */}
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <label className="flex items-center gap-1.5 text-parchment-muted text-[10px] font-bold uppercase tracking-widest">
                <Clock className="w-3 h-3" />
                {isEn ? 'Historical Period' : '历史年代'}
              </label>
              <select
                value={selectedTimeline}
                onChange={e => setSelectedTimeline(e.target.value)}
                className="px-3 py-2 rounded-lg border border-canvas-border bg-canvas-elevated text-parchment text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sapphire/30 focus:border-sapphire/50 hover:border-sapphire/30 transition-colors cursor-pointer"
              >
                <option value="All">{isEn ? 'All Periods' : '全部年代'}</option>
                {timelines.map(tl => <option key={tl} value={tl}>{translateTimeline(tl)}</option>)}
              </select>
            </div>

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={() => { setSelectedBook('All'); setSelectedTimeline('All'); setSelectedConfidence('All') }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gold/40 text-gold text-sm font-semibold bg-gold/8 hover:bg-gold/15 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                {isEn ? 'Clear' : '清除'}
              </button>
            )}

            {/* Results count */}
            <div className="ml-auto self-end text-parchment-muted text-sm">
              <span className="font-bold text-sapphire">{filtered.length}</span>
              {' '}{t('grid.results')}
            </div>
          </div>
        </motion.div>

        {/* ── Card grid ───────────────────────────────────────────── */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((evidence, i) => (
              <motion.div
                key={evidence.id}
                layout
              >
                <EvidenceCard
                  evidence={evidence}
                  index={i}
                  onClick={() => onSelectEvidence(evidence)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 text-parchment-muted"
          >
            {t('grid.empty')}
          </motion.div>
        )}
      </div>
    </section>
  )
}
