const obtenerMensaje = (nombre) => {
  const saludo = `¡Hola, ${nombre}!\n`

  const cuerpo = `  
¿Y si esta fuera la única vez que tienes la oportunidad real de ganar?

La mayoría de los aspirantes judiciales van a perder…
no por falta de preparación, sino por falta de estrategia.

Porque en campaña no gana quien sabe más.
Gana quien logra que el pueblo entienda, recuerde… y confíe en su mensaje.

Si después de un mes de campaña sientes que estás improvisando, que no conectas, o que no logras destacar entre tantos, no es tu culpa. Es normal.

Pero no hacer nada al respecto…
eso sí sería un error.

Soy Romeo Ahuja, abogado y estratega político. Dirijo Bellum Politics (bellumpolitics.com) y, junto a una experta en campañas judiciales de EE. UU., creamos una herramienta para quienes tienen vocación de justicia… y quieren ganar.

El Plan de los 3 Marcos incluye:

✅ Un método narratológico para que tu mensaje sea claro, humano y memorable.
✅ Una técnica de asociación numérica para que te escuchen… y no te olviden.
✅ Un guion base adaptable a redes, discursos y entrevistas.

Todo eso, en una consultoría personalizada de 1 hora, por solo $490 + IVA.

🔴 Advertencia realista: si dejas pasar esta oportunidad, podrías quedarte con la duda de qué habría pasado si hubieras actuado a tiempo.

Pero si agendas hoy, obtienes algo mucho más valioso que una llamada: una narrativa ganadora que puede cambiar el rumbo de tu elección.

Te apuntas aquí abajo:

👉 <a href="https://calendly.com/romeo-bellumpolitics/30min">Quiero mi sesión estratégica</a>`

  return saludo + cuerpo
}

module.exports = { obtenerMensaje }
