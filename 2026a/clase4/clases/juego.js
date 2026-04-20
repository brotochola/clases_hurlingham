class Juego {
  constructor() {
    this.pixiApp;
    this.pixiInicializado = false;
    this.gameObjects = [];
    this.teclado = {};
    this.ahora = performance.now();

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

    window.__PIXI_APP__ = this.pixiApp;

    console.log("pixi app inicializada");
    //agregamos el elementos canvas creado por pixi en el documento html
    document.body.appendChild(this.pixiApp.canvas);
    this.pixiInicializado = true;

    await this.precargarAssets();

    this.crearEventListeners();

    this.crearNivel();
  }

  crearEventListeners() {
    window.onkeydown = (evento) => {
      this.teclado[evento.key.toLowerCase()] = true;
    };

    window.onkeyup = (evento) => {
      delete this.teclado[evento.key.toLowerCase()];
    };
  }
  async precargarAssets() {
    this.ssChica = await PIXI.Assets.load("spritesheet/chica.json");
  }

  crearNivel() {
    for (let i = 0; i < 10; i++) {
      // const spriteDeConejitoTemporal = new PIXI.Sprite(texture);

      //definimos coord x
      const coordenadaXDeEsteConejito = Math.random() * window.innerWidth;
      //definimos y
      const coordenadaYDeEsteConejito = Math.random() * window.innerHeight;

      const instanciaDeConejito = new Persona(
        coordenadaXDeEsteConejito,
        coordenadaYDeEsteConejito,
        this.ssChica,
        this,
      );
    }

    this.prota = new Protagonista(
      window.innerWidth / 2,
      window.innerHeight / 2,
      this.ssChica,
      this,
    );

    this.gameLoop();
  }

  gameLoop() {
    const nuevoAhora = performance.now();
    // console.log("gameloop", nuevoAhora, this);
    const duracionFrame = nuevoAhora - this.ahora;
    const fps = 1000 / duracionFrame;

    // console.log(fps)

    this.ahora = nuevoAhora;

    for (let i = 0; i < this.gameObjects.length; i++) {
      const conejito = this.gameObjects[i];
      conejito.update();
    }

    requestAnimationFrame(() => {
      this.gameLoop();
    });
  }
}
