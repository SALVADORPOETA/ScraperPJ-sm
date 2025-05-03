const fs = require('fs')
const XLSX = require('xlsx')

// Leer el archivo JSON
const datos = JSON.parse(fs.readFileSync('mensajes4.json', 'utf-8'))

// Crear una hoja de Excel a partir de los datos
const hoja = XLSX.utils.json_to_sheet(datos)

// Crear un nuevo libro de Excel y agregar la hoja
const libro = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(libro, hoja, 'Mensajes4')

// Guardar el libro como archivo .xlsx
XLSX.writeFile(libro, 'mensajes4.xlsx')

console.log('✅ Archivo Excel generado exitosamente: mensajes4.xlsx')
