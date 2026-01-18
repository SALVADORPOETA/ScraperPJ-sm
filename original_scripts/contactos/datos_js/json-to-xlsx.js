const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

// Configuración de la interfaz para leer por pantalla
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question(
  'Introduce el nombre del archivo JSON (sin el .json): ',
  (filename) => {
    // Definir rutas
    const inputPath = path.join(__dirname, `../datos_json/${filename}.json`)
    const outputDir = path.join(__dirname, '../excel')
    const outputPath = path.join(outputDir, `${filename}.xlsx`)

    // Verificar si el archivo JSON existe
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Error: No se encontró el archivo en ${inputPath}`)
      rl.close()
      return
    }

    try {
      // 1. Leer el JSON
      const rawData = fs.readFileSync(inputPath, 'utf8')
      const jsonData = JSON.parse(rawData)

      // 2. Crear la carpeta de excel si no existe
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      // 3. Convertir JSON a Hoja de Cálculo
      const worksheet = XLSX.utils.json_to_sheet(jsonData)

      // 4. Crear el libro de trabajo (Workbook) y añadir la hoja
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidatos')

      // 5. Escribir el archivo Excel
      XLSX.writeFile(workbook, outputPath)

      console.log(`✅ ¡Éxito! Archivo convertido y guardado en: ${outputPath}`)
    } catch (error) {
      console.error('❌ Ocurrió un error durante la conversión:', error.message)
    }

    rl.close()
  },
)
