class Juego {
  pixiApp;
  conejitos = [];
  width;
  height;

  constructor() {
    this.width = 1280;
    this.height = 720;
    this.initPIXI();
  }

  //async indica q este metodo es asyncronico, es decir q puede usar "await"
  async initPIXI() {
    //creamos la aplicacion de pixi y la guardamos en la propiedad pixiApp
    this.pixiApp = new PIXI.Application();

    const opcionesDePixi = {
      background: "#1099bb",
      width: this.width,
      height: this.height,
    };

    //inicializamos pixi con las opciones definidas anteriormente
    //await indica q el codigo se frena hasta que el metodo init de la app de pixi haya terminado
    //puede tardar 2ms, 400ms.. no lo sabemos :O
    await this.pixiApp.init(opcionesDePixi);

    //agregamos el elementos canvas creado por pixi en el documento html
    document.body.appendChild(this.pixiApp.canvas);

    //cargamos la imagen bunny.png y la guardamos en la variable texture
    const texture = await PIXI.Assets.load("bunny.png");

    //creamos 10 instancias de la clase conejito
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      //crea una instancia de clase Conejito, el constructor de dicha clase toma como parametros la textura
      // q queremos usar,X,Y y una referencia a la instancia del juego (this)
      const conejito = new Conejito(texture, x, y, this);
      this.conejitos.push(conejito);
    }

    //agregamos el metodo this.gameLoop al ticker.
    //es decir: en cada frame vamos a ejecutar el metodo this.gameLoop
    this.pixiApp.ticker.add(() => {
      this.gameLoop();
    });
  }

  gameLoop(time) {
    //iteramos por todos los conejitos
    for (let unConejito of this.conejitos) {
      //ejecutamos el metodo tick de cada conejito
      unConejito.tick();
    }
  }
}
