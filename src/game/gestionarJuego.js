function isFinal(index,arreglo){//verifica cuando usuario haya acabado
      
    if(index >= arreglo.length){
        return true;
    }

    return false;
}

//verifcar que todos lo usuarios hayan respondido
function checkAllUsersAnswered(room){
    const usuarios = room.users;
  
  for (const usuario of usuarios) {
    if (usuario.preguntaId < room.preguntas.length) {
      return false; // Al menos un usuario no ha contestado todas las preguntas
    }
  }
  return true
}


function tablePosition(room){
    const usuarios = room.users;

  // Ordena el array 'usuarios' de mayor a menor según la propiedad 'buenas'
  const usuariosOrdenados = usuarios.sort((a, b) => b.buenas - a.buenas);

  // Ahora 'usuariosOrdenados' contiene el array ordenado
  console.log(usuariosOrdenados);

  // Puedes devolver el array ordenado si es necesario
  return usuariosOrdenados;
}
module.exports = {isFinal,checkAllUsersAnswered,tablePosition}