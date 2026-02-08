import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { PNG } from 'pngjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')

const size = 192
// Blue (#2563eb) for health app - RGB: 37, 99, 235
const r = 37, g = 99, b = 235

function createIcon(filename) {
  return new Promise((resolve, reject) => {
    const png = new PNG({ width: size, height: size, filterType: -1 })

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (size * y + x) << 2
        const cx = size / 2
        const cy = size / 2
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        const inCircle = dist < size * 0.4
        if (inCircle) {
          png.data[idx] = r
          png.data[idx + 1] = g
          png.data[idx + 2] = b
          png.data[idx + 3] = 255
        } else {
          png.data[idx] = 255
          png.data[idx + 1] = 255
          png.data[idx + 2] = 255
          png.data[idx + 3] = 255
        }
      }
    }

    const chunks = []
    png.pack()
      .on('data', (chunk) => chunks.push(chunk))
      .on('end', () => {
        fs.writeFileSync(path.join(publicDir, filename), Buffer.concat(chunks))
        console.log(`Created ${filename}`)
        resolve()
      })
      .on('error', reject)
  })
}

async function main() {
  await createIcon('pwa-192x192.png')
  await createIcon('apple-touch-icon.png')
}

main().catch(console.error)
