import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTags } from '../useTags'
import { mockTagApi } from '../../../setupTests'

describe('useTags', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadTags', () => {
    it('should load all tags on mount', async () => {
      const mockTags = [
        { id: 1, name: '경배' },
        { id: 2, name: '찬양' }
      ]
      mockTagApi.getAll.mockResolvedValue(mockTags)

      const { result } = renderHook(() => useTags())

      await waitFor(() => {
        expect(result.current.tags).toEqual(mockTags)
      })

      expect(mockTagApi.getAll).toHaveBeenCalledTimes(1)
    })

    it('should set isLoading to false after loading', async () => {
      mockTagApi.getAll.mockResolvedValue([])

      const { result } = renderHook(() => useTags())

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should handle load error', async () => {
      mockTagApi.getAll.mockRejectedValue(new Error('Failed to load'))

      const { result } = renderHook(() => useTags())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.tags).toEqual([])
    })
  })

  describe('toggleTag', () => {
    it('should add tag id when not selected', async () => {
      mockTagApi.getAll.mockResolvedValue([{ id: 1, name: '경배' }])

      const { result } = renderHook(() => useTags())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.toggleTag(1)
      })

      expect(result.current.selectedTagIds).toContain(1)
    })

    it('should remove tag id when already selected', async () => {
      mockTagApi.getAll.mockResolvedValue([{ id: 1, name: '경배' }])

      const { result } = renderHook(() => useTags({ initialSelectedIds: [1] }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.selectedTagIds).toContain(1)

      act(() => {
        result.current.toggleTag(1)
      })

      expect(result.current.selectedTagIds).not.toContain(1)
    })
  })

  describe('createTag', () => {
    it('should create a new tag and add to list', async () => {
      const existingTags = [{ id: 1, name: '경배' }]
      const newTag = { id: 2, name: '찬양' }

      mockTagApi.getAll.mockResolvedValue(existingTags)
      mockTagApi.create.mockResolvedValue(newTag)

      const { result } = renderHook(() => useTags())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.createTag('찬양')
      })

      expect(mockTagApi.create).toHaveBeenCalledWith('찬양')
      expect(result.current.tags).toContainEqual(newTag)
      expect(result.current.selectedTagIds).toContain(2)
    })

    it('should not create duplicate tag', async () => {
      const existingTags = [{ id: 1, name: '경배' }]
      mockTagApi.getAll.mockResolvedValue(existingTags)

      const { result } = renderHook(() => useTags())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        const created = await result.current.createTag('경배')
        expect(created).toBe(false)
      })

      expect(mockTagApi.create).not.toHaveBeenCalled()
    })

    it('should not create empty tag', async () => {
      mockTagApi.getAll.mockResolvedValue([])

      const { result } = renderHook(() => useTags())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        const created = await result.current.createTag('  ')
        expect(created).toBe(false)
      })

      expect(mockTagApi.create).not.toHaveBeenCalled()
    })
  })

  describe('setSelectedTagIds', () => {
    it('should update selected tag ids', async () => {
      mockTagApi.getAll.mockResolvedValue([
        { id: 1, name: '경배' },
        { id: 2, name: '찬양' }
      ])

      const { result } = renderHook(() => useTags())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setSelectedTagIds([1, 2])
      })

      expect(result.current.selectedTagIds).toEqual([1, 2])
    })
  })

  describe('isTagSelected', () => {
    it('should return true for selected tag', async () => {
      mockTagApi.getAll.mockResolvedValue([{ id: 1, name: '경배' }])

      const { result } = renderHook(() => useTags({ initialSelectedIds: [1] }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isTagSelected(1)).toBe(true)
      expect(result.current.isTagSelected(2)).toBe(false)
    })
  })
})
