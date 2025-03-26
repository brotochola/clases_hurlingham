class Presa extends Entidad {
  constructor(x, y, juego) {
    super(x, y, juego);
    this.lado = 10;
    this.velMax = 4;
    this.accMax = 0.2;
    this.crearGrafico();

    //PANEL DE CONTROL DE CADA ASPECTO DE BOIDS:

    this.factorSeparacion = 20;
    this.factorAlineacion = 12;
    this.factorAgruparse = 2;
    //
    this.factorEscapar = 32;
    this.vision = 100;
    this.distanciaLimiteParaEstarCerca = this.lado * 3;
  }

  crearGrafico() {
    this.grafico = new PIXI.Graphics()
      .rect(0, 0, this.lado, this.lado / 2)
      .fill(0xffffff);
    this.container.addChild(this.grafico);
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

  agruparseConOtrasPresas() {
    if (this.presasCerca.length == 0) return;

    let promX = 0;
    let promY = 0;
    let total = 0;
    for (let presaCerca of this.presasCerca) {
      if (presaCerca.dist > this.distanciaLimiteParaEstarCerca) {
        total++;
        promX += presaCerca.presa.x;
        promY += presaCerca.presa.y;
      }
    }

    if (total == 0) return;

    promX /= total;
    promY /= total;

    this.vectorQApuntaAlPromedioDePosicionesParaAgrupamiento = {
      x: promX - this.x,
      y: promY - this.y,
    };

    this.aplicarFuerza(
      this.vectorQApuntaAlPromedioDePosicionesParaAgrupamiento.x *
        this.factorAgruparse,
      this.vectorQApuntaAlPromedioDePosicionesParaAgrupamiento.y *
        this.factorAgruparse
    );
  }

  separacion() {
    let promX = 0;
    let promY = 0;

    if (this.presasCerca.length == 0) return;

    let total = 0;
    for (let presaCerca of this.presasCerca) {
      if (presaCerca.dist < this.distanciaLimiteParaEstarCerca) {
        total++;
        promX += presaCerca.presa.x;
        promY += presaCerca.presa.y;
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

  alineacion() {
    if (this.presasCerca.length == 0) return;

    let promVelX = 0;
    let promVelY = 0;

    for (let presa of this.presasCerca) {
      promVelX += presa.presa.velocidad.x;
      promVelY += presa.presa.velocidad.y;
    }

    promVelX /= this.presasCerca.length;
    promVelY /= this.presasCerca.length;

    let velocidadDeseada = { x: promVelX, y: promVelY };

    let fuerza = {
      x: velocidadDeseada.x - this.velocidad.x,
      y: velocidadDeseada.y - this.velocidad.y,
    };

    this.aplicarFuerza(
      fuerza.x * this.factorAlineacion,
      fuerza.y * this.factorAlineacion
    );
  }

  buscarPresasCerca() {
    let presasCerca = [];
    for (let presa of this.juego.presas) {
      if (presa == this) continue;
      let dist = distancia(presa, this);
      if (dist < this.vision) {
        presasCerca.push({ presa, dist });
      }
    }
    return presasCerca;
  }

  update() {
    //EJECUTA EL METODO UPDATE DE LA CLASE DE LA CUAL ESTA HEREDA
    this.depredador = this.buscarDepredadorMasCercano();
    this.presasCerca = this.buscarPresasCerca();

    // console.log(this.juego.depredadores , depredador)
    this.agruparseConOtrasPresas();
    this.separacion();
    this.alineacion();
    if (this.depredador) this.escaparse(this.depredador);

    super.update();
  }
}
