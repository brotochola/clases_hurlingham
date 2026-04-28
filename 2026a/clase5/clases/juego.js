class Juego {
  constructor() {
    this.pixiApp;
    this.pixiInicializado = false;
    this.gameObjects = [];
    this.personas = [];
    this.enemigos = [];
    this.piedras = [];
    this.teclado = {};
    this.mouse = {};
    this.ahora = performance.now();

    this.targetCamara = null;

    this.anchoMundo = 2500;
    this.altoMundo = 1200;

    this.init();
  }

  async init() {
    if (this.pixiInicializado) {
      console.log("no podes arrancar pixi de nuevo");
      return;
    }

    console.log("arrancando");
    this.pixiApp = new PIXI.Application();
    console.log("app de pixi creada", this.pixiApp);

    const opcionesDePixi = {
      background: "#ffff00",
      width: window.innerWidth,
      height: window.innerHeight,
    };

    await this.pixiApp.init(opcionesDePixi);

    this.containerPrincipal = new PIXI.Container();
    this.containerPrincipal.label = "container principal";
    this.pixiApp.stage.addChild(this.containerPrincipal);

    window.__PIXI_APP__ = this.pixiApp;

    console.log("pixi app inicializada");
    //agregamos el elementos canvas creado por pixi en el documento html
    document.body.appendChild(this.pixiApp.canvas);
    this.pixiInicializado = true;

    await this.precargarAssets();

    this.ponerFondo();

    this.crearEventListeners();

    this.crearNivel();
  }

  ponerFondo() {
    this.fondo = new PIXI.TilingSprite({
      texture: this.texturaFondo,
      width: this.anchoMundo,
      height: this.altoMundo,
    });

    this.containerPrincipal.addChild(this.fondo);
  }

  crearEventListeners() {
    window.onmousemove = (e) => {
      this.mouse.x = e.x;
      this.mouse.y = e.y;
    };

    window.onkeydown = (evento) => {
      this.teclado[evento.key.toLowerCase()] = true;
    };

    window.onkeyup = (evento) => {
      delete this.teclado[evento.key.toLowerCase()];
    };
  }
  async precargarAssets() {
    this.ssChica = await PIXI.Assets.load("spritesheet/chica.json");
    this.texturaFondo = await PIXI.Assets.load("fondo.avif");
    this.piedra1 = await PIXI.Assets.load("RAW_Rock_1.png");
  }

  ponerPiedras() {
    for (let i = 0; i < 20; i++) {
      const instanciaDeConejito = new Piedra(
        Math.random() * this.anchoMundo,
        Math.random() * this.altoMundo,
        this,
      );
    }
  }

  crearNivel() {
    this.prota = new Protagonista(
      window.innerWidth / 2,
      window.innerHeight / 2,
      this.ssChica,
      this,
    );

    this.targetCamara = this.prota;

    for (let i = 0; i < 200; i++) {
      //definimos coord x
      const coordenadaXDeEsteConejito = Math.random() * window.innerWidth;
      //definimos y
      const coordenadaYDeEsteConejito = Math.random() * window.innerHeight;

      const instanciaDeConejito = new Enemigo(
        coordenadaXDeEsteConejito,
        coordenadaYDeEsteConejito,
        this.ssChica,
        this,
      );
    }

    this.ponerPiedras();

    this.gameLoop();
  }

  asignarTargetCamara(quien) {
    if (!(quien instanceof GameObject)) return;
    this.targetCamara = quien;
  }

  moverCamara() {
    //adonde tiene q moverse el cont principal:
    const valorObjetivoDelContainerPrincipalX =
      -this.targetCamara.posicion.x + window.innerWidth * 0.5;

    const valorObjetivoDelContainerPrincipalY =
      -this.targetCamara.posicion.y + window.innerHeight * 0.5;

    //lerp de la posicion actual hasta la pos a la q tiene q moverse:

    const cuantoLerp = 0.01;

    this.containerPrincipal.x +=
      (valorObjetivoDelContainerPrincipalX - this.containerPrincipal.x) *
      cuantoLerp;

    this.containerPrincipal.y +=
      (valorObjetivoDelContainerPrincipalY - this.containerPrincipal.y) *
      cuantoLerp;

    //limites

    if (this.containerPrincipal.x > 0) this.containerPrincipal.x = 0;
    if (this.containerPrincipal.y > 0) this.containerPrincipal.y = 0;

    this.limiteDerechoCamara = -this.anchoMundo + window.innerWidth;
    this.limiteInferiorCamara = -this.altoMundo + window.innerHeight;

    if (this.containerPrincipal.x < this.limiteDerechoCamara) {
      this.containerPrincipal.x = this.limiteDerechoCamara;
    }

    if (this.containerPrincipal.y < this.limiteInferiorCamara) {
      this.containerPrincipal.y = this.limiteInferiorCamara;
    }
  }

  gameLoop() {
    const nuevoAhora = performance.now();

    for (let i = 0; i < this.gameObjects.length; i++) {
      const gameobject = this.gameObjects[i];
      gameobject.update();
    }

    this.moverCamara();

    // console.log("gameloop", nuevoAhora, this);
    const duracionFrame = nuevoAhora - this.ahora;
    this.fps = 1000 / duracionFrame;

    // console.log(fps)

    this.ahora = nuevoAhora;

    requestAnimationFrame(() => {
      this.gameLoop();
    });
  }
}
