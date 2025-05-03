const puppeteer = require('puppeteer')

async function scrapeCandidatos() {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  await page.goto('https://candidaturaspoderjudicial.ine.mx/', {
    waitUntil: 'networkidle0',
  })

  // Espera todos los encabezados del colapso
  await page.waitForSelector('.ant-collapse-header')

  // Selecciona el panel que contiene el texto "Juezas y jueces de Distrito" y haz clic
  const headers = await page.$$('.ant-collapse-header')

  for (let header of headers) {
    const text = await page.evaluate((el) => el.textContent, header)
    if (text.includes('Juezas y jueces de Distrito')) {
      await header.click()
      break
    }
  }

  // Espera a que aparezcan los enlaces después de hacer clic
  await page.waitForSelector('.div-FConsulta')

  const urls = await page.evaluate(() => {
    const enlaces = Array.from(document.querySelectorAll('.div-FConsulta'))
    return enlaces
      .map((enlace) => {
        const href = enlace.getAttribute('href')
        const fullUrl = 'https://candidaturaspoderjudicial.ine.mx' + href
        return href && !href.endsWith('.mxnull') ? fullUrl : null
      })
      .filter((url) => url !== null)
  })

  console.log(urls)

  await browser.close()
}

scrapeCandidatos()
