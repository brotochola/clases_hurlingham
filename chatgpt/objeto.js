// Clase base Objeto
class Objeto {
  constructor(x, y, velocidadMax, tamaño = 25, grid, app) {
    this.id = generarID();
    this.grid = grid;
    this.app = app;
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

  actualizar() {
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
