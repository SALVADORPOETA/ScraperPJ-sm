const puppeteer = require('puppeteer')

;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto(
    'https://candidaturaspoderjudicial.ine.mx/detalleCandidato/52219/11',
    { waitUntil: 'domcontentloaded' }
  )

  await page.waitForSelector('[data-det="nombreCandidato"]')
  await page.waitForSelector('[data-det="telefonoPublico"]')
  await page.waitForSelector('[data-det="correoElecPublico"]')
  await page.waitForSelector('[data-det="sexo"]')

  const datosCandidato = await page.evaluate(() => {
    const nombre = document
      .querySelector('[data-det="nombreCandidato"]')
      .textContent.trim()
    const telefono = document
      .querySelector('[data-det="telefonoPublico"]')
      .textContent.trim()
    const sexo = document.querySelector('[data-det="sexo"]').textContent.trim()

    const correos = Array.from(
      document.querySelectorAll('[data-det="correoElecPublico"]')
    )
      .map((el) => el.textContent.trim())
      .filter((txt) => txt.includes('@'))

    const correo = correos.length > 0 ? correos[0] : 'Correo no disponible'

    return { nombre, telefono, correo, sexo }
  })

  console.log(datosCandidato)

  await browser.close()
})()
