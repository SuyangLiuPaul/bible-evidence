import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, Clock, ArrowUpDown, SlidersHorizontal } from 'lucide-react'
import { type Category, type ConfidenceLevel } from '../data/evidences'

const categories: Array<Category | 'All'> = ['All', 'Archaeology', 'Manuscripts', 'History', 'Science']
const confidenceLevels: Array<ConfidenceLevel | 'All'> = ['All', 'Definitive', 'Strong', 'Circumstantial']

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

type SortKey = 'confidence' | 'date' | 'name'

interface MobileFilterSheetProps {
  isOpen: boolean
  onClose: () => void
  // Filter states
  activeCategory: Category | 'All'
  setActiveCategory: (c: Category | 'All') => void
  selectedConfidence: ConfidenceLevel | 'All'
  setSelectedConfidence: (c: ConfidenceLevel | 'All') => void
  selectedBook: string
  setSelectedBook: (b: string) => void
  selectedTimeline: string
  setSelectedTimeline: (t: string) => void
  sortBy: SortKey
  setSortBy: (s: SortKey) => void
  // Data
  evidences: Array<{ category: Category; confidenceLevel: ConfidenceLevel; bibleBooks: string[]; timeline: string }>
  bookCounts: Map<string, number>
  timelines: string[]
  activeFilterCount: number
  onClearAll: () => void
}

export function MobileFilterFAB({ onClick, count, isEn }: { onClick: () => void; count: number; isEn: boolean }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden fixed bottom-6 left-6 z-40 h-12 px-4 rounded-2xl glass flex items-center gap-2 active:scale-95 transition-transform"
      aria-label={isEn ? 'Open filters' : '打开筛选'}
    >
      <SlidersHorizontal className="w-5 h-5 text-sapphire" />
      <span className="text-parchment text-sm font-semibold">{isEn ? 'Filters' : '筛选'}</span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold text-white text-[11px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  )
}

export default function MobileFilterSheet({
  isOpen, onClose,
  activeCategory, setActiveCategory,
  selectedConfidence, setSelectedConfidence,
  selectedBook, setSelectedBook,
  selectedTimeline, setSelectedTimeline,
  sortBy, setSortBy,
  evidences, bookCounts, timelines,
  activeFilterCount, onClearAll,
}: MobileFilterSheetProps) {
  const { t, i18n } = useTranslation()
  const isEn = i18n.language === 'en'
  const bookLabel = (b: string) => isEn ? b : (BOOK_ZH[b] || b)

  const otBooks = OLD_TESTAMENT.filter(b => bookCounts.has(b))
  const ntBooks = NEW_TESTAMENT.filter(b => bookCounts.has(b))
  const specialBooks = SPECIAL.filter(b => bookCounts.has(b))

  const translateTimeline = (tl: string) => {
    if (isEn) return tl
    return tl
      .replace(/(\d+)(?:st|nd|rd|th)/g, '$1')
      .replace(/Century/g, '世纪')
      .replace(/Millennium/g, '千年期')
      .replace(/BCE/g, '公元前')
      .replace(/CE/g, '公元')
      .replace(/Medieval/g, '中世纪')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose()
            }}
            className="fixed inset-x-0 bottom-0 z-[70] max-h-[85vh] rounded-t-3xl glass-heavy flex flex-col"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-parchment-muted/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/20 flex-shrink-0">
              <h3 className="text-parchment font-semibold text-base">
                {isEn ? 'Filters' : '筛选'}
                {activeFilterCount > 0 && (
                  <span className="ml-2 text-gold text-sm">({activeFilterCount})</span>
                )}
              </h3>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/30 flex items-center justify-center" aria-label="Close">
                <X className="w-4 h-4 text-parchment-muted" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Category */}
              <div>
                <p className="text-parchment-muted text-[11px] font-bold uppercase tracking-widest mb-2">
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
                        aria-pressed={isActive}
                        className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all ${
                          isActive
                            ? 'border-sapphire/80 bg-sapphire/90 text-white'
                            : 'border-white/35 bg-white/25 text-parchment-muted'
                        }`}
                      >
                        {cat === 'All' ? t('filter.all') : t(`filter.${cat}`)}
                        <span className={`ml-1 text-[11px] font-bold ${isActive ? 'text-white/80' : 'text-parchment-muted'}`}>{count}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Confidence */}
              <div>
                <p className="text-parchment-muted text-[11px] font-bold uppercase tracking-widest mb-2">
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
                        aria-pressed={isActive}
                        className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all ${
                          isActive
                            ? 'border-sapphire/80 bg-sapphire/90 text-white'
                            : 'border-white/35 bg-white/25 text-parchment-muted'
                        }`}
                      >
                        {level === 'All' ? (isEn ? 'All' : '全部') : t(`confidence.${level}`)}
                        <span className={`ml-1 text-[11px] font-bold ${isActive ? 'text-white/80' : 'text-parchment-muted'}`}>{count}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Book */}
              <div>
                <label className="flex items-center gap-1.5 text-parchment-muted text-[11px] font-bold uppercase tracking-widest mb-2">
                  <BookOpen className="w-3 h-3" />
                  {isEn ? 'Bible Book' : '圣经书卷'}
                </label>
                <select
                  value={selectedBook}
                  onChange={e => setSelectedBook(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/40 backdrop-blur-xl border border-white/40 text-parchment text-sm font-medium"
                >
                  <option value="All">{isEn ? 'All Books' : '全部书卷'}</option>
                  <optgroup label={isEn ? 'Old Testament' : '旧约'}>
                    {otBooks.map(b => <option key={b} value={b}>{bookLabel(b)} ({bookCounts.get(b)})</option>)}
                  </optgroup>
                  <optgroup label={isEn ? 'New Testament' : '新约'}>
                    {ntBooks.map(b => <option key={b} value={b}>{bookLabel(b)} ({bookCounts.get(b)})</option>)}
                  </optgroup>
                  <optgroup label={isEn ? 'General' : '综合'}>
                    {specialBooks.map(b => <option key={b} value={b}>{bookLabel(b)} ({bookCounts.get(b)})</option>)}
                  </optgroup>
                </select>
              </div>

              {/* Timeline */}
              <div>
                <label className="flex items-center gap-1.5 text-parchment-muted text-[11px] font-bold uppercase tracking-widest mb-2">
                  <Clock className="w-3 h-3" />
                  {isEn ? 'Period' : '年代'}
                </label>
                <select
                  value={selectedTimeline}
                  onChange={e => setSelectedTimeline(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/40 backdrop-blur-xl border border-white/40 text-parchment text-sm font-medium"
                >
                  <option value="All">{isEn ? 'All Periods' : '全部年代'}</option>
                  {timelines.map(tl => <option key={tl} value={tl}>{translateTimeline(tl)}</option>)}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="flex items-center gap-1.5 text-parchment-muted text-[11px] font-bold uppercase tracking-widest mb-2">
                  <ArrowUpDown className="w-3 h-3" />
                  {isEn ? 'Sort' : '排序'}
                </label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortKey)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/40 backdrop-blur-xl border border-white/40 text-parchment text-sm font-medium"
                >
                  <option value="confidence">{isEn ? 'Confidence' : '置信度'}</option>
                  <option value="name">{isEn ? 'Name A-Z' : '名称'}</option>
                  <option value="date">{isEn ? 'Discovery Date' : '发现日期'}</option>
                </select>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="flex gap-3 px-5 py-4 border-t border-white/20 flex-shrink-0">
              {activeFilterCount > 0 && (
                <button
                  onClick={onClearAll}
                  className="flex-1 py-2.5 rounded-xl border border-gold/40 text-gold text-sm font-semibold bg-gold/8"
                >
                  {isEn ? 'Reset' : '重置'}
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-sapphire text-white text-sm font-semibold"
              >
                {isEn ? 'Apply' : '应用'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
