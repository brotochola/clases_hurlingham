class DistanceLookUpTable {
  constructor(juego) {
    this.juego = juego;
    this.caducidad = 1000;
    this.tabla = {};
  }
  getHash(obj1, obj2) {
    let min = obj1.id > obj2.id ? obj1.id : obj2.id;
    let max = obj1.id < obj2.id ? obj1.id : obj2.id;

    return min + "_" + max;
  }
  set(obj1, obj2, dist) {
    let hash = this.getHash(obj1, obj2);
    this.tabla[hash] = { dist, when: performance.now() };
  }

  get(obj1, obj2) {
    let hash = this.getHash(obj1, obj2);
    let val = this.tabla[hash];
    if (!val) return null;
    if (performance.now() - val.when < this.caducidad) {
      return val.dist;
    } else {
      delete this.tabla[hash];
      return null;
    }
   
  }

  reset(){
    this.tabla={}
  }
}
