class Depredador extends Entidad {
  constructor(x, y, juego) {
    super(x, y, juego);
    this.lado = 10;
    this.velMax = 3 + Math.random();
    this.accMax = 0.1 + Math.random() * 0.1;
    this.crearGrafico();

    this.factorSeparacion = SEPARACION_DEFAULT * 2;
    this.factorAlineacion = ALINEACION_DEFAULT * 0.15;
    this.factorAgruparse = COHESION_DEFAULT*0.5;
    //
    this.factorEscapar = ESCAPAR_DEFAULT;
    this.factorPerseguir = ESCAPAR_DEFAULT*3;

    this.vision = VISION_DEFAULT;
    this.distanciaLimiteParaEstarCerca = DISTANCIA_SEPARACION_DEFAULT;


  }



  crearGrafico() {
    this.grafico = new PIXI.Graphics()
      .rect(0, 0, this.lado, this.lado / 2)
      .fill(0xff0000);
    this.innerContainer.addChild(this.grafico);
  }

  perseguir(aQuien, serPiolaEIrADondeVaAEstar) {
    if (!aQuien) return;

    //steering = desired_velocity - velocity

    let vectorQApuntaAlTarget = { x: aQuien.x - this.x, y: aQuien.y - this.y };
    if(serPiolaEIrADondeVaAEstar){
      vectorQApuntaAlTarget.x+=target.velocidad.x*5
      vectorQApuntaAlTarget.y+=target.velocidad.y*5
    }



    //NORMALIZAR UN VECTOR ES LLEVAR SU DISTANCIA A 1 (LA DISTANCIA ES LA HIPOTENUSA DEL TRIANGULO RECTANGULO Q SE GENERA ENTRE 0,0 Y EL PUNTO x,y DEL VECTOR)
    let vectorNormalizado = normalizeVector(vectorQApuntaAlTarget);
    //ESTA ES EL VECTOR DE VELOCIDAD AL CUAL QUEREMOS IR PARA LLEGAR AL OBJETIVO
    let velocidadDeseadaNormalizada = {
      x: vectorNormalizado.x * this.factorPerseguir,
      y: vectorNormalizado.y * this.factorPerseguir,
    };


    this.aplicarFuerza(velocidadDeseadaNormalizada.x, velocidadDeseadaNormalizada.y);
  }

  buscarPresaMasCercana() {
    let distMenor = 99999999;
    let cual;

    for (let dep of this.juego.presas) {
      let dist = distancia(this, dep);
      if (dist < distMenor) {
        distMenor = dist;
        cual = dep;
      }
    }

    return cual;
  }

  update() {
    //EJECUTA EL METODO UPDATE DE LA CLASE DE LA CUAL ESTA HEREDA
    this.presa = this.buscarPresaMasCercana();
    this.depredadoresCerca = this.buscarDepredadoresCerca();

    this.cohesion(this.depredadoresCerca);
    this.separacion(this.depredadoresCerca);
    this.alineacion(this.depredadoresCerca);

    this.perseguir(this.presa);
    this.evadirObstaculos();
    
    super.update();
  }
}
