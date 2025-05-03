const fs = require('fs')
const pj = 6

// Leer el archivo mensajes1.json
const data = JSON.parse(fs.readFileSync(`mensajes${pj}.json`, 'utf8'))

// Filtrar solo los campos "contacto" y "correo"
const contactosFiltrados = data.map(({ contacto, telefono, correo }) => ({
  contacto,
  telefono,
  correo,
}))

// Guardar el nuevo array en contactosFiltrados.json
fs.writeFileSync(
  `contactosFiltrado${pj}.json`,
  JSON.stringify(contactosFiltrados, null, 2),
  'utf8'
)

console.log(`Archivo contactosFiltrados${pj}.json creado con éxito.`)
