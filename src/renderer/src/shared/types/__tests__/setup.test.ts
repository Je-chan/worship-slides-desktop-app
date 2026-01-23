import { describe, it, expect } from 'vitest'

describe('Test Environment', () => {
  it('should work with vitest', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have window.songApi mocked', () => {
    expect(window.songApi).toBeDefined()
    expect(window.songApi.getAll).toBeDefined()
  })

  it('should have window.tagApi mocked', () => {
    expect(window.tagApi).toBeDefined()
    expect(window.tagApi.getAll).toBeDefined()
  })
})
