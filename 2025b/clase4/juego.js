class Juego {
  pixiApp;
  conejitos = [];
  width;
  height;

  constructor() {
    this.width = 1280;
    this.height = 720;
    this.mouse = { posicion: { x: 0, y: 0 } };
    this.initPIXI();
  }

  //async indica q este metodo es asyncronico, es decir q puede usar "await"
  async initPIXI() {
    //creamos la aplicacion de pixi y la guardamos en la propiedad pixiApp
    this.pixiApp = new PIXI.Application();

    this.pixiApp.stage.name = "el stage";

    //esto es para que funcione la extension de pixi
    globalThis.__PIXI_APP__ = this.pixiApp;

    const opcionesDePixi = {
      background: "#1099bb",
      width: this.width,
      height: this.height,
      antialias: false,
      SCALE_MODE: PIXI.SCALE_MODES.NEAREST,
    };

    //inicializamos pixi con las opciones definidas anteriormente
    //await indica q el codigo se frena hasta que el metodo init de la app de pixi haya terminado
    //puede tardar 2ms, 400ms.. no lo sabemos :O
    await this.pixiApp.init(opcionesDePixi);

    // //agregamos el elementos canvas creado por pixi en el documento html
    document.body.appendChild(this.pixiApp.canvas);

    //cargamos la imagen bunny.png y la guardamos en la variable texture
    const texture = await PIXI.Assets.load("bunny.png");

    const animacionesPersonaje1 = await PIXI.Assets.load("img/personaje.json");

    for (let i = 0; i < 30; i++) {
      const x = 0.5 * this.width;
      const y = 0.5 * this.height;
      //crea una instancia de clase Conejito, el constructor de dicha clase toma como parametros la textura
      // q queremos usar,X,Y y una referencia a la instancia del juego (this)
      const conejito = new Conejito(animacionesPersonaje1, x, y, this);
      this.conejitos.push(conejito);
    }

    //agregamos el metodo this.gameLoop al ticker.
    //es decir: en cada frame vamos a ejecutar el metodo this.gameLoop
    this.pixiApp.ticker.add(this.gameLoop.bind(this));

    this.agregarInteractividadDelMouse();

    // this.asignarPerseguidorRandomATodos();
    // this.asignarTargets();
    this.asignarElMouseComoTargetATodosLosConejitos();
  }

  agregarInteractividadDelMouse() {
    // Escuchar el evento mousemove
    this.pixiApp.canvas.onmousemove = (event) => {
      this.mouse.posicion = { x: event.x, y: event.y };
    };
  }

  gameLoop(time) {
    //iteramos por todos los conejitos
    for (let unConejito of this.conejitos) {
      //ejecutamos el metodo tick de cada conejito
      unConejito.tick();
      unConejito.render();
    }
  }

  getConejitoRandom() {
    return this.conejitos[Math.floor(this.conejitos.length * Math.random())];
  }

  asignarTargets() {
    for (let cone of this.conejitos) {
      cone.asignarTarget(this.getConejitoRandom());
    }
  }

  asignarElMouseComoTargetATodosLosConejitos() {
    for (let cone of this.conejitos) {
      cone.asignarTarget(this.mouse);
    }
  }

  asignarPerseguidorRandomATodos() {
    for (let cone of this.conejitos) {
      cone.perseguidor = this.getConejitoRandom();
    }
  }
  asignarElMouseComoPerseguidorATodosLosConejitos() {
    for (let cone of this.conejitos) {
      cone.perseguidor = this.mouse;
    }
  }
}
