const fs = require('fs')
const { obtenerMensaje } = require('./mensajesNew.js')
const pj = 6

// Leer archivo original
const candidatos = JSON.parse(
  fs.readFileSync(`./datos_candidatos${pj}.json`, 'utf-8')
)

// Lista de números romanos del 1 al 10
const numerosRomanos = [
  'I',
  'II',
  'III',
  'IIII',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
]

// Detecta si una palabra es un número romano válido
const contieneNumeroRomano = (nombre) => {
  const partes = nombre.split(' ')
  return partes.some((p) => numerosRomanos.includes(p.toUpperCase()))
}

// Capitaliza nombre preservando números romanos en mayúsculas
const capitalizarNombre = (nombre) => {
  return nombre
    .split(' ')
    .map((p) => {
      const palabra = p.trim()
      if (numerosRomanos.includes(palabra.toUpperCase())) {
        return palabra.toUpperCase()
      } else {
        return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()
      }
    })
    .join(' ')
}

// Reordena si tiene ≤ 4 palabras, si no lo marca como irregular
const reordenarNombre = (nombre) => {
  const partes = nombre.trim().split(' ')
  if (partes.length > 4) {
    return capitalizarNombre(nombre) + ' (IrrApellido)'
  } else {
    const apellidos = partes.slice(0, 2).map((p) => p.toLowerCase())
    const nombrePropio = partes.slice(2).map((p) => p.toLowerCase())
    const nombreReordenado = [...nombrePropio, ...apellidos]
      .map((p) => {
        if (numerosRomanos.includes(p.toUpperCase())) {
          return p.toUpperCase()
        } else {
          return p.charAt(0).toUpperCase() + p.slice(1)
        }
      })
      .join(' ')
    return nombreReordenado
  }
}

// Elimina los dos últimos elementos del nombre (usualmente los apellidos)
// Elimina los dos últimos elementos del nombre ya reordenado (usualmente los apellidos)
const recortarNombre = (nombre) => {
  const nombreReordenado = reordenarNombre(nombre)
  const partes = nombreReordenado.split(' ')

  if (partes.length <= 2) {
    // Si tiene dos o menos palabras después de reordenar, no recortamos
    return nombreReordenado
  } else {
    const soloNombre = partes.slice(0, partes.length - 2)
    return soloNombre.join(' ')
  }
}

// Intros
const obtenerIntro = (nombre) => {
  const saludo = `¡Hola, ${nombre}! Soy Romeo Ahuja, abogado y estratega político especializado en campañas. Vi tu perfil y tengo una propuesta que puede ayudarte a destacar en esta elección. ¿Te puedo compartir más detalles por aquí?\n\n`
  const opciones = `📩 *Responde con:*\n\n1️⃣ Me interesa\n2️⃣ No me interesa`
  return saludo + opciones
}

// Status
const obtenerStatus = (nombre) => {
  const palabras = nombre.trim().split(/\s+/) // Dividir el nombre en palabras
  const status =
    palabras.length > 4 || contieneNumeroRomano(nombre) // Si tiene más de 4 palabras o tiene número romano
      ? 'POR EDITAR'
      : 'TERMINADO'
  return status
}

// Clasificar nombres en tres grupos
const regulares = []
const irregularesRomanos = []
const irregularesApellidos = []

// Genera el ID con el formato pj{pj}-{índice}
const generateId = (index) => {
  return `pj${pj}-${String(index + 1).padStart(4, '0')}`
}

// Paso 1: recolectar todos los datos SIN id
let todos = []

// En tu forEach:
candidatos.forEach((c) => {
  const statusNombre = obtenerStatus(c.nombre)
  const nombreReordenado = reordenarNombre(c.nombre)
  const tieneRomano = contieneNumeroRomano(c.nombre)

  // Aquí modificamos:
  let nombreRecortado
  if (tieneRomano || nombreReordenado.endsWith(' (IrrApellido)')) {
    // Irregulares: recortar solo 1 palabra
    const partes = reordenarNombre(c.nombre).split(' ')
    nombreRecortado =
      partes.length > 1
        ? partes.slice(0, partes.length - 1).join(' ')
        : partes.join('') // Si solo hay una palabra, no recorta
  } else {
    // Regulares: usar recortarNombre normal (el que elimina 2 palabras)
    nombreRecortado = recortarNombre(c.nombre)
  }

  const intro = obtenerIntro(nombreRecortado)
  const mensaje = obtenerMensaje(nombreRecortado, c.sexo)

  const datos = {
    status: statusNombre,
    contacto: c.nombre,
    nombre: nombreRecortado,
    telefono: c.telefono,
    correo: c.correo,
    intro: intro.trim(),
    mensaje: mensaje.trim(),
  }

  if (tieneRomano) {
    irregularesRomanos.push(datos)
  } else if (nombreReordenado.endsWith(' (IrrApellido)')) {
    irregularesApellidos.push(datos)
  } else {
    regulares.push(datos)
  }
})

// Paso 2: concatenar todos los grupos y agregar el ID como primer campo
todos = [...regulares, ...irregularesApellidos, ...irregularesRomanos]

const mensajesOrdenados = todos.map((obj, i) => {
  return { id: generateId(i), ...obj }
})

// Guardar nuevo archivo
fs.writeFileSync(
  `./mensajes1${pj}.json`,
  JSON.stringify(mensajesOrdenados, null, 2),
  'utf-8'
)

// Mostrar resumen
console.log(`✅ Archivo mensajes1${pj}.json generado con éxito.`)
console.log(`✔️ Nombres regulares: ${regulares.length}`)
console.log(`📜 Nombres con números romanos: ${irregularesRomanos.length}`)
console.log(`⚠️ Nombres con más de 4 palabras: ${irregularesApellidos.length}`)
