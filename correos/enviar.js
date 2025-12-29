const fs = require('fs')
const nodemailer = require('nodemailer')
const generarMensajeHTML = require('./generarMensajeHTML')
const pj = 1
require('dotenv').config()

const EMAIL_DIARIO = 100
// const CONTACTOS_PATH = `./mensajes${pj}.json`
const CONTACTOS_PATH = './carlos.json'
const PROGRESS_PATH = './progress.json'
const ENABLE_TRACKING = true

// Tu configuración SMTP (ajústala)
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Carga contactos
const contactos = JSON.parse(fs.readFileSync(CONTACTOS_PATH, 'utf-8'))

// Carga progreso
let startIndex = 0
if (fs.existsSync(PROGRESS_PATH)) {
  const saved = JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf-8'))
  startIndex = saved.ultimoIndice || 0
}

let enviados = 0
let omitidos = 0
const limite = Math.min(startIndex + EMAIL_DIARIO, contactos.length)

;(async () => {
  for (let i = startIndex; i < limite; i++) {
    const contacto = contactos[i]

    // Evitar contactos sin correo válido
    const correoValido =
      contacto.correo &&
      contacto.correo.includes('@') &&
      contacto.correo.trim() !== ''

    if (!correoValido) {
      omitidos++
      console.warn(
        `⚠️ Omitido por falta de correo válido: ${contacto.contacto}`
      )
      continue
    }

    const mensajeHTML = generarMensajeHTML(contacto.nombre, contacto.sexo)
    const trackingPixel = `<img src="https://bellumpolitics.com/tracking.php?id=${encodeURIComponent(
      contacto.id
    )}" width="1" height="1" style="display:none;" />`

    const mailOptions = {
      from: `"Romeo Ahuja - BellumPolitics" <${process.env.SMTP_USER}>`,
      to: contacto.correo,
      subject: '¿Vas a dejar pasar tu ÚNICA OPORTUNIDAD de ganar la elección?',
      html: mensajeHTML + (ENABLE_TRACKING ? trackingPixel : ''),
    }

    // Dentro del ciclo principal
    try {
      // Comentar en las pruebas. Descomentar cuando vaya a enviar los correos.
      await transporter.sendMail(mailOptions)
      enviados++

      console.log(`
  🔢 Índice: ${i}
  📤 Enviado a: ${contacto.correo}
  👤 Contacto: ${contacto.contacto}
  📨 Asunto: ${mailOptions.subject}
  📄 Mensaje (preview): ${mensajeHTML.slice(0, 200)}...
  ------------------------------------------------------------
      `)
    } catch (error) {
      console.error(`❌ Error al enviar a ${contacto.correo}:`, error.message)
      omitidos++
    }

    // Esperar 1 segundo entre correos
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  // Guardar progreso
  fs.writeFileSync(
    PROGRESS_PATH,
    JSON.stringify({ ultimoIndice: limite }, null, 2)
  )

  // Resumen
  console.log('\n📊 Resumen del envío:')
  console.log(`Enviados: ${enviados}`)
  console.log(`Omitidos (sin correo o error): ${omitidos}`)
  console.log(`Último índice guardado: ${limite}`)
})()
