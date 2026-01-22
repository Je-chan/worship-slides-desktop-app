// 슬라이드 스타일 타입 정의

export interface TextStyle {
  fontFamily: string
  fontSize: number
  fontWeight: string
  textColor: string
  textAlign: 'left' | 'center' | 'right'
  lineHeight: number
  textShadow: boolean
  textShadowColor: string
  textStroke: boolean
  textStrokeColor: string
}

export interface BackgroundStyle {
  type: 'color' | 'gradient' | 'image'
  color: string
  gradientFrom: string
  gradientTo: string
  gradientDirection: 'to-b' | 'to-r' | 'to-br' | 'to-bl'
  image: string | null
  imageOverlay: number // 0-100
  imageOverlayColor: string
}

export interface SlideTypeStyle {
  text: TextStyle
  background: BackgroundStyle
}

export interface SlideStyles {
  title: SlideTypeStyle
  lyrics: SlideTypeStyle
  transition: 'none' | 'fade' | 'slide'
  transitionDuration: number // ms
}

// 사용 가능한 폰트 목록
export const AVAILABLE_FONTS = [
  { name: '기본 (시스템)', value: 'system-ui, -apple-system, sans-serif' },
  { name: 'Pretendard', value: '"Pretendard Variable", Pretendard, sans-serif' },
  { name: 'Noto Sans KR', value: '"Noto Sans KR", sans-serif' },
  { name: 'Nanum Gothic', value: '"Nanum Gothic", sans-serif' },
  { name: 'Nanum Myeongjo', value: '"Nanum Myeongjo", serif' },
  { name: 'Gothic A1', value: '"Gothic A1", sans-serif' },
  { name: 'Black Han Sans', value: '"Black Han Sans", sans-serif' },
  { name: 'Do Hyeon', value: '"Do Hyeon", sans-serif' },
  { name: 'Jua', value: '"Jua", sans-serif' },
  { name: 'Gaegu', value: '"Gaegu", cursive' },
]

// 사용 가능한 폰트 굵기
export const FONT_WEIGHTS = [
  { name: '얇게', value: '300' },
  { name: '보통', value: '400' },
  { name: '중간', value: '500' },
  { name: '굵게', value: '600' },
  { name: '매우 굵게', value: '700' },
  { name: '가장 굵게', value: '800' },
]

// 기본 스타일
export const DEFAULT_STYLES: SlideStyles = {
  title: {
    text: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 80,
      fontWeight: '700',
      textColor: '#ffffff',
      textAlign: 'center',
      lineHeight: 1.4,
      textShadow: true,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textStroke: false,
      textStrokeColor: '#000000',
    },
    background: {
      type: 'color',
      color: '#1e293b',
      gradientFrom: '#1e293b',
      gradientTo: '#0f172a',
      gradientDirection: 'to-b',
      image: null,
      imageOverlay: 50,
      imageOverlayColor: '#000000',
    },
  },
  lyrics: {
    text: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 56,
      fontWeight: '500',
      textColor: '#ffffff',
      textAlign: 'center',
      lineHeight: 1.6,
      textShadow: true,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textStroke: false,
      textStrokeColor: '#000000',
    },
    background: {
      type: 'color',
      color: '#000000',
      gradientFrom: '#000000',
      gradientTo: '#1e293b',
      gradientDirection: 'to-b',
      image: null,
      imageOverlay: 60,
      imageOverlayColor: '#000000',
    },
  },
  transition: 'fade',
  transitionDuration: 300,
}

// 로컬 스토리지 키
const STORAGE_KEY = 'worship-slides-styles'

// 스타일 저장
export function saveStyles(styles: SlideStyles): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(styles))
}

// 스타일 불러오기
export function loadStyles(): SlideStyles {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // 기본값과 병합하여 새로운 속성이 추가되어도 누락되지 않도록
      return deepMerge(DEFAULT_STYLES, parsed)
    }
  } catch (e) {
    console.error('스타일 로드 실패:', e)
  }
  return DEFAULT_STYLES
}

// 스타일 초기화
export function resetStyles(): SlideStyles {
  localStorage.removeItem(STORAGE_KEY)
  return DEFAULT_STYLES
}

// 깊은 병합 함수
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target }
  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof target[key] === 'object' &&
        target[key] !== null
      ) {
        result[key] = deepMerge(
          target[key] as Record<string, unknown>,
          source[key] as Record<string, unknown>
        ) as T[Extract<keyof T, string>]
      } else {
        result[key] = source[key] as T[Extract<keyof T, string>]
      }
    }
  }
  return result
}

// CSS 스타일 생성 함수
export function getTextStyles(style: TextStyle): React.CSSProperties {
  return {
    fontFamily: style.fontFamily,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight,
    color: style.textColor,
    textAlign: style.textAlign,
    lineHeight: style.lineHeight,
    textShadow: style.textShadow
      ? `2px 2px 8px ${style.textShadowColor}, 0 0 20px ${style.textShadowColor}`
      : undefined,
    WebkitTextStroke: style.textStroke ? `1px ${style.textStrokeColor}` : undefined,
  }
}

export function getBackgroundStyles(style: BackgroundStyle): React.CSSProperties {
  switch (style.type) {
    case 'color':
      return { backgroundColor: style.color }
    case 'gradient':
      const directions: Record<string, string> = {
        'to-b': 'to bottom',
        'to-r': 'to right',
        'to-br': 'to bottom right',
        'to-bl': 'to bottom left',
      }
      return {
        background: `linear-gradient(${directions[style.gradientDirection]}, ${style.gradientFrom}, ${style.gradientTo})`,
      }
    case 'image':
      return {
        backgroundColor: style.color,
        backgroundImage: style.image ? `url(${style.image})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    default:
      return { backgroundColor: '#000000' }
  }
}

export function getOverlayStyles(style: BackgroundStyle): React.CSSProperties | null {
  if (style.type === 'image' && style.image) {
    return {
      backgroundColor: style.imageOverlayColor,
      opacity: style.imageOverlay / 100,
    }
  }
  return null
}
