/** 77.2 → "01:17.20" */
export const fmtTime = (t: number): string => {
  const s = Math.max(0, t)
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${(s - m * 60).toFixed(2).padStart(5, '0')}`
}

/** 1536 → "1.5 KB" */
export const fmtSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let v = bytes
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${i === 0 ? v : v.toFixed(1)} ${units[i]}`
}

export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v))
