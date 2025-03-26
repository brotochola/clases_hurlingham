// Oveja.js

// Asegúrate de que el archivo utils.js esté incluido en tu index.html antes de este script

class Oveja extends Objeto {
  constructor(x, y, velMax, juego) {
    super(x, y, velMax, juego);
    this.VelMaxOriginal = velMax;
    this.velMaxEnModoHuir = velMax * 2;
    this.equipoParaUpdate = Math.floor(Math.random() * 9) + 1;
    this.juego = juego;
    this.grid = juego.grid; // Referencia a la grid
    this.vision = 120 + Math.floor(Math.random() * 150); //en pixels
    this.vida = 1;
    this.debug = 0;

    this.cargarVariosSpritesAnimadosDeUnSoloArchivo(
      {
        archivo: "./img/oveja.png",
        frameWidth: 64,
        frameHeight: 64,
        velocidad: velMax * 0.1,
        animaciones: {
          correrAbajo: {
            desde: {
              x: 0,
              y: 0,
            },
            hasta: {
              x: 3,
              y: 0,
            },
          },
          correrLado: {
            desde: {
              x: 0,
              y: 1,
            },
            hasta: {
              x: 3,
              y: 1,
            },
          },
          correrArriba: {
            desde: {
              x: 0,
              y: 2,
            },
            hasta: {
              x: 3,
              y: 2,
            },
          },
        },
      },
      (animaciones) => {
        this.listo = true;
        this.cambiarSprite("correrLado");
      }
    );

    // this.cargarVariosSpritesAnimados(
    //   {
    //     correr: "./img/oveja.png",
    //   },
    //   64,
    //   64,
    //   velocidad * 0.5,
    //   (e) => {
    //     this.listo = true;
    //     this.cambiarSprite("correr");
    //   }
    // );

    this.estados = { IDLE: 0, HUYENDO: 1 };
    this.estado = this.estados.IDLE;
  }

  mirarAlrededor() {
    this.vecinos = this.obtenerVecinos();
    this.celdasVecinas = this.miCeldaActual.obtenerCeldasVecinas();
    this.estoyViendoAlPlayer = this.evaluarSiEstoyViendoAlPlayer();
  }

  hacerCosasSegunEstado() {
    let vecAtraccionAlPlayer,
      vecSeparacion,
      vecAlineacion,
      vecCohesion,
      bordes,
      vecRepulsionAObstaculos;

    let sumaDeVectores = new PIXI.Point(0, 0);

    //CALCULO LA FUERZA Q TRAE AL PERSONAJE PADENTRO DE LA PANTALLA DE NUEVO
    bordes = this.ajustarPorBordes();

    if (this.estado == this.estados.HUYENDO) {
      //SI ESTOY VIENDO AL PLAYER, HACERLE ATRACCION
      vecAtraccionAlPlayer = this.repulsionAlPerro();
      this.velocidadMax = this.velMaxEnModoHuir;
    } else if (this.estado == this.estados.IDLE) {
      //CALCULO LOS VECTORES PARA LOS PASOS DE BOIDS, SI NO HAY TARGET
      vecAlineacion = this.alineacion(this.vecinos);
      vecCohesion = this.cohesion(this.vecinos);
      // this.velocidad.x*=0.9
      // this.velocidad.y*=0.9
      this.velocidadMax = this.VelMaxOriginal;
    }

    vecRepulsionAObstaculos = this.repelerObstaculos(this.vecinos);
    vecSeparacion = this.separacion(this.vecinos);

    //SUMO LOS VECTORES ANTES DE APLICARLOS
    sumaDeVectores.x += (vecSeparacion || {}).x || 0;
    sumaDeVectores.x += (vecAlineacion || {}).x || 0;
    sumaDeVectores.x += (vecCohesion || {}).x || 0;
    sumaDeVectores.x += (vecAtraccionAlPlayer || {}).x || 0;
    sumaDeVectores.x += (bordes || {}).x || 0;
    sumaDeVectores.x += (vecRepulsionAObstaculos || {}).x || 0;

    sumaDeVectores.y += (vecSeparacion || {}).y || 0;
    sumaDeVectores.y += (vecAlineacion || {}).y || 0;
    sumaDeVectores.y += (vecCohesion || {}).y || 0;
    sumaDeVectores.y += (vecAtraccionAlPlayer || {}).y || 0;
    sumaDeVectores.y += (bordes || {}).y || 0;
    sumaDeVectores.y += (vecRepulsionAObstaculos || {}).y || 0;

    this.aplicarFuerza(sumaDeVectores);
  }

  update() {
    if (!this.listo) return;
    if (this.juego.contadorDeFrames % this.equipoParaUpdate == 0) {
      this.mirarAlrededor();
      this.segunDatosCambiarDeEstado();
      this.hacerCosasSegunEstado();
    }

    if ((this.juego.contadorDeFrames + this.equipoParaUpdate) % 4 == 1) {
      //CADA 4 FRAMES
      this.calcularAngulo();
      this.ajustarSpriteSegunAngulo();
    }

    //USA EL METODO UPDATE Q ESTA EN LA CLASE DE LA CUAL HEREDA ESTA:
    super.update();
  }

  ajustarSpriteSegunAngulo() {
    if (this.angulo > 315 || this.angulo < 45) {
      this.cambiarSprite("correrLado");
    } else if (this.angulo > 135 && this.angulo < 225) {
      this.cambiarSprite("correrLado");
    } else if (this.angulo > 45 && this.angulo < 135) {
      this.cambiarSprite("correrArriba");
    } else if (this.angulo > 225 && this.angulo < 315) {
      this.cambiarSprite("correrAbajo");
    }
  }
  segunDatosCambiarDeEstado() {
    if (this.estoyViendoAlPlayer) {
      this.estado = this.estados.HUYENDO;
    } else {
      this.estado = this.estados.IDLE;
    }
  }

  // atacar() {
  //   //SI YA ESTABA ATANCANDO, NO CAMBIAR EL SPRITE
  //   if (this.spriteActual.startsWith("ataque")) return;

  //   this.cambiarSprite(
  //     "ataque" + (Math.floor(Math.random() * 2) + 1).toString()
  //   );
  // }

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

  repulsionAlPerro() {
    const vecDistancia = new PIXI.Point(
      this.juego.player.container.x - this.container.x,
      this.juego.player.container.y - this.container.y
    );

    // let vecNormalizado = normalizarVector(vecDistancia.x, vecDistancia.y);

    let distCuadrada = vecDistancia.x ** 2 + vecDistancia.y ** 2;

    //HACER NEGATIVO ESTE VECTOR Y LOS ZOMBIES TE HUYEN
    vecDistancia.x = -(50 * vecDistancia.x) / distCuadrada;
    vecDistancia.y = -(50 * vecDistancia.y) / distCuadrada;
    return vecDistancia;
  }

  cohesion(vecinos) {
    const vecPromedio = new PIXI.Point(0, 0);
    let total = 0;

    vecinos.forEach((oveja) => {
      if (oveja instanceof Oveja) {
        vecPromedio.x += oveja.container.x;
        vecPromedio.y += oveja.container.y;
        total++;
      }
    });

    if (total > 0) {
      vecPromedio.x /= total;
      vecPromedio.y /= total;

      // Crear un vector que apunte hacia el centro de masa
      vecPromedio.x = vecPromedio.x - this.container.x;
      vecPromedio.y = vecPromedio.y - this.container.y;

      // // Escalar para que sea proporcional a la velocidad máxima
      vecPromedio.x *= 0.01;
      vecPromedio.y *= 0.01;
    }

    return vecPromedio;
  }

  separacion(vecinos) {
    const vecFuerza = new PIXI.Point(0, 0);

    vecinos.forEach((oveja) => {
      if (oveja instanceof Oveja) {
        const distancia = distanciaAlCuadrado(
          this.container.x,
          this.container.y,
          oveja.container.x,
          oveja.container.y
        );

        const dif = new PIXI.Point(
          this.container.x - oveja.container.x,
          this.container.y - oveja.container.y
        );
        dif.x /= distancia;
        dif.y /= distancia;
        vecFuerza.x += dif.x;
        vecFuerza.y += dif.y;
      }
    });

    vecFuerza.x *= 2.3;
    vecFuerza.y *= 2.3;
    return vecFuerza;
  }

  alineacion(vecinos) {
    const vecPromedio = new PIXI.Point(0, 0);
    let total = 0;

    vecinos.forEach((oveja) => {
      if (oveja instanceof Oveja) {
        vecPromedio.x += oveja.velocidad.x;
        vecPromedio.y += oveja.velocidad.y;
        total++;
      }
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
}
