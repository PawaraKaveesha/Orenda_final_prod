import fs from 'node:fs'
import path from 'node:path'

const dir = path.resolve('src/assets/images')
const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.jpeg'))

function jpegSize(buf) {
  let i = 2
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue }
    const marker = buf[i + 1]
    if (marker === 0xd8 || marker === 0xd9) { i++; continue }
    const len = (buf[i + 2] << 8) | buf[i + 3]
    if ((marker >= 0xc0 && marker <= 0xcf) && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const height = (buf[i + 5] << 8) | buf[i + 6]
      const width = (buf[i + 7] << 8) | buf[i + 8]
      return { width, height }
    }
    i += 2 + len
  }
  return { width: 0, height: 0 }
}

const rows = files
  .map((f) => {
    const buf = fs.readFileSync(path.join(dir, f))
    const { width, height } = jpegSize(buf)
    const orient = height > width ? 'PORTRAIT' : 'landscape'
    return { f, width, height, orient, kb: Math.round(buf.length / 1024) }
  })
  .sort((a, b) => (b.height / (b.width || 1)) - (a.height / (a.width || 1)))

for (const r of rows) {
  const ratio = (r.height / (r.width || 1)).toFixed(2)
  console.log(`${r.orient.padEnd(9)} ${String(r.width).padStart(5)}x${String(r.height).padEnd(5)} ratio ${ratio} ${String(r.kb).padStart(6)}kb  ${r.f}`)
}
