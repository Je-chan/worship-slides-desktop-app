import { describe, it, expect, expectTypeOf } from 'vitest'
import type {
  Song,
  Slide,
  Tag,
  PresentationSlide,
  SongWithTags
} from '../index'

describe('Shared Types', () => {
  describe('Song', () => {
    it('should have correct structure', () => {
      const song: Song = {
        id: 1,
        title: '찬양 제목',
        code: 'C',
        order: 1
      }

      expect(song.id).toBe(1)
      expect(song.title).toBe('찬양 제목')
      expect(song.code).toBe('C')
      expect(song.order).toBe(1)
    })

    it('should have correct types', () => {
      expectTypeOf<Song>().toMatchTypeOf<{
        id: number
        title: string
        code: string
        order: number
      }>()
    })
  })

  describe('Slide', () => {
    it('should have correct structure', () => {
      const slide: Slide = {
        id: 1,
        song_id: 1,
        slide_number: 1,
        content: '가사 내용'
      }

      expect(slide.id).toBe(1)
      expect(slide.song_id).toBe(1)
      expect(slide.slide_number).toBe(1)
      expect(slide.content).toBe('가사 내용')
    })
  })

  describe('Tag', () => {
    it('should have correct structure', () => {
      const tag: Tag = {
        id: 1,
        name: '경배'
      }

      expect(tag.id).toBe(1)
      expect(tag.name).toBe('경배')
    })
  })

  describe('PresentationSlide', () => {
    it('should have correct structure', () => {
      const slide: PresentationSlide = {
        songId: 1,
        songTitle: '찬양 제목',
        songCode: 'C',
        songOrder: 1,
        slideNumber: 1,
        content: '가사 내용'
      }

      expect(slide.songId).toBe(1)
      expect(slide.songTitle).toBe('찬양 제목')
    })
  })

  describe('SongWithTags', () => {
    it('should extend Song with tags array', () => {
      const songWithTags: SongWithTags = {
        id: 1,
        title: '찬양 제목',
        code: 'C',
        order: 1,
        tags: [
          { id: 1, name: '경배' },
          { id: 2, name: '찬양' }
        ]
      }

      expect(songWithTags.tags).toHaveLength(2)
      expect(songWithTags.tags[0].name).toBe('경배')
    })
  })
})
