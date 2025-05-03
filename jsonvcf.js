const fs = require('fs')
const pj = 6

// Leer archivo JSON filtrado
const contactos = JSON.parse(
  fs.readFileSync(`contactosFiltrado${pj}.json`, 'utf8')
)

// Generar contenido VCF con limpieza del sufijo y nota
const vcfContent = contactos
  .map(({ contacto, telefono, correo }) => {
    const nombreLimpio = contacto.replace(/\s*-\s*pj\d+$/i, '')
    return `
BEGIN:VCARD
VERSION:3.0
FN:${nombreLimpio}
TEL;TYPE=CELL:${telefono}
EMAIL;TYPE=INTERNET:${correo}
NOTE:pj${pj}
END:VCARD
`.trim()
  })
  .join('\n\n') // <-- Separación entre contactos

fs.writeFileSync(`contactos_pj${pj}.vcf`, vcfContent, 'utf8')

console.log(`Archivo contactos_pj${pj}.vcf creado con éxito.`)
