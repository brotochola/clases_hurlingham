class Juego {
  constructor(ancho, alto, cb) {
    this.app = new PIXI.Application();
    this.contadorDeFrame = 0;
    this.ancho = ancho;
    this.alto = alto;

    this.jugadores = [];
    this.jugadores1 = [];
    this.jugadores0 = [];
    this.pelota=new Pelota(this)

    this.contadorDeFrame = 0;

    let promesa = this.app.init({ width: this.ancho, height: this.alto });

    this.ponerListeners();

    promesa.then((e) => {
      document.body.appendChild(this.app.canvas);
      this.ponerFondo();
      window.__PIXI_APP__ = this.app;

      this.app.ticker.add(() => {
        this.gameLoop();
      });
      if (cb instanceof Function) cb();
    });
  }

  async ponerFondo() {
    // this.fondo=
    // Start loading right away and create a promise

    // When the promise resolves, we have the texture!
    let resolvedTexture = await PIXI.Assets.load("fondo.jpg");

    // create a new Sprite from the resolved loaded Texture
    this.fondo = PIXI.Sprite.from(resolvedTexture);
    this.fondo.scale.set(1.5);
    this.fondo.zIndex = -1;
    this.app.stage.addChild(this.fondo);
    return 1;
  }
  buscarEntidadMasCercana(x, y) {
    let distMenor = 99999999;
    let cual;

    for (let dep of this.jugadores) {
      let dist = distancia({pos:{ x: x, y: y }}, dep);
      if (dist < distMenor) {
        distMenor = dist;
        cual = dep;
      }
    }

    return cual;
  }

  ponerListeners() {
    window.onmousemove = (e) => {
      this.mouse = { x: e.x, y: e.y };
    };

    window.onmousedown = (e) => {
      for (let enti of this.jugadores) enti.debug = false;

      let entidadMasCerca = this.buscarEntidadMasCercana(e.x, e.y);
      entidadMasCerca.debug = true;
      this.entidadSeleccionada = entidadMasCerca;
    };
  }
  gameLoop() {
    this.contadorDeFrame++;

    this.pelota.update()
    this.pelota.render()


    for (let entidad of this.jugadores) {
      entidad.update();
      entidad.render();
    }
  }

  agregarJugador(obj) {
    let j = new Jugador(obj, this);

    this.jugadores.push(j);
    if (obj.equipo == 0) {
      this.jugadores0.push(j);
    } else if (obj.equipo == 1) {
      this.jugadores1.push(j);
    }
  }
  // agregarDepredador(x, y) {
  //   let depre = new Depredador(x, y, this);
  //   this.jugadores.push(depre);
  //   this.depredadores.push(depre);
  // }
}
