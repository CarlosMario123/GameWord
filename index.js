// Dependencias necesarias para el servidor
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const Socket = require("./src/Socket");
const cors = require("cors");

// Configuración para el servidor socket io
const app = express();
const port = 8000;
const server = http.createServer(app);
const io = socketio(server, {
   cors: "*"
});

const socket = new Socket(io);

// Configuración para servir archivos estáticos
app.use(express.static(__dirname + "/public"));


app.get("/", (req, res) => {
   res.sendFile(__dirname + "/public/index.html");
});


server.listen(port, () => {
   console.log(`Servidor en ejecución en http://localhost:${port}`);
});
