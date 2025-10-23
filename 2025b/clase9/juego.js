class Juego {
  pixiApp;
  conejitos = [];
  width;
  height;

  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mouse = { posicion: { x: 0, y: 0 } };
    this.initPIXI();
    this.initMatterJS();
    this.containerPrincipal = new PIXI.Container();

    this.pixiApp.stage.addChild(this.containerPrincipal);
  }

  initMatterJS() {
    // module aliases
    var Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite;

    // create an engine
    this.engine = Engine.create();

    // create a renderer
    // this.matterRenderer = Render.create({
    //   element: document.body,
    //   engine: this.engine,
    // });

    // create two boxes and a ground
    // var boxA = Bodies.rectangle(400, 200, 80, 80);
    // var boxB = Bodies.rectangle(450, 50, 80, 80);

    // Crear bordes de la pantalla
    this.piso = Bodies.rectangle(
      this.width / 2,
      this.height + 30,
      this.width,
      60,
      {
        isStatic: true,
        friction: 1,
      }
    );

    this.techo = Bodies.rectangle(this.width / 2, -30, this.width, 60, {
      isStatic: true,
      friction: 1,
    });

    this.paredIzquierda = Bodies.rectangle(
      -30,
      this.height / 2,
      60,
      this.height,
      {
        isStatic: true,
        friction: 1,
      }
    );

    this.paredDerecha = Bodies.rectangle(
      this.width + 30,
      this.height / 2,
      60,
      this.height,
      {
        isStatic: true,
        friction: 1,
      }
    );

    // add all of the bodies to the world
    Composite.add(this.engine.world, [
      this.piso,
      this.techo,
      this.paredIzquierda,
      this.paredDerecha,
    ]);

    // run the renderer
    if (this.matterRenderer) Render.run(this.matterRenderer);

    // create runner
    this.matterRunner = Runner.create();

    // run the engine
    Runner.run(this.matterRunner, this.engine);
  }

  //async indica q este metodo es asyncronico, es decir q puede usar "await"
  async initPIXI() {
    //creamos la aplicacion de pixi y la guardamos en la propiedad pixiApp
    this.pixiApp = new PIXI.Application();
    globalThis.__PIXI_APP__ = this.pixiApp;
    const opcionesDePixi = {
      background: "#1099bb",
      width: this.width,
      height: this.height,
      resizeTo: window,
    };

    //inicializamos pixi con las opciones definidas anteriormente
    //await indica q el codigo se frena hasta que el metodo init de la app de pixi haya terminado
    //puede tardar 2ms, 400ms.. no lo sabemos :O
    await this.pixiApp.init(opcionesDePixi);

    // //agregamos el elementos canvas creado por pixi en el documento html
    document.body.appendChild(this.pixiApp.canvas);

    this.pixiApp.canvas.id = "pixiCanvas";

    //cargamos la imagen bunny.png y la guardamos en la variable texture
    this.texturaDeConejo = await PIXI.Assets.load("bunny.png");

    //creamos 10 instancias de la clase conejito
    // for (let i = 0; i < 20; i++) {
    //   const x = Math.random() * this.width;
    //   const y = Math.random() * this.height;
    //   //crea una instancia de clase Conejito, el constructor de dicha clase toma como parametros la textura
    //   // q queremos usar,X,Y y una referencia a la instancia del juego (this)
    //   const conejito = new Conejito(texture, x, y, this);
    //   this.conejitos.push(conejito);
    // }

    //agregamos el metodo this.gameLoop al ticker.
    //es decir: en cada frame vamos a ejecutar el metodo this.gameLoop
    this.pixiApp.ticker.add(this.gameLoop.bind(this));

    this.agregarInteractividadDelMouse();
  }

  agregarInteractividadDelMouse() {
    // Escuchar el evento mousemove

    this.pixiApp.canvas.onmousedown = (event) => {
      this.mouse.apretado = true;
    };

    this.pixiApp.canvas.onmouseup = (event) => {
      this.mouse.apretado = false;
    };

    this.pixiApp.canvas.onmousemove = (event) => {
      this.mouse.posicion = { x: event.x, y: event.y };
    };

    this.pixiApp.canvas.onmousemove = (event) => {
      this.mouse.posicion = { x: event.x, y: event.y };

      if (this.mouse.apretado) {
        const conejito = new Conejito(
          this.texturaDeConejo,
          this.mouse.posicion.x,
          this.mouse.posicion.y,
          this
        );
        this.conejitos.push(conejito);
      }
    };

    this.pixiApp.canvas.oncontextmenu = (event) => {
      event.preventDefault();
      this.ponerBomba(event.clientX, event.clientY);
    };

    this.pixiApp.canvas.onclick = (event) => {
      const conejito = new Conejito(
        this.texturaDeConejo,
        this.mouse.posicion.x,
        this.mouse.posicion.y,
        this
      );
      this.conejitos.push(conejito);
    };
  }

  ponerBomba(x, y) {
    console.log(x, y);
    for (let conejito of this.conejitos) {
      const dist = calcularDistancia(conejito.posicion, { x: x, y: y });
      const vectorFuerza = {
        x: (conejito.cajita.position.x - x) / dist ** 2.5,
        y: (conejito.cajita.position.y - y) / dist ** 2.5,
      };

      conejito.aplicameFuerza(vectorFuerza.x, vectorFuerza.y);
    }
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
