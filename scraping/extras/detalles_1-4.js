const puppeteer = require('puppeteer')
const fs = require('fs').promises
const path = require('path')

const LIST_ID = process.argv[2]
if (!LIST_ID) {
  console.error(
    '❌ Debes proporcionar el id de la lista: node scrape_detalles.js <id>'
  )
  process.exit(1)
}

// Delay aleatorio entre 2 y 5 segundos
const randomDelay = () =>
  new Promise((res) => setTimeout(res, 2000 + Math.random() * 3000))

// Delay fijo en ms
const fixedDelay = (ms) => new Promise((res) => setTimeout(res, ms))

const MAX_RETRIES = 3
const OUTPUT_DIR = path.join(__dirname, 'output')

async function scrapeCandidatosDetalles(listId) {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
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

  const enlacesFile = path.join(OUTPUT_DIR, `enlaces_electos_${listId}.json`)
  const rawData = await fs.readFile(enlacesFile, 'utf-8')
  const links = JSON.parse(rawData)

  const resultados = []

  console.log(`🌐 Procesando lista ${listId} (${links.length} enlaces)`)

  for (let i = 0; i < links.length; i++) {
    const url = links[i]
    console.log(`🟡 Procesando ${i + 1}/${links.length}: ${url}`)

    let intentos = 0
    let exito = false

    while (intentos < MAX_RETRIES && !exito) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })

        // Espera hasta 60s a que el selector aparezca
        await page.waitForSelector('[data-det="nombreCandidato"]', {
          timeout: 60000,
        })

        // Delay fijo de 3s para asegurar que el contenido dinámico cargue
        await fixedDelay(3000)

        // Verifica si el selector existe antes de evaluar
        const existeNombre = await page.$('[data-det="nombreCandidato"]')
        if (!existeNombre) {
          resultados.push({
            url,
            error: 'Selector no encontrado o datos no disponibles',
          })
          break
        }

        // Extraer datos
        const datos = await page.evaluate(() => {
          const getText = (selector) => {
            const el = document.querySelector(selector)
            return el ? el.textContent.trim() : 'No disponible'
          }

          const nombre = getText('[data-det="nombreCandidato"]')
          const telefono = getText('[data-det="telefonoPublico"]')
          const sexo = getText('[data-det="sexo"]')

          const correos = Array.from(
            document.querySelectorAll('[data-det="correoElecPublico"]')
          )
            .map((el) => el.textContent.trim())
            .filter((txt) => txt.includes('@'))

          const correo =
            correos.length > 0 ? correos[0] : 'Correo no disponible'

          return { nombre, telefono, correo, sexo }
        })

        resultados.push({ url, ...datos })
        exito = true
        await randomDelay()
      } catch (error) {
        intentos++
        console.warn(
          `⚠️ Fallo en ${url} (intento ${intentos}): ${error.message}`
        )
        if (intentos === MAX_RETRIES) {
          resultados.push({ url, error: 'Error tras múltiples intentos' })
        } else {
          await randomDelay()
        }
      }
    }
  }

  const salidaPath = path.join(OUTPUT_DIR, `datos_candidatos_${listId}.json`)
  await fs.writeFile(salidaPath, JSON.stringify(resultados, null, 2), 'utf-8')
  console.log(`✅ Lista ${listId} procesada. Datos guardados en ${salidaPath}`)

  await browser.close()
}

scrapeCandidatosDetalles(LIST_ID)
