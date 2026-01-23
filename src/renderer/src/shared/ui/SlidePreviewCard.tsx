interface SlidePreviewCardProps {
  index: number
  content: string
  isTitle?: boolean
  className?: string
}

export function SlidePreviewCard({
  index,
  content,
  isTitle = false,
  className = ''
}: SlidePreviewCardProps): JSX.Element {
  return (
    <div
      className={`p-3 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-100/80 dark:border-slate-700/50 shadow-sm shadow-slate-200/50 dark:shadow-slate-900/30 transition-all duration-150 hover:shadow hover:border-slate-200 dark:hover:border-slate-600 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200/80 dark:from-primary-800/50 dark:to-primary-900/50 text-primary-700 dark:text-primary-200 text-xs font-bold flex items-center justify-center shadow-sm">
          {index}
        </span>
        <div className="flex-1 min-w-0">
          {isTitle && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-primary-100/80 dark:bg-primary-800/40 text-primary-700 dark:text-primary-300 font-medium mb-1.5 inline-block">
              제목
            </span>
          )}
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    </div>
  )
}
