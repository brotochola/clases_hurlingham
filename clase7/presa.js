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

    this.factorPerseguir = ESCAPAR_DEFAULT * 3;

    this.vision = VISION_DEFAULT;
    this.distanciaLimiteParaEstarCerca = DISTANCIA_SEPARACION_DEFAULT;

    this.estados = {
      IDLE: 0,
      ESCAPANDO: 1,
      PERSIGUIENDO: 2,
    };

    this.estado = this.estados.IDLE;
  }

  crearGrafico() {
    this.texto = new PIXI.Text();
    this.container.addChild(this.texto);
    this.texto.text = "0";
    this.texto.style.fill = "green";

    this.grafico = new PIXI.Graphics()
      .rect(0, 0, this.lado, this.lado / 2)
      .fill(0x00ff00);
    // this.grafico.pivot.set(this.grafico.width, this.grafico.height);
    this.innerContainer.addChild(this.grafico);
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

  mirarAlrededor() {
    super.mirarAlrededor();
    this.ratioPresasDepredadores =
      this.presasCerca.length / this.depredadoresCerca.length;

    this.depredador = this.buscarDepredadorMasCercano();
  }

  cambiarDeEstadoSegunCosas() {
    let ratioPresasDepredadoresAPartirDelCualElDepredadorHuye = 10;

    if (
      this.ratioPresasDepredadores <
        ratioPresasDepredadoresAPartirDelCualElDepredadorHuye &&
      this.presasCerca.length >
        ratioPresasDepredadoresAPartirDelCualElDepredadorHuye/2
    ) {
      if (this.depredador) {
        this.cambiarEstado(this.estados.ESCAPANDO);
      } else {
        this.cambiarEstado(this.estados.IDLE);
      }
    } else {
      this.cambiarEstado(this.estados.PERSIGUIENDO);
    }
  }

  segunEstadoHacerCosas() {
    switch (this.estado) {
      case this.estados.IDLE:
        this.ejecutarIDLE();
        break;

      case this.estados.ESCAPANDO:
        this.ejecutarESCAPANDO();
        break;
      case this.estados.PERSIGUIENDO:
        this.ejecutarPERSIGUIENDO();
        break;
    }
  }

  ejecutarESCAPANDO() {
    //this.cohesion(this.presasCerca);
    this.separacion(this.presasCerca);
    // this.alineacion(this.presasCerca);
    this.escaparse(this.depredador);
    this.evadirObstaculos();
  }

  ejecutarIDLE() {
    this.cohesion(this.presasCerca);
    this.separacion(this.presasCerca);
    this.alineacion(this.presasCerca);
    this.evadirObstaculos();
  }

  ejecutarPERSIGUIENDO() {
    // this.cohesion(this.presasCerca);
    // this.separacion(this.presasCerca);
    // this.alineacion(this.presasCerca);
    // this.perseguir(this.depredador);
    this.ejecutarIDLE()

    this.evadirObstaculos();
  }

  update() {
    if (this.celda) {
      // this.presasCerca=this.buscarPresasCerca();
      this.mirarAlrededor();
      this.cambiarDeEstadoSegunCosas();
      this.segunEstadoHacerCosas();
    }

    super.update();
  }

  render() {
    // if(this.estado==this.estados.IDLE){
    //   this.grafico.tint=null
    // }else if(this.estado==this.estados.ESCAPANDO){
    //   this.grafico.tint=0xaaffff
    // }else if(this.estado==this.estados.PERSIGUIENDO){
    //   this.grafico.tint=0xffaaff
    // }

    this.texto.text = this.estado;

    super.render();
  }
}
