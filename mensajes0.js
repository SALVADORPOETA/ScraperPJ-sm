// Mensajes
const obtenerMensaje = (nombre, sexo) => {
  const saludo = `¡Hola, ${nombre}!\n`

  const cuerpo = `
  Esta campaña judicial puede cambiar tu vida. Pero solo si logras conectar con la gente.
Ser buen${
    sexo === 'MUJER' ? 'a abogada' : ' abogado'
  } no basta. En política, el que gana no siempre es el más preparado… sino el que mejor comunica.

  Y tú, como muchos candidatos primerizos, probablemente estás sintiendo esto:

👉 No sabes cómo hablarle al pueblo sin sonar técnic${
    sexo === 'MUJER' ? 'a' : 'o'
  }.
👉 No tienes claro cómo destacar entre tant${
    sexo === 'MUJER' ? 'as candidatas' : 'os candidatos'
  }.
👉 Sientes que estás improvisando demasiado.

Aquí es donde entro yo.

Soy Romeo Ahuja, abogado y estratega político. Dirijo Bellum Politics (www.bellumpolitics.com), y junto con una aliada experta en campañas judiciales en EE.UU., creamos un método claro y funcional para candidat${
    sexo === 'MUJER' ? 'as' : 'os'
  } como tú.

Se llama El Plan de los 3 Marcos:

✅ El Método Narratológico, para que tu mensaje sea claro, humano y memorable.
✅ La Mnemotecnia de Asociación Numérica, para que te escuchen… y te recuerden.
✅ Un Guion Base, listo para adaptar a discursos, entrevistas y redes sociales.

Todo esto lo trabajamos en una consultoría personalizada de 1 hora, por solo $490 pesos + IVA.

Si decides no actuar, podrías perder la única oportunidad que tengas de ganar y de cumplir tu sueño.

Pero si actúas, vas a tener claridad, estrategia y una narrativa ganadora. Vas a hablar como alguien que entiende al pueblo, y no solo como abogad${
    sexo === 'MUJER' ? 'a' : 'o'
  }. Vas a marcar la diferencia.

¡AGENDA HOY MISMO TU VIDEOLLAMADA!

👉 Agendar videollamada: https://calendly.com/romeo-bellumpolitics/30min

—

Romeo Ahuja
Director de Bellum Politics
`

  return saludo + cuerpo
}

module.exports = { obtenerMensaje }
