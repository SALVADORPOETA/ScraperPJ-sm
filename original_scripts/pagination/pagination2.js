const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

async function scrapeCandidatos() {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  await page.goto('https://candidaturaspoderjudicial.ine.mx/', {
    waitUntil: 'networkidle0',
  })

  // Expandir el panel "Magistradas y magistrados del Tribunal de Disciplina Judicial"
  await page.waitForSelector('.ant-collapse-header')
  const headers = await page.$$('.ant-collapse-header')
  for (let header of headers) {
    const text = await page.evaluate((el) => el.textContent, header)
    if (
      text.includes(
        'Magistradas y magistrados del Tribunal de Disciplina Judicial'
      )
    ) {
      await header.click()
      break
    }
  }

  await page.waitForSelector('.div-FConsulta')

  let totalLinks = []
  let pageNumber = 1

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  while (pageNumber <= 4) {
    console.log(`📄 Cargando página ${pageNumber}...`)

    const urls = await page.evaluate(() => {
      const enlaces2 = Array.from(document.querySelectorAll('.div-FConsulta'))
      return enlaces2
        .map((enlace) => {
          const href = enlace.getAttribute('href')
          const fullUrl = 'https://candidaturaspoderjudicial.ine.mx' + href
          return href && !href.endsWith('.mxnull') ? fullUrl : null
        })
        .filter((url) => url !== null)
    })

    totalLinks = Array.from(new Set(totalLinks.concat(urls)))

    console.log(`✅ Página ${pageNumber} - ${urls.length} enlaces`)

    // Guardar respaldo parcial cada 25 páginas
    // if (pageNumber % 25 === 0 || pageNumber === 4) {
    //   const partFileName = path.join(
    //     __dirname,
    //     `enlaces2_parte_${pageNumber}.json`
    //   )
    //   fs.writeFileSync(partFileName, JSON.stringify(totalLinks, null, 2))
    //   console.log(`📝 Respaldo parcial guardado: ${partFileName}`)
    // }

    // Navegar a la siguiente página si no hemos llegado al final
    if (pageNumber < 4) {
      try {
        const nextPageButton = await page.$(
          `li.ant-pagination-item-${pageNumber + 1}`
        )
        if (nextPageButton) {
          await nextPageButton.click()
          await delay(5000) // Esperar 5 segundos
          pageNumber++
        } else {
          console.log('⚠️ Botón de siguiente página no encontrado.')
          break
        }
      } catch (error) {
        console.error('🚨 Error al avanzar de página:', error)
        break
      }
    } else {
      break
    }
  }

  // Guardar todos los enlaces en un solo archivo
  const finalPath = path.join(__dirname, 'enlaces2.json')
  const uniqueLinks = Array.from(new Set(totalLinks))
  fs.writeFileSync(finalPath, JSON.stringify(uniqueLinks, null, 2))
  console.log(
    `🎉 ¡Listo! Se guardaron ${uniqueLinks.length} enlaces únicos en ${finalPath}`
  )
  console.log(
    `🔁 Se eliminaron ${totalLinks.length - uniqueLinks.length} duplicados`
  )

  await browser.close()
}

scrapeCandidatos()
