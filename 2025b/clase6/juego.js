class Juego {
  pixiApp;
  personas = [];
  amigos = [];
  enemigos = [];
  faroles = [];
  monumentos = [];
  obstaculos = [];
  arboles = [];
  autos = [];
  objetosInanimados = [];
  protagonista;
  width;
  height;

  constructor() {
    this.iluminacion = false;
    this.updateDimensions();
    this.anchoDelMapa = 5000;
    this.altoDelMapa = 5000;
    this.mouse = { posicion: { x: 0, y: 0 } };

    // Variables para el zoom
    this.zoom = 1;
    this.minZoom = 0.1;
    this.maxZoom = 2;
    this.zoomStep = 0.1;

    this.initPIXI();
    this.setupResizeHandler();
  }

  updateDimensions() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  setupResizeHandler() {
    window.addEventListener("resize", () => {
      this.updateDimensions();
      if (this.pixiApp) {
        this.pixiApp.renderer.resize(this.width, this.height);
      }
    });
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
      antialias: true,
      resolution: 1,
      resizeTo: window,
    };

    //inicializamos pixi con las opciones definidas anteriormente
    //await indica q el codigo se frena hasta que el metodo init de la app de pixi haya terminado
    //puede tardar 2ms, 400ms.. no lo sabemos :O
    await this.pixiApp.init(opcionesDePixi);

    // //agregamos el elementos canvas creado por pixi en el documento html
    document.body.appendChild(this.pixiApp.canvas);

    //agregamos el metodo this.gameLoop al ticker.
    //es decir: en cada frame vamos a ejecutar el metodo this.gameLoop
    this.pixiApp.ticker.add(this.gameLoop.bind(this));

    this.agregarListenersDeTeclado();

    this.agregarInteractividadDelMouse();
    this.pixiApp.stage.sortableChildren = true;
    this.crearNivel();
  }

  agregarListenersDeTeclado() {
    window.onkeyup = (event) => {
      if (event.key.toLowerCase() == "u") {
        this.hacerQueLaCamaraSigaAalguienRandom();
      }
    };
  }

  async crearFondo() {
    this.fondo = new PIXI.TilingSprite(await PIXI.Assets.load("assets/bg.jpg"));
    this.fondo.zIndex = -999999999999999999999;
    this.fondo.tileScale.set(0.5);
    this.fondo.width = this.anchoDelMapa;
    this.fondo.height = this.altoDelMapa;
    this.containerPrincipal.addChild(this.fondo);
  }
  async crearNivel() {
    this.containerPrincipal = new PIXI.Container();

    this.graficoDebug = new PIXI.Graphics();
    this.graficoDebug.zIndex = 51231231231;
    this.graficoDebug.label = "graficoDebug";
    this.containerPrincipal.addChild(this.graficoDebug);

    this.pixiApp.stage.addChild(this.containerPrincipal);
    await this.cargarTexturas();
    this.crearFondo();

    this.nivel = new Nivel("assets/pixelart/plaza_de_mayo_15.json", this);

    // this.crearArboles();
    // this.crearCasitasRandom();
    this.crearProtagonista();
    this.targetCamara = this.protagonista;
    // this.crearEnemigos(200, 2);
    // this.crearEnemigos(40, 3);
    // this.crearEnemigos(40, 4);
    // this.crearEnemigos(40, 5);
    // this.crearEnemigos(40, 6);
    // this.crearEnemigos(40, 7);

    // this.crearArbolesRAndom

    this.crearAmigos(400);

    this.crearSistemaDeIluminacion(); // Sistema nuevo de sprites individuales
  }
  crearCasitasRandom() {
    for (let i = 0; i < 100; i++) {
      const monumento = new Monumento(
        Math.random() * this.anchoDelMapa,
        Math.random() * this.altoDelMapa,
        this,
        "casa" + Math.floor(Math.random() * 2 + 1),
        1
      );
      this.obstaculos.push(monumento);
    }
  }

  hacerQueLaCamaraSigaAalguienRandom() {
    this.targetCamara = this.getPersonaRandom();
  }

  async cargarTexturas() {
    await PIXI.Assets.load(["assets/bg.jpg"]);
  }
  crearEnemigos(cant, bando) {
    for (let i = 0; i < cant; i++) {
      const x = Math.random() * this.anchoDelMapa;
      const y = Math.random() * this.altoDelMapa;
      const persona = new Enemigo(x, y, this, bando);
      this.personas.push(persona);
      this.enemigos.push(persona);
    }
  }

  crearAutos() {
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * this.anchoDelMapa;
      const y = Math.random() * this.altoDelMapa;
      const auto = new Auto(x, y, this);
      this.autos.push(auto);
      this.objetosInanimados.push(auto);
    }
  }

  crearArboles() {
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * this.anchoDelMapa;
      const y = Math.random() * this.altoDelMapa;
      const arbol = new Arbol(x, y, this);
      this.arboles.push(arbol);
      this.obstaculos.push(arbol);
      this.objetosInanimados.push(arbol);
    }
  }
  crearAmigos(cant) {
    for (let i = 0; i < cant; i++) {
      const x = Math.random() * this.anchoDelMapa;
      const y = Math.random() * this.altoDelMapa;
      const persona = new Amigo(x, y, this);
      this.personas.push(persona);
      this.amigos.push(persona);
    }
  }
  crearProtagonista() {
    const x = this.anchoDelMapa / 2;
    const y = this.altoDelMapa / 2;
    const protagonista = new Protagonista(x, y, this);
    this.personas.push(protagonista);
    this.protagonista = protagonista;
  }

  agregarInteractividadDelMouse() {
    // Escuchar el evento mousemove
    this.pixiApp.canvas.onmousemove = (event) => {
      this.mouse.posicion = this.convertirCoordenadaDelMouse(event.x, event.y);
    };

    this.pixiApp.canvas.onmousedown = (event) => {
      this.mouse.down = this.convertirCoordenadaDelMouse(event.x, event.y);
      this.mouse.apretado = true;
    };
    this.pixiApp.canvas.onmouseup = (event) => {
      this.mouse.up = this.convertirCoordenadaDelMouse(event.x, event.y);
      this.mouse.apretado = false;
    };

    // Event listener para la rueda del mouse (zoom)
    this.pixiApp.canvas.addEventListener("wheel", (event) => {
      event.preventDefault(); // Prevenir el scroll de la página

      const zoomDelta = event.deltaY > 0 ? -this.zoomStep : this.zoomStep;
      const nuevoZoom = Math.max(
        this.minZoom,
        Math.min(this.maxZoom, this.zoom + zoomDelta)
      );

      if (nuevoZoom !== this.zoom) {
        // Obtener la posición del mouse antes del zoom
        const mouseX = event.x;
        const mouseY = event.y;

        // Calcular el punto en coordenadas del mundo antes del zoom
        const worldPosX = (mouseX - this.containerPrincipal.x) / this.zoom;
        const worldPosY = (mouseY - this.containerPrincipal.y) / this.zoom;

        // Aplicar el nuevo zoom
        this.zoom = nuevoZoom;
        this.containerPrincipal.scale.set(this.zoom);

        // Ajustar la posición del contenedor para mantener el mouse en el mismo punto del mundo
        this.containerPrincipal.x = mouseX - worldPosX * this.zoom;
        this.containerPrincipal.y = mouseY - worldPosY * this.zoom;
      }
    });
  }

  convertirCoordenadaDelMouse(mouseX, mouseY) {
    // Convertir coordenadas del mouse del viewport a coordenadas del mundo
    // teniendo en cuenta la posición y escala del containerPrincipal
    return {
      x: (mouseX - this.containerPrincipal.x) / this.zoom,
      y: (mouseY - this.containerPrincipal.y) / this.zoom,
    };
  }

  crearSistemaDeIluminacion() {
    console.log("crearSistemaDeIluminacion");
    this.graficoSombrasProyectadas = new PIXI.Graphics();
    this.graficoSombrasProyectadas.zIndex = 3;
    this.graficoSombrasProyectadas.label = "graficoSombrasProyectadas";
    this.graficoSombrasProyectadas.blendMode = "multiply";
    this.containerPrincipal.addChild(this.graficoSombrasProyectadas);

    this.blurParaElGraficoDeSombrasProyectadas = new PIXI.BlurFilter({
      strength: 8,
      quality: 2,
      kernelSize: 5,
    });
    this.graficoSombrasProyectadas.filters = [
      this.blurParaElGraficoDeSombrasProyectadas,
    ];

    // Solo crear el sistema de iluminación una vez
    setTimeout(() => {
      // Solo crear si no existe ya
      if (!this.containerDeIluminacion) {
        this.containerDeIluminacion = new PIXI.Container();
        this.containerDeIluminacion.label = "containerDeIluminacion";
        this.containerDeIluminacion.sortableChildren = true; // Para que funcione el zIndex

        this.containerPrincipal.addChild(this.containerDeIluminacion);

        // Primero crear el sprite negro de fondo
        const spriteNegro = crearSpriteNegro(
          this.anchoDelMapa,
          this.altoDelMapa
        );
        spriteNegro.label = "spriteNegro";
        // spriteNegro.x = -this.anchoDelMapa;
        // spriteNegro.y = -this.altoDelMapa;
        spriteNegro.zIndex = 1; // Debajo del gradiente
        this.containerDeIluminacion.addChild(spriteNegro);

        // Crear sprites individuales para cada farol usando sus propios métodos
        for (let farol of this.faroles) {
          const spriteGradiente = crearSpriteConGradiente(700);
          spriteGradiente.x = farol.posicion.x;
          spriteGradiente.y = farol.posicion.y;
          spriteGradiente.zIndex = 2; // Encima del sprite negro

          this.containerDeIluminacion.addChild(spriteGradiente);
        }

        this.containerDeIluminacion.zIndex = 2;
        this.containerDeIluminacion.alpha = 0.8;
        this.containerDeIluminacion.cacheAsBitmap = true;
        this.containerDeIluminacion.blendMode = "multiply";
      }

      // Siempre actualizar la visibilidad basada en el estado actual
      this.containerDeIluminacion.visible = this.iluminacion;
    }, 1000);
  }

  gameLoop(time) {
    //borrar lo q hay en los graficos debug y sombras proyectadas
    if (this.graficoSombrasProyectadas) this.graficoSombrasProyectadas.clear();
    if (this.graficoDebug) this.graficoDebug.clear();

    if (this.iluminacion) {
      for (let farol of this.faroles) {
        farol.actualizarLineas();
      }
    }
    //iteramos por todos los personas
    for (let unpersona of this.personas) {
      //ejecutamos el metodo tick de cada persona
      unpersona.tick();
      unpersona.render();
    }

    for (let obstaculo of this.obstaculos) {
      obstaculo.dibujarCirculo();
    }

    this.hacerQLaCamaraSigaAlProtagonista();
  }

  toggleIluminacion() {
    this.iluminacion = !this.iluminacion;

    // Alternar visibilidad del sistema de sprites individuales
    if (this.containerDeIluminacion)
      this.containerDeIluminacion.visible = this.iluminacion;

    for (let obj of [
      ...this.autos,
      ...this.personas,
      ...this.arboles,
      ...this.monumentos,
    ]) {
      obj.cambiarTintParaSimularIluminacion();
    }
  }

  hacerQLaCamaraSigaAlProtagonista() {
    if (!this.targetCamara) return;
    // Ajustar la posición considerando el zoom actual
    let targetX = -this.targetCamara.posicion.x * this.zoom + this.width / 2;
    let targetY = -this.targetCamara.posicion.y * this.zoom + this.height / 2;

    const x = (targetX - this.containerPrincipal.x) * 0.1;
    const y = (targetY - this.containerPrincipal.y) * 0.1;

    this.containerPrincipal.x += x;
    this.containerPrincipal.y += y;
  }

  finDelJuego() {
    alert("Te moriste! fin del juego");
  }

  getPersonaRandom() {
    return this.personas[Math.floor(this.personas.length * Math.random())];
  }

  // asignarTargets() {
  //   for (let cone of this.personas) {
  //     cone.asignarTarget(this.getpersonaRandom());
  //   }
  // }

  // asignarElMouseComoTargetATodosLospersonas() {
  //   for (let cone of this.personas) {
  //     cone.asignarTarget(this.mouse);
  //   }
  // }

  // asignarPerseguidorRandomATodos() {
  //   for (let cone of this.personas) {
  //     cone.perseguidor = this.getpersonaRandom();
  //   }
  // }
  // asignarElMouseComoPerseguidorATodosLospersonas() {
  //   for (let cone of this.personas) {
  //     cone.perseguidor = this.mouse;
  //   }
  // }
}
