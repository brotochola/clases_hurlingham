class GameObject {
  constructor(x, y, laDataQueVieneDelJson, juego) {
    this.juego = juego;
    this.container = new PIXI.Container();
    this.velocidadMaxima = 3;

    this.id = juego.gameObjects.length;

    //la agregamos al array de conejitos
    this.juego.gameObjects.push(this);

    //agregamos este sprite al stage
    this.juego.pixiApp.stage.addChild(this.container);

    this.posicion = {
      x: x,
      y: y,
    };

    this.velocidad = {
      x: 0,
      y: 0,
    };

    this.aceleracion = {
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
    this.spriteAnimadoActual = this.spritesAnimados[cual];
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

  aplicarFisica() {
    this.velocidad.x += this.aceleracion.x;
    this.velocidad.y += this.aceleracion.y;

    this.aceleracion.x = 0;
    this.aceleracion.y = 0;

    this.velocidad.x *= 0.99;
    this.velocidad.y *= 0.99;

    this.velocidadLineal = Math.sqrt(
      this.velocidad.x * this.velocidad.x + this.velocidad.y * this.velocidad.y,
    );

    //angulo en grados (cada radian son 57.2958 grados)
    this.angulo = Math.atan2(this.velocidad.y, this.velocidad.x) * 57.2958;

    //si la velocidad lineal (sin importar direccion) es menor a algo muy chiquito, se frena.
    if (this.velocidadLineal < 0.0001) {
      this.velocidad.x = 0;
      this.velocidad.y = 0;
    } else if (this.velocidadLineal > this.velocidadMaxima) {
      const factor = this.velocidadMaxima / this.velocidadLineal;
      this.velocidad.x *= factor;
      this.velocidad.y *= factor;
    }

    this.posicion.x += this.velocidad.x;
    this.posicion.y += this.velocidad.y;
  }

  sumarVelocidad(x, y) {
    this.velocidad.x += x;
    this.velocidad.y += y;
  }

  sumarAceleracion(x, y) {
    this.aceleracion.x += x;
    this.aceleracion.y += y;
  }

  asignarVelocidad(x, y) {
    this.velocidad.x = x;
    this.velocidad.y = y;
  }

  update() {
    //moverse
    this.aplicarFisica();
    //mostrar en pantalla:
    this.render();
  }

  render() {
    this.container.x = this.posicion.x;
    this.container.y = this.posicion.y;
    this.container.zIndex = this.posicion.y;
  }
}
