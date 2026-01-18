const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

async function scrapePDFLinks() {
  // Rutas de archivos
  const inputPath = path.join(__dirname, '../datos_json/datos_candidatos5.json')
  const outputPath = path.join(
    __dirname,
    '../datos_json/datos_candidatos_con_pdf.json',
  )

  // Leer el archivo JSON original
  const candidatos = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))
  const resultados = []

  console.log(`Iniciando scraping de ${candidatos.length} candidatos...`)

  const browser = await puppeteer.launch({
    headless: 'new', // "new" es la versión recomendada en versiones recientes
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  // Configurar un User-Agent para parecer un navegador real
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  )

  for (let i = 0; i < candidatos.length; i++) {
    const candidato = candidatos[i]
    console.log(
      `[${i + 1}/${candidatos.length}] Procesando: ${candidato.nombre}`,
    )

    try {
      await page.goto(candidato.url, {
        waitUntil: 'networkidle2',
        timeout: 60000,
      })

      // Esperar a que el botón de descarga aparezca en el DOM
      const selectorDescarga = 'a.focus-btn-descarga'
      await page.waitForSelector(selectorDescarga, { timeout: 10000 })

      // Extraer el href del elemento
      const pdfUrl = await page.evaluate((sel) => {
        const anchor = document.querySelector(sel)
        return anchor ? anchor.href : null
      }, selectorDescarga)

      // Agregar el nuevo dato al objeto del candidato
      resultados.push({
        ...candidato,
        url_pdf: pdfUrl,
      })
    } catch (error) {
      console.error(`Error en ${candidato.nombre}: ${error.message}`)
      resultados.push({
        ...candidato,
        url_pdf: 'Error al obtener enlace',
      })
    }

    // Guardar progreso cada 50 registros para evitar pérdida de datos si falla
    if (i % 50 === 0) {
      fs.writeFileSync(outputPath, JSON.stringify(resultados, null, 2))
    }
  }

  // Guardado final
  fs.writeFileSync(outputPath, JSON.stringify(resultados, null, 2))
  console.log('✅ Proceso finalizado. Datos guardados en:', outputPath)

  await browser.close()
}

scrapePDFLinks()
