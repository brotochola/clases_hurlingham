class Presa extends Entidad {
  constructor(obj) {
    super(obj);
    this.lado = 10;
    this.velMax = 5;
    this.accMax = 0.25;

    this.crearGrafico();

    this.factorSeparacion = SEPARACION_DEFAULT * 0.66;
    this.factorAlineacion = ALINEACION_DEFAULT * 1.5;
    this.factorAgruparse = COHESION_DEFAULT;
    //
    this.factorEscapar = ESCAPAR_DEFAULT * 2;
    this.vision = VISION_DEFAULT;
    this.distanciaLimiteParaEstarCerca = DISTANCIA_SEPARACION_DEFAULT;
  }

  crearGrafico() {
    this.grafico = new PIXI.Graphics();
    this.grafico.beginFill(0x00ff00); // Green color
    this.grafico.drawRect(0, 0, this.lado, this.lado / 2);
    this.grafico.endFill();

    // this.grafico = new PIXI.Graphics()
    //   .rect(0, 0, this.lado, this.lado / 2)
    //   .fill(0x00ff00);
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

  update() {
    if (this.celda) {
      // if(!this.entidadesCerca)

      this.entidadesCerca = this.celda.obtenerEntidadesAcaYEnLasCeldasVecinas();

      if (
        !this.depredadoresCerca ||
        (this.depredadoresCerca && this.meToca())
      ) {
        this.depredadoresCerca = this.buscarDepredadoresCercaUsandoGrid();
      }

      if (!this.presasCerca || (this.presasCerca && this.meToca())) {
        this.presasCerca = this.buscarPresasCercaUsandoGrid();
      }
      // this.presasCerca = this.buscarPresasCerca();

      if (
        !this.obstaculosCercanos ||
        (this.obstaculosCercanos && this.meToca())
      ) {
        this.obstaculosCercanos = this.obtenerObstaculosCerca();
      }

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
