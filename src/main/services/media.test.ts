import { expect, test } from 'vitest'
import { importable, kindOf, mimeOf } from './media'

test('kindOf reads the extension, whatever its case', () => {
  expect(kindOf('/Movies/Stream.MP4')).toBe('video')
  expect(kindOf('/Music/voice.m4a')).toBe('audio')
  expect(kindOf('/Pictures/logo.png')).toBe('image')
  expect(kindOf('/Documents/notes.txt')).toBeNull()
})

test('mimeOf falls back to a binary type', () => {
  expect(mimeOf('/a/b.mov')).toBe('video/quicktime')
  expect(mimeOf('/a/b.xyz')).toBe('application/octet-stream')
})

test('importable refuses relative paths, unknown types and hidden folders', () => {
  expect(importable('/Users/joe/Movies/stream.mp4')).toBe(true)
  expect(importable('Movies/stream.mp4')).toBe(false)
  expect(importable('/Users/joe/notes.txt')).toBe(false)
  expect(importable('/Users/joe/.ssh/key.png')).toBe(false)
})
