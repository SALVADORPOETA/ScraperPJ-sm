const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')

const args = process.argv.slice(2)
if (args.length === 0) {
  console.log('❌ Debes proporcionar un ID. Ejemplo: node script.js 7')
  process.exit(1)
}

const id = args[0]
const inputFilePath = `./output/enlaces_electos_${id}.json`
const outputFilePath = `./output/datos_candidatos_${id}.json`
const errorDir = './errores'

if (!fs.existsSync(errorDir)) fs.mkdirSync(errorDir, { recursive: true })

let enlaces = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'))

;(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    protocolTimeout: 120000, // 2 minutos de tolerancia para comunicación interna
    args: [
      '--window-size=900,800',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Evita crashes en sistemas con poca memoria
    ],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 850, height: 700 })

  // Evitar que los Service Workers causen lentitud
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false })
  })

  const resultados = []

  for (let i = 0; i < enlaces.length; i++) {
    const url = enlaces[i]
    console.log(`\n🔄 [${i + 1}/${enlaces.length}] Intentando: ${url}`)

    try {
      // Navegación con tiempo de espera generoso
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 90000,
      })

      // Pequeño scroll manual para disparar eventos
      await page.evaluate(() => window.scrollBy(0, 300))

      // Espera manual corta antes de buscar el selector
      await new Promise((r) => setTimeout(r, 3000))

      // Esperar al nombre (aumentamos a 40s)
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

      console.log(`   ✅ Extraído: ${datos.nombre}`)
      resultados.push({ url, ...datos })
    } catch (error) {
      console.warn(`   ⚠️ Error: ${error.message.substring(0, 60)}...`)

      try {
        // Captura con timeout interno para que no rompa el script si falla
        await page.screenshot({
          path: path.join(errorDir, `error_${id}_${i}.png`),
          timeout: 5000,
        })
      } catch (e) {
        console.warn('   ❌ No se pudo tomar la captura.')
      }

      resultados.push({ url, error: 'Timeout/No encontrado' })
    }

    // Guardar progreso cada 5 para seguridad
    if (i % 5 === 0)
      fs.writeFileSync(outputFilePath, JSON.stringify(resultados, null, 2))

    // Espera entre enlaces
    await new Promise((r) => setTimeout(r, 2000))
  }

  fs.writeFileSync(outputFilePath, JSON.stringify(resultados, null, 2))
  console.log(`\n✨ Proceso terminado.`)
  await browser.close()
})()
