const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')

const args = process.argv.slice(2)
if (args.length === 0) {
  console.log('❌ Debes proporcionar un ID. Ejemplo: node detalles.js 7')
  process.exit(1)
}

const id = args[0]

// Directorios
const OUTPUT_DIR = path.join(__dirname, 'output')
const ENLACES_DIR = path.join(OUTPUT_DIR, 'enlaces')
const DATOS_DIR = path.join(OUTPUT_DIR, 'datos')
const ERROR_DIR = path.join(OUTPUT_DIR, 'errores')
const PROGRESS_DIR = path.join(OUTPUT_DIR, 'progress')

// Crear carpetas
;[OUTPUT_DIR, ENLACES_DIR, DATOS_DIR, ERROR_DIR, PROGRESS_DIR].forEach(
  (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)
  }
)

// Archivos
const INPUT_FILE = path.join(ENLACES_DIR, `enlaces_electos_${id}.json`)
const OUTPUT_FILE = path.join(DATOS_DIR, `datos_candidatos_${id}.json`)
const PROGRESS_FILE = path.join(PROGRESS_DIR, `progress_datos_${id}.json`)

if (!fs.existsSync(INPUT_FILE)) {
  console.error(`❌ No existe el archivo de enlaces: ${INPUT_FILE}`)
  process.exit(1)
}

// Leer enlaces
const enlaces = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'))

// Leer progreso
function leerProgreso() {
  try {
    const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'))
    return data.index || 0
  } catch {
    return 0
  }
}

// Guardar progreso
function guardarProgreso(index) {
  fs.writeFileSync(
    PROGRESS_FILE,
    JSON.stringify(
      {
        index,
        totalProcesados: index,
      },
      null,
      2
    )
  )
}

// Leer resultados existentes si hay
let resultados = []
if (fs.existsSync(OUTPUT_FILE)) {
  resultados = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'))
}

;(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    protocolTimeout: 120000,
    args: [
      '--window-size=900,800',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 850, height: 700 })

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false })
  })

  let startIndex = leerProgreso()

  console.log(
    `🔁 Retomando scraping desde el enlace ${startIndex + 1}/${enlaces.length}`
  )

  for (let i = startIndex; i < enlaces.length; i++) {
    const url = enlaces[i]
    console.log(`\n🔄 [${i + 1}/${enlaces.length}] ${url}`)

    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 90000,
      })

      await page.evaluate(() => window.scrollBy(0, 300))
      await new Promise((r) => setTimeout(r, 3000))

      await page.waitForSelector('[data-det="nombreCandidato"]', {
        visible: true,
        timeout: 40000,
      })

      const datos = await page.evaluate(() => {
        const getText = (s) =>
          document.querySelector(s)?.textContent.trim() || 'No disponible'

        const correos = Array.from(
          document.querySelectorAll('[data-det="correoElecPublico"]')
        )
          .map((el) => el.textContent.trim())
          .filter((t) => t.includes('@'))

        return {
          nombre: getText('[data-det="nombreCandidato"]'),
          telefono: getText('[data-det="telefonoPublico"]'),
          correo: correos[0] || 'No disponible',
          sexo: getText('[data-det="sexo"]'),
        }
      })

      resultados.push({ url, ...datos })
      console.log(`   ✅ ${datos.nombre}`)
    } catch (error) {
      console.warn(`   ⚠️ ${error.message.substring(0, 60)}...`)

      try {
        await page.screenshot({
          path: path.join(ERROR_DIR, `error_${id}_${i}.png`),
          timeout: 5000,
        })
      } catch {}

      resultados.push({ url, error: 'Timeout/No encontrado' })
    }

    // Guardados críticos
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(resultados, null, 2))
    guardarProgreso(i + 1)

    await new Promise((r) => setTimeout(r, 2000))
  }

  console.log('\n✅ Scraping completado al 100%')
  await browser.close()
})()
