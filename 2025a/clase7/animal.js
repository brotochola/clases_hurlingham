class Animal extends Entidad {
  constructor(x, y, juego) {
    super(x, y, juego);

    this.lado = 10;

    this.velMax = 4;
    this.accMax = 0.2;

    this.velocidad = {
      x: -Math.random(),
      y: Math.random(),
    };

    this.promedioDePosicionDeMisAmigos = {
      x: 0,
      y: 0,
    };

    this.promedioDeVelDeMisAmigos = {
      x: 0,
      y: 0,
    };

    this.promedioPosAnimalesMuyCerca = {
      x: 0,
      y: 0,
    };
    this.animalesCerca = [];

    this.vision = window.vision ?? 100;

    this.crearGrafico();

    this.modoDebug = false;
  }

  crearGrafico() {
    this.grafico = new PIXI.Graphics()
      .rect(0, 0, this.lado, this.lado / 2)
      .fill(0xffffff);
    this.container.addChild(this.grafico);
  }

  mirarAlrededor() {
    this.promedioDePosicionDeMisAmigos = {
      x: 0,
      y: 0,
    };

    this.promedioDeVelDeMisAmigos = {
      x: 0,
      y: 0,
    };

    this.promedioPosAnimalesMuyCerca = {
      x: 0,
      y: 0,
    };

    this.animalesCerca = [];

    let animalesEnCeldasVecinas = [];
    if (this.celda) {
      animalesEnCeldasVecinas =
        this.celda.obtenerEntidadesAcaYEnCEldasVecinas();
    }

    for (let i = 0; i < animalesEnCeldasVecinas.length; i++) {
      const otroAnimal = this.juego.entidades[i];

      if (this == otroAnimal) continue;

      // let dist = distancia(this, this.juego.entidades[i]);

      // if (dist < this.vision) {
      this.animalesCerca.push(this.juego.entidades[i]);
      // }
    }

    //estan mas cerca:
    this.animalesMuyCerca = this.celda ? this.celda.entidadesAca : [];

    // for (let i = 0; i < this.celda.entidadesAca.length; i++) {
    //   const otroAnimal = this.celda.entidadesAca[i];

    //   if (this == otroAnimal) continue;

    //   // let dist = distancia(this, this.juego.entidades[i]);

    //   // if (dist < this.lado * 4) {
    //     this.animalesMuyCerca.push(this.juego.entidades[i]);
    //   // }
    // }

    if (this.animalesCerca.length > 0) {
      //promedio de aniamles muy cerca
      for (const animalCerca of this.animalesMuyCerca) {
        this.promedioPosAnimalesMuyCerca.x += animalCerca.x;
        this.promedioPosAnimalesMuyCerca.y += animalCerca.y;
      }
      this.promedioPosAnimalesMuyCerca.x /= this.animalesMuyCerca.length;
      this.promedioPosAnimalesMuyCerca.y /= this.animalesMuyCerca.length;
    }

    //promedios:

    if (this.animalesCerca.length == 0) return;

    for (const animalCerca of this.animalesCerca) {
      this.promedioDePosicionDeMisAmigos.x += animalCerca.x;
      this.promedioDePosicionDeMisAmigos.y += animalCerca.y;

      this.promedioDeVelDeMisAmigos.x += animalCerca.velocidad.x;
      this.promedioDeVelDeMisAmigos.y += animalCerca.velocidad.y;
    }
    this.promedioDePosicionDeMisAmigos.x /= this.animalesCerca.length;
    this.promedioDePosicionDeMisAmigos.y /= this.animalesCerca.length;

    this.promedioDeVelDeMisAmigos.x /= this.animalesCerca.length;
    this.promedioDeVelDeMisAmigos.y /= this.animalesCerca.length;
  }

  irHaciaMisAmigos() {
    const dx = this.promedioDePosicionDeMisAmigos.x - this.x;
    const dy = this.promedioDePosicionDeMisAmigos.y - this.y;
    const distancia = Math.hypot(dx, dy); // o Math.sqrt(dx*dx + dy*dy)

    if (distancia > 0) {
      this.aplicarFuerza(
        (dx / distancia) * window.factorCohesion,
        (dy / distancia) * window.factorCohesion
      );
    }
  }

  alinearmeConMisAmigos() {
    if (distancia > 0) {
      this.aplicarFuerza(
        this.promedioDeVelDeMisAmigos.x * window.factorAlineacion,
        this.promedioDeVelDeMisAmigos.y * window.factorAlineacion
      );
    }
  }

  separarmeDeLosQueEstanBastanteCerca() {
    const dx = this.promedioPosAnimalesMuyCerca.x - this.x;
    const dy = this.promedioPosAnimalesMuyCerca.y - this.y;
    const distancia = Math.hypot(dx, dy); // o Math.sqrt(dx*dx + dy*dy)
    // const factor = 0.1;

    if (distancia > 0) {
      this.aplicarFuerza(
        -(dx / distancia) * window.factorSeparacion,
        -(dy / distancia) * window.factorSeparacion
      );
    }
  }

  update() {
    super.update();

    this.mirarAlrededor();
    this.irHaciaMisAmigos();
    this.alinearmeConMisAmigos();
    this.separarmeDeLosQueEstanBastanteCerca();
    this.perseguirMouse();
  }
  perseguirMouse() {
    const dx = this.juego.mouse.x - this.x;
    const dy = this.juego.mouse.y - this.y;
    const distancia = Math.hypot(dx, dy); // o Math.sqrt(dx*dx + dy*dy)
    const factor = 1.1;

    if (distancia > 0) {
      this.aplicarFuerza((dx / distancia) * factor, (dy / distancia) * factor);
    }
  }

  render() {
    super.render();

    if (this.modoDebug) {
      this.grafico.rect(0, 0, this.lado, this.lado / 2).fill(0xff0000);

      this.juego.graficoDebug
        .rect(
          this.promedioDePosicionDeMisAmigos.x,
          this.promedioDePosicionDeMisAmigos.y,
          6,
          6
        )
        .fill(0x2222ff);
    }
  }
}
