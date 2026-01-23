import { X, ImagePlus } from 'lucide-react'
import { Card, CardHeader, CardContent, Label, Input, NumberStepper, SegmentedControl, IconButton, Button } from '@shared/ui'
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

const BACKGROUND_TYPE_OPTIONS = [
  { value: 'color' as const, label: '단색' },
  { value: 'gradient' as const, label: '그라데이션' },
  { value: 'image' as const, label: '이미지' }
]

const GRADIENT_DIRECTION_OPTIONS = [
  { value: 'to-b' as const, label: '↓' },
  { value: 'to-r' as const, label: '→' },
  { value: 'to-br' as const, label: '↘' },
  { value: 'to-bl' as const, label: '↙' }
]

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
          <SegmentedControl
            value={style.background.type}
            onChange={(value) => onUpdate('type', value)}
            options={BACKGROUND_TYPE_OPTIONS}
          />
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
              <SegmentedControl
                value={style.background.gradientDirection}
                onChange={(value) => onUpdate('gradientDirection', value)}
                options={GRADIENT_DIRECTION_OPTIONS}
              />
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
                  <IconButton
                    icon={<X className="w-4 h-4" />}
                    variant="danger"
                    size="sm"
                    label="이미지 삭제"
                    onClick={onRemoveImage}
                    className="absolute top-2 right-2"
                  />
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={onSelectImage}
                  className="w-full py-8 border-dashed"
                >
                  <ImagePlus className="w-8 h-8 mx-auto mb-2" />
                  이미지 선택
                </Button>
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
