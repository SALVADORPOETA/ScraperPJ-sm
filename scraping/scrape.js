const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const LIST_ID = process.argv[2]
if (!LIST_ID) {
  console.error('❌ Debes proporcionar el id de la lista: node scrape.js <id>')
  process.exit(1)
}

const BASE_URL = 'https://candidaturaspoderjudicial.ine.mx'

// Directorios
const OUTPUT_DIR = path.join(__dirname, 'output')
const ENLACES_DIR = path.join(OUTPUT_DIR, 'enlaces')
const PROGRESS_DIR = path.join(OUTPUT_DIR, 'progress')

// Crear carpetas si no existen
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR)
if (!fs.existsSync(ENLACES_DIR)) fs.mkdirSync(ENLACES_DIR)
if (!fs.existsSync(PROGRESS_DIR)) fs.mkdirSync(PROGRESS_DIR)

// Archivos
const OUTPUT_FILE = path.join(ENLACES_DIR, `enlaces_electos_${LIST_ID}.json`)
const PROGRESS_FILE = path.join(PROGRESS_DIR, `progress_${LIST_ID}.json`)

const MAX_RETRIES = 3
const DELAY_BETWEEN_PAGES = 4000

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

function guardarProgreso(progreso) {
  const progresoReducido = {
    page: progreso.page,
    totalEnlaces: progreso.totalEnlaces,
  }
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progresoReducido, null, 2))
}

function leerProgreso() {
  try {
    const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
    return {
      page: data.page || 1,
      totalEnlaces: data.totalEnlaces || 0,
    }
  } catch {
    return { page: 1, totalEnlaces: 0 }
  }
}

function leerEnlacesExistentes() {
  try {
    const data = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

async function scrapeElectos(listId) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1200, height: 800 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-position=50,50',
    ],
  })

  const page = await browser.newPage()
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  )

  let progreso = leerProgreso()
  let totalLinks = leerEnlacesExistentes()
  let pageNumber = progreso.page

  console.log(
    `🌐 Iniciando scraping de lista ${listId} desde página ${pageNumber}`
  )

  await page.goto(`${BASE_URL}/conoceTuNuevoPoderJudicial/${listId}`, {
    waitUntil: 'domcontentloaded',
  })

  while (true) {
    let exito = false

    for (let intento = 1; intento <= MAX_RETRIES; intento++) {
      try {
        if (pageNumber > 1) {
          const pageButton = await page.$(
            `li.ant-pagination-item-${pageNumber}`
          )
          if (pageButton) {
            await pageButton.click()
            await delay(2000)
          } else {
            console.log(`⚠️ No hay más páginas. Finalizando scraping.`)
            await browser.close()
            return
          }
        }

        await page.waitForSelector('.linkDetalleCandidato', { timeout: 60000 })

        const enlaces = await page.evaluate(() =>
          Array.from(document.querySelectorAll('.linkDetalleCandidato'))
            .map((a) => a.href)
            .filter(Boolean)
        )

        console.log(
          `✅ Página ${pageNumber}: ${enlaces.length} enlaces encontrados`
        )

        totalLinks = Array.from(new Set([...totalLinks, ...enlaces]))

        guardarProgreso({
          page: pageNumber + 1,
          totalEnlaces: totalLinks.length,
        })

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(totalLinks, null, 2))

        exito = true
        break
      } catch (err) {
        console.warn(
          `⚠️ Fallo en página ${pageNumber} (intento ${intento}): ${err.message}`
        )
        await delay(3000)
      }
    }

    if (!exito) {
      console.error(`🚨 No se pudo procesar la página ${pageNumber}.`)
      break
    }

    pageNumber++
    await delay(DELAY_BETWEEN_PAGES)
  }

  console.log(`🎉 Scraping completado. ${totalLinks.length} enlaces guardados.`)

  await browser.close()
}

scrapeElectos(LIST_ID)
