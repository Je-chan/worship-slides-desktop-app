import { X, ImagePlus } from 'lucide-react'
import { Card, CardHeader, CardContent, Label, Input, NumberStepper } from '@shared/ui'
import type { SlideTypeStyle } from '@shared/lib/slideStyles'

interface BackgroundStyleSettingsProps {
  style: SlideTypeStyle
  onUpdate: <K extends keyof SlideTypeStyle['background']>(
    key: K,
    value: SlideTypeStyle['background'][K]
  ) => void
  onSelectImage: () => void
  onRemoveImage: () => void
}

export function BackgroundStyleSettings({
  style,
  onUpdate,
  onSelectImage,
  onRemoveImage
}: BackgroundStyleSettingsProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">배경 스타일</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 배경 타입 */}
        <div className="space-y-2">
          <Label>배경 타입</Label>
          <div className="flex gap-2">
            {(['color', 'gradient', 'image'] as const).map((type) => (
              <button
                key={type}
                onClick={() => onUpdate('type', type)}
                className={`flex-1 py-2 rounded-lg border transition-all ${
                  style.background.type === type
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                }`}
              >
                {type === 'color' ? '단색' : type === 'gradient' ? '그라데이션' : '이미지'}
              </button>
            ))}
          </div>
        </div>

        {/* 단색 배경 */}
        {style.background.type === 'color' && (
          <div className="space-y-2">
            <Label>배경 색상</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={style.background.color}
                onChange={(e) => onUpdate('color', e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer"
              />
              <Input
                value={style.background.color}
                onChange={(e) => onUpdate('color', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        )}

        {/* 그라데이션 배경 */}
        {style.background.type === 'gradient' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>시작 색상</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={style.background.gradientFrom}
                    onChange={(e) => onUpdate('gradientFrom', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer"
                  />
                  <Input
                    value={style.background.gradientFrom}
                    onChange={(e) => onUpdate('gradientFrom', e.target.value)}
                    className="flex-1 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>끝 색상</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={style.background.gradientTo}
                    onChange={(e) => onUpdate('gradientTo', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer"
                  />
                  <Input
                    value={style.background.gradientTo}
                    onChange={(e) => onUpdate('gradientTo', e.target.value)}
                    className="flex-1 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>방향</Label>
              <div className="grid grid-cols-4 gap-2">
                {([
                  { value: 'to-b', label: '↓' },
                  { value: 'to-r', label: '→' },
                  { value: 'to-br', label: '↘' },
                  { value: 'to-bl', label: '↙' },
                ] as const).map((dir) => (
                  <button
                    key={dir.value}
                    onClick={() => onUpdate('gradientDirection', dir.value)}
                    className={`py-2 rounded-lg border text-lg transition-all ${
                      style.background.gradientDirection === dir.value
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {dir.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 이미지 배경 */}
        {style.background.type === 'image' && (
          <>
            <div className="space-y-2">
              <Label>배경 이미지</Label>
              {style.background.image ? (
                <div className="relative">
                  <img
                    src={style.background.image}
                    alt="배경"
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <button
                    onClick={onRemoveImage}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onSelectImage}
                  className="w-full py-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 hover:border-primary-400 hover:text-primary-500 transition-colors"
                >
                  <ImagePlus className="w-8 h-8 mx-auto mb-2" />
                  이미지 선택
                </button>
              )}
            </div>
            {style.background.image && (
              <>
                <div className="space-y-2">
                  <Label>오버레이 투명도</Label>
                  <NumberStepper
                    value={style.background.imageOverlay}
                    onChange={(v) => onUpdate('imageOverlay', v)}
                    min={0}
                    max={100}
                    step={5}
                    unit="%"
                  />
                </div>
                <div className="space-y-2">
                  <Label>오버레이 색상</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={style.background.imageOverlayColor}
                      onChange={(e) => onUpdate('imageOverlayColor', e.target.value)}
                      className="w-12 h-10 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={style.background.imageOverlayColor}
                      onChange={(e) => onUpdate('imageOverlayColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
