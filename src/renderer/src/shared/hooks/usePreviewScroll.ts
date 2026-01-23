import { useRef, useCallback, useEffect, type RefObject } from 'react'

interface UsePreviewScrollOptions {
  /** 바닥 판정 임계값 (픽셀, 기본값: 20) */
  threshold?: number
}

interface UsePreviewScrollReturn {
  /** 스크롤 컨테이너에 연결할 ref */
  previewRef: RefObject<HTMLDivElement | null>
  /** onScroll 이벤트 핸들러 */
  handlePreviewScroll: () => void
}

/**
 * 미리보기 자동 스크롤 커스텀 훅
 *
 * 사용자가 스크롤을 바닥에 두고 있으면 새 콘텐츠 추가 시 자동으로 바닥으로 스크롤합니다.
 * 사용자가 위로 스크롤한 경우에는 자동 스크롤하지 않습니다.
 *
 * @param contentLength - 콘텐츠 길이 (변경 시 스크롤 트리거)
 * @param options - 옵션 (threshold: 바닥 판정 임계값)
 *
 * @example
 * ```tsx
 * const { previewRef, handlePreviewScroll } = usePreviewScroll(previewSlides.length)
 *
 * return (
 *   <div ref={previewRef} onScroll={handlePreviewScroll}>
 *     {previewSlides.map(slide => ...)}
 *   </div>
 * )
 * ```
 */
export function usePreviewScroll(
  contentLength: number,
  options: UsePreviewScrollOptions = {}
): UsePreviewScrollReturn {
  const { threshold = 20 } = options

  const previewRef = useRef<HTMLDivElement | null>(null)
  const isAtBottomRef = useRef(true)

  // 스크롤 위치 추적
  const handlePreviewScroll = useCallback(() => {
    const el = previewRef.current
    if (!el) return

    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
  }, [threshold])

  // 콘텐츠 변경 시 자동 스크롤
  useEffect(() => {
    const el = previewRef.current
    if (el && isAtBottomRef.current) {
      el.scrollTop = el.scrollHeight
    }
  }, [contentLength])

  return {
    previewRef,
    handlePreviewScroll
  }
}
