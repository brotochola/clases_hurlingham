class Jugador extends Entidad {
  constructor(obj, juego) {
    super(obj.x, obj.y, juego);

    this.lado = 10;
    this.velMax = 4 + Math.random();
    this.accMax = 0.5 + Math.random() * 0.2;

    this.fuerzaParaPegarle = 4 + Math.random() * 3;

    for (let key of Object.keys(obj)) {
      this[key] = obj[key];
    }

    this.crearGrafico();

    //PANEL DE CONTROL DE CADA ASPECTO DE BOIDS:

    this.factorSeparacion = 5;
    this.factorAlineacion = 12;
    this.factorAgruparse = 2;
    //
    this.factorEscapar = 3;
    this.vision = 100;
    this.distanciaLimiteParaEstarCerca = this.lado * 0.5;
    this.crearGraficoParaIndicarQueEstaEntidadEStaSeleccionada();

    this.posicionEnLaCancha = {
      pos: new Vector(obj.x, obj.y),
    };
  }

  crearGrafico() {
    this.grafico = new PIXI.Graphics()
      .rect(0, 0, this.lado, this.lado / 2)
      .fill(this.equipo == 0 ? 0xff0000 : 0x0000ff);
    this.container.addChild(this.grafico);
  }

  perseguir(aQuien) {
    if (!aQuien) return;

    let vectorQApuntaAlTarget = {
      x: aQuien.pos.x - this.pos.x,
      y: aQuien.pos.y - this.pos.y,
    };

    let tempVec = new Vector(vectorQApuntaAlTarget.x, vectorQApuntaAlTarget.y);
    if (tempVec.mag() > this.lado * 2) {
      this.aplicarFuerza(
        vectorQApuntaAlTarget.x * this.factorEscapar,
        vectorQApuntaAlTarget.y * this.factorEscapar
      );
    }
  }

  // buscarDepredadorMasCercano() {
  //   let distMenor = 99999999;
  //   let cual;

  //   for (let dep of this.juego.depredadores) {
  //     let dist = distancia(this, dep);
  //     if (dist < distMenor && dist < this.vision) {
  //       distMenor = dist;
  //       cual = dep;
  //     }
  //   }

  //   return cual;
  // }

  // agruparseConOtrasjugadors() {
  //   if (this.jugadoresCerca.length == 0) return;

  //   let promX = 0;
  //   let promY = 0;
  //   let total = 0;
  //   for (let jugadorCerca of this.jugadoresCerca) {
  //     if (jugadorCerca.dist > this.distanciaLimiteParaEstarCerca) {
  //       total++;
  //       promX += jugadorCerca.jugador.x;
  //       promY += jugadorCerca.jugador.y;
  //     }
  //   }

  //   if (total == 0) return;

  //   promX /= total;
  //   promY /= total;

  //   this.vectorQApuntaAlPromedioDePosicionesParaAgrupamiento = {
  //     x: promX - this.x,
  //     y: promY - this.y,
  //   };

  //   this.aplicarFuerza(
  //     this.vectorQApuntaAlPromedioDePosicionesParaAgrupamiento.x *
  //       this.factorAgruparse,
  //     this.vectorQApuntaAlPromedioDePosicionesParaAgrupamiento.y *
  //       this.factorAgruparse
  //   );
  // }

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
      x: this.x - promX,
      y: this.y - promY,
    };

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
      if (dist < this.lado * 2) {
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
      (this.juego.pelota.estaDelLadoDerecho && this.equipo == 0) ||
      (this.juego.pelota.estaDelLadoIzquierdo && this.equipo == 1);

    this.estaLaPelotaDeMiLado =
      (this.sectorVertical == LADO.ARRIBA &&
        this.juego.pelota.estaEnLaMitadSuperior) ||
      (this.sectorVertical == LADO.ABAJO &&
        this.juego.pelota.estaEnLaMitadInferior);
  }

  hacerCosas() {
    if (this.estamosAtacando) {
      if (this.rol == ROLES.ATACANTE) {
        if (this.estaLaPelotaDeMiLado) {
          this.perseguir(this.juego.pelota);
        } else {
          this.perseguir(this.posicionEnLaCancha);
        }
      } else if (this.rol != ROLES.ARQUERO) {
        this.perseguir(this.posicionEnLaCancha);
      }
    } else {
      if (this.rol == ROLES.DEFENSOR) {
        if (this.estaLaPelotaDeMiLado) {
          this.perseguir(this.juego.pelota);
        } else {
          this.perseguir(this.posicionEnLaCancha);
        }
      } else if (this.rol != ROLES.ARQUERO) {
        this.perseguir(this.posicionEnLaCancha);
      }
    }

    if (this.rol == ROLES.ARQUERO) {
      if (
        (this.equipo == 0 && this.juego.pelota.estaEnElAreaIzquierda) ||
        (this.equipo == 1 && this.juego.pelota.estaEnElAreaDerecha)
      ) {
        this.perseguir(this.juego.pelota);
      } else {
        this.perseguir(this.posicionEnLaCancha);
      }
    }

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
  }

  patearPelota() {
    let vectorQApuntaAlArcoDesdeLaPelota = this.juego.pelota.pos.copy();
    let arcoDer = new Vector(LIMITE_DER, MITAD_TRANSVERSAL);
    let arcoIzq = new Vector(LIMITE_IZQ, MITAD_TRANSVERSAL);

    vectorQApuntaAlArcoDesdeLaPelota.sub(this.equipo == 0 ? arcoIzq:arcoDer);
    vectorQApuntaAlArcoDesdeLaPelota.setMag(
      this.fuerzaParaPegarle * (0.5 + Math.random())
    );

    this.juego.pelota.aplicarFuerza(
      vectorQApuntaAlArcoDesdeLaPelota.x,
      vectorQApuntaAlArcoDesdeLaPelota.y
    );
  }

  update() {
    //EJECUTA EL METODO UPDATE DE LA CLASE DE LA CUAL ESTA HEREDA
    // this.depredador = this.buscarDepredadorMasCercano();
    this.percibirEntorno();
    this.hacerCosas();

    // console.log(this.juego.depredadores , depredador)
    // this.agruparseConOtrasjugadors();
    this.separacion();

    // this.alineacion();
    // if (this.depredador) this.escaparse(this.depredador);
    this.velocidad.mult(0.9);
    super.update();
  }
}
