import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Input,
  Label,
  Textarea,
  Card,
  CardHeader,
  CardContent,
  FormField
} from '@shared/ui'
import { songCreateSchema, type SongCreateFormData } from '@features/song-create/model'

export function SongCreatePage(): JSX.Element {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<SongCreateFormData>({
    resolver: zodResolver(songCreateSchema),
    defaultValues: {
      title: '',
      code: '',
      order: undefined,
      slides: [{ id: crypto.randomUUID(), content: '' }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'slides'
  })

  const watchCode = watch('code')
  const watchOrder = watch('order')

  const onSubmit = async (data: SongCreateFormData) => {
    setSubmitError(null)

    try {
      // 1. 찬양 생성
      const song = await window.songApi.create(data.title.trim(), data.code, data.order)

      // 2. 슬라이드 생성 (1번은 제목, 2번부터 가사)
      await window.slideApi.create(song.id, 1, data.title.trim())

      let slideNumber = 2
      for (const slide of data.slides) {
        if (slide.content.trim()) {
          await window.slideApi.create(song.id, slideNumber, slide.content.trim())
          slideNumber++
        }
      }

      navigate('/')
    } catch (error) {
      console.error('저장 실패:', error)
      setSubmitError('저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const addSlide = () => {
    append({ id: crypto.randomUUID(), content: '' })
  }

  const removeSlide = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">찬양 등록</h1>
        <p className="mt-1 text-slate-600">새로운 찬양과 가사를 등록합니다.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 찬양 정보 */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">찬양 정보</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField error={errors.title?.message}>
              <Label htmlFor="title" required>
                찬양 제목
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="예: 주님의 사랑"
                error={!!errors.title}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField error={errors.code?.message} description="영문자로 분류 코드를 입력합니다.">
                <Label htmlFor="code" required>
                  코드
                </Label>
                <Input
                  id="code"
                  {...register('code')}
                  placeholder="예: C"
                  maxLength={5}
                  error={!!errors.code}
                  style={{ textTransform: 'uppercase' }}
                />
              </FormField>

              <FormField error={errors.order?.message} description="해당 코드 내 순서 번호입니다.">
                <Label htmlFor="order" required>
                  순서
                </Label>
                <Controller
                  name="order"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="order"
                      type="number"
                      min={1}
                      placeholder="예: 5"
                      error={!!errors.order}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === '' ? undefined : parseInt(value, 10))
                      }}
                    />
                  )}
                />
              </FormField>
            </div>

            {watchCode && watchOrder && (
              <p className="text-sm text-slate-600">
                찬양 식별자:{' '}
                <span className="font-mono font-medium text-primary-600">
                  {watchCode.toLowerCase()}
                  {watchOrder}
                </span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* 슬라이드 (가사) */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">슬라이드 (가사)</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                첫 번째 슬라이드는 자동으로 제목이 됩니다. 아래에 가사를 슬라이드별로 나누어
                입력하세요.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.slides?.root?.message && (
              <p className="text-sm text-red-600">{errors.slides.root.message}</p>
            )}
            {errors.slides?.message && (
              <p className="text-sm text-red-600">{errors.slides.message}</p>
            )}

            {fields.map((field, index) => (
              <FormField key={field.id}>
                <div className="flex items-center justify-between">
                  <Label>슬라이드 {index + 2}</Label>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSlide(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      삭제
                    </Button>
                  )}
                </div>
                <Textarea
                  {...register(`slides.${index}.content`)}
                  placeholder="가사를 입력하세요..."
                  rows={4}
                />
              </FormField>
            ))}

            <Button type="button" variant="secondary" onClick={addSlide} className="w-full">
              + 슬라이드 추가
            </Button>
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <div className="flex justify-end gap-3">
          {submitError && <p className="text-sm text-red-600 self-center">{submitError}</p>}
          <Button type="button" variant="secondary" onClick={() => navigate('/')}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </div>
  )
}
