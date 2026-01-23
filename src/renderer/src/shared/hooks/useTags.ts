import { useState, useEffect, useCallback } from 'react'
import type { Tag } from '@shared/types'

interface UseTagsOptions {
  /** 초기 선택된 태그 ID 목록 */
  initialSelectedIds?: number[]
  /** 마운트 시 자동 로드 여부 (기본값: true) */
  autoLoad?: boolean
}

interface UseTagsReturn {
  /** 모든 태그 목록 */
  tags: Tag[]
  /** 선택된 태그 ID 목록 */
  selectedTagIds: number[]
  /** 로딩 상태 */
  isLoading: boolean
  /** 태그 선택/해제 토글 */
  toggleTag: (tagId: number) => void
  /** 새 태그 생성 (성공 시 true 반환) */
  createTag: (name: string) => Promise<boolean>
  /** 태그가 선택되었는지 확인 */
  isTagSelected: (tagId: number) => boolean
  /** 선택된 태그 ID 목록 직접 설정 */
  setSelectedTagIds: (ids: number[]) => void
  /** 태그 목록 다시 로드 */
  reloadTags: () => Promise<void>
}

/**
 * 태그 관리 커스텀 훅
 *
 * @example
 * ```tsx
 * const { tags, selectedTagIds, toggleTag, createTag } = useTags()
 *
 * // 태그 토글
 * <button onClick={() => toggleTag(tag.id)}>
 *   {tag.name}
 * </button>
 *
 * // 새 태그 생성
 * const success = await createTag('새 태그')
 * ```
 */
export function useTags(options: UseTagsOptions = {}): UseTagsReturn {
  const { initialSelectedIds = [], autoLoad = true } = options

  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(initialSelectedIds)
  const [isLoading, setIsLoading] = useState(true)

  // 태그 목록 로드
  const loadTags = useCallback(async () => {
    setIsLoading(true)
    try {
      const tagsData = await window.tagApi.getAll()
      setTags(tagsData)
    } catch {
      // 에러 발생 시 빈 배열 유지
      setTags([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 자동 로드
  useEffect(() => {
    if (autoLoad) {
      loadTags()
    }
  }, [autoLoad, loadTags])

  // 태그 선택/해제 토글
  const toggleTag = useCallback((tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
  }, [])

  // 새 태그 생성
  const createTag = useCallback(async (name: string): Promise<boolean> => {
    const trimmed = name.trim()

    // 빈 이름 검사
    if (!trimmed) {
      return false
    }

    // 중복 검사 (대소문자 무시)
    if (tags.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
      return false
    }

    try {
      const newTag = await window.tagApi.create(trimmed)
      // 한글 정렬로 태그 추가
      setTags((prev) =>
        [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
      )
      // 새로 생성한 태그 자동 선택
      setSelectedTagIds((prev) => [...prev, newTag.id])
      return true
    } catch {
      return false
    }
  }, [tags])

  // 태그 선택 여부 확인
  const isTagSelected = useCallback(
    (tagId: number) => selectedTagIds.includes(tagId),
    [selectedTagIds]
  )

  return {
    tags,
    selectedTagIds,
    isLoading,
    toggleTag,
    createTag,
    isTagSelected,
    setSelectedTagIds,
    reloadTags: loadTags
  }
}
