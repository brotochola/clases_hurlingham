class Player extends Objeto {
  constructor(x, y, velMax, juego) {
    super(x, y, velMax, juego);
    this.velocidadMax = velMax;
    this.juego = juego;
    this.grid = juego.grid;
    // this.maxFuerza=0.3

    this.cargarSpriteSheetAnimadoDeJSON("./img/ambulancia.json", (e) => {
      this.listo = true;
      this.cambiarSprite("1");
      for (let sprite of Object.values(this.spritesAnimados)) {
        sprite.scale.set(1);
        sprite.anchor.set(0.5, 0.5);
      }
    });

    // this.cargarVariosSpritesAnimadosDeUnSoloArchivo(
    //   {
    //     archivo: "./img/perro.png",
    //     frameWidth: 32,
    //     frameHeight: 32,
    //     velocidad: velMax * 0.05,
    //     animaciones: {
    //       correrAbajo: {
    //         desde: {
    //           x: 0,
    //           y: 0,
    //         },
    //         hasta: {
    //           x: 3,
    //           y: 0,
    //         },
    //       },
    //       correrLado: {
    //         desde: {
    //           x: 0,
    //           y: 1,
    //         },
    //         hasta: {
    //           x: 3,
    //           y: 1,
    //         },
    //       },
    //       correrArriba: {
    //         desde: {
    //           x: 0,
    //           y: 2,
    //         },
    //         hasta: {
    //           x: 3,
    //           y: 2,
    //         },
    //       },
    //       idle: {
    //         desde: {
    //           x: 3,
    //           y: 7,
    //         },
    //         hasta: {
    //           x: 3,
    //           y: 7,
    //         },
    //       },
    //     },
    //   },
    //   (animaciones) => {
    //     this.listo = true;
    //     this.cambiarSprite("correrLado");
    //     for (let sprite of Object.values(this.spritesAnimados)) {
    //       sprite.scale.set(2);
    //     }
    //   }
    // );

    // this.juego.app.stage.addChild(this.sprite);
  }

  update() {
    if (!this.listo) return;

    if (this.juego.contadorDeFrames % 4 == 1) {
      this.manejarSprites();
    }
    this.calcularYAplicarFuerzas();
    super.update();
    // this.limitarVelocidadSiHayObstaculos()
  }

  manejarSprites() {
    this.calcularAngulo();
    this.ajustarSpriteSegunAngulo();

    // this.hacerQueLaVelocidadDeLaAnimacionCoincidaConLaVelocidad();
  }

  // limitarVelocidadSiHayObstaculos(){
  //   let numeroDeFrames=2
  //   let xDelFuturo=this.container.x+this.velocidad.x*numeroDeFrames
  //   let yDelFuturo=this.container.y+this.velocidad.y*numeroDeFrames

  //   let celdaDondeVoyAEstarEnElFuturo=this.juego.grid.getCellPX(xDelFuturo,yDelFuturo)
  //   let piedrasEnLaCeldaDelFuturo=Object.values(celdaDondeVoyAEstarEnElFuturo.objetosAca).filter(k=>k instanceof Piedra)
  //   if(piedrasEnLaCeldaDelFuturo.length){
  //     if(Math.abs(this.velocidad.x)>Math.abs(this.velocidad.y)){
  //       this.velocidad.x=0
  //     }else{
  //       this.velocidad.y=0
  //     }
  //   }

  // }

  calcularYAplicarFuerzas() {
    //EN FUERZAS VOY A SUMAR TODAS LAS FUERZAS Q FRAME A FRAME ACTUAN SOBR ESTE PERSONAJE
    let fuerzas = new PIXI.Point(0, 0);
    //ATRACCION AL MOUSE
    const vecAtraccionMouse = this.atraccionAlMouse();
    if (vecAtraccionMouse) {
      fuerzas.x += vecAtraccionMouse.x;
      fuerzas.y += vecAtraccionMouse.y;
    }

    const repulsionAObstaculos = this.repelerObstaculos(this.obtenerVecinos());
    if (repulsionAObstaculos) {
      fuerzas.x += repulsionAObstaculos.x;
      fuerzas.y += repulsionAObstaculos.y;
    }

    const bordes = this.ajustarPorBordes();
    fuerzas.x += bordes.x;
    fuerzas.y += bordes.y;

    //FUERZA APLICADA ES LA VELOCIDAD + LA ACELERACION/FUERZA, ES DECIR ADONDE QUIERE IR EL PERSONAJE
    let fuerzaAplicada = {
      x: this.velocidad.x + fuerzas.x,
      y: this.velocidad.y + fuerzas.y,
    };

    //SEGUN EL PAPER DEL CHABON, DESIREDVELOCITY-CURRENTVLEOCITY NOS DA LA ACELERACION PARA DOBLAR
    let steering = {
      x: fuerzaAplicada.x - this.velocidad.x,
      y: fuerzaAplicada.y - this.velocidad.y,
    };

    //Y ACA LA APLICAMOS AL VECTOR DE VELOCIDA ACTUAL
    this.velocidad.x += steering.x;
    this.velocidad.y += steering.y;

    //PRUEBA CON LERP, NO ES LO MISMO :P
    // this.velocidad.x=lerp(velActual.x,this.velocidad.x,0.7)
    // this.velocidad.y=lerp(velActual.y,this.velocidad.y,0.7)
  }
  ajustarSpriteSegunAngulo() {
    //TENEMOS 41 SPRITES PARA EL GIRO DE LA AMBULANCIA
    //360 GRADOS LOS DIVIDO POR LA CANTIDAD Q TENEMOS

    const cantidadDeImagenesQTenemos = 47;
    let grados = 360 / cantidadDeImagenesQTenemos;
    let correccionDeAngulo = 0;
    let anguloActualizado =
      (360 - this.angulo + correccionDeAngulo + 360) % 360;
    let porcion = Math.floor(anguloActualizado / grados) + 1;
    this.cambiarSprite(porcion);
    this.porcion = porcion;

    // let velLineal = calculoDeDistanciaRapido(
    //   0,
    //   0,
    //   this.velocidad.x,
    //   this.velocidad.y
    // );

    // if (
    //   this.angulo >= 315 ||
    //   this.angulo <= 45 ||
    //   (this.angulo >= 135 && this.angulo <= 225)
    // ) {
    //   //SI LA VELOCIDAD ES LA MITAD DE LA VELOCIDAD MAXIMA, CAMBIO AL SPRITE DE CAMINAR
    //   if (velLineal < this.velocidadMax * 0.5) {
    //     this.cambiarSprite("caminarLado");
    //   } else {
    //     this.cambiarSprite("correrLado");
    //   }
    // } else if (this.angulo > 45 && this.angulo < 135) {
    //   this.cambiarSprite("correrArriba");
    // } else if (this.angulo > 225 && this.angulo < 315) {
    //   this.cambiarSprite("correrAbajo");
    // }
  }

  colision() {
    console.log("colision", this.container.x, this.container.y , "velocidadLineal:", calculoDeDistanciaRapido(0,0,this.velocidad.x, this.velocidad.y));
  }
  atraccionAlMouse() {
    if (!this.juego.mouse) return null;
    const vecMouse = new PIXI.Point(
      this.juego.mouse.x - this.juego.app.stage.x - this.container.x,
      this.juego.mouse.y - this.juego.app.stage.y - this.container.y
    );

    let distCuadrada = vecMouse.x ** 2 + vecMouse.y ** 2;

    if (distCuadrada < this.juego.grid.cellSize ** 2) return null;

    return {
      x: (vecMouse.x - this.velocidad.x) * 0.001,
      y: (vecMouse.y - this.velocidad.y) * 0.001,
    };
  }
}