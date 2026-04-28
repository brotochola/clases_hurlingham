class Enemigo extends Persona {
  constructor(x, y, textures, juego) {
    super(x, y, textures, juego);

    this.juego.enemigos.push(this);

    this.velocidadMaxima = 1;
    this.distanciaParaEscaparmeDeLaPersonaQueMeAsusta = 40;
    this.container.tint = 0xff0000;
    this.distanciaPersonal = 20; // distancia mínima deseada respecto a otros enemigos

    this.asignarPersonaQueMeAsusta(this.juego.prota);

    // this.asignarTarget(this.juego.prota);
  }

  obtenerEnemigosCerca() {
    this.enemigosCercaMio = [];

    //filtro para obtener solo a los de mi mismo tipo
    for (let i = 0; i < this.personasCercaMio.length; i++) {
      if (this.personasCercaMio[i] instanceof Enemigo)
        this.enemigosCercaMio.push(this.personasCercaMio[i]);
    }
  }

  cohesion() {
    let promX = 0;
    let promY = 0;
    //calculamos promedio de posicion de los enemigos q puedo ver:
    for (let i = 0; i < this.enemigosCercaMio.length; i++) {
      promX += this.enemigosCercaMio[i].posicion.x;
      promY += this.enemigosCercaMio[i].posicion.y;
    }

    if (this.enemigosCercaMio.length === 0) return;

    promX /= this.enemigosCercaMio.length;
    promY /= this.enemigosCercaMio.length;

    // vector desde mi posicion hasta el centro de masa (promX,promY)
    const dx = promX - this.posicion.x;
    const dy = promY - this.posicion.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      // magnitud de la aceleracion hacia el objetivo
      const fuerza = 0.1; // ajustable: mayor -> acelera mas rapido hacia el punto

      // normalizamos y aplicamos fuerza
      const ax = (dx / dist) * fuerza;
      const ay = (dy / dist) * fuerza;

      this.sumarAceleracion(ax, ay);
    }
  }

  alineacion() {
    let promX = 0;
    let promY = 0;
    //calculamos promedio de posicion de los enemigos q puedo ver:
    for (let i = 0; i < this.enemigosCercaMio.length; i++) {
      promX += this.enemigosCercaMio[i].velocidad.x;
      promY += this.enemigosCercaMio[i].velocidad.y;
    }

    if (this.enemigosCercaMio.length === 0) return;

    promX /= this.enemigosCercaMio.length;
    promY /= this.enemigosCercaMio.length;

    // vector desde mi posicion hasta el centro de masa (promX,promY)
    const dx = promX - this.velocidad.x;
    const dy = promY - this.velocidad.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      // magnitud de la aceleracion hacia el objetivo
      const fuerza = 0.05; // ajustable: mayor -> acelera mas rapido hacia el punto

      // normalizamos y aplicamos fuerza
      const ax = (dx / dist) * fuerza;
      const ay = (dy / dist) * fuerza;

      this.sumarAceleracion(ax, ay);
    }
  }

  separacion() {
    if (!this.enemigosCercaMio || this.enemigosCercaMio.length === 0) return;

    const fuerzaMax = 0.5; // fuerza máxima de empuje para separarse (ajustable)

    for (let i = 0; i < this.enemigosCercaMio.length; i++) {
      const otro = this.enemigosCercaMio[i];
      let dx = otro.posicion.x - this.posicion.x;
      let dy = otro.posicion.y - this.posicion.y;
      let dist = Math.hypot(dx, dy);

      if (dist === 0) continue;

      if (dist < this.distanciaPersonal) {
        const ratio = this.distanciaPersonal / dist;
        const ax = -(dx / dist) * fuerzaMax * ratio;
        const ay = -(dy / dist) * fuerzaMax * ratio;

        this.sumarAceleracion(ax, ay);
      }
    }
  }

  update() {
    this.obtenerEnemigosCerca();
    this.separacion();
    this.cohesion();
    this.alineacion();
    this.evitarPiedras();

    super.update();
  }
}
