/**
 * Clase base para todas las entidades del juego
 */
class Entidad {
  /**
   * Constructor de la entidad
   * @param {number} x - Posición inicial en X
   * @param {number} y - Posición inicial en Y
   * @param {Object} juego - Referencia al juego principal
   */
  constructor(x, y, juego) {
    this.container = new PIXI.Container();
    this.juego = juego;

    this.id = generateRandomID(8);

    this.juego.app.stage.addChild(this.container);

    this.x = x;
    this.y = y;

    this.velocidad = { x: 0, y: 0 };
    this.acc = { x: 0, y: 0 };

    this.changuiMargenes = 10;
    this.fuerzaParavolverDeLosBordes = 300;

    // Qué tan fuertemente esta entidad es influenciada por el campo vectorial
    this.vectorFieldInfluence = 0;
  }

  /**
   * Aplica una fuerza a la entidad
   * @param {number} x - Componente X de la fuerza
   * @param {number} y - Componente Y de la fuerza
   */
  aplicarFuerza(x, y) {
    this.acc.x += x;
    this.acc.y += y;
  }

  /**
   * Hace que la entidad rebote contra los bordes de la pantalla
   */
  rebotarContraLosBoredes() {
    if (this.x < this.changuiMargenes) {
      //SI ESTOY MAS A LA IZQ Q EL MARGEN IZQ -CHANGUI
      // LA FUERZA Q SE LE APLICA ES DIRECTAMENTE PROPORCIONAL A LA DISTANCIA A LA Q ESTA

      let fuerza =
        distancia(this, { x: this.changuiMargenes, y: this.y }) *
        this.fuerzaParavolverDeLosBordes;
      this.aplicarFuerza(fuerza, 0);
    } else if (this.x > window.innerWidth - this.changuiMargenes) {
      //SI ESTOY MAS A LA DER Q EL MARGEN DERECHO-CHANGUI
      let fuerza =
        distancia(this, {
          x: window.innerWidth - this.changuiMargenes,
          y: this.y,
        }) * this.fuerzaParavolverDeLosBordes;
      this.aplicarFuerza(-fuerza, 0);
    }

    if (this.y < this.changuiMargenes) {
      //SI ESTOY MAS ARRIBA Q EL CHANGUI PARA ARRIBA
      let fuerza =
        distancia(this, {
          x: this.x,
          y: this.changuiMargenes,
        }) * this.fuerzaParavolverDeLosBordes;
      this.aplicarFuerza(0, fuerza);
    } else if (this.y > window.innerHeight - this.changuiMargenes) {
      //ABAJO
      let fuerza =
        distancia(this, {
          x: this.x,
          y: window.innerHeight - this.changuiMargenes,
        }) * this.fuerzaParavolverDeLosBordes;
      this.aplicarFuerza(0, -fuerza);
    }
  }

  /**
   * Aplica una fuerza basada en el campo vectorial actual
   */
  aplicarFuerzaVectorField() {
    if (this.juego.grid) {
      const vector = this.juego.grid.getVectorAt(this.x, this.y);
      if (vector) {
        this.aplicarFuerza(
          vector.x * this.vectorFieldInfluence,
          vector.y * this.vectorFieldInfluence
        );
      }
    }
  }
  getAcc() {
    return Math.hypot(this.acc.x, this.acc.y);
  }

  getVelocidad() {
    return Math.hypot(this.velocidad.x, this.velocidad.y);
  }

  /**
   * Actualiza la posición y velocidad de la entidad
   */
  update() {
    this.acc = limitMagnitude(this.acc, this.accMax);

    this.velocidad.x += this.acc.x;
    this.velocidad.y += this.acc.y;

    if (this.getVelocidad() < this.accMax * 0.9) {
      this.velocidad.x = 0;
      this.velocidad.y = 0;
    }

    this.acc.x = 0;
    this.acc.y = 0;

    this.velocidad = limitMagnitude(this.velocidad, this.velMax);

    this.rebotarContraLosBoredes();

    this.x += this.velocidad.x;
    this.y += this.velocidad.y;
  }

  /**
   * Renderiza la entidad en pantalla
   */
  render() {
    this.angulo = Math.atan2(this.velocidad.y, this.velocidad.x);

    this.container.rotation = this.angulo;
    this.container.x = this.x;
    this.container.y = this.y;
  }
}
