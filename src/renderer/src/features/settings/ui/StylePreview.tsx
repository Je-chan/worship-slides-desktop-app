import { Card, CardHeader, CardContent } from '@shared/ui'
import type { SlideTypeStyle } from '@shared/lib/slideStyles'
import { getTextStyles, getBackgroundStyles, getOverlayStyles } from '@shared/lib/slideStyles'

interface StylePreviewProps {
  style: SlideTypeStyle
  previewText: string
  label: string
}

export function StylePreview({ style, previewText, label }: StylePreviewProps): JSX.Element {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">미리보기</h2>
      </CardHeader>
      <CardContent>
        <div
          className="relative aspect-video rounded-xl overflow-hidden shadow-2xl"
          style={getBackgroundStyles(style.background)}
        >
          {/* 이미지 오버레이 */}
          {getOverlayStyles(style.background) && (
            <div
              className="absolute inset-0"
              style={getOverlayStyles(style.background)!}
            />
          )}
          {/* 텍스트 */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <p
              style={getTextStyles(style.text)}
              className="whitespace-pre-wrap"
            >
              {previewText}
            </p>
          </div>
        </div>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
          {label} 미리보기
        </p>
      </CardContent>
    </Card>
  )
}
