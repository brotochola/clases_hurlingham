const Z_INDEX = {
  containerBG: 0,
  graficoSombrasProyectadas: 1,
  containerIluminacion: 2,
  containerPrincipal: 3,
  spriteAmarilloParaElAtardecer: 4,
  containerUI: 5,
};

class Juego {
  pixiApp;
  personas = [];
  amigos = [];
  enemigos = [];
  civiles = [];
  policias = [];
  faroles = [];
  monumentos = [];
  obstaculos = [];
  arboles = [];
  autos = [];
  objetosInanimados = [];
  protagonista;
  width;
  height;
  debug = false;
  barrasDeVidaVisibles = true;
  distanciaALaQueLosObjetosTienenTodaLaLuz = 157;
  factorMagicoArriba = 2;
  factorMagicoAbajo = 2.18;
  teclado = {};
  ahora = performance.now();
  BASE_Z_INDEX = 50000;

  constructor() {
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
      // Redimensionar la RenderTexture del sistema de iluminación
      if (this.sistemaDeIluminacion) {
        this.sistemaDeIluminacion.redimensionarRenderTexture();
      }
      if (this.ui) this.ui.resize();
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
    this.ui = new UI(this);
  }

  agregarListenersDeTeclado() {
    window.onkeydown = (event) => {
      this.teclado[event.key.toLowerCase()] = true;
      if (event.key == "1") {
        this.crearUnAmigo(this.mouse.posicion.x, this.mouse.posicion.y);
      } else if (parseInt(event.key)) {
        this.crearUnEnemigo(
          parseInt(event.key),
          this.mouse.posicion.x,
          this.mouse.posicion.y
        );
      }
    };
    window.onkeyup = (event) => {
      this.teclado[event.key.toLowerCase()] = false;
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
    this.containerBG.addChild(this.fondo);
  }

  crearContainerBG() {
    this.containerBG = new PIXI.Container();
    this.containerBG.label = "containerBG";
    this.containerBG.zIndex = Z_INDEX.containerBG;

    this.pixiApp.stage.addChild(this.containerBG);
  }
  crearGraficoDebug() {
    this.graficoDebug = new PIXI.Graphics();
    this.graficoDebug.zIndex = 51231231231;
    this.graficoDebug.label = "graficoDebug";
    this.containerPrincipal.addChild(this.graficoDebug);
  }

  async crearNivel() {
    this.containerPrincipal = new PIXI.Container();
    this.containerPrincipal.label = "containerPrincipal";
    this.containerPrincipal.zIndex = Z_INDEX.containerPrincipal;
    this.pixiApp.stage.addChild(this.containerPrincipal);

    this.crearContainerBG();
    this.crearGraficoDebug();

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

    // this.crearAmigos(400);

    this.crearCruzTarget();

    // Crear el sistema de iluminación
    this.sistemaDeIluminacion = new SistemaDeIluminacion(this);
    this.particleSystem = new ParticleSystem(this);
  }

  async crearCruzTarget() {
    this.cruzTarget = new PIXI.Sprite(
      await PIXI.Assets.load("assets/pixelart/target.png")
    );
    this.cruzTarget.visible = false;

    this.cruzTarget.zIndex = 999999999999;
    this.cruzTarget.anchor.set(0.5, 0.5);
    this.containerPrincipal.addChild(this.cruzTarget);
  }

  hacerQueCruzTargetSeVaya() {
    gsap.to(this.cruzTarget, {
      alpha: 0,
      duration: 1,
      onComplete: () => {
        this.cruzTarget.visible = false;
      },
    });
  }
  hacerQueCruzTargetAparezca() {
    gsap.killTweensOf(this.cruzTarget);
    this.cruzTarget.visible = true;
    this.cruzTarget.alpha = 1;
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
    await PIXI.Assets.load([
      "assets/bg.jpg",
      "assets/pixelart/target.png",
      "assets/pixelart/globo_de_dialogo.png",
    ]);
  }

  crearUnEnemigo(bando, x, y, callback) {
    const persona = new Enemigo(x, y, this, bando);
    this.personas.push(persona);
    this.enemigos.push(persona);
    if (callback instanceof Function)
      persona.esperarAQueTengaSpriteCargado(() => callback());
    return persona;
  }

  crearUnAmigo(x, y, callback) {
    const persona = new Amigo(x, y, this);
    this.personas.push(persona);
    this.amigos.push(persona);
    if (callback instanceof Function)
      persona.esperarAQueTengaSpriteCargado(() => callback());
    return persona;
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

  crearUnCivil(x, y) {
    const persona = new Civil(x, y, this);
    this.civiles.push(persona);
    this.personas.push(persona);
  }

  crearUnPolicia(x, y) {
    const persona = new Policia(x, y, this);
    this.policias.push(persona);
    this.personas.push(persona);
  }

  crearAmigos(cant) {
    for (let i = 0; i < cant; i++) {
      const x = Math.random() * this.anchoDelMapa;
      const y = Math.random() * this.altoDelMapa;
      this.crearUnAmigo(x, y);
    }
  }
  crearProtagonista() {
    const x = 3500;
    const y = 1500;
    const protagonista = new Protagonista(x, y, this);
    this.personas.push(protagonista);
    this.protagonista = protagonista;
  }

  segunQueTeclaEstaApretadaHacerCosas() {
    if (this.teclado[1]) {
      this.crearUnAmigo(this.mouse.posicion.x, this.mouse.posicion.y);
    }
    if (this.teclado[2]) {
      this.crearUnEnemigo(2, this.mouse.posicion.x, this.mouse.posicion.y);
    } else if (this.teclado[3]) {
      this.crearUnEnemigo(3, this.mouse.posicion.x, this.mouse.posicion.y);
    } else if (this.teclado[4]) {
      this.crearUnEnemigo(4, this.mouse.posicion.x, this.mouse.posicion.y);
    } else if (this.teclado[5]) {
      this.crearUnEnemigo(5, this.mouse.posicion.x, this.mouse.posicion.y);
    } else if (this.teclado[6]) {
      this.crearUnEnemigo(6, this.mouse.posicion.x, this.mouse.posicion.y);
    } else if (this.teclado[7]) {
      this.crearUnEnemigo(7, this.mouse.posicion.x, this.mouse.posicion.y);
    } else if (this.teclado["c"]) {
      this.crearUnCivil(this.mouse.posicion.x, this.mouse.posicion.y);
    } else if (this.teclado["p"]) {
      this.crearUnPolicia(this.mouse.posicion.x, this.mouse.posicion.y);
    }
  }

  agregarInteractividadDelMouse() {
    this.pixiApp.canvas.oncontextmenu = (event) => {
      event.preventDefault();
    };
    // Escuchar el evento mousemove
    this.pixiApp.canvas.onmousemove = (event) => {
      this.segunQueTeclaEstaApretadaHacerCosas();
      this.mouse.posicion = this.convertirCoordenadaDelMouse(event.x, event.y);
    };

    this.pixiApp.canvas.onmousedown = (event) => {
      this.mouse.down = this.convertirCoordenadaDelMouse(event.x, event.y);
      this.mouse.apretado = true;
    };
    this.pixiApp.canvas.onmouseup = (event) => {
      if (event.button != 0) return;
      this.mouse.up = this.convertirCoordenadaDelMouse(event.x, event.y);
      this.mouse.apretado = false;
      this.ponerCruzTargetDondeElMouseHizoClick(this.mouse.up);
    };

    // Event listener para la rueda del mouse (zoom)
    this.pixiApp.canvas.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault(); // Prevenir el scroll de la página

        const zoomDelta = event.deltaY > 0 ? -this.zoomStep : this.zoomStep;
        const nuevoZoom = Math.max(
          this.minZoom,
          Math.min(this.maxZoom, this.zoom + zoomDelta)
        );

        if (nuevoZoom !== this.zoom) {
          // Aplicar el nuevo zoom
          this.cambiarZoom(nuevoZoom);

          // Recentrar la cámara en el targetCamara
          this.moverContainerPrincipalA(
            -this.targetCamara.posicion.x * this.zoom + this.width / 2,
            -this.targetCamara.posicion.y * this.zoom + this.height / 2
          );
        }
      },
      { passive: false }
    );
  }
  ponerCruzTargetDondeElMouseHizoClick(posicion) {
    this.cruzTarget.x = posicion.x;
    this.cruzTarget.y = posicion.y;
    this.hacerQueCruzTargetAparezca();
  }

  convertirCoordenadaDelMouse(mouseX, mouseY) {
    // Convertir coordenadas del mouse del viewport a coordenadas del mundo
    // teniendo en cuenta la posición y escala del containerPrincipal
    return {
      x: (mouseX - this.containerPrincipal.x) / this.zoom,
      y: (mouseY - this.containerPrincipal.y) / this.zoom,
    };
  }

  gameLoop(time) {
    //borrar lo q hay en los graficos debug
    if (this.graficoDebug) this.graficoDebug.clear();

    for (let unpersona of this.personas) unpersona.tick();
    for (let unpersona of this.personas) unpersona.render();

    for (let arbol of this.arboles) arbol.tick();
    for (let farol of this.faroles) farol.tick();

    for (let obstaculo of this.obstaculos) obstaculo.render();

    // Actualizar el sistema de iluminación
    if (this.sistemaDeIluminacion) this.sistemaDeIluminacion.tick();

    if (this.particleSystem) this.particleSystem.update();
    if (this.ui) this.ui.tick();
    this.chequearQueNoHayaMuertosConBarraDeVida();

    this.hacerQLaCamaraSigaAAlguien();
    this.calcularFPS();

    if (!this.debug) return;
    for (let obstaculo of this.obstaculos) obstaculo.dibujarCirculo();
    for (let unpersona of this.personas) unpersona.dibujarCirculo();
  }

  chequearQueNoHayaMuertosConBarraDeVida() {
    this.containerPrincipal.children
      .filter((child) => child.label.startsWith("persona muerta"))
      .forEach((k) => {
        const containerBarraVida = k.children.find((k) =>
          k.label.startsWith("containerBarraVida")
        );

        const spriteAnimado = k.children.find((k) =>
          k.label.startsWith("animatedSprite")
        );

        //fade out muertos
        if (spriteAnimado) {
          spriteAnimado.alpha *= 0.996;
          spriteAnimado.alpha -= 0.0001;

          if (spriteAnimado.alpha < 0.01) {
            k.removeChild(spriteAnimado);
            spriteAnimado.destroy();
            this.containerPrincipal.removeChild(k);
          }
        }

        if (containerBarraVida) {
          k.removeChild(containerBarraVida);
          containerBarraVida.destroy();
        }
      });
  }
  calcularFPS() {
    this.deltaTime = performance.now() - this.ahora;
    this.ahora = performance.now();
    this.fps = 1000 / this.deltaTime;
    this.ratioDeltaTime = this.deltaTime / 16.66;
  }

  toggleIluminacion() {
    if (this.sistemaDeIluminacion) {
      this.sistemaDeIluminacion.toggle();
    }
  }

  toggleBarrasDeVida() {
    this.barrasDeVidaVisibles = !this.barrasDeVidaVisibles;
    this.personas.forEach((persona) => {
      // Verificar que la persona no esté muerta y tenga barra de vida
      if (!persona.muerto && persona.containerBarraVida) {
        persona.containerBarraVida.visible = this.barrasDeVidaVisibles;
      }
    });
  }
  toggleDebug() {
    this.debug = !this.debug;
  }

  hacerQLaCamaraSigaAAlguien() {
    if (!this.targetCamara) return;
    // Ajustar la posición considerando el zoom actual
    let targetX = -this.targetCamara.posicion.x * this.zoom + this.width / 2;
    let targetY = -this.targetCamara.posicion.y * this.zoom + this.height / 2;

    const x = (targetX - this.containerPrincipal.x) * 0.1;
    const y = (targetY - this.containerPrincipal.y) * 0.1;

    this.moverContainerPrincipalA(
      this.containerPrincipal.x + x,
      this.containerPrincipal.y + y
    );
  }

  moverContainerPrincipalA(x, y) {
    this.containerPrincipal.x = x;
    this.containerPrincipal.y = y;
    this.containerBG.x = x;
    this.containerBG.y = y;
  }

  cambiarZoom(zoom) {
    this.zoom = zoom;
    this.containerPrincipal.scale.set(this.zoom);
    this.containerBG.scale.set(this.zoom);
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
