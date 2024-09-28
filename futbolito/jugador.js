class Jugador extends Entidad {
  constructor(obj, juego, equipo) {
    super(MITAD_DE_CANCHA, LIMITE_ABAJO - 200, juego);
    this.objInit = obj;

    this.radio = 6;
    this.velMax = 2 + Math.random();
    this.accMax = 0.4 + Math.random() * 0.2;

    this.fuerzaParaPegarle = 4 + Math.random() * 3;

    for (let key of Object.keys(obj)) {
      this[key] = obj[key];
    }

    this.equipo = equipo;

    this.crearGrafico();

    //PANEL DE CONTROL DE CADA ASPECTO DE BOIDS:

    this.factorSeparacion = 50;
    this.factorSeparacionDeLosMios = 500;
    this.factorAlineacion = 12;
    this.factorAgruparse = 2;
    //
    this.factorEscapar = 50;
    this.vision = 100;
    this.distanciaLimiteParaEstarCerca = this.radio * 2;
    this.crearCirculoSeleccionador();

    this.definirPosicionEnLaCancha();
  }

  definirPosicionEnLaCancha() {
    let limiteDer, limiteIzq, limiteArriba, limiteAbajo;
    let cantJugadoresEnMiLinea = this.equipo.formacion[this.rol - 1];
    this.porQueLadoVoy = this.numero % cantJugadoresEnMiLinea;
    let altoDeMiSegmento = ANCHO_CANCHA / cantJugadoresEnMiLinea;

    limiteArriba = LIMITE_ARRIBA + altoDeMiSegmento * this.porQueLadoVoy;
    limiteAbajo = limiteArriba + altoDeMiSegmento;

    if (this.rol == ROLES.DEFENSOR) {
      if (this.equipo.id == 0) {
        limiteIzq = LIMITE_IZQ;
        limiteDer = PRIMER_TERCIO;
      } else {
        limiteIzq = SEGUNDO_TERCIO;
        limiteDer = LIMITE_DER;
      }
    } else if (this.rol == ROLES.MEDIOCAMPISTA) {
      limiteIzq = PRIMER_TERCIO;
      limiteDer = SEGUNDO_TERCIO;
    } else if (this.rol == ROLES.ATACANTE) {
      if (this.equipo.id == 0) {
        limiteIzq = SEGUNDO_TERCIO;
        limiteDer = LIMITE_DER;
      } else {
        limiteIzq = LIMITE_IZQ;
        limiteDer = PRIMER_TERCIO;
      }
    } else if (this.rol == ROLES.ARQUERO) {
      limiteArriba = 205;
      limiteAbajo = 574;
      altoDeMiSegmento = limiteAbajo - limiteArriba;
      if (this.equipo.id == 0) {
        limiteIzq = LIMITE_IZQ;
        limiteDer = 221;
      } else {
        limiteIzq = 832;
        limiteDer = LIMITE_DER;
      }
    }

    // console.log(
    //   this.nombre, "equipo",
    //   this.equipo.id,"ROL",
    //   this.rol,
    //   "IZQ",
    //   limiteIzq,
    //   "DER",
    //   limiteDer,
    //   "ARRIBA",
    //   limiteArriba,
    //   "ABAJO",
    //   limiteAbajo,
    //   "alto:",
    //   altoDeMiSegmento,
    //   "cantJugadoresEnMiLinea",
    //   cantJugadoresEnMiLinea,
    //   "this.porQueLadoVoy ",
    //   this.porQueLadoVoy
    // );

    limiteIzq -=
      this.rol != ROLES.ARQUERO ? CANTIDAD_PX_AGRANDAR_AREA_DE_ACCION : 5;
    limiteDer +=
      this.rol != ROLES.ARQUERO ? CANTIDAD_PX_AGRANDAR_AREA_DE_ACCION : 5;
    limiteAbajo +=
      this.rol != ROLES.ARQUERO ? CANTIDAD_PX_AGRANDAR_AREA_DE_ACCION : 5;
    limiteArriba -=
      this.rol != ROLES.ARQUERO ? CANTIDAD_PX_AGRANDAR_AREA_DE_ACCION : 5;

    if (limiteIzq < LIMITE_IZQ) limiteIzq = LIMITE_IZQ;
    if (limiteDer > LIMITE_DER) limiteDer = LIMITE_DER;
    if (limiteArriba < LIMITE_ARRIBA) limiteArriba = LIMITE_ARRIBA;
    if (limiteAbajo > LIMITE_ABAJO) limiteAbajo = LIMITE_ABAJO;

    this.areaDeAccion = {
      x: limiteIzq,
      y: limiteArriba,
      limiteAbajo,
      limiteDer,
      ancho: limiteDer - limiteIzq,
      alto: limiteAbajo - limiteArriba,
    };

    let changui_arquero = 10;

    if (this.rol != ROLES.ARQUERO) {
      this.posicionEnLaCancha = {
        pos: new Vector(
          (limiteIzq + limiteDer) / 2,
          (limiteArriba + limiteAbajo) / 2
        ),
      };
    } else {
      this.posicionEnLaCancha = {
        pos: new Vector(
          this.equipo.id == 0
            ? LIMITE_IZQ + changui_arquero
            : LIMITE_DER - changui_arquero,
          (limiteArriba + limiteAbajo) / 2
        ),
      };
    }

    // if(isNaN(this.posicionEnLaCancha.pos.x) || isNaN(this.posicionEnLaCancha.pos.y)) debugger

    this.crearRectanguloDelAreaDeAccion(
      limiteIzq,
      limiteArriba,
      limiteDer - limiteIzq,
      limiteAbajo - limiteArriba
    );
  }

  crearRectanguloDelAreaDeAccion(x, y, ancho, alto) {
    let changui = 5;
    let margenDefinidoPorElEquipo = this.equipo.id * 10;
    this.rectAreaDeAccion = new PIXI.Graphics()
      .rect(
        x + changui + margenDefinidoPorElEquipo,
        y + changui + margenDefinidoPorElEquipo,
        ancho - changui,
        alto - changui
      )
      .stroke(this.equipo.color);
    this.rectAreaDeAccion.visible = false;

    this.juego.containerDebug.addChild(this.rectAreaDeAccion);
  }
  cambiarFormacion(formacion) {
    console.log(this.nombre, this.equipo.id, formacion);
    this.formacion = formacion;
  }

  crearGrafico() {
    this.grafico = new PIXI.Graphics()
      .circle(0, 0, this.radio)
      .fill(this.equipo.color)
      .stroke(this.equipo.colorSecundario);
    // .stokeWidth(3)
    this.grafico
      .moveTo(0, 0)
      .lineTo(this.radio * 1.1, 0)
      .stroke(0xffffff);
    this.container.addChild(this.grafico);
  }

  perseguir(aQuien) {
    if (!aQuien) return;

    let vectorQApuntaAlTarget = {
      x: aQuien.pos.x - this.pos.x,
      y: aQuien.pos.y - this.pos.y,
    };

    let tempVec = new Vector(vectorQApuntaAlTarget.x, vectorQApuntaAlTarget.y);
    if (tempVec.mag() > this.distanciaLimiteParaEstarCerca) {
      this.aplicarFuerza(
        vectorQApuntaAlTarget.x * this.factorEscapar,
        vectorQApuntaAlTarget.y * this.factorEscapar
      );
    }
  }

  separacionConMiEquipo() {
    let promX = 0;
    let promY = 0;

    if (this.jugadoresCerca.length == 0) return;

    let total = 0;
    for (let jugadorCerca of this.jugadoresCerca) {
      if (
        this == jugadorCerca.jugador ||
        jugadorCerca.jugador.equipo.id != this.equipo.id
      ) {
        continue;
      }
      if (jugadorCerca.dist < this.distanciaLimiteParaEstarCerca) {
        
        total++;
        promX += jugadorCerca.jugador.pos.x;
        promY += jugadorCerca.jugador.pos.y;
      }
    }
    if (total == 0) return;

    promX /= total;
    promY /= total;

    this.vectorQApuntaAlPromedioDePosicionesDeLosDeMiEquipo = {
      x: this.pos.x - promX,
      y: this.pos.y - promY,
    };

    // if(isNaN(this.vectorQApuntaAlPromedioDePosiciones.x)) debugger

    // console.log(this.vectorQApuntaAlPromedioDePosiciones)

    this.aplicarFuerza(
      this.vectorQApuntaAlPromedioDePosicionesDeLosDeMiEquipo.x,

      this.vectorQApuntaAlPromedioDePosicionesDeLosDeMiEquipo.y
    );
  }

  separacion() {
    let promX = 0;
    let promY = 0;

    if (this.jugadoresCerca.length == 0) return;

    let total = 0;
    for (let jugadorCerca of this.jugadoresCerca) {
      if (jugadorCerca.dist < this.distanciaLimiteParaEstarCerca) {
        total++;
        promX += jugadorCerca.jugador.pos.x;
        promY += jugadorCerca.jugador.pos.y;
      }
    }
    if (total == 0) return;

    promX /= total;
    promY /= total;

    this.vectorQApuntaAlPromedioDePosiciones = {
      x: this.pos.x - promX,
      y: this.pos.y - promY,
    };

    // if(isNaN(this.vectorQApuntaAlPromedioDePosiciones.x)) debugger

    this.aplicarFuerza(
      this.vectorQApuntaAlPromedioDePosiciones.x * this.factorSeparacion,
      this.vectorQApuntaAlPromedioDePosiciones.y * this.factorSeparacion
    );
  }

  // alineacion() {
  //   if (this.jugadoresCerca.length == 0) return;

  //   let promVelX = 0;
  //   let promVelY = 0;

  //   for (let jugador of this.jugadoresCerca) {
  //     promVelX += jugador.jugador.velocidad.x;
  //     promVelY += jugador.jugador.velocidad.y;
  //   }

  //   promVelX /= this.jugadoresCerca.length;
  //   promVelY /= this.jugadoresCerca.length;

  //   let velocidadDeseada = { x: promVelX, y: promVelY };

  //   let fuerza = {
  //     x: velocidadDeseada.x - this.velocidad.x,
  //     y: velocidadDeseada.y - this.velocidad.y,
  //   };

  //   this.aplicarFuerza(
  //     fuerza.x * this.factorAlineacion,
  //     fuerza.y * this.factorAlineacion
  //   );
  // }

  buscarjugadoresCerca() {
    let jugadoresCerca = [];
    for (let jugador of this.juego.jugadores) {
      if (jugador == this) continue;
      let dist = distancia(jugador, this);
      if (dist < this.radio * 2) {
        jugadoresCerca.push({ jugador, dist });
      }
    }
    return jugadoresCerca;
  }
  percibirEntorno() {
    this.jugadoresCerca = this.buscarjugadoresCerca();
    this.distanciaALaPelota = distancia(this, this.juego.pelota);
    this.lePuedoPegar = this.distanciaALaPelota < DISTANCIA_PARA_PEGARLE;

    this.estamosAtacando =
      (this.juego.pelota.estaDelLadoDerecho && this.equipo.id == 0) ||
      (this.juego.pelota.estaDelLadoIzquierdo && this.equipo.id == 1);

    this.estaLaPelotaDeMiLado =
      (this.sectorVertical == LADO.ARRIBA &&
        this.juego.pelota.estaEnLaMitadSuperior) ||
      (this.sectorVertical == LADO.ABAJO &&
        this.juego.pelota.estaEnLaMitadInferior);

    this.verSiLaPelotaEstaEnMiAreaDeAccion();
  }

  verSiLaPelotaEstaEnMiAreaDeAccion() {
    let pelotaX = this.juego.pelota.pos.x;
    let pelotaY = this.juego.pelota.pos.y;
    this.estaLaPelotaEnMiAreaDeAccion =
      pelotaX > this.areaDeAccion.x &&
      pelotaX < this.areaDeAccion.limiteDer &&
      pelotaY > this.areaDeAccion.y &&
      pelotaY < this.areaDeAccion.limiteAbajo;
  }

  hacerCosas() {
    this.separacion();
    // console.log(this.acc.x,this.acc.y)
    this.separacionConMiEquipo();

    if (this.estaLaPelotaEnMiAreaDeAccion) {
      this.perseguir(this.juego.pelota);
    } else {
      this.perseguir(this.posicionEnLaCancha);
    }

    // this.perseguir(this.juego.pelota);

    if (this.lePuedoPegar) {
      if (this.juego.pelota.estaYendoDespacio) {
        this.patearPelota();
      } else {
        this.pararPelota();
      }
    }
  }
  pararPelota() {
    this.juego.pelota.velocidad.mult(0.02);
    this.juego.pelota.velocidad.x += Math.random() * 0.1 - 0.05;
    this.juego.pelota.velocidad.y += Math.random() * 0.1 - 0.05;
  }

  patearPelota() {
    let cualArco =
      this.equipo.id == 0
        ? new Vector(LIMITE_DER, MITAD_TRANSVERSAL)
        : new Vector(LIMITE_IZQ, MITAD_TRANSVERSAL);

    cualArco.sub(this.juego.pelota.pos);
    cualArco.setMag(this.fuerzaParaPegarle * (0.5 + Math.random()));

    // console.log(this.nombre, this.equipo.id, cualArco.x, cualArco.y)

    this.juego.pelota.aplicarFuerza(
      cualArco.x + Math.random() * 1 - 0.5,
      cualArco.y + Math.random() * -0.5
    );
  }

  update() {
    //EJECUTA EL METODO UPDATE DE LA CLASE DE LA CUAL ESTA HEREDA
    // this.depredador = this.buscarDepredadorMasCercano();
    this.percibirEntorno();
    this.hacerCosas();

    // console.log(this.acc)

    // console.log(this.juego.depredadores , depredador)
    // this.agruparseConOtrasjugadors();

    // this.alineacion();
    // if (this.depredador) this.escaparse(this.depredador);
    this.velocidad.mult(0.9);


    console.log(this.nombre, this.acc)

    super.update();
  }
}
