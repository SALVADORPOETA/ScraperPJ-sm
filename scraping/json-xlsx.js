const fs = require('fs')
const XLSX = require('xlsx')
const path = require('path')

const LIST_ID = process.argv[2]
if (!LIST_ID) {
  console.error(
    '❌ Debes proporcionar el id de la lista: node json-xlsx.js <id>'
  )
  process.exit(1)
}

// Directorios
const OUTPUT_DIR = path.join(__dirname, 'output')
const DATOS_DIR = path.join(OUTPUT_DIR, 'datos')
const XLSX_DIR = path.join(OUTPUT_DIR, 'xlsx')

// Crear carpetas si no existen
;[OUTPUT_DIR, DATOS_DIR, XLSX_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir)
})

// Archivo JSON de entrada (NUEVA RUTA)
const INPUT_FILE = path.join(DATOS_DIR, `datos_candidatos_${LIST_ID}.json`)

if (!fs.existsSync(INPUT_FILE)) {
  console.error(`❌ No existe el archivo: ${INPUT_FILE}`)
  process.exit(1)
}

// Leer el archivo JSON
const datos = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'))

// Crear hoja de Excel
const hoja = XLSX.utils.json_to_sheet(datos)

// Crear libro y agregar hoja
const libro = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(libro, hoja, `Candidatos_${LIST_ID}`)

// Archivo Excel de salida
const XLSX_FILE = path.join(XLSX_DIR, `datos_${LIST_ID}.xlsx`)

// Guardar Excel
XLSX.writeFile(libro, XLSX_FILE)

console.log(`✅ Excel generado correctamente: ${XLSX_FILE}`)
