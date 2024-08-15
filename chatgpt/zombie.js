// Zombie.js

// Asegúrate de que el archivo utils.js esté incluido en tu index.html antes de este script

class Zombie extends Objeto {
  constructor(x, y, grid, app, juego) {
    super(x, y, 1.2, 20, grid, app); // Tamaño del zombie

    this.juego = juego;
    this.grid = grid; // Referencia a la grid

    // Cargar la textura del sprite desde el <img>
    const image = document.getElementById("zombieImage");
    this.sprite.texture = PIXI.Texture.from(image);

    // Asegurarse de que el tamaño sea 25x25
    this.sprite.width = 25;
    this.sprite.height = 25;
    this.debug = 0;
  }

  comportamiento(zombies, mouse) {
    this.vecinos = this.obtenerVecinos();
    const vecCohesion = this.cohesion(this.vecinos);
    const vecSeparacion = this.separacion(this.vecinos);
    const vecAlineacion = this.alineacion(this.vecinos);
    const vecAtraccionMouse = this.atraccionAlMouse(mouse);

    this.aplicarFuerza(vecCohesion);
    this.aplicarFuerza(vecSeparacion);
    this.aplicarFuerza(vecAlineacion);
    this.aplicarFuerza(vecAtraccionMouse);

    this.ajustarPorBordes();
  }

  atraccionAlMouse(mouse) {
    if (!mouse) return null;
    const vecMouse = new PIXI.Point(
      mouse.x - this.sprite.x,
      mouse.y - this.sprite.y
    );
    const distanciaCuadrada = distanciaAlCuadrado(
      this.sprite.x,
      this.sprite.y,
      mouse.x,
      mouse.y
    );

    if (distanciaCuadrada < 100 * 100) {
      vecMouse.x *= 0.2; // Intensidad de atracción al mouse
      vecMouse.y *= 0.2;
      return vecMouse;
    }

    return null;
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

  cohesion(vecinos) {
    const vecPromedio = new PIXI.Point(0, 0);
    let total = 0;

    vecinos.forEach((zombie) => {
      vecPromedio.x += zombie.sprite.x;
      vecPromedio.y += zombie.sprite.y;
      total++;
    });

    if (total > 0) {
      vecPromedio.x /= total;
      vecPromedio.y /= total;

      // Crear un vector que apunte hacia el centro de masa
      vecPromedio.x = vecPromedio.x - this.sprite.x;
      vecPromedio.y = vecPromedio.y - this.sprite.y;

      // Escalar para que sea proporcional a la velocidad máxima
      vecPromedio.x *= 0.02;
      vecPromedio.y *= 0.02;
    }

    return vecPromedio;
  }

  separacion(vecinos) {
    const vecFuerza = new PIXI.Point(0, 0);
    let total = 0;
    let sumaDeDistancias = 0;
    vecinos.forEach((zombie) => {
      const distancia = distanciaAlCuadrado(
        this.sprite.x,
        this.sprite.y,
        zombie.sprite.x,
        zombie.sprite.y
      );
      sumaDeDistancias += distancia;
      const dif = new PIXI.Point(
        this.sprite.x - zombie.sprite.x,
        this.sprite.y - zombie.sprite.y
      );
      dif.x /= distancia;
      dif.y /= distancia;
      vecFuerza.x += dif.x;
      vecFuerza.y += dif.y;
      total++;
    });

    if (total > 0) {
      vecFuerza.x /= total;
      vecFuerza.y /= total;

      let ratio =
        ((0.01 + Math.random() * 0.015) * sumaDeDistancias) / vecinos.length;
      vecFuerza.x *= ratio; // + Math.random() * 0.5;
      vecFuerza.y *= ratio; //+ Math.random() * 0.5;
    }

    return vecFuerza;
  }

  alineacion(vecinos) {
    const vecPromedio = new PIXI.Point(0, 0);
    let total = 0;

    vecinos.forEach((zombie) => {
      vecPromedio.x += zombie.velocidad.x;
      vecPromedio.y += zombie.velocidad.y;
      total++;
    });

    if (total > 0) {
      vecPromedio.x /= total;
      vecPromedio.y /= total;

      // Escalar para que sea proporcional a la velocidad máxima
      vecPromedio.x *= 0.2;
      vecPromedio.y *= 0.2;
    }

    return vecPromedio;
  }
  ajustarPorBordes() {
    let fuerza = { x: 0, y: 0 };
    if (this.sprite.x < 0) fuerza.x = -this.sprite.x;
    if (this.sprite.y < 0) fuerza.y = -this.sprite.y;
    if (this.sprite.x > this.app.view.width)
      fuerza.x = -(this.sprite.x - this.app.view.width);
    if (this.sprite.y > this.app.view.height)
      fuerza.y = -(this.sprite.y - this.app.view.height);

    // if(this.debug)console.log(fuerza)
    // Aplicar la fuerza calculada
    this.aplicarFuerza(fuerza);
  }
}
