const MUNDO_ANCHO = 7000;
const MUNDO_ALTO = 4000;
const CAMARA_VELOCIDAD = 6;
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 2.0;
const ZOOM_FACTOR = 0.001;

class Juego {
  constructor(opciones = {}) {
    this.opciones = opciones;
    this.colorDeFondo = opciones.background ?? "#ffff00";
    this.rutaSpritesheet = "civil1.json";
    this.rutasDeImagenes = {
      centroUrbano: "centroUrbano.png",
      torre1: "torre1.png",
      torre2: "torre2.png",
      rock1: "rock1.png",
      rock2: "rock2.png",
      rock3: "rock3.png",
      bg: "bg.jpg",
    };

    this.app = null;
    this.mundo = null;
    this.ui = null;
    this.assetsCivil = null;
    this.assetsSplat = null;
    this.texturas = {};

    //un array para cada tipo de gameObject
    this.gameObjects = [];
    this.enemigos = [];
    this.torres = [];
    this.centrosUrbanos = [];
    this.personas = [];
    this.casitas = [];

    this.pixiInicializado = false;
    this.teclas = {};

    this.ultimoTimestamp = null;
    this.deltaTimeRatio = 1;
    this.pausado = false;
    this.rafId = null;

    this.gameloop = this.gameloop.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    this.onWindowBlur = this.onWindowBlur.bind(this);
    this.onWindowFocus = this.onWindowFocus.bind(this);
  }

  async init() {
    if (this.pixiInicializado) {
      console.log("no podes arrancar pixi de nuevo");
      return;
    }

    this.app = new PIXI.Application();

    await this.app.init({
      background: this.colorDeFondo,
      width: window.innerWidth,
      height: window.innerHeight,

      pixelArt: true,

      resolution: 1,
      autoDensity: true,
      powerPreference: "high-performance",
      backgroundAlpha: 0,
      antialias: false,
      resolution: 1,
      resizeTo: window,
      backgroundColor: 0x1099bb,
    });

    this.app.stage.sortableChildren = true;

    window.__PIXI_APP__ = this.app;

    document.body.appendChild(this.app.canvas);
    document.body.style.margin = "0px";
    document.body.style.overflow = "hidden";

    this.pixiInicializado = true;

    try {
      this.assetsCivil = await PIXI.Assets.load(this.rutaSpritesheet);
      this.assetsSplat = await PIXI.Assets.load("splat/splat.json");
    } catch (error) {
      this.mostrarErrorDeAssets(error);
      throw error;
    }

    await this.cargarAssets();

    this.mundo = new PIXI.Container();
    this.mundo.sortableChildren = true;
    this.mundo.x = Math.round((window.innerWidth - MUNDO_ANCHO) / 2);
    this.mundo.y = Math.round((window.innerHeight - MUNDO_ALTO) / 2);
    this.app.stage.addChild(this.mundo);

    const texturaBg = this.texturas["bg"];
    const fondo = new PIXI.TilingSprite({
      texture: texturaBg,
      width: MUNDO_ANCHO,
      height: MUNDO_ALTO,
    });
    fondo.zIndex = -1;
    this.mundo.addChild(fondo);

    this.spawnCentroUrbano(MUNDO_ANCHO / 2, MUNDO_ALTO / 2);

    this.ui = new UI(this);

    window.addEventListener("resize", this.onResize);
    document.body.addEventListener("click", this.onClick);
    document.body.addEventListener("contextmenu", this.onContextMenu);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("wheel", this.onWheel, { passive: false });
    window.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    window.addEventListener("blur", this.onWindowBlur);
    window.addEventListener("focus", this.onWindowFocus);

    this.rafId = requestAnimationFrame(this.gameloop);
  }

  mostrarErrorDeAssets(error) {
    console.error("No se pudo cargar el spritesheet civil1", error);

    const cartel = document.createElement("div");
    cartel.textContent =
      'No se pudo cargar "civil1.json". Revisar que "civil1.png" exista junto al json.';
    cartel.style.position = "fixed";
    cartel.style.left = "16px";
    cartel.style.top = "16px";
    cartel.style.padding = "12px 16px";
    cartel.style.background = "#ffffff";
    cartel.style.border = "1px solid #000000";
    cartel.style.fontFamily = "sans-serif";
    cartel.style.zIndex = "9999";

    document.body.appendChild(cartel);
  }

  async cargarAssets() {
    const entradas = Object.entries(this.rutasDeImagenes);

    await Promise.all(
      entradas.map(async ([clave, ruta]) => {
        const textura = await PIXI.Assets.load(ruta);
        this.texturas[clave] = textura;
      }),
    );
  }

  async cargarTextura(clave, rutaOriginal) {
    if (this.texturas[clave]) {
      return this.texturas[clave];
    }

    const ruta = rutaOriginal;
    const textura = await PIXI.Assets.load(ruta);
    this.texturas[clave] = textura;

    return textura;
  }

  agregarGameObject(gameObject) {
    this.mundo.addChild(gameObject.container);
    gameObject.render();

    return gameObject;
  }

  spawnEnemigo(x, y, opciones = {}) {
    const enemigo = new Enemigo(x, y, this, opciones);

    return this.agregarGameObject(enemigo);
  }

  spawnCentroUrbano(x, y) {
    const centroUrbano = new CentroUrbano(x, y, this);

    this.centroUrbano = centroUrbano;
    return this.agregarGameObject(centroUrbano);
  }

  spawnTorre(x, y, tipo = 1) {
    const torre = new Torre(x, y, this, tipo);

    return this.agregarGameObject(torre);
  }

  moverEnemigosHacia(x, y) {
    for (let enemigo of this.enemigos) {
      enemigo.setearTarget(x, y);
    }
  }

  onKeyDown(event) {
    this.teclas[event.key.toLowerCase()] = true;
  }

  onKeyUp(event) {
    this.teclas[event.key.toLowerCase()] = false;
  }

  onClick(event) {
    if (this.ui?.ignorarProximoClick) {
      this.ui.ignorarProximoClick = false;
      return;
    }

    const zoom = this.mundo.scale.x;
    const mundoX = (event.pageX - this.mundo.x) / zoom;
    const mundoY = (event.pageY - this.mundo.y) / zoom;

    if (this.ui?.confirmarColocacion(mundoX, mundoY)) return;

    this.moverEnemigosHacia(mundoX, mundoY);
  }

  onWheel(event) {
    event.preventDefault();
    if (!this.mundo) return;

    const zoom = this.mundo.scale.x;
    const nuevoZoom = Math.min(
      ZOOM_MAX,
      Math.max(ZOOM_MIN, zoom - event.deltaY * ZOOM_FACTOR * zoom),
    );

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const mundoX = (mouseX - this.mundo.x) / zoom;
    const mundoY = (mouseY - this.mundo.y) / zoom;

    this.mundo.scale.set(nuevoZoom);
    this.mundo.x = mouseX - mundoX * nuevoZoom;
    this.mundo.y = mouseY - mundoY * nuevoZoom;
  }

  onContextMenu(event) {
    event.preventDefault();
    if (this.ui?.fantasma) {
      this.ui.cancelarColocacion();
      return;
    }
  }

  onMouseMove(event) {
    if (!this.teclas["1"]) return;

    const zoom = this.mundo.scale.x;
    const mundoX = (event.clientX - this.mundo.x) / zoom;
    const mundoY = (event.clientY - this.mundo.y) / zoom;

    this.spawnEnemigo(mundoX, mundoY);
  }

  pausa() {
    this.pausado = true;
    console.log("pausando juego");
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  reanudar() {
    if (this.pausado) {
      console.log("reanudando juego");
      this.pausado = false;
      this.ultimoTimestamp = null;
      this.rafId = requestAnimationFrame(this.gameloop);
    }
  }

  onVisibilityChange() {
    if (document.hidden) {
      this.pausa();
    } else {
      this.reanudar();
    }
  }

  onWindowBlur() {
    this.pausa();
  }

  onWindowFocus() {
    this.reanudar();
  }

  onResize() {
    if (!this.app) {
      return;
    }

    this.app.renderer.resize(window.innerWidth, window.innerHeight);
  }

  moverCamara() {
    if (!this.mundo) return;

    if (this.teclas["a"] || this.teclas["arrowleft"]) {
      this.mundo.x += CAMARA_VELOCIDAD;
    }
    if (this.teclas["d"] || this.teclas["arrowright"]) {
      this.mundo.x -= CAMARA_VELOCIDAD;
    }
    if (this.teclas["w"] || this.teclas["arrowup"]) {
      this.mundo.y += CAMARA_VELOCIDAD;
    }
    if (this.teclas["s"] || this.teclas["arrowdown"]) {
      this.mundo.y -= CAMARA_VELOCIDAD;
    }

    const zoom = this.mundo.scale.x;
    const anchoEscalado = MUNDO_ANCHO * zoom;
    const altoEscalado = MUNDO_ALTO * zoom;

    if (anchoEscalado <= window.innerWidth) {
      this.mundo.x = Math.round((window.innerWidth - anchoEscalado) / 2);
    } else {
      this.mundo.x = Math.min(
        0,
        Math.max(window.innerWidth - anchoEscalado, this.mundo.x),
      );
    }

    if (altoEscalado <= window.innerHeight) {
      this.mundo.y = Math.round((window.innerHeight - altoEscalado) / 2);
    } else {
      this.mundo.y = Math.min(
        0,
        Math.max(window.innerHeight - altoEscalado, this.mundo.y),
      );
    }
  }

  gameloop(timestamp) {
    this.deltaTimeRatio = this.ultimoTimestamp
      ? (timestamp - this.ultimoTimestamp) / 16.666
      : 1;
    this.ultimoTimestamp = timestamp;

    this.moverCamara();

    for (let gameObject of this.gameObjects) {
      gameObject.update(this.deltaTimeRatio, this.gameObjects);
    }

    this.rafId = requestAnimationFrame(this.gameloop);
  }

  getEnemigosCerca(x, y, radio) {
    return this.enemigos.filter((enemigo) => {
      return distancia(x, y, enemigo.posicion.x, enemigo.posicion.y) < radio;
    });
  }
}

window.Juego = Juego;
