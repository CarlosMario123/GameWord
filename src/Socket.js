const preguntas = require("./utils/preguntas");
const gestor = require("./game/gestionarJuego")

class Socket {
  constructor(io) {
    this.io = io;
    this.manejarConexion();
    this.rooms = {}; //diccionario para controlar las salas


    setInterval(()=>{
    this.rooms = {}
    console.log("limpiando salas")
    },6 * 60 * 60 * 1000);
  }

  manejarConexion() {
    this.io.on("connection", (socket) => {
      console.log(`Usuario conectado a socket io: ${socket.id}`);
      //Enviamos el id del usuario cuando se conecta
      this.io.to(socket.id).emit("usuarioConectado", { id: socket.id });

      socket.on("chat:join", (room) => {
        this.joinRoom(socket, room);
      });

      socket.on("chat:leave", (room) => {
        this.leaveRoom(socket, room);
      });

      socket.on("chat:send", (data) => {
        console.log("enviando...");
        this.sendMessage(socket, data);
      });

      socket.on("disconnect", () => {
        console.log(`Usuario desconectado de socket io: ${socket.id}`);
      });

      socket.on("chat:startGame", (room) => {
        this.startGame(socket, room);
      });

      socket.on("chat:constestar", (data) => {
        this.contestando(socket, data);
      });
    });
  }

  joinRoom(socket, room) {
    console.log("uniendo ala sala: ", room);

    if (this.rooms[room] && this.rooms[room].gameStarted == true) {
      this.io.emit(
        "chat:notificacion",
        `El juego ya ha comenzado en la sala ${room}. No se permiten más participantes.`
      );
      return;
    }

    // uniendo ala sala
    socket.join(room);
    socket.room = room;

    //Si room de rooms no esta creado que se cree
    if (!this.rooms[room]) {
      this.rooms[room] = { users: [], gameStarted: false, preguntas: [] };
    }
    //Agregamos al usuario ala sala
    const usuario = { id: socket.id, buenas: 0, mala: 0, preguntaId: 0 };
    this.rooms[room].users.push(usuario);

    this.io
      .to(room)
      .emit("chat:system", `${socket.id} se unió a la sala ${room}`);
  }

  leaveRoom(socket, room) {
    socket.leave(room);
    this.io
      .to(room)
      .emit("chat:system", `${socket.id} abandonó la sala ${room}`);
  }

  sendMessage(socket, data, room) {
    if (!socket.room) {
      console.log("el usuario: " + socket.id);
      console.log("no podra enviar msg ya que no se ha unido a una sala");
      return;
    }

    if (this.rooms[socket.room].gameStarted) {
      this.io
        .to(socket.id)
        .emit("chat:notificacion", "espera antes de que se inicie la partida");
    }
    this.io
      .to(socket.room)
      .emit("chat:message", { user: socket.id, message: data.message });
  }

  startGame(socket, room) {
    if (!socket.room) {
      this.io
        .to(socket.id)
        .emit(
          "chat:notificacion",
          "No podras iniciar una partida ya que no haz unido a una sala"
        );
      return;
    }

    if (
      this.rooms[socket.room] &&
      this.rooms[socket.room].users &&
      this.rooms[socket.room].users.length > 1
    ) {
      //this.rooms[socket.room].gameStarted = true;
      console.log(`El juego en la sala ${socket.room} ha comenzado.`);
      this.rooms[socket.room].gameStarted = true; //aca damos aviso que en esa sala se creo un juego
      this.rooms[socket.room].preguntas = preguntas();

      this.io
        .to(socket.room)
        .emit("chat:activarJuego", { activado: true, preguntas: preguntas() });
    } else {
      console.log(
        this.io
          .to(socket.id)
          .emit(
            "chat:notificacion",
            "`El usuario ${socket.id} no puede iniciar el juego en la sala ${room}.`"
          )
      );
    }
  }

  deleteUser(){
    io.sockets.clients(someRoom).forEach(function(s){
      s.leave(someRoom);
  });
  }

  //en metodo ira logica de contestar la preguntas
  contestando(socket, data) {
    //buscamos el usuario por su id
    const foundUser = this.rooms[socket.room].users.find(user => user.id == socket.id);
    //checamos en que pregunta va
    const pregunta = this.rooms[socket.room].preguntas[foundUser.preguntaId]

   
    const indice = this.rooms[socket.room].users.indexOf(foundUser);//verifcamos el indice del usuario
     const idPregunta = this.rooms[socket.room].users[indice].preguntaId;//extraemos el id de la pregunta actual
          //veficamos si todavia hay preguntas
    if(gestor.isFinal(idPregunta,this.rooms[socket.room].preguntas)){
      const data = this.rooms[socket.room].users[indice];
      this.io.to(socket.id).emit("finalPlayer",data);
      if(gestor.checkAllUsersAnswered(this.rooms[socket.room])){
         //Emitiremos el ganador a todos los participantes
         this.io.to(socket.room).emit("winner",gestor.tablePosition(this.rooms[socket.room]));
       // Eliminar la sala del conjunto
        delete this.rooms[socket.room];
        this.deleteUser()
      }
       return
    }
    
    //verificamos si la respuesta es correcta
    if(pregunta.respuestaCorrecta == data){
      this.rooms[socket.room].users[indice].buenas += 1;
      console.log(this.rooms[socket.room].users[indice])
    }else{
      this.rooms[socket.room].users[indice].mala += 1;
  
    }
    this.rooms[socket.room].users[indice].preguntaId += 1//aumenta uno a su pregunta;
   


    this.io
    .to(socket.id)
    .emit("nextQuestion",this.rooms[socket.room].preguntas[idPregunta]);
  }
}

module.exports = Socket;
