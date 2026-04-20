class Persona extends GameObject {
  constructor(x, y, textures, i, juego) {
    super(x, y, textures, i, juego);

    this.dataJson = textures;
    this.distanciaParaLlegar = 100;

    this.velocidadMaxima = 10;
    this.direccion = "abajo";

    this.cargarSpritesAnimados(this.dataJson);
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
    super.update();
  }

  perseguirTarget() {
    const cuanto = 0.1;
    if (this.targetX == undefined || this.targetX == null) {
      return;
    }
    let dx = this.targetX - this.posicion.x;
    let dy = this.targetY - this.posicion.y;
    const dist = Math.hypot(dx, dy);

    if (dist > this.distanciaParaLlegar) {
      const vx = dx / dist; // dirección normalizada X
      const vy = dy / dist; // dirección normalizada Y
      // velocidad con magnitud 1 (cambiar multiplicador si se quiere otra rapidez)
      this.sumarAceleracion(vx * cuanto, vy * cuanto);
    }
  }

  asignarTarget(targetX, targetY) {
    this.targetX = targetX;
    this.targetY = targetY;
  }
}
