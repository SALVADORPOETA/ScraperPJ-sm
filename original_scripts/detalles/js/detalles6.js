const puppeteer = require('puppeteer')
const fs = require('fs').promises
const path = require('path')

// Delay aleatorio entre 2 y 5 segundos
const randomDelay = () =>
  new Promise((res) => setTimeout(res, 2000 + Math.random() * 3000))

// Límite de reintentos por página
const MAX_RETRIES = 3

async function scrapeCandidatosDetalles() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50, // Simula comportamiento humano
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()

  // Establecer user-agent para evitar detección por bots
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  )

  const filePath = path.join(__dirname, 'enlaces6.json')
  const rawData = await fs.readFile(filePath, 'utf-8')
  const links = JSON.parse(rawData)

  const resultados = []

  for (let i = 0; i < links.length; i++) {
    const url = links[i]
    console.log(`🟡 Procesando ${i + 1}/${links.length}: ${url}`)

    let intentos = 0
    let exito = false

    while (intentos < MAX_RETRIES && !exito) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })

        await page.waitForSelector('[data-det="nombreCandidato"]', {
          timeout: 5000,
        })

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

        // Espera aleatoria entre candidatos
        await randomDelay()
      } catch (error) {
        intentos++
        console.warn(
          `⚠️  Fallo en ${url} (intento ${intentos}): ${error.message}`
        )

        if (intentos === MAX_RETRIES) {
          resultados.push({ url, error: 'Error tras múltiples intentos' })
        } else {
          await randomDelay() // esperar antes de reintentar
        }
      }
    }
  }

  await browser.close()

  const salidaPath = path.join(__dirname, 'datos_candidatos6.json')
  await fs.writeFile(salidaPath, JSON.stringify(resultados, null, 2), 'utf-8')

  console.log(`✅ Proceso terminado. Datos guardados en ${salidaPath}`)
}

scrapeCandidatosDetalles()
