import { expect, test } from 'vitest'
import { byteRange } from './range'

test('no header means the whole file', () => {
  expect(byteRange(null, 100)).toBeNull()
})

test('start and end are inclusive and clamped to the file', () => {
  expect(byteRange('bytes=0-9', 100)).toEqual({ start: 0, end: 9 })
  expect(byteRange('bytes=90-', 100)).toEqual({ start: 90, end: 99 })
  expect(byteRange('bytes=90-500', 100)).toEqual({ start: 90, end: 99 })
})

test('a suffix range is the last N bytes', () => {
  expect(byteRange('bytes=-10', 100)).toEqual({ start: 90, end: 99 })
})

test('ranges outside the file or malformed are invalid', () => {
  expect(byteRange('bytes=100-', 100)).toBe('invalid')
  expect(byteRange('bytes=5-2', 100)).toBe('invalid')
  expect(byteRange('bytes=-', 100)).toBe('invalid')
  expect(byteRange('items=0-1', 100)).toBe('invalid')
  expect(byteRange('bytes=0-', 0)).toBe('invalid')
})
