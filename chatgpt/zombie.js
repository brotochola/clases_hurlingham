// Zombie.js

// Asegúrate de que el archivo utils.js esté incluido en tu index.html antes de este script

class Zombie extends Objeto {
  constructor(x, y, juego) {
    super(x, y, 0.5, 20, juego); // Tamaño del zombie
    this.equipoParaUpdate = Math.floor(Math.random() * 9)+1;
    this.juego = juego;
    this.grid = juego.grid; // Referencia a la grid
    this.vision = 50 + Math.floor(Math.random() * 150); //en pixels
    // Cargar la textura del sprite desde el <img>
    this.sprite.texture = PIXI.Texture.from("./zombie.png");

    // Asegurarse de que el tamaño sea 25x25
    this.sprite.width = 25;
    this.sprite.height = 25;
    this.debug = 0;

    this.juego.app.stage.addChild(this.sprite);
  }

  recibirTiro() {
    this.borrar();
  }
  update(zombies, mouse) {
    if (this.juego.contadorDeFrames % this.equipoParaUpdate == 0) {
      this.vecinos = this.obtenerVecinos();
      this.estoyViendoAlPlayer = this.evaluarSiEstoyViendoAlPlayer();
      let vecAtraccionAlPlayer, vecSeparacion, vecAlineacion, vecCohesion;

      if (this.estoyViendoAlPlayer) {
        vecAtraccionAlPlayer = this.atraccionAlJugador();
        this.aplicarFuerza(vecAtraccionAlPlayer);
      }
      vecCohesion = this.cohesion(this.vecinos);
      vecAlineacion = this.alineacion(this.vecinos);
      this.aplicarFuerza(vecCohesion);
      this.aplicarFuerza(vecAlineacion);
      vecSeparacion = this.separacion(this.vecinos);
      this.aplicarFuerza(vecSeparacion);

      this.ajustarPorBordes();
    }

    super.update();
  }

  evaluarSiEstoyViendoAlPlayer() {
    const distanciaCuadrada = distanciaAlCuadrado(
      this.sprite.x,
      this.sprite.y,
      this.juego.player.sprite.x,
      this.juego.player.sprite.y
    );

    if (distanciaCuadrada < this.vision ** 2 && distanciaCuadrada > 160) {
      return true;
    }
    return false;
  }

  atraccionAlJugador() {
    const vecDistancia = new PIXI.Point(
      this.juego.player.sprite.x - this.sprite.x,
      this.juego.player.sprite.y - this.sprite.y
    );

    let vecNormalizado = normalizarVector(vecDistancia.x, vecDistancia.y);

    vecDistancia.x = vecNormalizado.x;
    vecDistancia.y = vecNormalizado.y;
    return vecDistancia;
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

      // // Escalar para que sea proporcional a la velocidad máxima
      vecPromedio.x *= 0.02;
      vecPromedio.y *= 0.02;
    }

    return vecPromedio;
  }

  separacion(vecinos) {
    const vecFuerza = new PIXI.Point(0, 0);

    vecinos.forEach((zombie) => {
      const distancia = distanciaAlCuadrado(
        this.sprite.x,
        this.sprite.y,
        zombie.sprite.x,
        zombie.sprite.y
      );

      const dif = new PIXI.Point(
        this.sprite.x - zombie.sprite.x,
        this.sprite.y - zombie.sprite.y
      );
      dif.x /= distancia;
      dif.y /= distancia;
      vecFuerza.x += dif.x;
      vecFuerza.y += dif.y;
    });

    // if (total > 0) {
    //   vecFuerza.x /= total;
    //   vecFuerza.y /= total;

    //   // let ratio =
    //   //   ((0.009 + Math.random() * 0.01) * sumaDeDistancias) / vecinos.length;
    //   // vecFuerza.x *= ratio; // + Math.random() * 0.5;
    //   // vecFuerza.y *= ratio; //+ Math.random() * 0.5;
    // }

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
