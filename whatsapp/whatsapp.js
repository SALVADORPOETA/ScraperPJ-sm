const pj = 6
const puppeteer = require('puppeteer')
// const contactos = require('./carlos.json')
const contactos = require(`./mensajes${pj}.json`)
// const contactos = require('./todosContactos.json')
const fs = require('fs')
const path = require('path')

// Función para limpiar números de teléfono
function limpiarNumero(numero) {
  return numero.replace(/\D/g, '')
}

// Crear carpeta de sesión si no existe
const sessionPath = path.join(__dirname, 'session')
if (!fs.existsSync(sessionPath)) {
  fs.mkdirSync(sessionPath)
}

// Función para leer el progreso de 'progressWhats.json'
function leerProgreso() {
  try {
    return JSON.parse(fs.readFileSync('progressWhats.json'))
  } catch (error) {
    console.log("📁 El archivo 'progressWhats.json' no existe, creando...")
    return { index: 0 } // Valor predeterminado
  }
}

// Función para guardar el progreso en 'progressWhats.json'
function guardarProgreso(progreso) {
  fs.writeFileSync('progressWhats.json', JSON.stringify(progreso, null, 2))
  console.log(`✔️ Progreso guardado en 'progressWhats.json'.`)
}

// Configuración de la cantidad de mensajes diarios
const MENSAJE_DIARIO = 10 // Cambia este número según lo que necesites

;(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: './session', // 👉 Guarda sesión aquí
    defaultViewport: null,
    args: ['--start-maximized'],
  })

  const page = await browser.newPage()
  await page.goto('https://web.whatsapp.com')

  // Esperamos a que el usuario esté logueado
  console.log(
    '🚀 Asegúrate de que WhatsApp esté abierto y cargado. Presiona Enter aquí cuando estés listo...'
  )
  process.stdin.once('data', async () => {
    // Cargar el progreso previo
    const progreso = leerProgreso()
    console.log(`🔄 Progreso cargado: el índice actual es ${progreso.index}`)

    let cantidadEnviada = 0
    for (let i = progreso.index; i < contactos.length; i++) {
      if (cantidadEnviada >= MENSAJE_DIARIO) break // Detener si hemos enviado los mensajes diarios

      const contacto = contactos[i]
      try {
        if (!contacto.telefono) {
          console.log('❌ Contacto sin número, saltando...')
          continue
        }

        const telefonoLimpio = limpiarNumero(contacto.telefono)

        if (telefonoLimpio.length === 0) {
          console.log('❌ Teléfono vacío tras limpiar, saltando...')
          continue
        }

        const numeroConPrefijo = `52${telefonoLimpio}`
        const mensaje = contacto.intro || ''
        const nombreContacto = contacto.contacto || ''

        if (mensaje.trim() === '') {
          console.log(
            `⚠️ Contacto ${numeroConPrefijo} sin mensaje, saltando...`
          )
          continue
        }

        const url = `https://web.whatsapp.com/send?phone=${numeroConPrefijo}&text=${encodeURIComponent(
          mensaje
        )}`
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })

        await page.waitForSelector('div[contenteditable="true"]', {
          timeout: 15000,
        })

        // Pequeño retraso por seguridad
        await new Promise((res) => setTimeout(res, 1500))

        await page.keyboard.press('Enter')
        console.log(
          `✅ Mensaje enviado a ${numeroConPrefijo} - ${nombreContacto}`
        )

        // Actualizar y guardar progreso
        cantidadEnviada++
        progreso.index = i + 1
        guardarProgreso(progreso)

        // Delay entre envíos
        await new Promise((res) => setTimeout(res, 4000))
      } catch (error) {
        console.log(
          `❌ Error enviando a ${contacto.telefono}: ${error.message}`
        )
        // Delay pequeño antes de seguir
        await new Promise((res) => setTimeout(res, 2000))
      }
    }

    console.log('🏁 Todos los mensajes procesados.')

    // Aseguramos que el navegador se cierre correctamente
    await browser.close()

    // Finalmente, cerramos el proceso de Node.js
    process.exit(0)
  })
})()
