import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Trash2, ChevronLeft, Music } from 'lucide-react'
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
import { useToast } from '@shared/lib'
import { useTags, usePreviewScroll } from '@shared/hooks'
import type { Song, Slide, Tag } from '@shared/types'
import { songCreateSchema, ALLOWED_CODES, parseLyricsToSlides, slidesToLyrics, type SongCreateFormData } from '@features/song-create'

type ViewMode = 'view' | 'edit'

export function SongDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const songId = parseInt(id || '0', 10)

  const [mode, setMode] = useState<ViewMode>('view')
  const [song, setSong] = useState<Song | null>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [songTags, setSongTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // 태그 관리 훅
  const {
    tags: allTags,
    selectedTagIds,
    toggleTag,
    createTag,
    setSelectedTagIds
  } = useTags()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [orderDuplicateError, setOrderDuplicateError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
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

  // 실시간 슬라이드 미리보기 계산
  const previewSlides = useMemo(() => {
    const result: string[] = []
    if (watchTitle.trim()) {
      result.push(watchTitle.trim())
    }
    if (watchLyrics) {
      const lyricsSlides = parseLyricsToSlides(watchLyrics)
      result.push(...lyricsSlides)
    }
    return result
  }, [watchTitle, watchLyrics])

  // 미리보기 자동 스크롤
  const { previewRef, handlePreviewScroll } = usePreviewScroll(previewSlides.length)

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      if (!songId) {
        navigate('/songs')
        return
      }

      try {
        const [songData, slidesData, tagsForSong] = await Promise.all([
          window.songApi.getById(songId),
          window.slideApi.getBySongId(songId),
          window.songTagApi.getBySongId(songId)
        ])

        if (!songData) {
          navigate('/songs')
          return
        }

        setSong(songData)
        setSlides(slidesData)
        setSongTags(tagsForSong)
        setSelectedTagIds(tagsForSong.map((t) => t.id))

        // 폼 초기값 설정 (슬라이드 2번부터가 가사)
        const lyricsSlides = slidesData.filter((s) => s.slide_number >= 2).map((s) => s.content)
        reset({
          title: songData.title,
          code: songData.code,
          order: songData.order,
          lyrics: slidesToLyrics(lyricsSlides)
        })
      } catch {
        toast.error('데이터를 불러오는데 실패했습니다.')
        navigate('/songs')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [songId, navigate, reset, setSelectedTagIds])

  // 태그 생성 핸들러
  const handleCreateTag = async () => {
    const trimmed = newTagName.trim()
    if (!trimmed) return

    const success = await createTag(trimmed)
    if (success) {
      setNewTagName('')
    } else {
      // 중복 태그인 경우에도 입력 필드 초기화
      setNewTagName('')
    }
  }

  // 순서 중복 검증
  const validateOrder = async (code: string, order: number): Promise<boolean> => {
    try {
      const existing = await window.songApi.getByCodeOrder(code, order)
      if (existing && existing.id !== songId) {
        setOrderDuplicateError(`${code}${order}는 이미 존재합니다.`)
        return false
      }
      setOrderDuplicateError(null)
      return true
    } catch {
      return true
    }
  }

  // 수정 모드로 전환
  const enterEditMode = () => {
    setMode('edit')
    setOrderDuplicateError(null)
    setSubmitError(null)
  }

  // 읽기 모드로 전환 (변경 취소)
  const cancelEdit = () => {
    if (!song) return

    const lyricsSlides = slides.filter((s) => s.slide_number >= 2).map((s) => s.content)
    reset({
      title: song.title,
      code: song.code,
      order: song.order,
      lyrics: slidesToLyrics(lyricsSlides)
    })
    setSelectedTagIds(songTags.map((t) => t.id))
    setOrderDuplicateError(null)
    setSubmitError(null)
    setMode('view')
  }

  // 가사 유효성 체크
  const hasLyrics = watchLyrics && parseLyricsToSlides(watchLyrics).length > 0

  // 저장
  const onSubmit = async (data: SongCreateFormData) => {
    setSubmitError(null)

    const isOrderValid = await validateOrder(data.code, data.order)
    if (!isOrderValid) {
      return
    }

    try {
      // 1. 찬양 수정
      await window.songApi.update(songId, data.title.trim(), data.code, data.order)

      // 2. 기존 슬라이드 삭제 후 재생성
      await window.slideApi.deleteBySongId(songId)

      // 제목 슬라이드 (1번)
      await window.slideApi.create(songId, 1, data.title.trim())

      // 가사 슬라이드 (2번부터)
      const lyricsSlides = parseLyricsToSlides(data.lyrics)
      let slideNumber = 2
      for (const content of lyricsSlides) {
        await window.slideApi.create(songId, slideNumber, content)
        slideNumber++
      }

      // 3. 태그 업데이트
      await window.songTagApi.setTagsForSong(songId, selectedTagIds)

      // 4. 데이터 다시 로드
      const [updatedSong, updatedSlides, updatedSongTags] = await Promise.all([
        window.songApi.getById(songId),
        window.slideApi.getBySongId(songId),
        window.songTagApi.getBySongId(songId)
      ])

      setSong(updatedSong)
      setSlides(updatedSlides)
      setSongTags(updatedSongTags)

      setMode('view')
    } catch {
      setSubmitError('저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // 삭제
  const handleDelete = async () => {
    try {
      await window.slideApi.deleteBySongId(songId)
      await window.songTagApi.setTagsForSong(songId, [])
      await window.songApi.delete(songId)
      navigate('/songs')
    } catch {
      setSubmitError('삭제에 실패했습니다.')
    }
  }

  const canSubmit = hasLyrics && !orderDuplicateError

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!song) {
    return null
  }

  // 읽기 모드
  if (mode === 'view') {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-800/50 dark:to-primary-900/50 flex items-center justify-center shadow-sm">
              <Music className="w-6 h-6 text-primary-600 dark:text-primary-300" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-primary-100 to-primary-200/80 dark:from-primary-800/40 dark:to-primary-900/40 text-primary-700 dark:text-primary-300 font-mono text-sm font-bold shadow-sm">
                  {song.code}{song.order}
                </span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {song.title}
                </h1>
              </div>
              {songTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {songTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100/80 text-slate-600 border border-slate-200/50 dark:bg-slate-700/80 dark:text-slate-300 dark:border-slate-600/50"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={enterEditMode}>
              <Pencil className="w-4 h-4" />
              수정
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </Button>
          </div>
        </div>

        {/* 삭제 확인 다이얼로그 */}
        {showDeleteConfirm && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">
                    정말로 이 찬양을 삭제하시겠습니까?
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    삭제된 찬양은 복구할 수 없습니다.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                    취소
                  </Button>
                  <Button
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    삭제
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 슬라이드 목록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">슬라이드</h2>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-gradient-to-r from-primary-100 to-primary-200/80 dark:from-primary-800/40 dark:to-primary-900/40 text-primary-700 dark:text-primary-300 font-semibold shadow-sm">
                {slides.length}개
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="p-3.5 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-100/80 dark:border-slate-700/50 shadow-sm shadow-slate-200/50 dark:shadow-slate-900/30 transition-all duration-150 hover:shadow hover:border-slate-200 dark:hover:border-slate-600"
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200/80 dark:from-primary-800/50 dark:to-primary-900/50 text-primary-700 dark:text-primary-200 text-xs font-bold flex items-center justify-center shadow-sm">
                    {slide.slide_number}
                  </span>
                  <div className="flex-1 min-w-0">
                    {slide.slide_number === 1 && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-primary-100/80 dark:bg-primary-800/40 text-primary-700 dark:text-primary-300 font-medium mb-1.5 inline-block">
                        제목
                      </span>
                    )}
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {slide.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 목록으로 돌아가기 */}
        <div className="flex justify-start">
          <Button variant="secondary" onClick={() => navigate('/songs')}>
            <ChevronLeft className="w-4 h-4" />
            목록으로
          </Button>
        </div>
      </div>
    )
  }

  // 수정 모드
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-800/50 dark:to-primary-900/50 flex items-center justify-center shadow-sm">
          <Pencil className="w-6 h-6 text-primary-600 dark:text-primary-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">찬양 수정</h1>
          <p className="mt-0.5 text-slate-500 dark:text-slate-400">찬양 정보와 가사를 수정합니다.</p>
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
                      placeholder="순서 입력"
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

                {allTags.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">
                    등록된 태그가 없습니다. 위 입력창에서 새 태그를 생성해주세요.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                          selectedTagIds.includes(tag.id)
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm shadow-primary-600/30'
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
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-medium">
                    {previewSlides.length}개
                  </span>
                </div>
                <div
                  ref={previewRef}
                  onScroll={handlePreviewScroll}
                  className="h-[420px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 space-y-2"
                >
                  {previewSlides.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 text-sm">
                      가사를 입력하면 슬라이드가 표시됩니다
                    </div>
                  ) : (
                    previewSlides.map((content, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-md bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            {index === 0 && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-medium mb-1 inline-block">
                                제목
                              </span>
                            )}
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

        {/* 버튼 */}
        <div className="flex justify-end gap-3">
          {submitError && <p className="text-sm text-red-600 dark:text-red-400 self-center">{submitError}</p>}
          <Button type="button" variant="secondary" onClick={cancelEdit}>
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
