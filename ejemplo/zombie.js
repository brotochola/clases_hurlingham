// Zombie.js

// Asegúrate de que el archivo utils.js esté incluido en tu index.html antes de este script

class Zombie extends Objeto {
  constructor(x, y, velocidad, juego) {
    super(x, y, velocidad, juego);
    this.equipoParaUpdate = Math.floor(Math.random() * 9) + 1;
    this.juego = juego;
    this.grid = juego.grid; // Referencia a la grid
    this.vision = 100 + Math.floor(Math.random() * 150); //en pixels

    this.debug = 0;

    this.cargarVariosSpritesAnimados(
      { correr: "./img/zombie.png" },
      96,
      96,
      velocidad * 0.5,
      (e) => {
        this.cambiarSprite("correr");
      }
    );
  }

  recibirTiro() {
    this.borrar();
  }
  update() {
    if (this.juego.contadorDeFrames % this.equipoParaUpdate == 0) {
      this.vecinos = this.obtenerVecinos();
      this.estoyViendoAlPlayer = this.evaluarSiEstoyViendoAlPlayer();
      let vecAtraccionAlPlayer,
        vecSeparacion,
        vecAlineacion,
        vecCohesion,
        bordes;

      //CALCULO LA FUERZA Q TRAE AL PERSONAJE PADENTRO DE LA PANTALLA DE NUEVO
      bordes = this.ajustarPorBordes();
      //SEPARACION SE CALCULA SIEMPRE
      vecSeparacion = this.separacion(this.vecinos);

      if (this.estoyViendoAlPlayer) {
        //SI ESTOY VIENDO AL PLAYER, HACERLE ATRACCION
        vecAtraccionAlPlayer = this.atraccionAlJugador();
      } else {
        //CALCULO LOS VECTORES PARA LOS PASOS DE BOIDS, SI NO HAY TARGET
        vecAlineacion = this.alineacion(this.vecinos);
        vecCohesion = this.cohesion(this.vecinos);
      }

      //SUMO LOS VECTORES ANTES DE APLICARLOS
      let sumaDeVectores = new PIXI.Point(0, 0);
      sumaDeVectores.x += (vecSeparacion || {}).x || 0;
      sumaDeVectores.x += (vecAlineacion || {}).x || 0;
      sumaDeVectores.x += (vecCohesion || {}).x || 0;
      sumaDeVectores.x += (vecAtraccionAlPlayer || {}).x || 0;
      sumaDeVectores.x += (bordes || {}).x || 0;

      sumaDeVectores.y += (vecSeparacion || {}).y || 0;
      sumaDeVectores.y += (vecAlineacion || {}).y || 0;
      sumaDeVectores.y += (vecCohesion || {}).y || 0;
      sumaDeVectores.y += (vecAtraccionAlPlayer || {}).y || 0;
      sumaDeVectores.y += (bordes || {}).y || 0;

      this.aplicarFuerza(sumaDeVectores);
    }

    super.update();
  }

  evaluarSiEstoyViendoAlPlayer() {
    const distanciaCuadrada = distanciaAlCuadrado(
      this.container.x,
      this.container.y,
      this.juego.player.container.x,
      this.juego.player.container.y
    );

    if (distanciaCuadrada < this.vision ** 2) {
      return true;
    }
    return false;
  }

  atraccionAlJugador() {
    const vecDistancia = new PIXI.Point(
      this.juego.player.container.x - this.container.x,
      this.juego.player.container.y - this.container.y
    );

    let vecNormalizado = normalizarVector(vecDistancia.x, vecDistancia.y);

    //HACER NEGATIVO ESTE VECTOR Y LOS ZOMBIES TE HUYEN
    vecDistancia.x = vecNormalizado.x;
    vecDistancia.y = vecNormalizado.y;
    return vecDistancia;
  }

  cohesion(vecinos) {
    const vecPromedio = new PIXI.Point(0, 0);
    let total = 0;

    vecinos.forEach((zombie) => {
      vecPromedio.x += zombie.container.x;
      vecPromedio.y += zombie.container.y;
      total++;
    });

    if (total > 0) {
      vecPromedio.x /= total;
      vecPromedio.y /= total;

      // Crear un vector que apunte hacia el centro de masa
      vecPromedio.x = vecPromedio.x - this.container.x;
      vecPromedio.y = vecPromedio.y - this.container.y;

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
        this.container.x,
        this.container.y,
        zombie.container.x,
        zombie.container.y
      );

      const dif = new PIXI.Point(
        this.container.x - zombie.container.x,
        this.container.y - zombie.container.y
      );
      dif.x /= distancia;
      dif.y /= distancia;
      vecFuerza.x += dif.x;
      vecFuerza.y += dif.y;
    });

    vecFuerza.x *= 10;
    vecFuerza.y *= 10;
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
    let fuerza = new PIXI.Point(0, 0);

    if (this.container.x < 0) fuerza.x = -this.container.x;
    if (this.container.y < 0) fuerza.y = -this.container.y;
    if (this.container.x > this.app.view.width)
      fuerza.x = -(this.container.x - this.app.view.width);
    if (this.container.y > this.app.view.height)
      fuerza.y = -(this.container.y - this.app.view.height);

    // if(this.debug)console.log(fuerza)
    return fuerza;
  }
}
