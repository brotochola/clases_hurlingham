class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.objetosAca = {};
  }
  agregar(obj) {
    this.objetosAca[obj.id] = obj;
    obj.miCeldaActual = this;
  }
  sacar(obj) {
    obj.miCeldaActual=null
    delete this.objetosAca[obj.id];
  }
}
