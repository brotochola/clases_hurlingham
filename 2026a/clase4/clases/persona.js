class Persona extends GameObject {
  constructor(x, y, textures, i, juego) {
    super(x, y, textures, i, juego);

    this.dataJson = textures;
    this.distanciaParaLlegar = 60;
    this.distanciaParaEscaparmeDeLaPersonaQueMeAsusta = 140;

    this.velocidadMaxima = 3;
    this.direccion = "abajo";

    this.target = null;

    this.cargarSpritesAnimados(this.dataJson);

    if (!(this instanceof Protagonista)) {
      this.asignarTarget(this.juego.gameObjects[this.id - 1]);
    }

    this.asignarPersonaQueMeAsusta(this.juego.prota);

    // this.asignarTarget(this.juego.prota);
  }

  // chequearSiEstoyCercaDelTargetYFrenar() {
  //   if (
  //     distancia(this.posicion.x, this.posicion.y, this.targetX, this.targetY) <
  //     this.distanciaParaLlegar
  //   ) {
  //     this.asignarVelocidad(0, 0);
  //   }
  // }

  render() {
    this.cambiarDeSpriteDeDireccion();
    if (!this.spriteAnimadoActual) return;
    this.cambiarVelDeReproduccionDeLaAnimacionSegunVelocidadLineal();
    super.render();
  }

  cambiarVelDeReproduccionDeLaAnimacionSegunVelocidadLineal() {
    this.spriteAnimadoActual.animationSpeed = this.velocidadLineal * 0.1;
  }

  cambiarDeSpriteDeDireccion() {
    // Divide el círculo en 8 sectores (centros en múltiplos de 45°)
    if (this.angulo >= -22.5 && this.angulo < 22.5 && this.direccion != "der") {
      this.cambiarAnimacion("der");
    } else if (
      this.angulo >= 22.5 &&
      this.angulo < 67.5 &&
      this.direccion != "abajo_der"
    ) {
      this.cambiarAnimacion("abajo_der");
    } else if (
      this.angulo >= 67.5 &&
      this.angulo < 112.5 &&
      this.direccion != "abajo"
    ) {
      this.cambiarAnimacion("abajo");
    } else if (
      this.angulo >= 112.5 &&
      this.angulo < 157.5 &&
      this.direccion != "abajo_izq"
    ) {
      this.cambiarAnimacion("abajo_izq");
    } else if (this.angulo >= 157.5 || this.angulo < -157.5) {
      this.cambiarAnimacion("izq");
    } else if (this.angulo >= -157.5 && this.angulo < -112.5) {
      this.cambiarAnimacion("arriba_izq");
    } else if (this.angulo >= -112.5 && this.angulo < -67.5) {
      this.cambiarAnimacion("arriba");
    } else if (this.angulo >= -67.5 && this.angulo < -22.5) {
      this.cambiarAnimacion("arriba_der");
    }
  }

  update() {
    this.perseguirTarget();
    this.escaparmeDeQuienMeAsusta();
    super.update();
  }

  escaparmeDeQuienMeAsusta() {
    if (!this.personaQueMeAsusta) {
      return;
    }

    let dx = this.personaQueMeAsusta.posicion.x - this.posicion.x;
    let dy = this.personaQueMeAsusta.posicion.y - this.posicion.y;
    const dist = Math.hypot(dx, dy);

    if (dist < this.distanciaParaEscaparmeDeLaPersonaQueMeAsusta) {
      const ratioDistanciaACtualConDistParaLlegar =
        dist / this.distanciaParaEscaparmeDeLaPersonaQueMeAsusta;

      const vx = dx / dist;
      const vy = dy / dist;

      this.sumarAceleracion(
        -vx * ratioDistanciaACtualConDistParaLlegar,
        -vy * ratioDistanciaACtualConDistParaLlegar,
      );
    }
  }

  perseguirTarget() {
    if (!this.target) {
      return;
    }

    const cuanto = 0.1;

    let dx = this.target.posicion.x - this.posicion.x;
    let dy = this.target.posicion.y - this.posicion.y;
    const dist = Math.hypot(dx, dy);

    if (dist > this.distanciaParaLlegar) {
      const ratioDistanciaACtualConDistParaLlegar =
        dist / this.distanciaParaLlegar;

      const vx = dx / dist; // dirección normalizada X
      const vy = dy / dist; // dirección normalizada Y

      this.sumarAceleracion(
        vx * ratioDistanciaACtualConDistParaLlegar,
        vy * ratioDistanciaACtualConDistParaLlegar,
      );
    }
  }

  asignarPersonaQueMeAsusta(gameObj) {
    this.personaQueMeAsusta = gameObj;
  }

  asignarTarget(gameObj) {
    console.log("asignar", gameObj, this);
    this.target = gameObj;
  }
}
