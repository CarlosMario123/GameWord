import { findErrorInput } from "./validarErrores/Errores.js";
const socket = io("https://gameword2.onrender.com");

const nameSala = document.getElementById("nameRoom");
const unirse = document.getElementById("unirse");
const jugar = document.getElementById("jugar");
const juego = document.getElementById("juego");
const pregunta = document.getElementById("pregunta");

//le asigno evento a cada boton
for (let i = 1; i <= 3; i++) {
  document.getElementById(`btn${i}`).addEventListener("click", () => {
    const valor = document.getElementById(`btn${i}`).innerText;
    socket.emit("chat:constestar", valor);
  });
}
unirse.addEventListener("click", () => {
  if (findErrorInput(nameSala.value)) {
    //Verificamos que el input sea valido
    return;
  }

  // deshabilitar el botón después de hacer clic
  //unirse.disabled = true;
  socket.emit("chat:join", nameSala.value);
});


socket.on("usuarioConectado",(data)=>{
    const myID = document.getElementById("myId");
    myID.innerHTML = "tu id: " + data.id;
   
})

jugar.addEventListener("click", () => {
  socket.emit("chat:startGame");
  //socket.emit("chat:send",{hola:"hola",room:"XD"})
});

//eventoDeNotificacion

socket.on("chat:notificacion", (data) => {
  // Crear un div para mostrar la notificación
  const notificationDiv = document.createElement("div");
  notificationDiv.className = "notification";
  notificationDiv.textContent = data;

  // Agregar el div al cuerpo del documento
  document.body.appendChild(notificationDiv);

  // Desaparecer el div después de dos segundos
  setTimeout(() => {
    // Eliminar el div después de dos segundos
    document.body.removeChild(notificationDiv);
  }, 2500);
});

//este evento renderizara cuando el juego este completo
socket.on("chat:activarJuego", (data) => {
  console.log("se comenzo el juego");
  let pregunte = data.preguntas[0].pregunta;
  let respueste = data.preguntas[0].respuestas;

  juego.classList.remove("opacity-0");
  pregunta.innerHTML = pregunte;
  asingarNewTextButtons(respueste);
});

//Data
socket.on("nextQuestion", (data) => {
  pregunta.innerHTML = data.pregunta;
  asingarNewTextButtons(data.respuestas)
});

async function asingarNewTextButtons(arreglo) {
  const data = await arreglo;

  for (let i = 0; i < arreglo.length; i++) {
    document.getElementById(`btn${i + 1}`).innerHTML = arreglo[i];
  }
}

socket.on("finalPlayer",(data)=>{
    const resultado = document.getElementById("resultado")
    juego.classList.add("opacity-0");
    console.log("final");
    resultado.innerHTML = `<p>Resultado de la partida</p>
    <p>Buenas: ${data.buenas} </p>
     <p>Malas: ${data.mala}</p>
     <p>Esperando jugadores...</p>`
  
})


socket.on("winner", (data) => {
    // Llamar a la función para mostrar los resultados
    mostrarResultados(data);
  });

  // Función para mostrar los resultados en lista de los competidores
  function mostrarResultados(data) {
    const tabla = document.getElementById("tablaResult");
    tabla.classList.remove("hidden")
    const listaResultados = document.getElementById("resultadoLista");

    // Limpiar el contenido actual
    listaResultados.innerHTML = '';

    // Recorrer los datos y agregar cada posición a la lista
    data.forEach((usuario, index) => {
      const li = document.createElement("li");
      li.className = "mb-4 text-black"
      li.textContent = `Posición ${index + 1}: Usuario ${usuario.id} - Buenas: ${usuario.buenas}`;
      listaResultados.appendChild(li);
    });
  }


  const reiniciarBtn = document.getElementById("reiniciarBtn");

  reiniciarBtn.addEventListener("click", function() {
    // Recargar la página
    location.reload();
  });
