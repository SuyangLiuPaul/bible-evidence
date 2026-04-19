import { useTranslation } from 'react-i18next'
import { type ConfidenceLevel, confidenceConfig, confidenceBarWidth } from '../data/evidences'

interface ConfidenceBadgeProps {
  level: ConfidenceLevel
  showBar?: boolean
  size?: 'sm' | 'md'
}

export default function ConfidenceBadge({ level, showBar = false, size = 'sm' }: ConfidenceBadgeProps) {
  const { t, i18n } = useTranslation()
  const cfg = confidenceConfig[level]
  const isZh = i18n.language === 'zh'

  return (
    <div className="flex flex-col gap-2">
      <div className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 ${cfg.bg} ${cfg.border}`}>
        <span className={`font-bold tracking-wide ${cfg.text} ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
          {isZh ? cfg.tierZh : cfg.tier}
        </span>
        <span className={`${cfg.text} opacity-50 ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>·</span>
        <span className={`${cfg.text} font-medium ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
          {t(`confidence.${level}`)}
        </span>
      </div>
      {showBar && (
        <div className="h-1.5 w-full rounded-full bg-canvas-border overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${cfg.barColor} ${confidenceBarWidth[level]}`} />
        </div>
      )}
    </div>
  )
}
