const puppeteer = require('puppeteer')
const fs = require('fs').promises
const path = require('path')
const pj = 1

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

  const filePath = path.join(__dirname, `enlaces${pj}.json`)
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

          // Buscar el div ant-card-body que contiene el h2 con id="titulo-propuestas"
          const cardBody = Array.from(
            document.querySelectorAll('.ant-card-body')
          ).find((card) => card.querySelector('#titulo-propuestas'))

          if (!cardBody) return { propuestas: 'No disponibles' }

          // Ahora que tenemos el div correcto, buscamos los span con clase "ajustar"
          const propuestas = Array.from(cardBody.querySelectorAll('.ajustar'))
            .slice(0, 3) // Obtener solo las tres primeras propuestas
            .map((el) => el.textContent.trim())

          // Si no encontramos suficientes propuestas, las marcamos como no disponibles
          while (propuestas.length < 3) {
            propuestas.push('Propuesta no disponible')
          }

          return {
            nombre: getText('[data-det="nombreCandidato"]'),
            telefono: getText('[data-det="telefonoPublico"]'),
            correo: getText('[data-det="correoElecPublico"]'),
            sexo: getText('[data-det="sexo"]'),
            propuestas1: propuestas[0],
            propuestas2: propuestas[1],
            propuestas3: propuestas[2],
          }
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

  const salidaPath = path.join(__dirname, `propuestas${pj}.json`)
  await fs.writeFile(salidaPath, JSON.stringify(resultados, null, 2), 'utf-8')

  console.log(`✅ Proceso terminado. Datos guardados en ${salidaPath}`)
}

scrapeCandidatosDetalles()
