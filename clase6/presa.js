class Presa extends Entidad {
  constructor(obj) {
    super(obj);
    this.lado = 10;
    this.velMax = 4;
    this.accMax = 0.25;

    this.crearGrafico();

    this.factorSeparacion = SEPARACION_DEFAULT;
    this.factorAlineacion = ALINEACION_DEFAULT;
    this.factorAgruparse = COHESION_DEFAULT;
    //
    this.factorEscapar = ESCAPAR_DEFAULT;
    this.vision = VISION_DEFAULT;
    this.distanciaLimiteParaEstarCerca = DISTANCIA_SEPARACION_DEFAULT;
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



  buscarDepredadorMasCercanoUsandoLaGrid() {
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
    if (this.celda) {
      this.entidadesCerca = this.celda.obtenerEntidadesAcaYEnLasCeldasVecinas();
      this.depredadoresCerca = this.buscarDepredadoresCercaUsandoGrid();
      this.presasCerca = this.buscarPresasCercaUsandoGrid();
      // this.presasCerca = this.buscarPresasCerca();

      this.obstaculosCercanos = this.obtenerObstaculosCerca();

      this.depredador = this.buscarDepredadorMasCercano();

      // this.presasCerca=this.buscarPresasCerca();

      // console.log(this.juego.depredadores , depredador)
      this.cohesion(this.presasCerca);
      this.separacion(this.presasCerca);
      this.alineacion(this.presasCerca);
      if (this.depredador) this.escaparse(this.depredador);
      this.evadirObstaculos();
    }

    super.update();
  }

  render() {
    super.render();
  }
}
