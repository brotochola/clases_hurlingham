class Juego {
  constructor(callback) {
    this.app = new PIXI.Application();
    this.contadorDeFrame = 0;
    this.ancho = window.innerWidth * 4;
    this.alto = window.innerHeight * 4;

    this.escala = 1


    this.entidades = [];
    this.presas = [];
    this.depredadores = [];
    this.obstaculos = [];

    this.contadorDeFrame = 0;

    let promesa = this.app.init({ width: this.ancho, height: this.alto });

    this.colores = {
      mana: 0x5a63ae,
      vida: 0xcb455e,
    };

    promesa.then((e) => {
      this.juegoListo();
      if (callback instanceof Function) callback()
    });
  }

  juegoListo() {

    this.contenedorPrincipal = new PIXI.Container()
    this.contenedorPrincipal.name = "contenedorPrincipal"
    this.app.stage.addChild(this.contenedorPrincipal)

    // this.contenedorPrincipal.interactive = true;
    // this.contenedorPrincipal.on('mousedown', () => {
    //   console.log('hello');
    // });


    // this.meterFondo()

    document.body.appendChild(this.app.canvas);
    window.__PIXI_APP__ = this.app;
    this.app.ticker.add((e) => {
      this.gameLoop(e);
    });



    this.dibujador = new PIXI.Graphics();
    this.contenedorPrincipal.addChild(this.dibujador);

    this.crearUI();

    this.ponerListeners();
  }

  crearUI() {
    this.ui = new PIXI.Container();
    this.ui.name = "UI";
    this.app.stage.addChild(this.ui);

    this.crearTextoDeTiempo();

    this.cargarImagenes();
  }

  crearTextoDeTiempo() {
    this.tiempoText = new PIXI.Text();
    this.tiempoText.text = "00";
    this.tiempoText.style.fontFamily = "fuente";
    this.tiempoText.style.align = "right";
    juego.tiempoText.x = this.ancho - 80;
    juego.tiempoText.y = 30;
    this.tiempoText.style.fill = "white";
    this.ui.addChild(this.tiempoText);
  }
  setearVida(val) {
    if (!this.barraVida) return;
    let min = 11;
    let max = 180;

    this.barraVida.width = lerp(min, max, val);
  }

  meterFondo() {
    PIXI.Assets.load("img/bg.jpg").then((textura) => {



      this.fondo = new PIXI.Sprite(textura);
      this.fondo.scale.set(10)

      this.contenedorPrincipal.addChild(this.fondo);
    });
  }


  cargarImagenes() {
    PIXI.Assets.load("img/vida.png").then((textura) => {
      this.barraVida = new PIXI.Graphics()
        .rect(0, 0, 10, 25)
        .fill(this.colores.vida);
      this.barraVida.x = 85;
      this.barraVida.y = 49;

      this.ui.addChild(this.barraVida);

      this.imagenVida = new PIXI.Sprite(textura);
      this.imagenVida.scale.set(0.14);
      this.imagenVida.y = 20;
      this.imagenVida.x = 20;
      this.ui.addChild(this.imagenVida);
    });
  }

  buscarEntidadMasCercana(x, y) {
    let distMenor = 99999999;
    let cual;

    for (let dep of this.entidades) {
      let dist = distancia({ x: x, y: y }, dep);
      if (dist < distMenor) {
        distMenor = dist;
        cual = dep;
      }
    }

    return cual;
  }

  ponerListeners() {

    window.onwheel = e => {




      this.escala -= e.deltaY / 2000

      
      this.contenedorPrincipal.pivot.x = e.x - (window.innerWidth / 2) / this.escala
      this.contenedorPrincipal.pivot.y = e.y - (window.innerHeight / 2) / this.escala

      
    }
    window.onmousemove = (e) => {
      

      let xDelContenedor = e.x + this.contenedorPrincipal.pivot.x
      let yDelContenedor = e.y + this.contenedorPrincipal.pivot.y



      this.mouse = { x: e.x, y: e.y };
      if (this.entidadSeleccionada && this.clickEn) {
        this.entidadSeleccionada.x = xDelContenedor;
        this.entidadSeleccionada.y = yDelContenedor;
      }
    };

    // window.onmouseout = () => {
    //   this.clickEn = null;
    // };
    window.onmouseup = () => {
      this.clickEn = null;
    };

    document.body.onmouseleave = () => {
      this.clickEn = null
    }




    window.onmousedown = (e) => {
      let xDelContenedor = e.x + this.contenedorPrincipal.pivot.x
      let yDelContenedor = e.y + this.contenedorPrincipal.pivot.y


      // let grafico=new PIXI.Graphics().rect(xDelContenedor,yDelContenedor,10,10).fill(0xffffff)
      // this.contenedorPrincipal.addChild(grafico)


      // console.log(e.x,e.y, xDelContenedor,yDelContenedor)

      for (let enti of this.entidades) {
        enti.debug = false;
      }

      this.dibujador.clear();

      let entidadMasCerca = this.buscarEntidadMasCercana(xDelContenedor, yDelContenedor);
      this.clickEn = { x: xDelContenedor, y: yDelContenedor };

      let objetoConXeYRelativasAlcontenedorPrincipal = {
        x: xDelContenedor, y: yDelContenedor
      }

      if (distancia(objetoConXeYRelativasAlcontenedorPrincipal, entidadMasCerca) < 50) {
        entidadMasCerca.debug = true;
        this.entidadSeleccionada = entidadMasCerca;
      }else{
        this.entidadSeleccionada=null
      }
    };
  }
  gameLoop(e) {
    this.objetoTickDePixi = e;
    // console.log(e)
    this.contadorDeFrame++;

    for (let entidad of this.entidades) {
      entidad.update();
      entidad.render();
    }

    this.moverCamara()



    ///COSAS DE LA UI
    //PONGO EL TIEMPO ARRIBA A LA DERECHA
    let tiempoInicial = 100
    let tiempoRestante = tiempoInicial - Math.floor(e.lastTime / 1000);
    this.setearVida(tiempoRestante / 100);
    this.tiempoText.text = tiempoRestante.toString();
  }

  moverCamara() {
    if (this.entidadSeleccionada instanceof Presa || this.entidadSeleccionada instanceof Depredador) {
      this.contenedorPrincipal.pivot.x = this.entidadSeleccionada.x - (window.innerWidth / 2) / this.escala
      this.contenedorPrincipal.pivot.y = this.entidadSeleccionada.y - (window.innerHeight / 2) / this.escala
    }

    this.contenedorPrincipal.scale.set(this.escala)
    //   let valX = -this.entidadSeleccionada.x + window.innerWidth / 2
    //   let valY = -this.entidadSeleccionada.y + window.innerHeight / 2
    //   this.contenedorPrincipal.x = lerp(this.contenedorPrincipal.x, valX, 0.05)
    //   this.contenedorPrincipal.y = lerp(this.contenedorPrincipal.y, valY, 0.05)
    // }


  }

  agregarPresa(x, y) {
    let presa = new Presa(x, y, this);
    this.entidades.push(presa);
    this.presas.push(presa);
  }
  agregarDepredador(x, y) {
    let depre = new Depredador(x, y, this);
    this.entidades.push(depre);
    this.depredadores.push(depre);
  }
  agregarObstaculo(x, y, radio) {
    let depre = new Obstaculo(x, y, radio, this);
    this.entidades.push(depre);
    this.obstaculos.push(depre);
  }
}
