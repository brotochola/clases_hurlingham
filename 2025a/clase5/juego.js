class Juego {
  constructor() {
    this.app = new PIXI.Application();
    this.contadorDeFrame = 0;
    this.ancho = window.innerWidth;
    this.alto = window.innerHeight;

    this.mouse = { x: 0, y: 0 };

    this.teclado = {};

    this.gravedad = { x: 0, y: 3 };

    this.personas = [];
    this.arboles = [];
    this.presas = [];
    this.depredadores = [];

    this.app
      .init({ width: this.ancho, height: this.alto, background: "#ffffff" })
      .then(() => {
        this.pixiListo();
      });
  }

  pixiListo() {
    console.log("pixi listo");

    document.body.appendChild(this.app.canvas);

    this.ponerEventListeners();

    window.__PIXI_APP__ = this.app;

    this.containerPrincipal = new PIXI.Container();
    this.containerPrincipal.name = "el container principal";
    this.app.stage.addChild(this.containerPrincipal);

    this.ponerFondo();

    this.ponerPresas(10);
    this.ponerDepredadores(1);

    this.ponerArboles(12);
    this.ponerProtagonista();

    this.app.stage.sortableChildren = true;

    this.app.ticker.add(() => this.gameLoop());
  }

  async ponerFondo() {
    // Cargar la textura
    let textura = await PIXI.Assets.load("bg.jpg");

    // Crear el TilingSprite con la textura y dimensiones
    this.fondo = new PIXI.TilingSprite(textura, this.ancho * 3, this.alto * 3);

    // Añadir al escenario
    this.containerPrincipal.addChild(this.fondo);
  }

  ponerEventListeners() {
    window.onmousemove = (evento) => {
      this.cuandoSeMueveElMouse(evento);
    };

    window.onkeydown = (eventoTeclado) => {
      let letraApretada = eventoTeclado.key.toLowerCase();
      this.teclado[letraApretada] = true;
    };

    window.onkeyup = (eventoTeclado) => {
      let letraApretada = eventoTeclado.key.toLowerCase();
      delete this.teclado[letraApretada];
    };
  }

  cuandoSeMueveElMouse(evento) {
    this.mouse.x = evento.x;
    this.mouse.y = evento.y;
  }
  gameLoop() {
    for (let i = 0; i < this.arboles.length; i++) {
      this.arboles[i].update();
    }

    for (let i = 0; i < this.personas.length; i++) {
      this.personas[i].update();
    }

    this.protagonista.update();

    this.moverCamara();

    ///renders

    for (let i = 0; i < this.personas.length; i++) {
      this.personas[i].render();
    }
    for (let i = 0; i < this.arboles.length; i++) {
      this.arboles[i].render();
    }

    this.protagonista.render();
  }

  moverCamara() {
    if (!this.fondo) return;
    // this.containerPrincipal.x = this.protagonista.x;
    // this.containerPrincipal.y = this.protagonista.y;

    const cuanto = 0.033333;

    const valorFinalX = -this.protagonista.x + this.ancho / 2;
    const valorFinalY = -this.protagonista.y + this.alto / 2;

    this.containerPrincipal.x -=
      (this.containerPrincipal.x - valorFinalX) * cuanto;
    this.containerPrincipal.y -=
      (this.containerPrincipal.y - valorFinalY) * cuanto;

    if (this.containerPrincipal.x > 0) this.containerPrincipal.x = 0;
    if (this.containerPrincipal.y > 0) this.containerPrincipal.y = 0;

    //limite derecho
    if (this.containerPrincipal.x < -this.fondo.width + this.ancho) {
      this.containerPrincipal.x = -this.fondo.width + this.ancho;
    }

    if (this.containerPrincipal.y < -this.fondo.height + this.alto) {
      this.containerPrincipal.y = -this.fondo.height + this.alto;
    }
  }

  ponerArboles(cantidad) {
    for (let i = 0; i < cantidad; i++) {
      const arbol = new Arbol(
        Math.random() * this.ancho,
        Math.random() * this.alto,
        this
      );

      this.arboles.push(arbol);
    }
  }

  ponerPresas(cantidad) {
    for (let i = 0; i < cantidad; i++) {
      const chabon = new Presa(
        Math.random() * this.ancho,
        Math.random() * this.alto,
        this
      );
      chabon.asignarAceleracion(Math.random() * 20, Math.random() * 2);
      this.personas.push(chabon);
      this.presas.push(chabon);
    }
  }

  ponerProtagonista() {
    this.protagonista = new Protagonista(500, 500, this);
  }

  ponerDepredadores(cantidad) {
    for (let i = 0; i < cantidad; i++) {
      const chabon = new Depredador(
        Math.random() * this.ancho,
        Math.random() * this.alto,
        this
      );
      chabon.asignarAceleracion(Math.random() * 20, Math.random() * 2);
      this.personas.push(chabon);
      this.depredadores.push(chabon);
    }
  }
}
