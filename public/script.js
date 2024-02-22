import { findErrorInput } from "./validarErrores/Errores.js";
const domain = window.location.origin;
console.log(domain)
const socket = io(domain);

const nameSala = document.getElementById("nameRoom");
const unirse = document.getElementById("unirse");
const jugar = document.getElementById("jugar");
const juego = document.getElementById("juego");
const pregunta = document.getElementById("pregunta");
const alert = document.getElementById("alert");

//le asigno evento a cada boton
for (let i = 1; i <= 3; i++) {
  document.getElementById(`btn${i}`).addEventListener("click", () => {
    const valor = document.getElementById(`btn${i}`).innerText;
    socket.emit("chat:constestar", valor);
  });
}
unirse.addEventListener("click", (e) => {
  e.preventDefault();
  if (findErrorInput(nameSala.value)) {
    //Verificamos que el input sea valido
    nameSala.value = "";
    return;
  }
  // deshabilitar el botón después de hacer clic
  //unirse.disabled = true;
  jugar.removeAttribute("disabled");
  console.log("Se unio a: ", nameSala.value);
  socket.emit("chat:join", nameSala.value);
  nameSala.value = "";
});

socket.on("usuarioConectado", (data) => {
  console.log("data")
  console.log(data)
  const myID = document.getElementById("myId");
  myID.innerHTML = "tu id: " + data.id;
});

jugar.addEventListener("click", (e) => {
  e.preventDefault();
  const modal = document.getElementById("myModal");
  modal.classList.add("hidden");
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
  asingarNewTextButtons(data.respuestas);
});

async function asingarNewTextButtons(arreglo) {
  const data = await arreglo;

  for (let i = 0; i < arreglo.length; i++) {
    document.getElementById(`btn${i + 1}`).innerHTML = arreglo[i];
  }
}

socket.on("finalPlayer", (data) => {
  const resultado = document.getElementById("resultado");

  juego.classList.add("opacity-0");

  console.log("final");
  resultado.innerHTML = `
  <div class="bg-white rounded-md shadow-md p-4">
    <p class="text-lg font-bold mb-2">Resultado de la partida</p>
    <p class="mb-2 font-semibold">Buenas: <span class="text-green-500">${data.buenas}</span></p>
    <p class="mb-2 font-semibold">Malas: <span class="text-red-500">${data.mala}</span></p>
    <p>Esperando jugadores...</p>
  </div>
    `;
});

socket.on("winner", (data) => {
  // Llamar a la función para mostrar los resultados
  console.log(data);
  mostrarResultados(data);
});

// Función para mostrar los resultados en lista de los competidores
function mostrarResultados(data) {
  const tabla = document.getElementById("tablaResult");
  const result = document.getElementById("mostrarResultado");
  tabla.classList.remove("hidden");
  result.classList.remove("hidden");
  const listaResultados = document.getElementById("resultadoLista");

  // Limpiar el contenido actual
  listaResultados.innerHTML = "";

  // Recorrer los datos y agregar cada posición a la lista
  data.forEach((usuario, index) => {
    const li = document.createElement("li");
    li.className = "mt-6 mx-4 mb-4 text-black pb-2 list-none";
    li.style.textDecoration = "none";
    li.innerHTML = `
    <p class=" text-2xl mb-2 font-semibold"> Posición ${index + 1}:</p> <span class="font-normal ">Usuario: ${usuario.id} - Buenas:  <span class="text-green-500"> ${usuario.buenas} </span> </span>
    `;
    listaResultados.appendChild(li);
  });
}

const reiniciarBtn = document.getElementById("reiniciarBtn");

reiniciarBtn.addEventListener("click", function () {
  // Recargar la página
  location.reload();
});
