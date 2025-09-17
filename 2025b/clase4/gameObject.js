class GameObject {
  //defino las propiedades q tiene mi clase, aunq podria no definirlas
  sprite;
  id;
  x = 0;
  y = 0;
  target;
  perseguidor;
  aceleracionMaxima = 0.2;
  velocidadMaxima = 3;
  spritesAnimados = {};
  radio = 10;
  distanciaPersonal = 20;
  distanciaParaLlegar = 300;

  constructor(textureData, x, y, juego) {
    this.container = new PIXI.Container();

    this.container.name = "container";
    this.vision = Math.random() * 200 + 1300;
    //guarda una referencia a la instancia del juego
    this.posicion = { x: x, y: y };
    this.velocidad = { x: Math.random() * 10, y: Math.random() * 10 };
    this.aceleracion = { x: 0, y: 0 };

    this.juego = juego;
    //generamos un ID para este conejito
    this.id = Math.floor(Math.random() * 99999999);

    // tomo como parametro la textura y creo un sprite

    this.cargarSpritesAnimados(textureData);

    this.cambiarAnimacion("caminarAbajo");

    // this.sprite.play();
    // this.sprite.loop = true;
    // this.sprite.animationSpeed = 0.1;
    // this.sprite.scale.set(2);

    // //le asigno x e y al sprite
    // this.sprite.x = x;
    // this.sprite.y = y;

    // //establezco el punto de pivot en el medio:
    // this.sprite.anchor.set(0.5);

    // //agrego el sprite al stage
    // //this.juego es una referencia a la instancia de la clase Juego
    // //a su vez el juego tiene una propiedad llamada pixiApp, q es la app de PIXI misma,
    // //q a su vez tiene el stage. Y es el Stage de pixi q tiene un metodo para agregar 'hijos'
    // //(el stage es como un container/nodo)
    // this.juego.pixiApp.stage.addChild(this.sprite);

    this.juego.pixiApp.stage.addChild(this.container);
  }

  cambiarAnimacion(cual) {
    //hacemos todos invisibles
    for (let key of Object.keys(this.spritesAnimados)) {
      this.spritesAnimados[key].visible = false;
    }
    //y despues hacemos visible el q queremos
    this.spritesAnimados[cual].visible = true;
  }

  cargarSpritesAnimados(textureData) {
    for (let key of Object.keys(textureData.animations)) {
      this.spritesAnimados[key] = new PIXI.AnimatedSprite(
        textureData.animations[key]
      );

      this.spritesAnimados[key].play();
      this.spritesAnimados[key].loop = true;
      this.spritesAnimados[key].animationSpeed = 0.1;
      this.spritesAnimados[key].scale.set(2);
      this.spritesAnimados[key].anchor.set(0.5, 1);

      this.container.addChild(this.spritesAnimados[key]);
    }
  }

  tick() {
    //TODO: hablar de deltatime
    this.aceleracion.x = 0;
    this.aceleracion.y = 0;

    this.separacion();

    this.escapar();
    this.perseguir();
    this.limitarAceleracion();
    this.velocidad.x +=
      this.aceleracion.x * this.juego.pixiApp.ticker.deltaTime;
    this.velocidad.y +=
      this.aceleracion.y * this.juego.pixiApp.ticker.deltaTime;

    //variaciones de la velocidad
    this.rebotar();
    this.aplicarFriccion();
    this.limitarVelocidad();

    //pixeles por frame
    this.posicion.x += this.velocidad.x * this.juego.pixiApp.ticker.deltaTime;
    this.posicion.y += this.velocidad.y * this.juego.pixiApp.ticker.deltaTime;

    //guardamos el angulo
    this.angulo =
      radianesAGrados(Math.atan2(this.velocidad.y, this.velocidad.x)) + 180;

    this.velocidadLineal = Math.sqrt(
      this.velocidad.x * this.velocidad.x + this.velocidad.y * this.velocidad.y
    );
  }

  separacion() {
    let promedioDePosicionDeAquellosQEstanMuyCercaMio = { x: 0, y: 0 };
    let contador = 0;

    for (let persona of this.juego.conejitos) {
      if (this != persona) {
        if (
          calcularDistancia(this.posicion, persona.posicion) <
          this.distanciaPersonal
        ) {
          contador++;
          promedioDePosicionDeAquellosQEstanMuyCercaMio.x += persona.posicion.x;
          promedioDePosicionDeAquellosQEstanMuyCercaMio.y += persona.posicion.y;
        }
      }
    }

    if (contador == 0) return;

    promedioDePosicionDeAquellosQEstanMuyCercaMio.x /= contador;
    promedioDePosicionDeAquellosQEstanMuyCercaMio.y /= contador;

    let vectorQueSeAlejaDelPromedioDePosicion = {
      x: this.posicion.x - promedioDePosicionDeAquellosQEstanMuyCercaMio.x,
      y: this.posicion.y - promedioDePosicionDeAquellosQEstanMuyCercaMio.y,
    };

    vectorQueSeAlejaDelPromedioDePosicion = limitarVector(
      vectorQueSeAlejaDelPromedioDePosicion,
      1
    );

    const factor = 10;

    this.aceleracion.x += vectorQueSeAlejaDelPromedioDePosicion.x * factor;
    this.aceleracion.y += vectorQueSeAlejaDelPromedioDePosicion.y * factor;
  }

  cambiarDeSpriteAnimadoSegunAngulo() {
    //0 grados es a la izq, abre en sentido horario, por lo cual 180 es a la derecha
    //90 es para arriba
    //270 abajo

    if ((this.angulo > 315 && this.angulo < 360) || this.angulo < 45) {
      this.cambiarAnimacion("caminarDerecha");
      this.spritesAnimados.caminarDerecha.scale.x = -2;
    } else if (this.angulo > 135 && this.angulo < 225) {
      this.cambiarAnimacion("caminarDerecha");
      this.spritesAnimados.caminarDerecha.scale.x = 2;
    } else if (this.angulo < 135 && this.angulo > 45) {
      this.cambiarAnimacion("caminarArriba");
    } else {
      this.cambiarAnimacion("caminarAbajo");
    }
  }

  limitarAceleracion() {
    this.aceleracion = limitarVector(this.aceleracion, this.aceleracionMaxima);
  }

  limitarVelocidad() {
    this.velocidad = limitarVector(this.velocidad, this.velocidadMaxima);
  }

  aplicarFriccion() {
    const friccion = Math.pow(0.95, this.juego.pixiApp.ticker.deltaTime);
    this.velocidad.x *= friccion;
    this.velocidad.y *= friccion;
  }

  rebotar() {
    //ejemplo mas realista
    if (this.posicion.x > this.juego.width || this.posicion.x < 0) {
      //si la coordenada X de este conejito es mayor al ancho del stage,
      //o si la coordenada X.. es menor q 0 (o sea q se fue por el lado izquierdo)
      //multiplicamos por -0.99, o sea que se invierte el signo (si era positivo se hace negativo y vicecversa)
      //y al ser 0.99 pierde 1% de velocidad
      this.velocidad.x *= -0.99;
    }

    if (this.posicion.y > this.juego.height || this.posicion.y < 0) {
      this.velocidad.y *= -0.99;
    }
  }

  asignarTarget(quien) {
    this.target = quien;
  }

  perseguir() {
    if (!this.target) return;
    const dist = calcularDistancia(this.posicion, this.target.posicion);
    if (dist > this.vision) return;

    // Decaimiento exponencial: va de 1 a 0 a medida que se acerca
    let factor = Math.pow(dist / this.distanciaParaLlegar, 3);

    const difX = this.target.posicion.x - this.posicion.x;
    const difY = this.target.posicion.y - this.posicion.y;

    let vectorTemporal = {
      x: -difX,
      y: -difY,
    };
    vectorTemporal = limitarVector(vectorTemporal, 1);

    this.aceleracion.x += -vectorTemporal.x * factor;
    this.aceleracion.y += -vectorTemporal.y * factor;
  }

  escapar() {
    if (!this.perseguidor) return;
    const dist = calcularDistancia(this.posicion, this.perseguidor.posicion);
    if (dist > this.vision) return;

    const difX = this.perseguidor.posicion.x - this.posicion.x;
    const difY = this.perseguidor.posicion.y - this.posicion.y;

    let vectorTemporal = {
      x: -difX,
      y: -difY,
    };
    vectorTemporal = limitarVector(vectorTemporal, 1);

    this.aceleracion.x += -vectorTemporal.x;
    this.aceleracion.y += -vectorTemporal.y;
  }

  asignarVelocidad(x, y) {
    this.velocidad.x = x;
    this.velocidad.y = y;
  }

  render() {
    this.container.x = this.posicion.x;
    this.container.y = this.posicion.y;

    this.container.zIndex = this.posicion.y;

    this.cambiarDeSpriteAnimadoSegunAngulo();
    this.cambiarVelocidadDeAnimacionSegunVelocidadLineal();
  }

  cambiarVelocidadDeAnimacionSegunVelocidadLineal() {
    const keys = Object.keys(this.spritesAnimados);
    for (let key of keys) {
      this.spritesAnimados[key].animationSpeed =
        this.velocidadLineal * 0.05 * this.juego.pixiApp.ticker.deltaTime;
    }
  }
}
