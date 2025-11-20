import { describe, it, expect } from 'vitest'
import { reorderArray, moveUp, moveDown } from '@/utils/reorder'

describe('reorder utils', () => {
  it('reorderArray moves item from index to index', () => {
    const arr = ['a', 'b', 'c', 'd']
    expect(reorderArray(arr, 1, 3)).toEqual(['a', 'c', 'd', 'b'])
  })

  it('moveUp moves element up by one', () => {
    const arr = ['a', 'b', 'c']
    expect(moveUp(arr, 2)).toEqual(['a', 'c', 'b'])
  })

  it('moveDown moves element down by one', () => {
    const arr = ['a', 'b', 'c']
    expect(moveDown(arr, 0)).toEqual(['b', 'a', 'c'])
  })

  it('out-of-bounds indices return original array', () => {
    const arr = ['a', 'b']
    expect(reorderArray(arr, -1, 1)).toEqual(['a', 'b'])
    expect(reorderArray(arr, 0, 2)).toEqual(['a', 'b'])
  })

  it('no-op when from==to', () => {
    const arr = ['a', 'b']
    expect(reorderArray(arr, 1, 1)).toEqual(['a', 'b'])
  })
})
