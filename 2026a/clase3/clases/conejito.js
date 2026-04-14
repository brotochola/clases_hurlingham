class Conejito {
  constructor(x, y, textures, i) {
    // console.log("texturas", textures);

    this.id = i;
    // this.x = x;
    // this.y = y;
    // this.sprite = new PIXI.Sprite(textura);

    // this.secuenciaDeimg = ["bunny.png", "bunny2.png"];
    // const textureArray = [];

    this.dataJson = textures;

    this.distanciaParaLlegar = 10;

    this.direccion = "abajo";

    this.container = new PIXI.Container();

    // this.sprite = new PIXI.AnimatedSprite(this.dataJson.animations.arriba);
    // this.sprite.scale.set(2, 2);
    // this.sprite.animationSpeed = Math.random();
    // this.sprite.play();

    // this.sprite.x = x;
    // this.sprite.y = y;
    // this.velocidadX = Math.random() * 10 - 5; // esto va random entre -5 y 5
    // this.velocidadY = Math.random() * 10 - 5;

    this.cargarSpritesAnimados(this.dataJson);

    this.posicion = {
      x: x,
      y: y,
    };

    this.velocidad = {
      x: 0,
      y: 0,
    };
  }

  cambiarAnimacion(cual) {
    this.animacionQueEstamosUsandoAhorita = cual;
    //hacemos todos invisibles
    for (let key of Object.keys(this.spritesAnimados)) {
      this.spritesAnimados[key].visible = false;
    }
    //y despues hacemos visible el q queremos
    this.spritesAnimados[cual].visible = true;
  }

  cargarSpritesAnimados(textureData) {
    this.spritesAnimados = {};
    for (let key of Object.keys(textureData.animations)) {
      this.spritesAnimados[key] = new PIXI.AnimatedSprite(
        textureData.animations[key],
      );
      this.spritesAnimados[key].name = key;

      this.spritesAnimados[key].play();
      this.spritesAnimados[key].loop = true;
      this.spritesAnimados[key].animationSpeed = 0.1;
      this.spritesAnimados[key].scale.set(2);
      this.spritesAnimados[key].anchor.set(0.5, 1);

      this.container.addChild(this.spritesAnimados[key]);
    }
  }

  update() {
    //lerp
    //friccion;
    this.velocidad.x = this.velocidad.x; //* 0.97;
    this.velocidad.y = this.velocidad.y; // * 0.97;

    this.velocidadLineal = Math.sqrt(
      this.velocidad.x * this.velocidad.x + this.velocidad.y * this.velocidad.y,
    );

    //angulo en grados (cada radian son 57.2958 grados)
    this.angulo = Math.atan2(this.velocidad.y, this.velocidad.x) * 57.2958;

    //si la velocidad lineal (sin importar direccion) es menor a algo muy chiquito, se frena.
    if (this.velocidadLineal < 0.0001) {
      this.velocidad.x = 0;
      this.velocidad.y = 0;
    }

    this.posicion.x += this.velocidad.x;
    this.posicion.y += this.velocidad.y;

    this.chequearSiEstoyCercaDelTargetYFrenar();

    this.darLaVueltaAlMundo();

    this.render();
  }

  chequearSiEstoyCercaDelTargetYFrenar() {
    if (
      distancia(this.posicion.x, this.posicion.y, this.targetX, this.targetY) <
      this.distanciaParaLlegar
    ) {
      this.asignarVelocidad(0, 0);
    }
  }

  render() {
    this.container.x = this.posicion.x;
    this.container.y = this.posicion.y;

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

  darLaVueltaAlMundo() {
    //cuando el conejito se paso del limite inferior del canvas
    if (this.posicion.y > window.innerHeight) {
      //lo teletransportamos para arriba de todo (mas alla del limite superior del canvas)
      this.posicion.y = -Math.random() * 100;
    }

    //se va para arriba
    if (this.posicion.y < 0) {
      //lo teletransportamos para arriba de todo (mas alla del limite superior del canvas)
      this.posicion.y = window.innerHeight;
    }

    //se va para la izq
    if (this.posicion.x < 0) {
      //lo teletransportamos para arriba de todo (mas alla del limite superior del canvas)
      this.posicion.x = window.innerWidth;
    }

    //se va para la der
    if (this.posicion.x > window.innerWidth) {
      //lo teletransportamos para arriba de todo (mas alla del limite superior del canvas)
      this.posicion.x = 0;
    }
  }

  sumarVelocidad(x, y) {
    this.velocidad.x += x;
    this.velocidad.y += y;
  }

  asignarVelocidad(x, y) {
    this.velocidad.x = x;
    this.velocidad.y = y;
  }

  andaPalla(targetX, targetY) {
    this.targetX = targetX;
    this.targetY = targetY;

    let dx = targetX - this.posicion.x;
    let dy = targetY - this.posicion.y;
    const dist = Math.hypot(dx, dy);

    if (dist > this.distanciaParaLlegar) {
      const vx = dx / dist; // dirección normalizada X
      const vy = dy / dist; // dirección normalizada Y
      // velocidad con magnitud 1 (cambiar multiplicador si se quiere otra rapidez)
      this.asignarVelocidad(vx * 2, vy * 2);
    } else {
      // ya estamos en la posición (o muy cerca)
      this.asignarVelocidad(0, 0);
    }
  }
}
