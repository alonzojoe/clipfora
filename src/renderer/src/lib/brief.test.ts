import { expect, test } from 'vitest'
import type { Resource } from '../../../shared/types'
import { buildBrief } from './brief'
import { fmtSize, fmtTime } from './format'

const file = (path: string, missing = false): Resource => ({
  id: path,
  path,
  name: path.split('/').pop() ?? path,
  kind: 'video',
  size: 1,
  url: `clip://media/${path}`,
  missing
})

test('the brief joins info, files and prompt in that order', () => {
  const brief = buildBrief(' Tag @brand. ', [file('/Movies/a.mp4')], 'Five clips, 30 seconds each')
  expect(brief).toBe(
    [
      'Make vertical 9:16 clips (1080 x 1920).',
      'Campaign info:\nTag @brand.',
      'Source files:\n- /Movies/a.mp4',
      'What to make:\nFive clips, 30 seconds each'
    ].join('\n\n')
  )
})

test('empty parts and missing files are left out', () => {
  expect(buildBrief('', [file('/Movies/gone.mp4', true)], '  ')).toBe(
    'Make vertical 9:16 clips (1080 x 1920).'
  )
})

test('time and size read the way the panels show them', () => {
  expect(fmtTime(77.2)).toBe('01:17.20')
  expect(fmtTime(-1)).toBe('00:00.00')
  expect(fmtSize(512)).toBe('512 B')
  expect(fmtSize(1536)).toBe('1.5 KB')
  expect(fmtSize(3 * 1024 ** 3)).toBe('3.0 GB')
})
