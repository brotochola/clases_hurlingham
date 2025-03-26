class Depredador extends Entidad {
  constructor(obj) {
    super(obj);
    this.lado = 10;
    this.velMax = 3 + Math.random();
    this.accMax = 0.1 + Math.random() * 0.1;
    this.crearGrafico();

    this.factorSeparacion = SEPARACION_DEFAULT * 2;
    this.factorAlineacion = ALINEACION_DEFAULT * 0.15;
    this.factorAgruparse = COHESION_DEFAULT * 0.5;
    //
    this.factorEscapar = ESCAPAR_DEFAULT;
    this.factorPerseguir = ESCAPAR_DEFAULT * 3;

    this.vision = VISION_DEFAULT;
    this.distanciaLimiteParaEstarCerca = DISTANCIA_SEPARACION_DEFAULT;

    this.estados = {
      IDLE: 0,
      YENDO_A_UNA_PRESA: 1,
      HUYENDO: 2,
    };
  }

  crearGrafico() {
    this.grafico = new PIXI.Graphics()
      .rect(0, 0, this.lado, this.lado / 2)
      .fill(0xff0000);
    this.innerContainer.addChild(this.grafico);
  }

  mirarAlrededor() {
    super.mirarAlrededor();

    this.ratioPresasDepredadores =
      this.presasCerca.length / this.depredadoresCerca.length;

    this.presa = this.buscarPresaMasCercana();
  }

  cambiarDeEstadoSegunCosas() {
    // if(this.presasCerca)
    let ratioPresasDepredadoresAPartirDelCualElDepredadorHuye = 5;

    if (
      this.ratioPresasDepredadores <
      ratioPresasDepredadoresAPartirDelCualElDepredadorHuye
    ) {
      //SOMOS MAS NOSOTROS (LOS DEPREDADORES)

      if (this.presa) {
        this.cambiarEstado(this.estados.YENDO_A_UNA_PRESA);
      } else {
        this.cambiarEstado(this.estados.IDLE);
      }
    } else {
      //SON MAS LAS PRESAS CERCA Q LOS DEPREDADORES CERCA
      this.cambiarEstado(this.estados.HUYENDO);
    }
  }

  segunEstadoHacerCosas() {
    switch (this.estado) {
      case this.estados.IDLE:
        this.ejecutarIDLE();
        break;

      case this.estados.YENDO_A_UNA_PRESA:
        this.ejecutarYENDO_A_UNA_PRESA();
        break;
      case this.estados.HUYENDO:
        this.ejecutarHUYENDO();
    }
  }

  ejecutarIDLE() {
    this.cohesion(this.depredadoresCerca);
    this.separacion(this.depredadoresCerca);
    this.alineacion(this.depredadoresCerca);
    this.evadirObstaculos();
  }

  ejecutarYENDO_A_UNA_PRESA() {
    // this.cohesion(this.depredadoresCerca);
    this.separacion(this.depredadoresCerca);
    // this.alineacion(this.depredadoresCerca);

    this.perseguir(this.presa);
    this.evadirObstaculos();
  }

  ejecutarHUYENDO() {
    this.separacion(this.depredadoresCerca);
    this.escaparse(this.presa);
    this.evadirObstaculos();
  }

  update() {
    if (this.celda) {
      this.mirarAlrededor();
      this.cambiarDeEstadoSegunCosas();
      this.segunEstadoHacerCosas();
    }

    super.update();
  }
}
