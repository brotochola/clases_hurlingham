// Clase base Objeto
class Objeto {
  constructor(x, y, velocidadMax, tamaño = 25, juego) {
    this.id = generarID();
    this.grid = juego.grid;
    this.app = juego.app;
    this.juego = juego;
    this.sprite = new PIXI.Sprite();
    this.sprite.x = x;
    this.sprite.y = y;

    this.velocidad = new PIXI.Point(0, 0);
    this.velocidadMax = velocidadMax;
    this.velocidadMaxCuadrada = velocidadMax * velocidadMax;

    // Ajustar el tamaño y el punto de pivote
    this.sprite.width = tamaño;
    this.sprite.height = tamaño;
    this.sprite.anchor.set(0.5); // Pivote en el centro
  }

  getObjetosEnMiCelda() {
    this.miCelda = this.grid.getCellPX(this.sprite.x, this.sprite.y);
    return this.miCelda.objetosAca;
  }

  borrar() {
    this.juego.app.stage.removeChild(this.sprite);
    if (this instanceof Zombie) {
      this.juego.zombies = this.juego.zombies.filter((k) => k != this);
    } else if (this instanceof Bala) {
      this.juego.balas = this.juego.balas.filter((k) => k != this);
    }

    this.grid.remove(this);
  }

  obtenerVecinos() {
    const vecinos = [];
    const cellSize = this.grid.cellSize;
    const xIndex = Math.floor(this.sprite.x / cellSize);
    const yIndex = Math.floor(this.sprite.y / cellSize);

    // Revisar celdas adyacentes
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const cell = this.grid.getCell(xIndex + i, yIndex + j);
        if (cell) {
          cell.objetosAca.forEach((zombie) => {
            if (zombie !== this) {
              vecinos.push(zombie);
            }
          });
        }
      }
    }
    return vecinos;
  }
  normalizarVelocidad() {
    if (this.velocidad.x == 0 && this.velocidad.y == 0) {
      return;
    }

    let magnitud = calculoDeDistanciaRapido(
      0,
      0,
      this.velocidad.x,
      this.velocidad.y
    );

    if (magnitud == 0) return;

    this.velocidad.x /= magnitud;
    this.velocidad.y /= magnitud;

    this.velocidad.x *= this.velocidadMax;
    this.velocidad.y *= this.velocidadMax;
    if (isNaN(this.velocidad.x)) debugger;
  }

  update() {
    this.normalizarVelocidad();

    this.sprite.x += this.velocidad.x;
    this.sprite.y += this.velocidad.y;
    this.actualizarRotacion();
    this.actualizarPosicionEnGrid();
  }
  actualizarPosicionEnGrid() {
    this.grid.update(this);
  }

  aplicarFuerza(fuerza) {
    if (!fuerza) return;
    this.velocidad.x += fuerza.x;
    this.velocidad.y += fuerza.y;

    // Limitar la velocidad máxima
    const velocidadCuadrada =
      this.velocidad.x * this.velocidad.x + this.velocidad.y * this.velocidad.y;
    if (velocidadCuadrada > this.velocidadMaxCuadrada) {
      const magnitud = Math.sqrt(velocidadCuadrada);
      this.velocidad.x = (this.velocidad.x / magnitud) * this.velocidadMax;
      this.velocidad.y = (this.velocidad.y / magnitud) * this.velocidadMax;
    }
  }

  actualizarRotacion() {
    if (this.velocidad.x !== 0 || this.velocidad.y !== 0) {
      const angulo = Math.atan2(this.velocidad.y, this.velocidad.x);
      this.sprite.rotation = angulo;
    }
  }
}
