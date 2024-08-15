class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    //esto seria mejor con un objeto y keys como el id de los objetos
    this.objetosAca = [];
  }
  agregar(obj) {
    for (let i = 0; i < this.objetosAca.length; i++) {
      if (obj.id == this.objetosAca[i].id) {
        return;
      }
    }
    this.objetosAca.push(obj);
    obj.miCeldaActual = this;
  }
  sacar(obj) {
    for (let i = 0; i < this.objetosAca.length; i++) {
      if (obj.id == this.objetosAca[i].id) {
        this.objetosAca.splice(i, 1);
        return;
      }
    }
  }
}
