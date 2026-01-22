import { z } from 'zod'

// 허용되는 코드 목록 (도레미파솔라시 순서)
export const ALLOWED_CODES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
export type AllowedCode = (typeof ALLOWED_CODES)[number]

export const slideSchema = z.object({
  id: z.string(),
  content: z.string()
})

export const songCreateSchema = z.object({
  title: z
    .string()
    .min(1, '찬양 제목을 입력해주세요.')
    .max(100, '찬양 제목은 100자 이내로 입력해주세요.'),
  code: z
    .string()
    .min(1, '코드를 선택해주세요.')
    .refine(
      (val) => ALLOWED_CODES.includes(val.toUpperCase() as AllowedCode),
      '코드는 A, B, C, D, E, F, G 중 하나여야 합니다.'
    )
    .transform((val) => val.toUpperCase()),
  order: z
    .number({ invalid_type_error: '순서를 입력해주세요.' })
    .int('순서는 정수여야 합니다.')
    .min(1, '순서는 1 이상이어야 합니다.'),
  lyrics: z
    .string()
    .min(1, '가사를 입력해주세요.')
})

// 가사 텍스트를 슬라이드 배열로 파싱하는 유틸 함수
export function parseLyricsToSlides(lyrics: string): string[] {
  // 빈 줄(두 개 이상의 연속 줄바꿈)을 기준으로 슬라이드 분리
  return lyrics
    .split(/\n\s*\n/)
    .map((slide) => slide.trim())
    .filter((slide) => slide.length > 0)
}

// 슬라이드 배열을 가사 텍스트로 합치는 유틸 함수
export function slidesToLyrics(slides: string[]): string {
  return slides.join('\n\n')
}

export type SlideInput = z.infer<typeof slideSchema>
export type SongCreateFormData = z.infer<typeof songCreateSchema>
