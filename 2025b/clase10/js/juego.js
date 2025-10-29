class Juego {
  static Z_INDEX = {
    containerBG: 0,
    graficoSombrasProyectadas: 1,
    containerIluminacion: 2,
    containerPrincipal: 3,
    spriteAmarilloParaElAtardecer: 4,
    containerUI: 5,
    cables: 999999999999,
  };
  // Configuración estática - accesible globalmente como Juego.CONFIG
  static getDefaultConfig() {
    return {
      usar_grilla: true,
      percibir_cada_10_frames: true,
      no_renderizar_lo_q_no_se_ve: true,
      comparar_distancias_cuadradas: true,
      usar_pool_vectores: true,
      usar_sombras_proyectadas: true, // Activar/desactivar sombras para comparar performance

      // NUEVO: Sistema optimizado de sombras con texturas (10-20x más rápido)
      // true = usa texturas pre-renderizadas (RECOMENDADO)
      // false = usa geometría calculada cada frame (método viejo)
      usar_sombras_con_texturas: true,

      max_sombras_por_objeto: 3, // Cantidad máxima de sombras por personaje (recomendado: 2-4)

      // Efecto pixelado de sombras (solo con usar_sombras_con_texturas: true)
      // 1.0 = sin pixelado, 0.1 = muy pixelado, 0.05 = ultra pixelado
      escala_textura_sombras: 0.1, // Valor por defecto (recomendado: 0.05-0.2)

      // OPTIMIZACIÓN: Frecuencia de actualización de tints (cambios de color por iluminación)
      // Actualizar tints cada N frames (1 = cada frame, 10 = cada 10 frames)
      // Valores más altos = mejor performance pero menos suave
      frames_entre_updates_tint: 10, // Recomendado: 5-15

      // OPTIMIZACIÓN: Frecuencia de cálculo de comportamientos de flocking
      frames_seguir_al_lider: 20, // Para amigos siguiendo al protagonista
      frames_cohesion: 21, // Calcular cohesión cada N frames (recomendado: 15-30)
      frames_alineacion: 22, // Calcular alineación cada N frames (recomendado: 15-30)
      frames_repeler_obstaculos: 15, // Calcular repulsión de obstáculos cada N frames (recomendado: 10-20)
      frames_repeler_enemigos: 18, // Calcular repulsión de enemigos cada N frames (recomendado: 10-25)
    };
  }
  static CONFIG = Juego.getDefaultConfig();

  static ponerLaPeorConfiguracion() {
    Juego.CONFIG = {
      usar_grilla: false,
      percibir_cada_10_frames: false,
      no_renderizar_lo_q_no_se_ve: false,
      comparar_distancias_cuadradas: false,
      usar_pool_vectores: false,
      usar_sombras_proyectadas: false,
      usar_sombras_con_texturas: false,
      max_sombras_por_objeto: 100,
      escala_textura_sombras: 1,
      frames_entre_updates_tint: 1,
      frames_seguir_al_lider: 1,
      frames_cohesion: 1,
      frames_alineacion: 1,
      frames_repeler_obstaculos: 1,
      frames_repeler_enemigos: 1,
      escala_textura_sombras: 1,
    };
  }

  pixiApp;
  gameObjects = [];
  fuegos = [];
  faroles = [];
  personasMuertas = []; // Array específico para personas muertas (para fade out)
  cosasQueDanLuz = [];
  personas = [];
  amigos = [];
  enemigos = [];
  civiles = [];
  policias = [];
  postes = [];
  cables = [];
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
  // factorMagicoAbajo = 2.18;
  teclado = {};
  ahora = performance.now();
  BASE_Z_INDEX = 50000;
  anchoDelMapa;
  altoDelMapa;

  constructor() {
    this.FRAMENUM = 0;
    this.updateDimensions();

    this.mouse = { posicion: { x: 0, y: 0 } };

    // Variables para el zoom
    this.zoom = 1;
    this.minZoom = 0.25;
    this.maxZoom = 2;
    this.zoomStep = 0.1;
    this.grilla = new Grilla(this, 150, this.anchoDelMapa, this.altoDelMapa);

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
    this.pixiApp.ticker.maxFPS = 60;

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
      } else if (event.key == "f") {
        this.crearFuego(this.mouse.posicion.x, this.mouse.posicion.y);
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
    this.fondo.width = this.anchoDelMapa + this.width / 2;
    this.fondo.height = this.altoDelMapa + this.height / 2;
    this.fondo.x = this.nivel.minX - this.width / 2;
    this.fondo.y = this.nivel.minY - this.height / 2;
    this.containerBG.addChild(this.fondo);
  }

  crearContainerBG() {
    this.containerBG = new PIXI.Container();
    this.containerBG.label = "containerBG";
    this.containerBG.zIndex = Juego.Z_INDEX.containerBG;

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
    this.containerPrincipal.zIndex = Juego.Z_INDEX.containerPrincipal;
    this.pixiApp.stage.addChild(this.containerPrincipal);

    this.crearContainerBG();
    this.crearGraficoDebug();

    await this.cargarTexturas();
    this.crearGraficoParaCables();

    this.nivel = new Nivel(
      "assets/pixelart/plaza_de_mayo_21.json",
      this,
      () => {
        console.log("nivel cargado");
        this.anchoDelMapa = this.nivel.maxX - this.nivel.minX;
        this.altoDelMapa = this.nivel.maxY - this.nivel.minY;
        this.crearFondo();
        this.crearProtagonista(this.nivel.getCenterOfTheLimits());
        this.targetCamara = this.protagonista;
      }
    );

    // this.crearArboles();
    // this.crearCasitasRandom();

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

  crearGraficoParaCables() {
    this.graficoParaCables = new PIXI.Graphics();
    this.graficoParaCables.zIndex = Juego.Z_INDEX.cables;
    this.graficoParaCables.label = "graficoParaCables";
    this.containerPrincipal.addChild(this.graficoParaCables);
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
      "assets/pixelart/fuego/fuego.png",
      "assets/pixelart/fuego/fuego.json",
    ]);
  }

  crearUnEnemigo(bando, x, y, callback, data) {
    const persona = new Enemigo(x, y, this, bando);
    this.personas.push(persona);
    this.enemigos.push(persona);
    if (callback instanceof Function)
      persona.esperarAQueTengaSpriteCargado(() => callback());

    if (!data) return;

    const keys = Object.keys(data);
    for (let key of keys) {
      persona[key] = data[key];
    }

    return persona;
  }

  crearUnAmigo(x, y, callback, data) {
    const persona = new Amigo(x, y, this);
    this.personas.push(persona);
    this.amigos.push(persona);
    if (callback instanceof Function)
      persona.esperarAQueTengaSpriteCargado(() => callback());

    if (!data) return;

    const keys = Object.keys(data);
    for (let key of keys) {
      persona[key] = data[key];
    }

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
  crearProtagonista(posicion, data) {
    const x = posicion.x ?? 6000;
    const y = posicion.y ?? 1400;
    const protagonista = new Protagonista(x, y, this);
    this.personas.push(protagonista);
    this.protagonista = protagonista;

    if (!data) return;

    const keys = Object.keys(data);
    for (let key of keys) {
      protagonista[key] = data[key];
    }
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
      if (event.button == 1) {
        this.quePasaCuandoTocamosElBotonDeLaRuedita(event.x, event.y);
      }
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
          // this.moverContainerPrincipalA(
          //   -this.targetCamara.posicion.x * this.zoom + this.width / 2,
          //   -this.targetCamara.posicion.y * this.zoom + this.height / 2
          // );
          this.hacerQLaCamaraSigaAAlguien(1);
        }
      },
      { passive: false }
    );
  }

  quePasaCuandoTocamosElBotonDeLaRuedita(x, y) {
    const posicion = this.convertirCoordenadaDelMouse(x, y);
    let distanciaMinima = Infinity;
    let personaMasCerca = null;
    for (let i = 0; i < this.personas.length; i++) {
      const persona = this.personas[i];
      const distancia = calcularDistancia(persona.posicion, posicion);
      if (distancia < distanciaMinima && distancia < persona.radio * 5) {
        distanciaMinima = distancia;
        personaMasCerca = persona;
      }
    }
    if (personaMasCerca) {
      this.targetCamara = personaMasCerca;
    }
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
    this.FRAMENUM++;

    //borrar lo q hay en los graficos debug
    if (this.graficoDebug) this.graficoDebug.clear();

    for (let gameObject of this.gameObjects) {
      gameObject.actualizarSiEstoyVisibleEnLaPantalla();
    }

    for (let unpersona of this.personas) {
      unpersona.tick();
      unpersona.render();
    }

    for (let arbol of this.arboles) arbol.tick();
    for (let farol of this.faroles) farol.tick();
    for (let fuego of this.fuegos) fuego.tick();

    for (let obstaculo of this.obstaculos) obstaculo.render();

    // Actualizar el sistema de iluminación
    if (this.sistemaDeIluminacion) this.sistemaDeIluminacion.tick();

    if (this.particleSystem) this.particleSystem.update();
    if (this.ui) this.ui.tick();

    this.chequearQueNoHayaMuertosConBarraDeVida();

    this.hacerQLaCamaraSigaAAlguien();
    this.calcularFPS();

    if (!this.debug) return;
    // Dibujar las celdas de la grilla
    // this.grilla.dibujarGrilla();
    for (let obstaculo of this.obstaculos) obstaculo.dibujarCirculo();
    for (let unpersona of this.personas) unpersona.dibujarCirculo();
  }

  chequearQueNoHayaMuertosConBarraDeVida() {
    // OPTIMIZACIÓN: Iterar solo sobre personas muertas en lugar de filter() todo el containerPrincipal
    // Antes: O(n) filter sobre TODOS los children cada frame
    // Ahora: O(m) donde m = solo personas muertas (típicamente <10)

    for (let i = this.personasMuertas.length - 1; i >= 0; i--) {
      const persona = this.personasMuertas[i];

      if (!persona.sprite || !persona.container) {
        // Si ya fue destruido, remover del array usando swap-and-pop
        removerDeArrayConSwapAndPop(this.personasMuertas, i, true);
        continue;
      }

      const spriteAnimado = persona.sprite;

      // Fade out gradual
      if (spriteAnimado) {
        spriteAnimado.alpha *= 0.996;
        spriteAnimado.alpha -= 0.0001;

        // Si el fade terminó, destruir completamente
        if (spriteAnimado.alpha < 0.01) {
          if (persona.container) {
            this.containerPrincipal.removeChild(persona.container);
            persona.container.destroy({ children: true });
          }

          // Remover del array de muertos usando swap-and-pop
          removerDeArrayConSwapAndPop(this.personasMuertas, i, true);
        }
      }

      // Limpiar barra de vida si todavía existe (redundancia por seguridad)
      if (persona.containerBarraVida && persona.containerBarraVida.parent) {
        persona.containerBarraVida.parent.removeChild(
          persona.containerBarraVida
        );
        persona.containerBarraVida.destroy();
        persona.containerBarraVida = null;
      }
    }
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

  hacerQLaCamaraSigaAAlguien(factorLerp = 0.1) {
    if (!this.targetCamara) return;

    const centerOfTheLimits = this.nivel.getCenterOfTheLimits();

    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    const limits = this.nivel.getLimits();
    let offsetX = 0;
    let offsetY = 0;
    //estos ratios son entre -1 y 1
    if (limits) {
      const xOffsetRatio =
        (this.targetCamara.posicion.x - centerOfTheLimits.x) /
        (centerOfTheLimits.x - limits.left.x);

      const yOffsetRatio =
        (this.targetCamara.posicion.y - centerOfTheLimits.y) /
        (centerOfTheLimits.y - limits.top.y);

      //ya se q lo maximo q quiero mover la camara cuando estamos llegando al limite
      //es la mitad del ancho o del alto de la pantalla
      // es decir, no quiero mostrar lo q no esta hecho del nivel

      offsetX = xOffsetRatio * halfWidth * 0.9; //0.9 porq sino es mucho y no se llega a ver el ultimo rincon del mapa
      offsetY = yOffsetRatio * halfHeight * 0.9;
    }
    // Ajustar la posición considerando el zoom actual
    //y agregamos los offsetX e Y
    let targetX =
      -this.targetCamara.posicion.x * this.zoom + this.width / 2 + offsetX;
    let targetY =
      -this.targetCamara.posicion.y * this.zoom + this.height / 2 + offsetY;

    const x = (targetX - this.containerPrincipal.x) * factorLerp;
    const y = (targetY - this.containerPrincipal.y) * factorLerp;

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
  crearFuego(x, y) {
    const fuego = new Fuego(x, y, this);
  }

  getPersonaRandom() {
    return this.personas[Math.floor(this.personas.length * Math.random())];
  }

  borrarATodasLasPersonas() {
    for (let persona of this.personas) {
      persona.borrar();
    }
  }

  serializarTodosLosGameObjects(clase) {
    if (clase)
      return this.gameObjects
        .filter((gameObject) => gameObject instanceof clase)
        .map((gameObject) => gameObject.serializar());
    return this.gameObjects.map((gameObject) => gameObject.serializar());
  }

  guardarEstaPartidaEnElLocalStorage(nombre) {
    let objetoPaGuardar = {
      nivel: this.nivel.jsonUrl,
      personas: this.serializarTodosLosGameObjects(Persona),
      minutoDelDia: this.sistemaDeIluminacion.minutoDelDia,
      numeroDeDia: this.sistemaDeIluminacion.numeroDeDia,
    };

    localStorage[nombre] = JSON.stringify(objetoPaGuardar);
  }

  cargarPartidaDelLocalStorage(nombre) {
    const dataDelLocalStorage = localStorage[nombre];
    if (!dataDelLocalStorage) {
      console.warn("No se encontró la partida en el localStorage");
      return;
    }

    this.borrarATodasLasPersonas();

    let objetoCargado = JSON.parse(dataDelLocalStorage);
    // console.log("objetoCargado", objetoCargado);

    for (let persona of objetoCargado.personas) {
      if (persona.clase === "Protagonista") {
        this.crearProtagonista(persona.posicion, persona);
      } else if (persona.clase === "Amigo") {
        console.log("creando amigo", persona);
        this.crearUnAmigo(
          persona.posicion.x,
          persona.posicion.y,
          null,
          persona
        );
      } else if (persona.clase === "Enemigo") {
        this.crearUnEnemigo(
          persona.bando,
          persona.posicion.x,
          persona.posicion.y,
          null,
          persona
        );
      }
    }

    //que hora y dia eran cuando guardamos
    this.sistemaDeIluminacion.minutoDelDia = objetoCargado.minutoDelDia;
    this.sistemaDeIluminacion.numeroDeDia = objetoCargado.numeroDeDia;

    this.targetCamara = this.protagonista;
  }
}
