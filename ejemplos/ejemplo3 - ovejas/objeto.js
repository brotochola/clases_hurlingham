// Clase base Objeto
class Objeto {
  constructor(x, y, velocidadMax, juego) {
    this.id = generarID();
    this.grid = juego.grid;
    this.app = juego.app;
    this.juego = juego;
    this.container = new PIXI.Container();
    this.juego.app.stage.addChild(this.container);
    this.listo = false;
    this.container.x = x;
    this.container.y = y;

    this.velocidad = new PIXI.Point(0, 0);
    this.velocidadMax = velocidadMax;
    this.velocidadMaxCuadrada = velocidadMax * velocidadMax;

    // this.container.anchor.set(0.5,1); // Pivote en el centro

    this.spritesAnimados = {};
  }
  calcularAngulo() {
    this.angulo =
      (radians_to_degrees(Math.atan2(this.velocidad.x, this.velocidad.y)) -
        90 +
        360) %
      360;

    return this.angulo;
  }

  cambiarSprite(cual, numero = 0, loop = true, cb) {
    //SI EL SPRITE ACTUAL ES EL MISMO AL Q QUEREMOS CAMBIAR, NO HACE NADA.. RETURN
    if (this.spriteActual == cual) return;
    // console.log("#cambiar sprite", this.spriteActual, "->", cual);
    this.spriteActual = cual;
    let sprite = this.spritesAnimados[cual];
    if (!sprite) return null;
    if (numero != undefined) {
      sprite.gotoAndPlay(numero);
    }
    sprite.loop = loop;
    this.container.removeChildren();
    this.container.addChild(sprite);
    if (cb instanceof Function) {
      sprite.onComplete = () => {
        cb();
      };
    }

    return sprite;
  }

  cargarSpriteSheetAnimadoDeJSON(url, cb) {
    console.log("#cargarSpriteSheetAnimadoDeJSON", url);
    const loader = PIXI.Loader.shared;
    let nombre = this.constructor.name;

    loader.add(nombre, url).load((loader, resources) => {
      this.sheet = resources[nombre].spritesheet;
      let animaciones = Object.keys(this.sheet.animations);

      for (let i = 0; i < animaciones.length; i++) {
        console.log(animaciones[i]);
        let frames = this.sheet.animations[animaciones[i]];

        let animacionActual = new PIXI.AnimatedSprite(frames);
        animacionActual.loop = true;
        animacionActual.play();

        this.spritesAnimados[animaciones[i]] = animacionActual;
      }

      if (cb instanceof Function) cb(this.spritesAnimados);
    });
  }

  cargarVariosSpritesAnimadosDeUnSoloArchivo(inObj, cb) {
    let texture = PIXI.Texture.from(inObj.archivo);
    let retObj = {};
    texture.baseTexture.on("loaded", () => {
      let width = texture.baseTexture.width;
      let height = texture.baseTexture.height;
      let frameWidth = inObj.frameWidth;
      let frameHeight = inObj.frameHeight;
      let cantFramesX = width / frameWidth;
      let cantFramesY = height / frameHeight;

      const frames = [];

      for (let i = 0; i < cantFramesX; i++) {
        frames[i] = [];
        for (let j = 0; j < cantFramesY; j++) {
          const rectangle = new PIXI.Rectangle(
            i * frameWidth,
            j * frameHeight,
            frameWidth,
            frameHeight
          );
          const frame = new PIXI.Texture(texture.baseTexture, rectangle);
          // frame.anchor.set(0.5,1)

          frames[i][j] = frame;
        }
      } //for

      // console.log("frames cortados", frames);

      let animaciones = Object.keys(inObj.animaciones);
      for (let i = 0; i < animaciones.length; i++) {
        let anim = inObj.animaciones[animaciones[i]];

        let framesParaEstaAnimacion = [];
        for (let x = anim.desde.x; x <= anim.hasta.x; x++) {
          framesParaEstaAnimacion.push(frames[x][anim.hasta.y]);
        }

        // console.log("#" + animaciones[i], framesParaEstaAnimacion);

        const animatedSprite = new PIXI.AnimatedSprite(framesParaEstaAnimacion);
        animatedSprite.animationSpeed = inObj.velocidad;
        animatedSprite.loop = true;
        animatedSprite.anchor.set(0.5, 1);
        animatedSprite.play();

        retObj[animaciones[i]] = animatedSprite;
      } //for animaciones
      // console.log("returnn", retObj);
      this.spritesAnimados = retObj;
      if (cb instanceof Function) cb(retObj);
    });
  }
  cargarVariosSpritesAnimados(inObj, w, h, velocidad, cb) {
    let ret = {};
    let keys = Object.keys(inObj);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      this.cargarSpriteAnimado(inObj[key], w, h, velocidad, (spriteAnimado) => {
        ret[key] = spriteAnimado;
        if (Object.keys(ret).length == keys.length) {
          //TERMINO
          this.spritesAnimados = { ...this.spritesAnimados, ...ret };
          if (cb instanceof Function) cb(this.spritesAnimados);
        }
      });
    }
  }

  cargarSpriteAnimado(url, frameWidth, frameHeight, vel, cb) {
    let texture = PIXI.Texture.from(url);
    texture.baseTexture.on("loaded", () => {
      let width = texture.baseTexture.width;
      let height = texture.baseTexture.height;
      let cantFramesX = width / frameWidth;
      let cantFramesY = height / frameHeight;

      const frames = [];

      for (let i = 0; i < cantFramesX; i++) {
        for (let j = 0; j < cantFramesY; j++) {
          const rectangle = new PIXI.Rectangle(
            i * frameWidth,
            j * frameHeight,
            frameWidth,
            frameHeight
          );
          const frame = new PIXI.Texture(texture.baseTexture, rectangle);
          // frame.anchor.set(0.5,1)

          frames.push(frame);
        }
      } //for

      const animatedSprite = new PIXI.AnimatedSprite(frames);

      // Configurar la animación
      animatedSprite.animationSpeed = vel;
      animatedSprite.loop = true; // Para que la animación se repita

      animatedSprite.anchor.set(0.5, 1);

      // Iniciar la animación
      animatedSprite.play();

      if (cb) cb(animatedSprite);
    });
  }

  borrar() {
    this.juego.app.stage.removeChild(this.container);
    if (this instanceof Oveja) {
      this.juego.zombies = this.juego.zombies.filter((k) => k != this);
    } else if (this instanceof Bala) {
      this.juego.balas = this.juego.balas.filter((k) => k != this);
    }

    this.grid.remove(this);
  }

  obtenerVecinos() {
    let vecinos = [];
    const cellSize = this.grid.cellSize;
    const xIndex = Math.floor(this.container.x / cellSize);
    const yIndex = Math.floor(this.container.y / cellSize);
    const margen = 1;
    // Revisar celdas adyacentes
    for (let i = -margen; i <= margen; i++) {
      for (let j = -margen; j <= margen; j++) {
        const cell = this.grid.getCell(xIndex + i, yIndex + j);

        if (cell) {
          vecinos = [
            ...vecinos,
            ...Object.values(cell.objetosAca).filter(
              (k) => k != this && !k.decorado
            ),
          ];
        }
      }
    }
    return vecinos;
  }
  estoyEnLaMismaCeldaQue(fulano) {
    return (
      fulano.miCeldaActual &&
      this.miCeldaActual &&
      fulano.miCeldaActual == this.miCeldaActual
    );
  }
  normalizarVelocidad() {
    if (this.velocidad.x == 0 && this.velocidad.y == 0) {
      return;
    }

    let magnitud = calculoDeDistanciaRapido(
      0,
      0,
      this.velocidad.x,
      this.velocidad.y
    );

    if (magnitud == 0) return;

    this.velocidad.x /= magnitud;
    this.velocidad.y /= magnitud;

    this.velocidad.x *= this.velocidadMax;
    this.velocidad.y *= this.velocidadMax;
    if (isNaN(this.velocidad.x)) debugger;
  }

  update() {
    // this.normalizarVelocidad();

    this.container.x += this.velocidad.x;
    this.container.y += this.velocidad.y;

    this.actualizarZIndex();
    this.actualizarLado();
    this.actualizarPosicionEnGrid();

    if (Math.abs(this.velocidad.x) < 0.2 && Math.abs(this.velocidad.y) < 0.2) {
      this.velocidad.x = 0;
      this.velocidad.y = 0;
    } else {
      this.velocidad.x *= 0.98;
      this.velocidad.y *= 0.98;
    }
  }

  hacerQueLaVelocidadDeLaAnimacionCoincidaConLaVelocidad() {
    this.spritesAnimados[this.spriteActual].animationSpeed =
      0.07 *
        calculoDeDistanciaRapido(0, 0, this.velocidad.x, this.velocidad.y) +
      0.1;
  }
  actualizarPosicionEnGrid() {
    this.grid.update(this);
  }

  ajustarPorBordes() {
    let fuerza = new PIXI.Point(0, 0);

    let margen = this.juego.grid.cellSize * 0.5;
    let limiteDerecho = this.juego.canvasWidth - margen;
    let limiteIzquierdo = margen;
    let limiteArriba = margen;
    let limiteAbajo = this.juego.canvasHeight - margen;

    let cuantaFuerza = 1;

    if (this.container.x < limiteIzquierdo) fuerza.x = cuantaFuerza;
    if (this.container.y < limiteArriba) fuerza.y = cuantaFuerza;
    if (this.container.x > limiteDerecho) fuerza.x = -cuantaFuerza;
    if (this.container.y > limiteAbajo) fuerza.y = -cuantaFuerza;

    // if(this.debug)console.log(fuerza)
    return fuerza;
  }

  repelerObstaculos(vecinos) {
    const vecFuerza = new PIXI.Point(0, 0);
    let cant = 0;
    vecinos.forEach((obstaculo) => {
      if (obstaculo instanceof Piedra) {
        const distCuadrada = distanciaAlCuadrado(
          this.container.x,
          this.container.y,
          obstaculo.container.x,
          obstaculo.container.y
        );

        if (distCuadrada < obstaculo.radio ** 2) {
          //SI ESTA A MENOS DE UNA CELDA DE DIST
          const dif = new PIXI.Point(
            this.container.x - obstaculo.container.x,
            this.container.y - obstaculo.container.y
          );
          dif.x /= distCuadrada;
          dif.y /= distCuadrada;
          vecFuerza.x += dif.x;
          vecFuerza.y += dif.y;
          cant++;
        }
      }
    });
    if (cant) {
      vecFuerza.x *= 40;
      vecFuerza.y *= 40;
      // vecFuerza.x += -this.velocidad.x;
      // vecFuerza.y += -this.velocidad.y;
    }

    return vecFuerza;
  }

  aplicarFuerza(fuerza) {
    if (!fuerza) return;
    // let limiteDeFuerza = 0.1;
    // //SI LA FUERZA Q LE VAMOS A APLICAR ES MUY POCA, NI LA APLICAMOS
    // if(Math.abs(fuerza.x)<limiteDeFuerza && Math.abs(fuerza.y)<limiteDeFuerza) return;
    this.velocidad.x += fuerza.x;
    this.velocidad.y += fuerza.y;

    // Limitar la velocidad máxima
    const velocidadCuadrada =
      this.velocidad.x * this.velocidad.x + this.velocidad.y * this.velocidad.y;
    if (velocidadCuadrada > this.velocidadMaxCuadrada) {
      const magnitud = Math.sqrt(velocidadCuadrada);
      this.velocidad.x = (this.velocidad.x / magnitud) * this.velocidadMax;
      this.velocidad.y = (this.velocidad.y / magnitud) * this.velocidadMax;
    }
  }
  actualizarLado() {
    if (this.velocidad.x > 0) {
      this.container.scale.x = 1;
    } else if (this.velocidad.x < 0) {
      this.container.scale.x = -1;
    } else if (this.velocidad.y == 0 && this instanceof Oveja) {
      if (this.juego.player.container.x > this.container.x) {
        this.container.scale.x = 1;
      } else {
        this.container.scale.x = -1;
      }
    }
  }
  actualizarZIndex() {
    this.container.zIndex = Math.floor(this.container.y);
  }
}
