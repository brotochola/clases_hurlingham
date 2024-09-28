class Juego {
  constructor(ancho, alto, cb) {
    this.app = new PIXI.Application();
    
    this.ancho = ancho;
    this.alto = alto;

    this.equipos = [new Equipo(0), new Equipo(1)];

    this.jugadores = [];

    this.pelota = new Pelota(this);

    this.contadorDeFrame = 0;

    let promesa = this.app.init({ width: this.ancho, height: this.alto });

    this.ponerListeners();

    promesa.then((e) => {
      document.body.appendChild(this.app.canvas);
     
      window.__PIXI_APP__ = this.app;

      this.app.ticker.add(() => {
        this.gameLoop();
      });

      this.juegoListo()

      if (cb instanceof Function) cb();
    });
  }

  juegoListo(){
    this.containerDebug=new PIXI.Container()
    this.app.stage.addChild(this.containerDebug)
    this.ponerFondo();
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
      let dist = distancia({ pos: { x: x, y: y } }, dep);
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
      console.log(e.x, e.y);
      let distanciaParaClick = 30;
      for (let enti of this.jugadores) enti.debug = false;

      let entidadMasCerca = this.buscarEntidadMasCercana(e.x, e.y);
      if (
        distancia(entidadMasCerca, { pos: { x: e.x, y: e.y } }) <
        distanciaParaClick
      ) {
        entidadMasCerca.debug = true;
        this.entidadSeleccionada = entidadMasCerca;
      }
    };
  }
  gameLoop() {
    this.contadorDeFrame++;

    this.pelota.update();
    this.pelota.render();

    for (let entidad of this.jugadores) {
      entidad.update();
      entidad.render();
    }
  }

  ponerJugadores() {
    for (let equipo of this.equipos) {
      //ARQUEROS
      this.agregarJugador({
        equipo: equipo.id,
        rol: ROLES.ARQUERO,
        numero: 1,  
        sectorVertical: LADO.ARRIBA,
      });

      for (let l = 0; l < equipo.formacion.length; l++) {
        let cantJugadoresEnEstaLinea = equipo.formacion[l];
        for (let i = 0; i < cantJugadoresEnEstaLinea; i++) {
          this.agregarJugador({
            equipo: equipo.id,
            rol:
              l == 0
                ? ROLES.DEFENSOR
                : l == 1
                ? ROLES.MEDIOCAMPISTA
                : ROLES.ATACANTE,
            numero: equipo.jugadores.length+1,    
            sectorVertical: LADO.MEDIO,
          });
        }
      }
    }
  }

  cambiarFormacionDeEquipo(id, formacion) {
    this.equipos[id].cambiarFormacion(formacion);
  }

  agregarJugador(obj) {
    let j = new Jugador(obj, this, this.equipos[obj.equipo]);

    this.jugadores.push(j);

    this.equipos[obj.equipo].jugadores.push(j);
  }
  // agregarDepredador(x, y) {
  //   let depre = new Depredador(x, y, this);
  //   this.jugadores.push(depre);
  //   this.depredadores.push(depre);
  // }
}
