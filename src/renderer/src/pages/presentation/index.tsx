import { useState, useEffect, useCallback, useRef } from 'react'
import {
  loadStyles,
  getTextStyles,
  getBackgroundStyles,
  getOverlayStyles,
  type SlideStyles
} from '@shared/lib/slideStyles'

interface PresentationSlide {
  songId: number
  songTitle: string
  songCode: string
  songOrder: number
  slideNumber: number
  content: string
}

export function PresentationPage(): JSX.Element {
  const [slides, setSlides] = useState<PresentationSlide[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [numberInput, setNumberInput] = useState('')
  const [showInfo, setShowInfo] = useState(false)
  const [styles, setStyles] = useState<SlideStyles | null>(null)
  const numberInputTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 스타일 로드
  useEffect(() => {
    setStyles(loadStyles())
  }, [])

  // 슬라이드 데이터 수신
  useEffect(() => {
    const unsubscribe = window.presentationApi.onUpdateSlides((newSlides) => {
      setSlides(newSlides)
      setCurrentIndex(0)
    })

    return () => unsubscribe()
  }, [])

  // 다음 슬라이드
  const goNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1))
  }, [slides.length])

  // 이전 슬라이드
  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  // 처음으로
  const goFirst = useCallback(() => {
    setCurrentIndex(0)
  }, [])

  // 마지막으로
  const goLast = useCallback(() => {
    setCurrentIndex(slides.length - 1)
  }, [slides.length])

  // 특정 슬라이드로 이동
  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentIndex(index)
    }
  }, [slides.length])

  // 전체화면 토글
  const toggleFullscreen = useCallback(async (fullscreen: boolean) => {
    await window.presentationApi.setFullscreen(fullscreen)
  }, [])

  // 슬라이드 쇼 종료
  const closePresentation = useCallback(async () => {
    await window.presentationApi.close()
  }, [])

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // 숫자 입력 처리
      if (e.key >= '0' && e.key <= '9') {
        setNumberInput((prev) => prev + e.key)
        setShowInfo(true)

        // 이전 타임아웃 클리어
        if (numberInputTimeoutRef.current) {
          clearTimeout(numberInputTimeoutRef.current)
        }

        // 3초 후 숫자 입력 초기화
        numberInputTimeoutRef.current = setTimeout(() => {
          setNumberInput('')
          setShowInfo(false)
        }, 3000)

        return
      }

      // Enter: 숫자로 슬라이드 이동
      if (e.key === 'Enter' && numberInput) {
        const slideNum = parseInt(numberInput, 10)
        if (slideNum >= 1 && slideNum <= slides.length) {
          goToSlide(slideNum - 1)
        }
        setNumberInput('')
        setShowInfo(false)
        if (numberInputTimeoutRef.current) {
          clearTimeout(numberInputTimeoutRef.current)
        }
        return
      }

      // 방향키 및 기타 키 처리
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ': // Space
        case 'PageDown':
          e.preventDefault()
          goNext()
          break
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          goPrev()
          break
        case 'Home':
          e.preventDefault()
          goFirst()
          break
        case 'End':
          e.preventDefault()
          goLast()
          break
        case 'F5':
          e.preventDefault()
          toggleFullscreen(true)
          break
        case 'Escape':
          e.preventDefault()
          // 현재 전체화면이면 전체화면 해제, 아니면 슬라이드 쇼 종료
          const isFullscreen = await window.presentationApi.isFullscreen()
          if (isFullscreen) {
            toggleFullscreen(false)
          } else {
            closePresentation()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev, goFirst, goLast, goToSlide, toggleFullscreen, closePresentation, numberInput, slides.length])

  // 마우스 움직임으로 정보 표시
  useEffect(() => {
    let timeout: NodeJS.Timeout

    const handleMouseMove = () => {
      setShowInfo(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (!numberInput) {
          setShowInfo(false)
        }
      }, 2000)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timeout)
    }
  }, [numberInput])

  // 슬라이드가 없는 경우
  if (slides.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70 text-lg">슬라이드를 불러오는 중...</p>
          <p className="text-white/40 text-sm mt-2">ESC를 눌러 종료</p>
        </div>
      </div>
    )
  }

  const currentSlide = slides[currentIndex]

  // 현재 슬라이드가 제목인지 가사인지 판단 (slideNumber === 1이면 제목)
  const isTitle = currentSlide.slideNumber === 1
  const currentStyle = styles ? (isTitle ? styles.title : styles.lyrics) : null

  // 배경 스타일
  const backgroundStyle = currentStyle ? getBackgroundStyles(currentStyle.background) : { backgroundColor: '#000000' }
  const overlayStyle = currentStyle ? getOverlayStyles(currentStyle.background) : null

  // 텍스트 스타일
  const textStyle = currentStyle ? getTextStyles(currentStyle.text) : {}

  // 트랜지션 스타일
  const transitionStyle = styles ? {
    transition: styles.transition === 'none' ? 'none' : `opacity ${styles.transitionDuration}ms ease-in-out`
  } : {}

  return (
    <div className="min-h-screen flex flex-col select-none cursor-none relative" style={backgroundStyle}>
      {/* 이미지 오버레이 */}
      {overlayStyle && (
        <div className="absolute inset-0 pointer-events-none" style={overlayStyle} />
      )}

      {/* 메인 슬라이드 영역 */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10" style={transitionStyle}>
        <div className="w-full">
          <p
            className="whitespace-pre-wrap"
            style={textStyle}
          >
            {currentSlide.content}
          </p>
        </div>
      </div>

      {/* 하단 정보 바 (마우스 움직임 또는 숫자 입력 시 표시) */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300 ${
          showInfo ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* 좌측: 찬양 정보 */}
          <div className="text-white/70">
            <span className="font-mono text-sm px-2 py-1 rounded bg-white/10 mr-2">
              {currentSlide.songCode}{currentSlide.songOrder}
            </span>
            <span className="text-sm">{currentSlide.songTitle}</span>
          </div>

          {/* 중앙: 슬라이드 번호 / 숫자 입력 */}
          <div className="text-white text-center">
            {numberInput ? (
              <div className="flex items-center gap-2">
                <span className="text-white/50 text-sm">이동:</span>
                <span className="font-mono text-2xl px-3 py-1 rounded bg-white/20">{numberInput}</span>
                <span className="text-white/50 text-sm">Enter로 이동</span>
              </div>
            ) : (
              <span className="font-mono text-lg">
                {currentIndex + 1} / {slides.length}
              </span>
            )}
          </div>

          {/* 우측: 조작 힌트 */}
          <div className="text-white/50 text-sm space-x-4">
            <span>← → 이동</span>
            <span>F5 전체화면</span>
            <span>ESC 종료</span>
          </div>
        </div>
      </div>

      {/* 좌우 클릭 영역 (투명) */}
      <div
        className="fixed top-0 left-0 bottom-0 w-1/3 cursor-pointer"
        onClick={goPrev}
        style={{ cursor: 'w-resize' }}
      />
      <div
        className="fixed top-0 right-0 bottom-0 w-1/3 cursor-pointer"
        onClick={goNext}
        style={{ cursor: 'e-resize' }}
      />
    </div>
  )
}
