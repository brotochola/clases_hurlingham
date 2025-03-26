// Clase Juego
class Juego {
  constructor() {
    this.pausa = false;
    this.canvasWidth = window.innerWidth * 2;
    this.canvasHeight = window.innerHeight * 2;
    this.app = new PIXI.Application({
      width: this.canvasWidth,
      height: this.canvasHeight,
      resizeTo: window,
      backgroundColor: 0x1099bb,
    });
    document.body.appendChild(this.app.view);
    this.gridActualizacionIntervalo = 10; // Cada 10 frames
    this.contadorDeFrames = 0;
    this.grid = new Grid(50, this); // Tamaño de celda 50
    this.ovejas = [];
    this.balas = [];
    this.obstaculos = [];
    this.decorados=[]

    this.keyboard = {};

    this.app.stage.sortableChildren = true;
    // this.hacerCosasParaQSeVeaPixelado()


    this.ponerFondo();
    this.ponerProtagonista();

    this.ponerOvejas(500);

    this.ponerPiedras(20);

    this.ponerPastos(1000);
    this.ponerListeners();

    setTimeout(() => {
      this.app.ticker.add(this.actualizar.bind(this));
      window.__PIXI_APP__ = this.app;
    }, 100);
  }

  hacerCosasParaQSeVeaPixelado(){
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.app.view.style.imageRendering = 'pixelated';
    PIXI.settings.ROUND_PIXELS = true;
  }

  ponerPastos(cant){
    for (let i = 0; i < cant; i++) {
      this.decorados.push(
        new Pasto(
          Math.random() * this.canvasWidth,
          Math.random() * this.canvasHeight,
          this
        )
      );
    }
  }
  ponerFondo() {
    // Crear un patrón a partir de una imagen
    PIXI.Texture.fromURL("./img/bg2.png").then((patternTexture) => {
      // Crear un sprite con la textura del patrón
      this.backgroundSprite = new PIXI.TilingSprite(patternTexture, 5000, 5000);
      // this.backgroundSprite.tileScale.set(0.5);

      // Añadir el sprite al stage
      this.app.stage.addChild(this.backgroundSprite);
    });
  }
  ponerProtagonista() {
    this.player = new Player(
      window.innerWidth / 2,
      window.innerHeight * 0.9,
      5,
      this
    );
  }

  ponerPiedras(cant) {
    for (let i = 0; i < cant; i++) {
      this.obstaculos.push(
        new Piedra(
          Math.random() * this.canvasWidth,
          Math.random() * this.canvasHeight,
          this
        )
      );
    }
  }

  ponerOvejas(cant) {
    // Crear algunos ovejas
    for (let i = 0; i < cant; i++) {
      //LA VELOCIDAD SE USA PARA LA VELOCIDAD MAXIMA CON LA Q SE MUEVE EL ZOMBIE
      //Y TAMBIEN PARA LA VELOCIDAD DE REPRODUCCION DE UN SPRITE
      let velocidad = Math.random() * 1.3 + 1.5;
      const oveja = new Oveja(
        Math.random() * this.canvasWidth,
        Math.random() * this.canvasHeight,
        velocidad,
        this
      ); // Pasar la grid a los ovejas
      this.ovejas.push(oveja);
      this.grid.add(oveja);
    }
  }
  mouseDownEvent() {}

  ponerListeners() {
    // Manejar eventos del mouse
    this.app.view.addEventListener("mousedown", () => {
      (this.mouse || {}).click = true;
      this.mouseDownEvent();
    });
    this.app.view.addEventListener("mouseup", () => {
      (this.mouse || {}).click = false;
    });

    this.app.view.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.app.view.addEventListener("mouseleave", () => {
      this.mouse = null;
    });
    window.addEventListener("resize", () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener("keydown", (e) => {
      this.keyboard[e.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (e) => {
      delete this.keyboard[e.key.toLowerCase()];
    });
  }

  // Actualizar la posición del mouse
  onMouseMove(event) {
    this.mouse = { x: 0, y: 0 };
    const rect = this.app.view.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  }
  pausar() {
    this.pausa = !this.pausa;
  }

  actualizar() {
    if (this.pausa) return;
    this.contadorDeFrames++;

    this.player.update();
    this.ovejas.forEach((oveja) => {
      oveja.update();
    });
    this.balas.forEach((bala) => {
      bala.update();
    });

    this.decorados.forEach((decorado) => {
      decorado.update();
    });

    // this.obstaculos.forEach((obstaculo) => {
    //   obstaculo.update();
    // });

    // //CADA 5 FRAMES ACTUALIZO LA GRILLA
    // if (this.contadorDeFrames % 5 == 0) {
    //   this.grid.actualizarCantidadSiLasCeldasSonPasablesONo();
    // }

    this.moverCamara();
  }

  moverCamara() {
    let lerpFactor = 0.05;
    // Obtener la posición del protagonista
    const playerX = this.player.container.x;
    const playerY = this.player.container.y;

    // Calcular la posición objetivo del stage para centrar al protagonista
    const halfScreenWidth = this.app.screen.width / 2;
    const halfScreenHeight = this.app.screen.height / 2;

    const targetX = halfScreenWidth - playerX;
    const targetY = halfScreenHeight - playerY;

    // Aplicar el límite de 0,0 y canvasWidth, canvasHeight
    const clampedX = Math.min(
      Math.max(targetX, -(this.canvasWidth - this.app.screen.width)),
      0
    );
    const clampedY = Math.min(
      Math.max(targetY, -(this.canvasHeight - this.app.screen.height)),
      0
    );

    // Aplicar Lerp para suavizar el movimiento de la cámara
    this.app.stage.position.x = lerp(
      this.app.stage.position.x,
      clampedX,
      lerpFactor
    );
    this.app.stage.position.y = lerp(
      this.app.stage.position.y,
      clampedY,
      lerpFactor
    );
  }
}

// Inicializar el juego
let juego = new Juego();
