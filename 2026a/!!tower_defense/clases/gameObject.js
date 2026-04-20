class GameObject {
  constructor(x, y, juego) {
    this.id = juego.gameObjects.length;
    this.juego = juego;
    this.container = new PIXI.Container();
    this.container.label = this.constructor.name;
    this.container.sortableChildren = true;
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
    this.velocidadLineal = 0;
    this.angulo = 0;
    this.radio = 20;
    this.estatico = false;
    this.velocidadMaxima = 10;
    this.friccion = 1;
    juego.gameObjects.push(this);
  }

  sacameDeLosArrays() {
    this.juego.casitas = this.juego.casitas.filter((casita) => casita !== this);
    this.juego.torres = this.juego.torres.filter((torre) => torre !== this);
    this.juego.centrosUrbanos = this.juego.centrosUrbanos.filter(
      (centroUrbano) => centroUrbano !== this,
    );
    this.juego.personas = this.juego.personas.filter(
      (persona) => persona !== this,
    );
    this.juego.enemigos = this.juego.enemigos.filter(
      (enemigo) => enemigo !== this,
    );
    this.juego.gameObjects = this.juego.gameObjects.filter(
      (gameObject) => gameObject !== this,
    );
  }

  configurarOrigen(displayObject) {
    if (displayObject?.anchor?.set) {
      displayObject.anchor.set(0.5, 1);
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

  agregarAceleracion(x, y) {
    this.aceleracion.x += x;
    this.aceleracion.y += y;
  }

  aplicarAceleracion(deltaTimeRatio) {
    this.velocidad.x += this.aceleracion.x * deltaTimeRatio;
    this.velocidad.y += this.aceleracion.y * deltaTimeRatio;
    this.aceleracion.x = 0;
    this.aceleracion.y = 0;
  }

  actualizarVelocidadLinealYAngulo() {
    this.velocidadLineal = Math.hypot(this.velocidad.x, this.velocidad.y);

    if (this.velocidadLineal > 0.0001) {
      this.angulo = Math.atan2(this.velocidad.y, this.velocidad.x) * 57.2958;
    }
  }

  aplicarFriccion(deltaTimeRatio) {
    this.velocidad.x *= this.friccion * deltaTimeRatio;
    this.velocidad.y *= this.friccion * deltaTimeRatio;
  }

  actualizarPosicion(deltaTimeRatio = 1) {
    this.posicion.x += this.velocidad.x * deltaTimeRatio;
    this.posicion.y += this.velocidad.y * deltaTimeRatio;
  }

  limitarVelocidad() {
    const velCuad =
      this.velocidad.x * this.velocidad.x + this.velocidad.y * this.velocidad.y;
    if (velCuad > this.velocidadMaxima * this.velocidadMaxima) {
      const factor = this.velocidadMaxima / Math.sqrt(velCuad);
      this.velocidad.x *= factor;
      this.velocidad.y *= factor;
    }
  }

  resolverColisionCon(otro) {
    if (this.estatico) return;

    const dx = otro.posicion.x - this.posicion.x;
    const dy = otro.posicion.y - this.posicion.y;
    const distCuad = dx * dx + dy * dy;
    const sumRadios = this.radio + otro.radio;

    if (distCuad >= sumRadios * sumRadios || distCuad < 0.00000001) return;

    const dist = Math.sqrt(distCuad);
    const overlap = sumRadios - dist;
    const nx = dx / dist;
    const ny = dy / dist;
    const fuerza = otro.estatico ? overlap : overlap * 0.5;

    this.sumarVelocidad(-nx * fuerza, -ny * fuerza);
  }

  resolverColisionesPropias(gameObjects) {
    for (let otro of gameObjects) {
      if (otro !== this) this.resolverColisionCon(otro);
    }
  }

  aplicarFisica(deltaTimeRatio, gameObjects) {
    if (this.estatico) return;
    this.actualizarVelocidadLinealYAngulo();
    this.aplicarAceleracion(deltaTimeRatio);
    this.aplicarFriccion(deltaTimeRatio);
    this.limitarVelocidad();
    this.actualizarPosicion(deltaTimeRatio);
    this.resolverColisionesPropias(gameObjects);
  }

  render() {
    this.container.x = this.posicion.x;
    this.container.y = this.posicion.y;
    this.container.zIndex = this.posicion.y;
  }

  update(deltaTimeRatio = 1, gameObjects = []) {
    this.aplicarFisica(deltaTimeRatio, gameObjects);
    this.render();
  }
}

window.GameObject = GameObject;
