import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { BookOpen, Clock, X, Search, ArrowUpDown, SlidersHorizontal } from 'lucide-react'
import { type Evidence, type Category, type ConfidenceLevel } from '../data/evidences'
import EvidenceCard from './EvidenceCard'
import MobileFilterSheet, { MobileFilterFAB } from './MobileFilterSheet'

const categories: Array<Category | 'All'> = ['All', 'Archaeology', 'Manuscripts', 'History', 'Science']
const confidenceLevels: Array<ConfidenceLevel | 'All'> = ['All', 'Definitive', 'Strong', 'Circumstantial']
type SortKey = 'confidence' | 'date' | 'name'

const CONFIDENCE_ORDER: Record<ConfidenceLevel, number> = { Definitive: 0, Strong: 1, Circumstantial: 2 }

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
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All')
  const [selectedConfidence, setSelectedConfidence] = useState<ConfidenceLevel | 'All'>('All')
  const [selectedBook, setSelectedBook] = useState('All')
  const [selectedTimeline, setSelectedTimeline] = useState('All')
  const [sortBy, setSortBy] = useState<SortKey>('confidence')
  const [sheetOpen, setSheetOpen] = useState(false)
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

  const searchLower = searchQuery.toLowerCase()

  const matchSearch = useCallback((e: Evidence) => {
    if (!searchLower) return true
    const title = t(e.titleKey).toLowerCase()
    const summary = t(e.summaryKey).toLowerCase()
    const id = e.id.replace(/_/g, ' ')
    return title.includes(searchLower) || summary.includes(searchLower) || id.includes(searchLower)
  }, [searchLower, t])

  const bookCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of evidences) {
      for (const book of e.bibleBooks) {
        counts.set(book, (counts.get(book) || 0) + 1)
      }
    }
    return counts
  }, [evidences])

  const otBooks = OLD_TESTAMENT.filter(b => bookCounts.has(b))
  const ntBooks = NEW_TESTAMENT.filter(b => bookCounts.has(b))
  const specialBooks = SPECIAL.filter(b => bookCounts.has(b))
  const timelines = Array.from(new Set(evidences.map(e => e.timeline)))

  const filtered = useMemo(() => {
    const result = evidences.filter(e => {
      const catMatch = activeCategory === 'All' || e.category === activeCategory
      const confMatch = selectedConfidence === 'All' || e.confidenceLevel === selectedConfidence
      const bookMatch = selectedBook === 'All' || e.bibleBooks.includes(selectedBook)
      const timelineMatch = selectedTimeline === 'All' || e.timeline === selectedTimeline
      const searchMatch = matchSearch(e)
      return catMatch && confMatch && bookMatch && timelineMatch && searchMatch
    })

    result.sort((a, b) => {
      if (sortBy === 'confidence') return CONFIDENCE_ORDER[a.confidenceLevel] - CONFIDENCE_ORDER[b.confidenceLevel]
      if (sortBy === 'name') return t(a.titleKey).localeCompare(t(b.titleKey))
      return a.discoveryDate.localeCompare(b.discoveryDate)
    })

    return result
  }, [evidences, activeCategory, selectedConfidence, selectedBook, selectedTimeline, sortBy, matchSearch, t])

  const hasFilters = searchQuery || selectedBook !== 'All' || selectedTimeline !== 'All' || selectedConfidence !== 'All'
  const activeFilterCount = [
    activeCategory !== 'All',
    selectedConfidence !== 'All',
    selectedBook !== 'All',
    selectedTimeline !== 'All',
    searchQuery !== '',
  ].filter(Boolean).length

  const clearAll = () => {
    setSearchQuery('')
    setSelectedBook('All')
    setSelectedTimeline('All')
    setSelectedConfidence('All')
    setActiveCategory('All')
  }

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

        {/* ── Mobile sticky search bar ──────────────────────────── */}
        <div className="md:hidden sticky top-14 z-30 -mx-6 px-4 py-3 bg-white/60 backdrop-blur-2xl border-b border-white/40">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isEn ? 'Search evidence...' : '搜索证据...'}
              aria-label={isEn ? 'Search evidence' : '搜索证据'}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/40 backdrop-blur-xl border border-white/40 text-parchment text-sm font-medium placeholder:text-parchment-muted/60 focus:outline-none focus:ring-2 focus:ring-sapphire/20 focus:border-sapphire/30"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 -mr-1 text-parchment-muted hover:text-parchment transition-colors" aria-label={isEn ? 'Clear search' : '清除搜索'}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Mobile results count */}
          <div className="mt-2 text-center text-parchment-muted text-xs">
            <span className="font-bold text-sapphire">{filtered.length}</span> {t('grid.results')}
          </div>
        </div>

        {/* ── Desktop filter panel — sticky ─────────────────────── */}
        <div className="hidden md:block sticky top-16 z-30">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-10 glass rounded-3xl p-5"
          >
            {/* Search bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isEn ? 'Search evidence...' : '搜索证据...'}
                aria-label={isEn ? 'Search evidence' : '搜索证据'}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/40 backdrop-blur-xl border border-white/40 text-parchment text-sm font-medium placeholder:text-parchment-muted/60 focus:outline-none focus:ring-2 focus:ring-sapphire/20 focus:border-sapphire/30 hover:border-white/60 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 -mr-1 text-parchment-muted hover:text-parchment transition-colors" aria-label={isEn ? 'Clear search' : '清除搜索'}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category pills with layout animation */}
            <div className="mb-3">
              <p className="text-parchment-muted text-[11px] font-bold uppercase tracking-widest mb-2">
                {isEn ? 'Category' : '类别'}
              </p>
              <LayoutGroup>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => {
                    const isActive = activeCategory === cat
                    const count = cat === 'All' ? evidences.length : evidences.filter(e => e.category === cat).length
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        aria-pressed={isActive}
                        className={`relative px-4 py-2 rounded-xl text-sm font-semibold border transition-colors duration-200 ${
                          isActive
                            ? 'border-transparent text-white'
                            : 'border-white/35 bg-white/25 backdrop-blur-md text-parchment-muted hover:bg-white/45 hover:border-white/55 hover:text-sapphire'
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="category-indicator"
                            className="absolute inset-0 rounded-xl bg-sapphire/90 border border-sapphire/80"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">
                          {cat === 'All' ? t('filter.all') : t(`filter.${cat}`)}
                          <span className={`ml-1.5 text-[11px] font-bold tabular-nums ${isActive ? 'text-white/80' : 'text-parchment-muted'}`}>
                            {count}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </LayoutGroup>
            </div>

            {/* Confidence pills with layout animation */}
            <div className="mb-3">
              <p className="text-parchment-muted text-[11px] font-bold uppercase tracking-widest mb-2">
                {isEn ? 'Confidence' : '置信度'}
              </p>
              <LayoutGroup>
                <div className="flex flex-wrap gap-2">
                  {confidenceLevels.map(level => {
                    const isActive = selectedConfidence === level
                    const count = level === 'All' ? evidences.length : evidences.filter(e => e.confidenceLevel === level).length
                    return (
                      <button
                        key={level}
                        onClick={() => setSelectedConfidence(level)}
                        aria-pressed={isActive}
                        className={`relative px-4 py-2 rounded-xl text-sm font-semibold border transition-colors duration-200 ${
                          isActive
                            ? 'border-transparent text-white'
                            : 'border-white/35 bg-white/25 backdrop-blur-md text-parchment-muted hover:bg-white/45 hover:border-white/55 hover:text-sapphire'
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="confidence-indicator"
                            className="absolute inset-0 rounded-xl bg-sapphire/90 border border-sapphire/80"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">
                          {level === 'All' ? (isEn ? 'All' : '全部') : t(`confidence.${level}`)}
                          <span className={`ml-1.5 text-[11px] font-bold tabular-nums ${isActive ? 'text-white/80' : 'text-parchment-muted'}`}>
                            {count}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </LayoutGroup>
            </div>

            {/* Row 3: Book, Timeline, Sort */}
            <div className="pt-3 border-t border-white/30 flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1.5 min-w-[200px] flex-1">
                <label htmlFor="book-select" className="flex items-center gap-1.5 text-parchment-muted text-[11px] font-bold uppercase tracking-widest">
                  <BookOpen className="w-3 h-3" />
                  {isEn ? 'Bible Book' : '圣经书卷'}
                </label>
                <select
                  id="book-select"
                  value={selectedBook}
                  onChange={e => setSelectedBook(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-white/40 backdrop-blur-xl border border-white/40 text-parchment text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sapphire/20 focus:border-sapphire/30 hover:border-white/60 transition-colors cursor-pointer"
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

              <div className="flex flex-col gap-1.5 min-w-[180px]">
                <label htmlFor="timeline-select" className="flex items-center gap-1.5 text-parchment-muted text-[11px] font-bold uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  {isEn ? 'Period' : '年代'}
                </label>
                <select
                  id="timeline-select"
                  value={selectedTimeline}
                  onChange={e => setSelectedTimeline(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-white/40 backdrop-blur-xl border border-white/40 text-parchment text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sapphire/20 focus:border-sapphire/30 hover:border-white/60 transition-colors cursor-pointer"
                >
                  <option value="All">{isEn ? 'All Periods' : '全部年代'}</option>
                  {timelines.map(tl => <option key={tl} value={tl}>{translateTimeline(tl)}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="sort-select" className="flex items-center gap-1.5 text-parchment-muted text-[11px] font-bold uppercase tracking-widest">
                  <ArrowUpDown className="w-3 h-3" />
                  {isEn ? 'Sort' : '排序'}
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortKey)}
                  className="px-3 py-2.5 rounded-xl bg-white/40 backdrop-blur-xl border border-white/40 text-parchment text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sapphire/20 focus:border-sapphire/30 hover:border-white/60 transition-colors cursor-pointer"
                >
                  <option value="confidence">{isEn ? 'Confidence' : '置信度'}</option>
                  <option value="name">{isEn ? 'Name A-Z' : '名称'}</option>
                  <option value="date">{isEn ? 'Discovery Date' : '发现日期'}</option>
                </select>
              </div>

              {hasFilters && (
                <button
                  onClick={clearAll}
                  aria-label={isEn ? 'Clear all filters' : '清除所有筛选'}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gold/40 text-gold text-sm font-semibold bg-gold/8 hover:bg-gold/15 transition-colors backdrop-blur-md"
                >
                  <X className="w-3.5 h-3.5" />
                  {isEn ? 'Clear' : '清除'}
                </button>
              )}

              <div className="ml-auto self-end text-parchment-muted text-sm">
                <span className="font-bold text-sapphire">{filtered.length}</span>
                {' '}{t('grid.results')}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Card grid with stagger ────────────────────────────── */}
        <motion.div
          layout
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.04 } },
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start contain-paint"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((evidence, i) => (
              <motion.div
                key={evidence.id}
                layout
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
                }}
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

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full flex flex-col items-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-3xl glass-subtle flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-parchment-muted/50" />
            </div>
            <p className="text-parchment-muted text-lg font-medium mb-2">
              {t('grid.emptyTitle')}
            </p>
            <p className="text-parchment-muted/70 text-sm max-w-sm mb-6">
              {t('grid.emptyDesc')}
            </p>
            <button
              onClick={clearAll}
              className="px-5 py-2.5 rounded-xl bg-sapphire/10 text-sapphire text-sm font-semibold hover:bg-sapphire/20 transition-colors"
            >
              {t('grid.resetFilters')}
            </button>
          </motion.div>
        )}
      </div>

      {/* ── Mobile filter FAB + Bottom Sheet ────────────────────── */}
      <MobileFilterFAB onClick={() => setSheetOpen(true)} count={activeFilterCount} isEn={isEn} />
      <MobileFilterSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        selectedConfidence={selectedConfidence}
        setSelectedConfidence={setSelectedConfidence}
        selectedBook={selectedBook}
        setSelectedBook={setSelectedBook}
        selectedTimeline={selectedTimeline}
        setSelectedTimeline={setSelectedTimeline}
        sortBy={sortBy}
        setSortBy={setSortBy}
        evidences={evidences}
        bookCounts={bookCounts}
        timelines={timelines}
        activeFilterCount={activeFilterCount}
        onClearAll={clearAll}
      />
    </section>
  )
}
