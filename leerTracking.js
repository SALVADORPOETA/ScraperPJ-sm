const https = require('https')
const fs = require('fs')
const path = require('path')
const data = 'todosContactos.json'

// URLs y rutas
const url = 'https://bellumpolitics.com/tracking_api.php'
const backupPath = path.join(__dirname, 'tracking_backup.json')
const contactosPath = path.join(__dirname, data)

// Leer el archivo carlos.json
let contactos = []
try {
  const contactosData = fs.readFileSync(contactosPath, 'utf-8')
  contactos = JSON.parse(contactosData)
} catch (error) {
  console.error('❌ Error al leer carlos.json:', error.message)
  process.exit(1) // Detener ejecución si no hay contactos
}

// Crear un mapa de id => contacto para acceso rápido
const contactosMap = {}
contactos.forEach((c) => {
  contactosMap[c.id] = c.contacto
})

// Obtener logs desde el servidor
https
  .get(url, (res) => {
    let data = ''

    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', () => {
      try {
        const logs = JSON.parse(data)

        console.log('\n📦 Resultados de Tracking:\n')
        logs.forEach((log, index) => {
          // Insertar el campo "contacto" si existe
          log.contacto = contactosMap[log.id] || 'Desconocido'

          console.log(`#${index + 1}`)
          console.log(`🆔 ID: ${log.id}`)
          console.log(`👤 Contacto: ${log.contacto}`)
          console.log(`📅 Fecha y hora: ${log.timestamp}`)
          console.log('------------------------------')
        })

        // Guardar backup local
        fs.writeFileSync(backupPath, JSON.stringify(logs, null, 2), 'utf-8')
        console.log(`\n💾 Backup guardado exitosamente en ${backupPath}\n`)
      } catch (error) {
        console.error('❌ Error al parsear JSON:', error.message)
      }
    })
  })
  .on('error', (err) => {
    console.error('❌ Error al conectarse:', err.message)
  })
