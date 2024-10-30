class Player extends Objeto {
  constructor(x, y, velMax, juego) {
    super(x, y, velMax, juego);

    this.velocidadMax = velMax;
    this.juego = juego;
    this.grid = juego.grid;
    // this.maxFuerza=0.3

    this.ponerCajitaDeMatterJS();

    this.cargarSpriteSheetAnimadoDeJSON("./img/ambulancia.json", (e) => {
      this.listo = true;
      this.cambiarSprite("1");
      for (let sprite of Object.values(this.spritesAnimados)) {
        sprite.scale.set(1);
        sprite.anchor.set(0.5, 0.5);
      }
    });

    this.maxSpeed = 5; // Velocidad máxima
    this.acceleration = 0.5; // Aceleración
    this.deceleration = 0.05; // Desaceleración (inercia)
    this.rotationSpeed = 0.01; // Velocidad de rotación
    // this.velocidad = { x: 0, y: 0 };

    this.traccion = 0;
    this.angulo = 0;
    this.velocidadLineal = 0;
  }
  actualizarZIndex() {
    this.container.zIndex = Math.floor(this.container.y);
  }

  ponerCajitaDeMatterJS() {
    this.caja = Matter.Bodies.rectangle(
      this.container.x,
      this.container.y,
      80,
      35
    );

    this.caja.yo = this;

    // add all of the bodies to the world
    Matter.Composite.add(this.juego.engine.world, [this.caja]);
  }

  colisionCon(quien) {
    // console.log("player colisionCon", quien);
  }
  update() {
    if (!this.listo) return;

    this.posAnterior = { x: this.caja.position.x, y: this.caja.position.y };

    if (this.juego.contadorDeFrames % 4 == 1) {
      this.ajustarSpriteSegunAngulo();
    }
    this.calcularYAplicarFuerzas();

    this.grid.update(this);
    this.actualizarZIndex();
    // super.update();
    // this.limitarVelocidadSiHayObstaculos()
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

  calcularAnguloYTraccion() {
    // Rotación

    this.tocamosAlgunaTecla = false;

    if (this.juego.keyboard["a"]) {
      if (this.traccion > 0) {
        // this.angulo -= (this.rotationSpeed * this.velocidadLineal) % 360;
        this.caja.angle -= 0.001;
      } else {
        this.caja.angle += 0.001;

        // this.angulo += (this.rotationSpeed * this.velocidadLineal) % 360;
      }
    }
    if (this.juego.keyboard["d"]) {
      if (this.traccion > 0) {
        // this.angulo += (this.rotationSpeed * this.velocidadLineal) % 360;
        this.caja.angle += 0.001;
      } else {
        // this.angulo -= (this.rotationSpeed * this.velocidadLineal) % 360;
        this.caja.angle -= 0.001;
      }
    }

    if (this.juego.keyboard[" "]) {
      this.traccion *= 0.95;
      this.moverCajita();
    } else if (this.juego.keyboard["w"]) {
      this.tocamosAlgunaTecla = true;

      this.traccion += this.acceleration;
      this.moverCajita();
    } else if (this.juego.keyboard["s"]) {
      this.tocamosAlgunaTecla = true;

      this.traccion += -this.acceleration;
      this.moverCajita();
    }
  }

  moverCajita() {
    let cos = Math.cos(this.caja.angle);
    let sin = Math.sin(this.caja.angle);
    Matter.Body.setVelocity(this.caja, {
      x: cos * 0.1 * this.traccion,
      y: sin * 0.1 * this.traccion,
    });
  }
  calcularYAplicarFuerzas() {
    //EN FUERZAS VOY A SUMAR TODAS LAS FUERZAS Q FRAME A FRAME ACTUAN SOBR ESTE PERSONAJE
    // let fuerzas = new PIXI.Point(0, 0);
    //ATRACCION AL MOUSE
    // const vecAtraccionMouse = this.atraccionAlMouse();
    // if (vecAtraccionMouse) {
    //   fuerzas.x += vecAtraccionMouse.x;
    //   fuerzas.y += vecAtraccionMouse.y;
    // }

    this.calcularAnguloYTraccion();

    // const repulsionAObstaculos = this.repelerObstaculos(this.obtenerVecinos());
    // if (repulsionAObstaculos) {
    //   fuerzas.x += repulsionAObstaculos.x;
    //   fuerzas.y += repulsionAObstaculos.y;
    // }

    // const bordes = this.ajustarPorBordes();
    // fuerzas.x += bordes.x;
    // fuerzas.y += bordes.y;

    // //FUERZA APLICADA ES LA VELOCIDAD + LA ACELERACION/FUERZA, ES DECIR ADONDE QUIERE IR EL PERSONAJE
    // let fuerzaAplicada = {
    //   x: this.velocidad.x + fuerzas.x,
    //   y: this.velocidad.y + fuerzas.y,
    // };

    // //SEGUN EL PAPER DEL CHABON, DESIREDVELOCITY-CURRENTVLEOCITY NOS DA LA ACELERACION PARA DOBLAR
    // let steering = {
    //   x: fuerzaAplicada.x - this.velocidad.x,
    //   y: fuerzaAplicada.y - this.velocidad.y,
    // };

    // //Y ACA LA APLICAMOS AL VECTOR DE VELOCIDA ACTUAL
    // this.velocidad.x += steering.x;
    // this.velocidad.y += steering.y;

    //PRUEBA CON LERP, NO ES LO MISMO :P
    // this.velocidad.x=lerp(velActual.x,this.velocidad.x,0.7)
    // this.velocidad.y=lerp(velActual.y,this.velocidad.y,0.7)

    // //SEGUN EL ANGULO CALCULO CUANTO EN X Y CUANTO EN Y DEBERIA MOVERSE

    // //LLAMO TRACCION A LA VELOCIDAD DE ROTACION DE LAS RUEDAS DEL AUTO, O ALGO ASI
    // this.velocidad.x = cos * this.traccion;
    // this.velocidad.y = sin * this.traccion;

    // //LA TRACCION VA DISMINUYENDO FRAME A FRAME
    // this.traccion *= 1 - this.deceleration;

    // //ME GUARDO UNA REFERENCIA DE LA VELOCIDAD LINEAL DEL AUTO, CON PITAGORAS
    // this.velocidadLineal = Math.sqrt(
    //   this.velocidad.x ** 2 + this.velocidad.y ** 2
    // );

    // //QUE LA VELOCIDAD NO EXCEDA LA MAXIMA
    // this.limitSpeed();

    // if (Math.abs(this.velocidad.x) < 0.2 && Math.abs(this.velocidad.y) < 0.2) {
    //   this.velocidad.x = 0;
    //   this.velocidad.y = 0;
    // } else {
    //   this.velocidad.x *= 0.98;
    //   this.velocidad.y *= 0.98;
    // }

    // this.caja.isStatic = !this.tocamosAlgunaTecla;

    this.container.x = this.caja.position.x;
    this.container.y = this.caja.position.y;

    //LA VELOCIDAD SE APLICA A LA POSICION
    // this.container.x += this.velocidad.x;
    // this.container.y += this.velocidad.y;

    //EL SPRITE MATCHEA SIEMPRE SU ROTACION CON LA PROPIEDAD ANGULO
    // this.sprite.rotation = this.angulo
  }
  limitSpeed() {
    // Limitar la velocidad máxima
    let factor = this.traccion > 0 ? 1 : this.traccion < 0 ? -1 : 0;
    //LIMITAR LA TRACCION
    this.traccion =
      Math.abs(this.traccion) > this.maxSpeed
        ? this.maxSpeed * factor
        : this.traccion;

    if (this.velocidadLineal > this.maxSpeed) {
      this.velocidad.x =
        (this.velocidad.x / this.velocidadLineal) * this.maxSpeed;
      this.velocidad.y =
        (this.velocidad.y / this.velocidadLineal) * this.maxSpeed;
    }
  }

  ajustarSpriteSegunAngulo() {
    //TENEMOS 41 SPRITES PARA EL GIRO DE LA AMBULANCIA
    //360 GRADOS LOS DIVIDO POR LA CANTIDAD Q TENEMOS

    const cantidadDeImagenesQTenemos = 47;
    let grados = 360 / cantidadDeImagenesQTenemos;
    this.anguloActualizado =
      radians_to_degrees(this.caja.angle + 360 - 90) % 360;
    let porcion = Math.floor(this.anguloActualizado / grados) + 1;

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
    console.log(
      "colision",
      this.container.x,
      this.container.y,
      "velocidadLineal:",
      calculoDeDistanciaRapido(0, 0, this.velocidad.x, this.velocidad.y)
    );
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
