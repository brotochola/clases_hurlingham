class Presa extends Entidad {
  constructor(x, y, juego, vel, id) {
    super(x, y, juego);
    this.lado = 10;
    this.velMax = 4;
    this.accMax = 0.25;

    this.inicializarConDataGuardada(vel, id);

    this.crearGrafico();

    this.factorSeparacion = SEPARACION_DEFAULT;
    this.factorAlineacion = ALINEACION_DEFAULT;
    this.factorAgruparse = COHESION_DEFAULT;
    //
    this.factorEscapar = ESCAPAR_DEFAULT;
    this.vision = VISION_DEFAULT;
    this.distanciaLimiteParaEstarCerca = DISTANCIA_SEPARACION_DEFAULT;
  }

  inicializarConDataGuardada(vel, id) {
    this.id = id;
    if (vel) {
      this.velocidad.x = vel.x;
      this.velocidad.y = vel.y;
    }
  }

  crearGrafico() {
    this.grafico = new PIXI.Graphics()
      .rect(0, 0, this.lado, this.lado / 2)
      .fill(0x00ff00);
    // this.grafico.pivot.set(this.grafico.width, this.grafico.height);
    this.innerContainer.addChild(this.grafico);
  }

  escaparse(aQuien) {
    if (!aQuien) return;

    //steering = desired_velocity - velocity

    let vectorQApuntaAlTarget = { x: this.x - aQuien.x, y: this.y - aQuien.y };
    //NORMALIZAR UN VECTOR ES LLEVAR SU DISTANCIA A 1 (LA DISTANCIA ES LA HIPOTENUSA DEL TRIANGULO RECTANGULO Q SE GENERA ENTRE 0,0 Y EL PUNTO x,y DEL VECTOR)
    // let vectorNormalizado = normalizeVector(vectorQApuntaAlTarget);
    // // //ESTA ES EL VECTOR DE VELOCIDAD AL CUAL QUEREMOS IR PARA LLEGAR AL OBJETIVO
    // let velocidadDeseadaNormalizada = {
    //   x: vectorNormalizado.x * this.velMax,
    //   y: vectorNormalizado.y * this.velMax,
    // };

    this.aplicarFuerza(
      vectorQApuntaAlTarget.x * this.factorEscapar,
      vectorQApuntaAlTarget.y * this.factorEscapar
    );
  }

  buscarDepredadorMasCercano() {
    let distMenor = 99999999;
    let cual;

    for (let dep of this.juego.depredadores) {
      let dist = distancia(this, dep);
      if (dist < distMenor && dist < this.vision) {
        distMenor = dist;
        cual = dep;
      }
    }

    return cual;
  }

  update() {
    //EJECUTA EL METODO UPDATE DE LA CLASE DE LA CUAL ESTA HEREDA
    this.depredador = this.buscarDepredadorMasCercano();
    this.presasCerca = this.buscarPresasCercaUsandoGrid();
    // this.presasCerca=this.buscarPresasCerca();

    // console.log(this.juego.depredadores , depredador)
    this.cohesion(this.presasCerca);
    this.separacion(this.presasCerca);
    this.alineacion(this.presasCerca);
    if (this.depredador) this.escaparse(this.depredador);
    this.evadirObstaculos();

    super.update();
  }

  render() {
    super.render();
  }
}
