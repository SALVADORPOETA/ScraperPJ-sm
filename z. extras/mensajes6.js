const fs = require('fs')

// Leer archivo original
const candidatos = JSON.parse(
  fs.readFileSync('./datos_candidatos6.json', 'utf-8')
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
    return capitalizarNombre(nombre) + ' (EDITAR)'
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

// Mensajes
const obtenerMensaje = (nombre, sexo) => {
  const saludo = `¡Hola, ${nombre}!\n`

  const cuerpo = `
Sé que esta puede ser tu primera campaña. Eres buen${
    sexo === 'MUJER' ? 'a abogada' : ' abogado'
  }, sí, pero hacer política es otro terreno. Y es normal que te enfrentes a esto:

👉 No sabes cómo hablarle al pueblo sin sonar técnic${
    sexo === 'MUJER' ? 'a' : 'o'
  }.
👉 No tienes claro cómo destacar entre tant${
    sexo === 'MUJER' ? 'as candidatas' : 'os candidatos'
  }.
👉 Y sientes que estás improvisando demasiado.

Yo puedo ayudarte a ordenar todo eso.

Soy Romeo Ahuja, abogado y estratega político. Dirijo Bellum Politics (www.bellumpolitics.com), y junto con una aliada experta en campañas judiciales en EE.UU., creamos un plan específico para candidat${
    sexo === 'MUJER' ? 'as' : 'os'
  } como tú.

Se llama El Plan de los 3 Marcos:

✅ Te enseño el Método Narratológico, para que armes un mensaje claro, humano y memorable.
✅ Aplicamos la Mnemotecnia de Asociación Numérica, para que la gente no solo te escuche… sino que te recuerde.
✅ Te doy un Guion Base que puedes adaptar a discursos, entrevistas y redes sociales.

Todo esto en una consultoría de 1 hora por solo $490 pesos + IVA.

No te arriesgues a perder la única oportunidad que quizá tengas de ganar y de cumplir tu sueño. No saber comunicar lo que representas puede costarte el cargo.

Haz una inversión pequeña que puede cambiarlo todo.

¿Te gustaría agendar tu sesión por videollamada?
`

  return saludo + cuerpo
}

// Clasificar nombres en tres grupos
const regulares = []
const irregularesRomanos = []
const irregularesApellidos = []

candidatos.forEach((c) => {
  const nombreReordenado = reordenarNombre(c.nombre)
  const tieneRomano = contieneNumeroRomano(c.nombre)
  const nombreRecortado = recortarNombre(c.nombre)
  const intro = obtenerIntro(nombreRecortado)
  const mensaje = obtenerMensaje(nombreRecortado, c.sexo)

  const datos = {
    nombre: nombreReordenado,
    telefono: c.telefono,
    correo: c.correo,
    intro: intro.trim(),
    mensaje: mensaje.trim(),
  }

  if (tieneRomano) {
    irregularesRomanos.push(datos)
  } else if (nombreReordenado.endsWith(' (EDITAR)')) {
    irregularesApellidos.push(datos)
  } else {
    regulares.push(datos)
  }
})

// Unir en orden: regulares → romanos → apellidos
const mensajesOrdenados = [
  ...regulares,
  ...irregularesRomanos,
  ...irregularesApellidos,
]

// Guardar nuevo archivo
fs.writeFileSync(
  './mensajes6.json',
  JSON.stringify(mensajesOrdenados, null, 2),
  'utf-8'
)

// Mostrar resumen
console.log('✅ Archivo "mensajes6.json" generado con éxito.')
console.log(`✔️ Nombres regulares: ${regulares.length}`)
console.log(`📜 Nombres con números romanos: ${irregularesRomanos.length}`)
console.log(`⚠️ Nombres con más de 4 palabras: ${irregularesApellidos.length}`)
