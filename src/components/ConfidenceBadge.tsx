import { useTranslation } from 'react-i18next'
import { type ConfidenceLevel, confidenceConfig, confidenceBarWidth } from '../data/evidences'

interface ConfidenceBadgeProps {
  level: ConfidenceLevel
  showBar?: boolean
  size?: 'sm' | 'md'
}

export default function ConfidenceBadge({ level, showBar = false, size = 'sm' }: ConfidenceBadgeProps) {
  const { t } = useTranslation()
  const cfg = confidenceConfig[level]

  return (
    <div className="flex flex-col gap-2">
      <div className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 bg-white/30 backdrop-blur-md border border-white/40 ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <span className={`font-semibold tracking-wide ${size === 'sm' ? 'text-[11px]' : 'text-xs'}`}>
          {t(`confidence.${level}`)}
        </span>
      </div>
      {showBar && (
        <div className="h-1.5 w-full rounded-full bg-white/25 backdrop-blur-md overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${cfg.barColor} ${confidenceBarWidth[level]}`} />
        </div>
      )}
    </div>
  )
}
