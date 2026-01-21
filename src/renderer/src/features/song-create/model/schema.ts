import { z } from 'zod'

// 허용되는 코드 목록
export const ALLOWED_CODES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const
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
  slides: z
    .array(slideSchema)
    .min(1, '최소 하나의 슬라이드가 필요합니다.')
    .refine(
      (slides) => slides.length > 0 && slides[0].content.trim().length > 0,
      '첫 번째 가사 슬라이드는 반드시 입력해야 합니다.'
    )
})

export type SlideInput = z.infer<typeof slideSchema>
export type SongCreateFormData = z.infer<typeof songCreateSchema>
