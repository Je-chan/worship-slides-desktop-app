import { z } from 'zod'

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
    .min(1, '코드를 입력해주세요.')
    .max(5, '코드는 5자 이내로 입력해주세요.')
    .regex(/^[a-zA-Z]+$/, '코드는 영문자만 사용할 수 있습니다.')
    .transform((val) => val.toUpperCase()),
  order: z
    .number({ invalid_type_error: '순서를 입력해주세요.' })
    .int('순서는 정수여야 합니다.')
    .min(1, '순서는 1 이상이어야 합니다.'),
  slides: z
    .array(slideSchema)
    .min(1, '최소 하나의 슬라이드가 필요합니다.')
    .refine(
      (slides) => slides.some((slide) => slide.content.trim().length > 0),
      '최소 하나의 가사를 입력해주세요.'
    )
})

export type SlideInput = z.infer<typeof slideSchema>
export type SongCreateFormData = z.infer<typeof songCreateSchema>
