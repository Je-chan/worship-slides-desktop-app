import { useState, useEffect } from 'react'
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
import { songCreateSchema, ALLOWED_CODES, type SongCreateFormData } from '@features/song-create/model'

interface Tag {
  id: number
  name: string
}

export function SongCreatePage(): JSX.Element {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [orderDuplicateError, setOrderDuplicateError] = useState<string | null>(null)

  // 태그 목록 로드
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tagsData = await window.tagApi.getAll()
        setTags(tagsData)
      } catch (error) {
        console.error('태그 목록 로드 실패:', error)
      }
    }
    loadTags()
  }, [])

  // 태그 토글
  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  // 태그 생성
  const handleCreateTag = async () => {
    const trimmed = newTagName.trim()
    if (!trimmed) return

    // 이미 존재하는 태그인지 확인
    if (tags.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
      setNewTagName('')
      return
    }

    try {
      const newTag = await window.tagApi.create(trimmed)
      setTags((prev) => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name, 'ko')))
      setSelectedTagIds((prev) => [...prev, newTag.id])
      setNewTagName('')
    } catch (error) {
      console.error('태그 생성 실패:', error)
    }
  }

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
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
  const watchSlides = watch('slides')

  // 코드 변경 시 순서 자동 계산
  useEffect(() => {
    const updateOrder = async () => {
      if (watchCode && ALLOWED_CODES.includes(watchCode.toUpperCase() as typeof ALLOWED_CODES[number])) {
        try {
          const maxOrder = await window.songApi.getMaxOrderByCode(watchCode)
          setValue('order', maxOrder + 1)
          setOrderDuplicateError(null)
        } catch (error) {
          console.error('순서 조회 실패:', error)
        }
      }
    }
    updateOrder()
  }, [watchCode, setValue])

  // 순서 중복 검증
  const validateOrder = async (code: string, order: number): Promise<boolean> => {
    try {
      const existing = await window.songApi.getByCodeOrder(code, order)
      if (existing) {
        setOrderDuplicateError(`${code}${order}는 이미 존재합니다.`)
        return false
      }
      setOrderDuplicateError(null)
      return true
    } catch {
      return true
    }
  }

  // 첫 번째 슬라이드 유효성 체크
  const isFirstSlideValid = watchSlides && watchSlides.length > 0 && watchSlides[0].content.trim().length > 0

  const onSubmit = async (data: SongCreateFormData) => {
    setSubmitError(null)

    // 순서 중복 검증
    const isOrderValid = await validateOrder(data.code, data.order)
    if (!isOrderValid) {
      return
    }

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

      // 3. 태그 연결
      if (selectedTagIds.length > 0) {
        await window.songTagApi.setTagsForSong(song.id, selectedTagIds)
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

  // 저장 버튼 활성화 조건
  const canSubmit = isFirstSlideValid && !orderDuplicateError

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">찬양 등록</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">새로운 찬양과 가사를 등록합니다.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 찬양 정보 */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">찬양 정보</h2>
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
              <FormField error={errors.code?.message} description="A ~ G 중 선택하세요.">
                <Label htmlFor="code" required>
                  코드
                </Label>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <select
                      id="code"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all duration-200 ease-out shadow-sm bg-white dark:bg-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-400 focus:shadow-md hover:border-slate-400 dark:hover:border-slate-500 ${
                        errors.code
                          ? 'border-red-400 focus:ring-red-500/50 focus:border-red-400'
                          : 'border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      <option value="">코드 선택</option>
                      {ALLOWED_CODES.map((code) => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </FormField>

              <FormField
                error={errors.order?.message || orderDuplicateError || undefined}
                description="해당 코드 내 순서 번호입니다."
              >
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
                      placeholder="자동 계산됨"
                      error={!!errors.order || !!orderDuplicateError}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === '' ? undefined : parseInt(value, 10))
                        setOrderDuplicateError(null)
                      }}
                      onBlur={async () => {
                        if (watchCode && field.value) {
                          await validateOrder(watchCode, field.value)
                        }
                      }}
                    />
                  )}
                />
              </FormField>
            </div>

            {watchCode && watchOrder && !orderDuplicateError && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                찬양 식별자:{' '}
                <span className="font-mono font-medium text-primary-600 dark:text-primary-400">
                  {watchCode.toLowerCase()}
                  {watchOrder}
                </span>
              </p>
            )}

            {/* 태그 선택 및 생성 */}
            <FormField>
              <Label>태그</Label>
              <div className="space-y-3 mt-1">
                {/* 태그 생성 입력 */}
                <div className="flex gap-2">
                  <Input
                    placeholder="새 태그 이름 입력"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCreateTag()
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" className="min-w-1/5" onClick={handleCreateTag}>
                    추가
                  </Button>
                </div>

                {/* 기존 태그 목록 */}
                {tags.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">
                    등록된 태그가 없습니다. 위 입력창에서 새 태그를 생성해주세요.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm ${
                          selectedTagIds.includes(tag.id)
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-slate-100'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </FormField>
          </CardContent>
        </Card>

        {/* 슬라이드 (가사) */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">슬라이드 (가사)</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                첫 번째 슬라이드는 자동으로 제목이 됩니다. 아래에 가사를 슬라이드별로 나누어
                입력하세요.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.slides?.root?.message && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.slides.root.message}</p>
            )}
            {errors.slides?.message && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.slides.message}</p>
            )}

            {fields.map((field, index) => {
              const isRequired = index === 0
              const slideContent = watchSlides?.[index]?.content || ''
              const isEmpty = slideContent.trim().length === 0

              return (
                <FormField key={field.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label>슬라이드 {index + 2}</Label>
                      {isRequired && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 font-medium">
                          필수
                        </span>
                      )}
                    </div>
                    {fields.length > 1 && !isRequired && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSlide(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                      >
                        삭제
                      </Button>
                    )}
                  </div>
                  <Textarea
                    {...register(`slides.${index}.content`)}
                    placeholder={isRequired ? '첫 번째 가사를 입력하세요 (필수)' : '가사를 입력하세요...'}
                    rows={4}
                    className={isRequired && isEmpty ? 'border-red-300 dark:border-red-700' : ''}
                  />
                  {isRequired && isEmpty && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">첫 번째 가사는 필수입니다.</p>
                  )}
                </FormField>
              )
            })}

            <Button type="button" variant="secondary" onClick={addSlide} className="w-full">
              + 슬라이드 추가
            </Button>
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <div className="flex justify-end gap-3">
          {submitError && <p className="text-sm text-red-600 dark:text-red-400 self-center">{submitError}</p>}
          <Button type="button" variant="secondary" onClick={() => navigate('/')}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting || !canSubmit}>
            {isSubmitting ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </div>
  )
}
