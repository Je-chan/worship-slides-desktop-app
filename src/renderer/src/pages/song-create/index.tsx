import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Input,
  Label,
  Select,
  Textarea,
  Card,
  CardHeader,
  CardContent,
  FormField
} from '@shared/ui'
import type { Tag } from '@shared/types'
import { songCreateSchema, ALLOWED_CODES, parseLyricsToSlides, type SongCreateFormData } from '@features/song-create/model'
import { PenLine } from 'lucide-react'

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
      lyrics: ''
    }
  })

  const watchCode = watch('code')
  const watchOrder = watch('order')
  const watchLyrics = watch('lyrics')
  const watchTitle = watch('title')

  // 가사 슬라이드 미리보기 계산 (제목 제외)
  const lyricsSlides = useMemo(() => {
    if (!watchLyrics) return []
    return parseLyricsToSlides(watchLyrics)
  }, [watchLyrics])

  // 총 슬라이드 개수 (제목 1개 + 가사 슬라이드)
  const totalSlideCount = 1 + lyricsSlides.length

  // 미리보기 자동 스크롤
  const previewRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)

  const handlePreviewScroll = useCallback(() => {
    const el = previewRef.current
    if (!el) return
    // 스크롤이 맨 아래에서 20px 이내면 "맨 아래"로 간주
    const threshold = 20
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
  }, [])

  // 슬라이드가 변경되고 맨 아래를 보고 있었다면 자동 스크롤
  useEffect(() => {
    const el = previewRef.current
    if (el && isAtBottomRef.current) {
      el.scrollTop = el.scrollHeight
    }
  }, [lyricsSlides])

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

  // 가사 유효성 체크
  const hasLyrics = watchLyrics && parseLyricsToSlides(watchLyrics).length > 0

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

      const lyricsSlides = parseLyricsToSlides(data.lyrics)
      let slideNumber = 2
      for (const content of lyricsSlides) {
        await window.slideApi.create(song.id, slideNumber, content)
        slideNumber++
      }

      // 3. 태그 연결
      if (selectedTagIds.length > 0) {
        await window.songTagApi.setTagsForSong(song.id, selectedTagIds)
      }

      navigate('/songs')
    } catch (error) {
      console.error('저장 실패:', error)
      setSubmitError('저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // 저장 버튼 활성화 조건
  const canSubmit = hasLyrics && !orderDuplicateError

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-800/50 dark:to-primary-900/50 flex items-center justify-center shadow-sm">
          <PenLine className="w-6 h-6 text-primary-600 dark:text-primary-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">찬양 등록</h1>
          <p className="mt-0.5 text-slate-500 dark:text-slate-400">새로운 찬양과 가사를 등록합니다.</p>
        </div>
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
                    <Select
                      id="code"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      error={!!errors.code}
                    >
                      <option value="">코드 선택</option>
                      {ALLOWED_CODES.map((code) => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </Select>
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
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                          selectedTagIds.includes(tag.id)
                            ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-sm shadow-primary-700/30'
                            : 'bg-slate-100/80 text-slate-600 border border-slate-200/50 hover:bg-slate-200/80 hover:text-slate-800 hover:border-slate-300/50 dark:bg-slate-700/80 dark:text-slate-300 dark:border-slate-600/50 dark:hover:bg-slate-600 dark:hover:text-slate-100'
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

        {/* 가사 입력 & 슬라이드 미리보기 (스플릿 뷰) */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">가사 입력</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              가사를 입력하면 <span className="font-medium text-primary-600 dark:text-primary-400">빈 줄</span>을 기준으로 자동으로 슬라이드가 분리됩니다.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              {/* 왼쪽: 가사 입력 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lyrics" required>전체 가사</Label>
                  <span className="text-xs text-slate-400">빈 줄로 슬라이드 구분</span>
                </div>
                <Textarea
                  id="lyrics"
                  {...register('lyrics')}
                  placeholder={`첫 번째 슬라이드 가사
두 번째 줄...

두 번째 슬라이드 가사
(빈 줄로 구분)

세 번째 슬라이드...`}
                  className={`font-mono text-sm h-[420px] resize-none ${errors.lyrics ? 'border-red-300 dark:border-red-700' : ''}`}
                />
                {errors.lyrics?.message && (
                  <p className="text-xs text-red-500 dark:text-red-400">{errors.lyrics.message}</p>
                )}
              </div>

              {/* 오른쪽: 슬라이드 미리보기 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>슬라이드 미리보기</Label>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-gradient-to-r from-primary-100 to-primary-200/80 dark:from-primary-800/40 dark:to-primary-900/40 text-primary-700 dark:text-primary-300 font-semibold shadow-sm">
                    {totalSlideCount}개
                  </span>
                </div>
                <div
                  ref={previewRef}
                  onScroll={handlePreviewScroll}
                  className="h-[420px] overflow-y-auto rounded-xl border border-slate-200/80 dark:border-slate-700/50 bg-gradient-to-b from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/30 p-3 space-y-2.5"
                >
                  {/* 슬라이드 1번: 제목 (항상 표시) */}
                  <div className="p-3.5 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-100/80 dark:border-slate-700/50 shadow-sm shadow-slate-200/50 dark:shadow-slate-900/30 transition-all duration-150 hover:shadow hover:border-slate-200 dark:hover:border-slate-600">
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200/80 dark:from-primary-800/50 dark:to-primary-900/50 text-primary-700 dark:text-primary-200 text-xs font-bold flex items-center justify-center shadow-sm">
                        1
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-primary-100/80 dark:bg-primary-800/40 text-primary-700 dark:text-primary-300 font-medium mb-1.5 inline-block">
                          제목
                        </span>
                        <p className={`text-sm whitespace-pre-wrap break-words leading-relaxed ${watchTitle.trim() ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500 italic'}`}>
                          {watchTitle.trim() || '제목을 입력해주세요'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 슬라이드 2번부터: 가사 */}
                  {lyricsSlides.length === 0 ? (
                    <div className="flex items-center justify-center py-10 text-slate-400 dark:text-slate-500 text-sm">
                      가사를 입력하면 슬라이드가 표시됩니다
                    </div>
                  ) : (
                    lyricsSlides.map((content, index) => (
                      <div
                        key={index}
                        className="p-3.5 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-100/80 dark:border-slate-700/50 shadow-sm shadow-slate-200/50 dark:shadow-slate-900/30 transition-all duration-150 hover:shadow hover:border-slate-200 dark:hover:border-slate-600"
                      >
                        <div className="flex items-start gap-3">
                          <span className="shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200/80 dark:from-slate-700/80 dark:to-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center shadow-sm">
                            {index + 2}
                          </span>
                          <div className="flex-1 min-w-0 pt-1">
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words leading-relaxed">
                              {content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <div className="flex justify-end gap-3">
          {submitError && <p className="text-sm text-red-600 dark:text-red-400 self-center">{submitError}</p>}
          <Button type="button" variant="secondary" onClick={() => navigate('/songs')}>
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
