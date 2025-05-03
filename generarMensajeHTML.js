// generarMensajeHTML.js

const generarMensajeHTML = (nombre, sexo) => {
  const esMujer = sexo === 'MUJER'
  const htmlBase = `
      <div style="font-family:arial,helvetica,sans-serif;font-size:14pt; line-height:1.6;">
        <p>¡Hola, [Nombre]!</p>
  
        <p>¿Y si esta fuera la única vez que tienes la oportunidad real de ganar?</p>
  
        <p>
          La mayoría de los aspirantes judiciales van a perder…
          no por falta de preparación, sino por falta de estrategia.
        </p>
  
        <p>
          Porque en campaña no gana quien sabe más.
          Gana quien logra que el pueblo entienda, recuerde… y confíe en su mensaje.
        </p>

        <p>Si después de un mes de campaña sientes que estás improvisando, que no conectas, o que no logras destacar entre tantos, no es tu culpa. Es normal.</p>
        
        <p>
          Pero no hacer nada al respecto…
          eso sí sería un error.
        </p>
  
        <p>
          Soy Romeo Ahuja, abogado y estratega político. Dirijo Bellum Politics 
          (<a href="https://www.bellumpolitics.com" target="_blank">www.bellumpolitics.com</a>) y, junto con una aliada experta en campañas judiciales en EE. UU., 
          creamos un método claro y funcional para candidat${
            esMujer ? 'as' : 'os'
          } como tú.
        </p>
  
        <p><strong>El Plan de los 3 Marcos:</strong></p>
  
        <ul>
          <li><strong>✅ El Método Narratológico</strong>, para que tu mensaje sea claro, humano y memorable.</li>
          <li><strong>✅ La Mnemotecnia de Asociación Numérica</strong>, para que te escuchen… y no te olviden.</li>
          <li><strong>✅ Un Guion Base</strong>, adaptable a redes, discursos y entrevistas.</li>
        </ul>
  
        <p>Todo esto lo trabajamos en una consultoría personalizada de 1 hora, por solo $490 pesos + IVA.</p>
  
        <p>
          🔴 Advertencia realista: si dejas pasar esta oportunidad, podrías quedarte con la duda de qué habría pasado si hubieras actuado a tiempo.
        </p>
  
        <p>Pero si agendas hoy, obtienes algo mucho más valioso que una llamada: una narrativa ganadora que puede cambiar el rumbo de tu elección.</p>  

        <p>Te apuntas aquí abajo:</p>
  
        <p>👉 <a href="https://calendly.com/romeo-bellumpolitics/30min">Quiero mi sesión estratégica</a></p>
  
        <br>
  
        <div style="font-size: 14px; color: #555;">
          —<br>
          Romeo Ahuja<br>
          Director de Bellum Politics
        </div>
      </div>
    `

  return htmlBase.replace('[Nombre]', nombre || 'candidat@')
}

module.exports = generarMensajeHTML
