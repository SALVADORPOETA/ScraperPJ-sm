const fs = require('fs')
const pj = 6

// Leer ambos archivos
const mensajesCorrectos = JSON.parse(
  fs.readFileSync(`mensajes${pj}.json`, 'utf-8')
)
const mensajesIncorrectos = JSON.parse(
  fs.readFileSync(`mensajes1${pj}.json`, 'utf-8')
)

// Asegurar que tengan la misma longitud (opcional, solo para seguridad)
if (mensajesCorrectos.length !== mensajesIncorrectos.length) {
  console.warn(
    '⚠️ Los archivos tienen diferente cantidad de objetos. Solo se actualizarán hasta el más corto.'
  )
}

// Actualizar intro y mensaje por índice
const mensajesActualizados = mensajesIncorrectos.map((obj, index) => {
  const reemplazo = mensajesCorrectos[index]
  return {
    ...obj,
    status: reemplazo?.status ?? obj.status,
    intro: reemplazo?.intro ?? obj.intro,
    mensaje: reemplazo?.mensaje ?? obj.mensaje,
  }
})

// Guardar el nuevo archivo
fs.writeFileSync(
  `mensajes1${pj}_actualizado.json`,
  JSON.stringify(mensajesActualizados, null, 2),
  'utf-8'
)

console.log('✅ Actualización por índice completada.')
